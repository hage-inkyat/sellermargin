import { FEES } from "./fees-data.js";
import { computeFees, computeProfit, breakEvenPrice, priceForTargetMargin } from "./fee-engine.js";

const $ = (id) => document.getElementById(id);

const FEE_LABELS = {
  listing: "Listing fee",
  transaction: "Transaction fee",
  processing: "Payment processing",
  regulatory: "Regulatory operating fee",
  offsiteAds: "Offsite Ads fee",
  currencyConversion: "Currency conversion",
  vatOnFees: "VAT/GST on fees",
  caFeeTax: "Canadian tax on fees (est.)",
};

function fmt(country, x) {
  const c = FEES.countries[country];
  return c.symbol + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Clamp to a finite, non-negative, sane value; anything else becomes 0.
function readNum(id, max = 1e9) {
  const v = parseFloat($(id).value);
  if (!Number.isFinite(v) || v < 0) return 0;
  return Math.min(v, max);
}

function readInputs() {
  const country = $("country").value;
  const fx = readNum("fxRate");
  return {
    input: {
      country,
      itemPrice: readNum("itemPrice"),
      shipping: readNum("shipping"),
      giftWrap: 0,
      salesTax: readNum("salesTax"),
      listingsUsed: 1,
      offsiteAds: $("offsiteAds").value,
      sellerVatRegistered: $("vatRegistered").checked,
      currencyConversion: $("ccyConv").checked,
      internationalOrder: $("intlOrder").checked,
      fxUsdToLocal: fx > 0 ? fx : FEES.countries[country].fxUsdToLocal,
      caProvince: $("caProvince").value || undefined,
      caGstRegistered: $("caGstReg").checked,
      caQstRegistered: $("caQstReg").checked,
      caBuyerTaxCollected: $("caBuyerTax").checked,
      caManualFeeTax: $("caManualTax").value.trim() === "" ? undefined : readNum("caManualTax"),
    },
    costs: {
      cogs: readNum("cogs"),
      shippingCost: readNum("shipCost"),
      labor: readNum("labor"),
      other: readNum("otherCost"),
    },
    targetMargin: readNum("targetMargin", 99),
  };
}

function recalc() {
  const { input, costs, targetMargin } = readInputs();
  const country = input.country;
  let feeResult;
  try {
    feeResult = computeFees(FEES, input);
  } catch {
    // Never leave stale numbers on screen if the engine rejects the input.
    for (const id of ["outRevenue", "outFees", "outNet", "outProfit", "outMargin", "outBreakeven", "outTargetPrice"]) {
      $(id).textContent = "—";
    }
    $("feeRows").innerHTML = "";
    $("outFeeRate").textContent = "";
    return;
  }
  const p = computeProfit(feeResult, costs);

  $("outRevenue").textContent = fmt(country, feeResult.orderRevenue);
  $("outFees").textContent = "−" + fmt(country, feeResult.totalFees);
  $("outNet").textContent = fmt(country, feeResult.netRevenue);
  $("outProfit").textContent = fmt(country, p.profit);
  $("outProfit").classList.toggle("neg", p.profit < 0);
  $("outMargin").textContent = p.margin.toFixed(1) + "%";
  $("outMargin").classList.toggle("neg", p.profit < 0);
  $("outFeeRate").textContent = feeResult.effectiveFeeRate.toFixed(1) + "% of revenue goes to fees";

  const tbody = $("feeRows");
  tbody.innerHTML = "";
  for (const [key, label] of Object.entries(FEE_LABELS)) {
    const v = feeResult.fees[key];
    if (v === 0 && (key === "regulatory" || key === "offsiteAds" || key === "currencyConversion" || key === "vatOnFees" || key === "caFeeTax")) continue;
    const tr = document.createElement("tr");
    const pct = feeResult.orderRevenue > 0 ? ((v / feeResult.orderRevenue) * 100).toFixed(2) + "%" : "—";
    tr.innerHTML = `<td>${label}</td><td class="num">${fmt(country, v)}</td><td class="num muted">${pct}</td>`;
    tbody.appendChild(tr);
  }

  const be = breakEvenPrice(FEES, { ...input, itemPrice: 0 }, costs);
  $("outBreakeven").textContent = be === null ? "—" : fmt(country, be);
  if (targetMargin > 0 && targetMargin < 100) {
    const tp = priceForTargetMargin(FEES, { ...input, itemPrice: 0 }, costs, targetMargin);
    $("outTargetPrice").textContent = tp === null ? "not reachable" : fmt(country, tp);
  } else {
    $("outTargetPrice").textContent = "—";
  }
}

function onCountryChange() {
  const code = $("country").value;
  const c = FEES.countries[code];
  $("fxRate").value = c.fxUsdToLocal;
  $("fxLabel").textContent = `USD → ${c.currency} rate (editable)`;
  const vatRow = $("vatRow");
  vatRow.style.display = c.vatOnFeesRate ? "" : "none";
  $("intlRow").style.display = c.processing.intlRate !== undefined ? "" : "none";
  $("usNote").style.display = code === "US" ? "" : "none";
  $("caPanel").style.display = c.caTax ? "" : "none";
  onProvinceChange();
  document.querySelectorAll(".ccy").forEach((el) => (el.textContent = c.symbol));
  recalc();
}

function onProvinceChange() {
  $("caQstRow").style.display = $("caProvince").value === "QC" ? "" : "none";
}

function buildFeeTable() {
  const tbody = $("countryFeeRows");
  for (const [code, c] of Object.entries(FEES.countries)) {
    const tr = document.createElement("tr");
    const proc =
      `${(c.processing.rate * 100).toFixed(0)}% + ${c.symbol}${c.processing.fixed.toFixed(2)}` +
      (c.processing.intlRate !== undefined ? ` (intl ${(c.processing.intlRate * 100).toFixed(0)}%)` : "");
    tr.innerHTML =
      `<td>${c.name}</td>` +
      `<td class="num">${proc}</td>` +
      `<td class="num">${c.regulatoryFeeRate ? (c.regulatoryFeeRate * 100).toFixed(2) + "%" : "—"}</td>` +
      `<td class="num">${c.vatOnFeesRate ? (c.vatOnFeesRate * 100).toFixed(0) + "%" : c.vatNote ? "varies*" : "—"}</td>`;
    tbody.appendChild(tr);
  }
}

function buildSources() {
  const ul = $("sourceList");
  ul.innerHTML = "";
  for (const s of FEES.meta.sources) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = s;
    a.textContent = s;
    a.rel = "nofollow noopener";
    li.appendChild(a);
    ul.appendChild(li);
  }
}

function init() {
  const sel = $("country");
  for (const [code, c] of Object.entries(FEES.countries)) {
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = c.name + " (" + c.currency + ")";
    sel.appendChild(opt);
  }
  sel.value = "US";

  const provSel = $("caProvince");
  const provinces = FEES.countries.CA.caTax.provinces;
  for (const [code, p] of Object.entries(provinces)) {
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = p.name;
    provSel.appendChild(opt);
  }
  provSel.value = "ON";
  provSel.addEventListener("change", onProvinceChange);

  if (FEES.meta.draft) {
    const banner = document.createElement("div");
    banner.className = "draft-banner";
    banner.textContent = "DRAFT fee data — verification in progress. Do not rely on these numbers yet.";
    document.body.prepend(banner);
  }
  document.querySelectorAll(".verified-date").forEach((el) => (el.textContent = FEES.meta.verifiedDate));

  buildFeeTable();
  buildSources();
  document.querySelectorAll("input, select").forEach((el) => {
    el.addEventListener("input", recalc);
    el.addEventListener("change", recalc);
  });
  sel.addEventListener("change", onCountryChange);
  onCountryChange();
}

init();
