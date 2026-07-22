/**
 * Etsy fee & profit engine — pure functions, config-driven.
 *
 * All fee rates/bases come from a config object (see product/data/fees.json).
 * Nothing here hardcodes a rate, so the annual fee-table update never touches logic.
 *
 * Monetary values are in the seller's local currency unless a name ends in USD.
 * `fxUsdToLocal` converts USD-denominated fees (listing fee, offsite-ads cap).
 */

/** Round to 2 decimals (half up) for display-stable arithmetic. */
export function round2(x) {
  return Math.round((x + Number.EPSILON) * 100) / 100;
}

/**
 * Compute the per-order Etsy fees.
 *
 * @param {object} cfg  fee config (see fees.json: {global, countries})
 * @param {object} input
 *   country            key into cfg.countries
 *   itemPrice          item price × quantity, local currency
 *   shipping           shipping charged to buyer
 *   giftWrap           gift wrap charged to buyer
 *   salesTax           sales tax / VAT Etsy collects from the buyer on the order
 *   listingsUsed       number of listing fees consumed by this order (default 1)
 *   offsiteAds         'none' | 'standard' | 'discounted'
 *   sellerVatRegistered true if seller provided a VAT/GST ID to Etsy
 *   fxUsdToLocal       optional override; defaults to cfg.countries[country].fxUsdToLocal
 * @returns {{fees: object, totalFees: number, orderRevenue: number, netRevenue: number, effectiveFeeRate: number}}
 */
export function computeFees(cfg, input) {
  const c = cfg.countries[input.country];
  if (!c) throw new Error(`Unknown country: ${input.country}`);
  const g = cfg.global;

  const itemPrice = num(input.itemPrice);
  const shipping = num(input.shipping);
  const giftWrap = num(input.giftWrap);
  const salesTax = num(input.salesTax);
  const listingsUsed = input.listingsUsed === undefined ? 1 : num(input.listingsUsed);
  const fx = input.fxUsdToLocal !== undefined ? num(input.fxUsdToLocal) : c.fxUsdToLocal;

  if (itemPrice < 0 || shipping < 0 || giftWrap < 0 || salesTax < 0) {
    throw new Error("Amounts must be non-negative");
  }

  const itemShipWrap = itemPrice + shipping + giftWrap;
  const orderTotalWithTax = itemShipWrap + salesTax;

  // 1) Listing fee: fixed USD per listing/renewal.
  const listing = g.listingFeeUSD * fx * listingsUsed;

  // 2) Transaction fee: % of item + shipping + gift wrap (not tax).
  const transaction = g.transactionFee.rate * itemShipWrap;

  // 3) Payment processing: % of order total (tax-inclusive where configured) + fixed.
  //    CA/AU charge a higher rate on international (non-domestic, non-US-for-CA) orders.
  const processingBase = g.processingIncludesTax ? orderTotalWithTax : itemShipWrap;
  const procRate = input.internationalOrder && c.processing.intlRate !== undefined ? c.processing.intlRate : c.processing.rate;
  const processing = itemShipWrap > 0 ? procRate * processingBase + c.processing.fixed : 0;

  // 4) Regulatory operating fee: % of the same base as the transaction fee.
  const regulatory = (c.regulatoryFeeRate || 0) * itemShipWrap;

  // 5) Offsite Ads: % of order total incl. shipping/tax-per-config, capped in USD.
  let offsiteAds = 0;
  if (input.offsiteAds && input.offsiteAds !== "none") {
    const rate = input.offsiteAds === "discounted" ? g.offsiteAds.discountedRate : g.offsiteAds.standardRate;
    const oaBase = g.offsiteAds.baseIncludesTax ? orderTotalWithTax : itemShipWrap;
    offsiteAds = Math.min(rate * oaBase, g.offsiteAds.capUSD * fx);
  }

  // 6) Currency conversion: % when listing currency differs from payout currency.
  const currencyConversion = input.currencyConversion ? g.currencyConversionRate * itemShipWrap : 0;

  // 7) VAT/GST charged ON Etsy's fees for unregistered sellers in applicable countries.
  let vatOnFees = 0;
  if (c.vatOnFeesRate && !input.sellerVatRegistered) {
    const vatBase = listing + transaction + processing + regulatory + offsiteAds + currencyConversion;
    vatOnFees = c.vatOnFeesRate * vatBase;
  }

  const fees = {
    listing: round2(listing),
    transaction: round2(transaction),
    processing: round2(processing),
    regulatory: round2(regulatory),
    offsiteAds: round2(offsiteAds),
    currencyConversion: round2(currencyConversion),
    vatOnFees: round2(vatOnFees),
  };
  const totalFees = round2(Object.values(fees).reduce((a, b) => a + b, 0));
  const orderRevenue = round2(itemShipWrap);
  const netRevenue = round2(orderRevenue - totalFees);

  return {
    fees,
    totalFees,
    orderRevenue,
    netRevenue,
    effectiveFeeRate: orderRevenue > 0 ? round2((totalFees / orderRevenue) * 100) : 0,
  };
}

/**
 * Profit after seller-side costs.
 * @param {object} feeResult  result of computeFees
 * @param {object} costs  {cogs, shippingCost, labor, other} in local currency
 */
export function computeProfit(feeResult, costs) {
  // Negative costs would silently inflate profit — clamp to zero.
  const cost = (x) => Math.max(0, num(x));
  const totalCosts = cost(costs.cogs) + cost(costs.shippingCost) + cost(costs.labor) + cost(costs.other);
  const profit = round2(feeResult.netRevenue - totalCosts);
  const margin = feeResult.orderRevenue > 0 ? round2((profit / feeResult.orderRevenue) * 100) : 0;
  return { totalCosts: round2(totalCosts), profit, margin };
}

/**
 * Smallest item price at which profit >= 0, holding other inputs fixed.
 * Returns null if not achievable below `maxPrice`.
 */
export function breakEvenPrice(cfg, input, costs, maxPrice = 1e7) {
  return priceForTargetMargin(cfg, input, costs, 0, maxPrice);
}

/**
 * Smallest item price achieving `targetMarginPct` (% of order revenue), or null.
 * Profit and margin are monotonically increasing in price, so binary search works.
 */
export function priceForTargetMargin(cfg, input, costs, targetMarginPct, maxPrice = 1e7) {
  const ok = (price) => {
    const fr = computeFees(cfg, { ...input, itemPrice: price });
    const { profit, margin } = computeProfit(fr, costs);
    return targetMarginPct === 0 ? profit >= 0 : margin >= targetMarginPct;
  };
  if (!ok(maxPrice)) return null;
  let lo = 0;
  let hi = maxPrice;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (ok(mid)) hi = mid;
    else lo = mid;
  }
  return round2(hi);
}

function num(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}
