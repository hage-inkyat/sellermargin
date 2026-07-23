// GENERATED from product/data/fees.json — do not edit by hand. Run: npm run build:data
export const FEES = {
  "meta": {
    "productVersion": "1.1.1",
    "verifiedDate": "2026-07-23",
    "draft": false,
    "note": "All rates verified against official Etsy pages on verifiedDate. VAT-on-fees percentages are each country's standard VAT/GST rate (Etsy publishes no numeric table; it charges the seller's home-country rate). FX rates are approximate mid-market values used only for USD-fixed fees (listing fee, Offsite Ads cap) and are user-editable.",
    "sources": [
      "https://help.etsy.com/hc/en-us/articles/360035902374-Etsy-Fee-Basics",
      "https://help.etsy.com/hc/en-us/articles/115014483627-What-are-the-Fees-and-Taxes-for-Selling-on-Etsy",
      "https://help.etsy.com/hc/en-us/articles/115015628847-What-are-Payment-Processing-Fees-for-Selling-on-Etsy",
      "https://help.etsy.com/hc/en-us/articles/1500011073202-What-is-a-Regulatory-Operating-Fee",
      "https://www.etsy.com/legal/fees",
      "https://help.etsy.com/hc/en-us/articles/360040584433-How-VAT-Is-Collected-on-Seller-Fees",
      "https://community.etsy.com/forum/announcements-290/topic/regulatory-operating-fee-updates-for-some-markets-181930/"
    ],
    "nuances": {
      "transactionFeeTax": "US sellers: 6.5% is NOT charged on sales tax. Non-US sellers: the 6.5% applies to the tax-inclusive listing price — enter your VAT-inclusive price as the item price.",
      "processingBase": "Payment processing % applies to the total sale price including shipping and sales tax charged on the listing.",
      "regulatoryBase": "Regulatory operating fee applies to item price + shipping + gift wrap; excludes tax collected by Etsy.",
      "offsiteAdsBase": "Offsite Ads % applies to the order amount including shipping and gift wrap; capped at 100 USD per attributed order. US checkout sales tax is NOT included; for non-US sellers, tax inside a VAT-inclusive item price is inherently included.",
      "canadaTaxes": "Canadian GST/HST/PST/QST on seller fees depends on province and registration status and is NOT modeled — see Etsy's Canadian tax help article.",
      "usTaxOnFees": "Some US states charge sales tax on Etsy seller fees — e.g. Texas: 6.25% on transaction fees (applied to 80% of the fee) since 2025-10-01, no exemption mechanism. Not modeled; disclosed in UI.",
      "multiQuantity": "Each additional quantity sold in one order renews the 0.20 USD listing fee; the calculators count one listing fee per order."
    },
    "june2026RegulatoryChanges": {
      "note": "Effective 2026-06-22. Old rates per valueaddedresource.net (Etsy overwrote official pages); new rates confirmed on Etsy's official help page 2026-07-23.",
      "GB": {
        "old": 0.0032,
        "new": 0.0048
      },
      "FR": {
        "old": 0.0047,
        "new": 0.0114
      },
      "IT": {
        "old": 0.0032,
        "new": 0.008
      },
      "ES": {
        "old": 0.0072,
        "new": 0.0088
      },
      "TR": {
        "old": 0.0227,
        "new": 0.0167
      },
      "IN": {
        "old": 0.0029,
        "new": 0.0005
      },
      "HU": {
        "old": 0,
        "new": 0.0197
      }
    }
  },
  "global": {
    "listingFeeUSD": 0.2,
    "transactionFee": {
      "rate": 0.065
    },
    "processingIncludesTax": true,
    "currencyConversionRate": 0.025,
    "offsiteAds": {
      "standardRate": 0.15,
      "discountedRate": 0.12,
      "thresholdUSD": 10000,
      "capUSD": 100,
      "baseIncludesTax": false
    }
  },
  "countries": {
    "US": {
      "name": "United States",
      "currency": "USD",
      "symbol": "$",
      "fxUsdToLocal": 1,
      "processing": {
        "rate": 0.03,
        "fixed": 0.25
      },
      "regulatoryFeeRate": 0,
      "vatOnFeesRate": null
    },
    "GB": {
      "name": "United Kingdom",
      "currency": "GBP",
      "symbol": "£",
      "fxUsdToLocal": 0.78,
      "processing": {
        "rate": 0.04,
        "fixed": 0.2
      },
      "regulatoryFeeRate": 0.0048,
      "vatOnFeesRate": 0.2
    },
    "CA": {
      "name": "Canada",
      "currency": "CAD",
      "symbol": "C$",
      "fxUsdToLocal": 1.37,
      "processing": {
        "rate": 0.03,
        "fixed": 0.25,
        "intlRate": 0.04
      },
      "regulatoryFeeRate": 0.005,
      "vatOnFeesRate": null,
      "vatNote": "Canadian tax on fees is ESTIMATED from Etsy's published decision table (province, registration, buyer-tax status); your monthly Etsy invoice is authoritative",
      "intlNote": "Orders from US buyers are charged the domestic 3% rate; the 4% intlRate applies only to non-US international orders",
      "caTax": {
        "note": "Etsy publishes WHICH fees are taxed (help article 6633345416215), not numeric rates. Rates below = seller-province GST/HST per CRA place-of-supply (derived, not Etsy-verbatim) + BC PST 7% on all fees + QC QST 9.975%. Regulatory fee treated as always-taxed (conservative; Etsy's always-taxed list is non-exhaustive). Verified 2026-07-23; NS dropped to 14% on 2025-04-01.",
        "rules": "Registered (GST/HST): ALL fees taxed. Unregistered: transaction+processing exempt ONLY on orders where Etsy collected buyer GST/HST (most domestic orders); other fees always taxed. BC: +7% PST on all fees unconditionally. MB/SK: no provincial tax on fees. QC: QST mirrors the GST rule.",
        "provinces": {
          "AB": {
            "name": "Alberta",
            "gsthst": 0.05,
            "pst": 0,
            "qst": 0
          },
          "BC": {
            "name": "British Columbia",
            "gsthst": 0.05,
            "pst": 0.07,
            "qst": 0
          },
          "MB": {
            "name": "Manitoba",
            "gsthst": 0.05,
            "pst": 0,
            "qst": 0
          },
          "NB": {
            "name": "New Brunswick",
            "gsthst": 0.15,
            "pst": 0,
            "qst": 0
          },
          "NL": {
            "name": "Newfoundland and Labrador",
            "gsthst": 0.15,
            "pst": 0,
            "qst": 0
          },
          "NS": {
            "name": "Nova Scotia",
            "gsthst": 0.14,
            "pst": 0,
            "qst": 0
          },
          "NT": {
            "name": "Northwest Territories",
            "gsthst": 0.05,
            "pst": 0,
            "qst": 0
          },
          "NU": {
            "name": "Nunavut",
            "gsthst": 0.05,
            "pst": 0,
            "qst": 0
          },
          "ON": {
            "name": "Ontario",
            "gsthst": 0.13,
            "pst": 0,
            "qst": 0
          },
          "PE": {
            "name": "Prince Edward Island",
            "gsthst": 0.15,
            "pst": 0,
            "qst": 0
          },
          "QC": {
            "name": "Quebec",
            "gsthst": 0.05,
            "pst": 0,
            "qst": 0.09975
          },
          "SK": {
            "name": "Saskatchewan",
            "gsthst": 0.05,
            "pst": 0,
            "qst": 0
          },
          "YT": {
            "name": "Yukon",
            "gsthst": 0.05,
            "pst": 0,
            "qst": 0
          }
        }
      }
    },
    "AU": {
      "name": "Australia",
      "currency": "AUD",
      "symbol": "A$",
      "fxUsdToLocal": 1.5,
      "processing": {
        "rate": 0.03,
        "fixed": 0.25,
        "intlRate": 0.04
      },
      "regulatoryFeeRate": 0,
      "vatOnFeesRate": 0.1
    },
    "DE": {
      "name": "Germany",
      "currency": "EUR",
      "symbol": "€",
      "fxUsdToLocal": 0.92,
      "processing": {
        "rate": 0.04,
        "fixed": 0.3
      },
      "regulatoryFeeRate": 0,
      "vatOnFeesRate": 0.19
    },
    "FR": {
      "name": "France",
      "currency": "EUR",
      "symbol": "€",
      "fxUsdToLocal": 0.92,
      "processing": {
        "rate": 0.04,
        "fixed": 0.3
      },
      "regulatoryFeeRate": 0.0114,
      "vatOnFeesRate": 0.2
    },
    "IT": {
      "name": "Italy",
      "currency": "EUR",
      "symbol": "€",
      "fxUsdToLocal": 0.92,
      "processing": {
        "rate": 0.04,
        "fixed": 0.3
      },
      "regulatoryFeeRate": 0.008,
      "vatOnFeesRate": 0.22
    },
    "ES": {
      "name": "Spain",
      "currency": "EUR",
      "symbol": "€",
      "fxUsdToLocal": 0.92,
      "processing": {
        "rate": 0.04,
        "fixed": 0.3
      },
      "regulatoryFeeRate": 0.0088,
      "vatOnFeesRate": 0.21
    },
    "NL": {
      "name": "Netherlands",
      "currency": "EUR",
      "symbol": "€",
      "fxUsdToLocal": 0.92,
      "processing": {
        "rate": 0.04,
        "fixed": 0.3
      },
      "regulatoryFeeRate": 0,
      "vatOnFeesRate": 0.21
    }
  }
};
