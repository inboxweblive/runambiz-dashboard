// =========================================================
// RUNAMBIZ_COUNTRIES
// Full list of countries (ISO 3166-1 alpha-2) with their
// primary currency (ISO 4217) and a display symbol.
// Where no distinct symbol exists, the ISO currency code
// is used as the symbol (this matches common fintech UX,
// e.g. "AED 100" instead of inventing a symbol).
// =========================================================

export const RUNAMBIZ_COUNTRIES = [
  { code: "AF", name: "Afghanistan", currency: "AFN", symbol: "؋" },
  { code: "AL", name: "Albania", currency: "ALL", symbol: "L" },
  { code: "DZ", name: "Algeria", currency: "DZD", symbol: "DA" },
  { code: "AD", name: "Andorra", currency: "EUR", symbol: "€" },
  { code: "AO", name: "Angola", currency: "AOA", symbol: "Kz" },
  { code: "AR", name: "Argentina", currency: "ARS", symbol: "AR$" },
  { code: "AM", name: "Armenia", currency: "AMD", symbol: "֏" },
  { code: "AU", name: "Australia", currency: "AUD", symbol: "A$" },
  { code: "AT", name: "Austria", currency: "EUR", symbol: "€" },
  { code: "AZ", name: "Azerbaijan", currency: "AZN", symbol: "₼" },
  { code: "BS", name: "Bahamas", currency: "BSD", symbol: "B$" },
  { code: "BH", name: "Bahrain", currency: "BHD", symbol: "BD" },
  { code: "BD", name: "Bangladesh", currency: "BDT", symbol: "৳" },
  { code: "BB", name: "Barbados", currency: "BBD", symbol: "Bds$" },
  { code: "BY", name: "Belarus", currency: "BYN", symbol: "Br" },
  { code: "BE", name: "Belgium", currency: "EUR", symbol: "€" },
  { code: "BZ", name: "Belize", currency: "BZD", symbol: "BZ$" },
  { code: "BJ", name: "Benin", currency: "XOF", symbol: "CFA" },
  { code: "BT", name: "Bhutan", currency: "BTN", symbol: "Nu." },
  { code: "BO", name: "Bolivia", currency: "BOB", symbol: "Bs" },
  { code: "BA", name: "Bosnia and Herzegovina", currency: "BAM", symbol: "KM" },
  { code: "BW", name: "Botswana", currency: "BWP", symbol: "P" },
  { code: "BR", name: "Brazil", currency: "BRL", symbol: "R$" },
  { code: "BN", name: "Brunei", currency: "BND", symbol: "B$" },
  { code: "BG", name: "Bulgaria", currency: "BGN", symbol: "лв" },
  { code: "BF", name: "Burkina Faso", currency: "XOF", symbol: "CFA" },
  { code: "BI", name: "Burundi", currency: "BIF", symbol: "FBu" },
  { code: "CV", name: "Cabo Verde", currency: "CVE", symbol: "$" },
  { code: "KH", name: "Cambodia", currency: "KHR", symbol: "៛" },
  { code: "CM", name: "Cameroon", currency: "XAF", symbol: "FCFA" },
  { code: "CA", name: "Canada", currency: "CAD", symbol: "CA$" },
  { code: "CF", name: "Central African Republic", currency: "XAF", symbol: "FCFA" },
  { code: "TD", name: "Chad", currency: "XAF", symbol: "FCFA" },
  { code: "CL", name: "Chile", currency: "CLP", symbol: "CL$" },
  { code: "CN", name: "China", currency: "CNY", symbol: "CN¥" },
  { code: "CO", name: "Colombia", currency: "COP", symbol: "CO$" },
  { code: "KM", name: "Comoros", currency: "KMF", symbol: "CF" },
  { code: "CG", name: "Congo", currency: "XAF", symbol: "FCFA" },
  { code: "CR", name: "Costa Rica", currency: "CRC", symbol: "₡" },
  { code: "CI", name: "Côte d’Ivoire", currency: "XOF", symbol: "CFA" },
  { code: "HR", name: "Croatia", currency: "EUR", symbol: "€" },
  { code: "CU", name: "Cuba", currency: "CUP", symbol: "$" },
  { code: "CY", name: "Cyprus", currency: "EUR", symbol: "€" },
  { code: "CZ", name: "Czechia", currency: "CZK", symbol: "Kč" },
  { code: "DK", name: "Denmark", currency: "DKK", symbol: "kr" },
  { code: "DJ", name: "Djibouti", currency: "DJF", symbol: "Fdj" },
  { code: "DO", name: "Dominican Republic", currency: "DOP", symbol: "RD$" },
  { code: "CD", name: "DR Congo", currency: "CDF", symbol: "FC" },
  { code: "EC", name: "Ecuador", currency: "USD", symbol: "$" },
  { code: "EG", name: "Egypt", currency: "EGP", symbol: "E£" },
  { code: "SV", name: "El Salvador", currency: "USD", symbol: "$" },
  { code: "GQ", name: "Equatorial Guinea", currency: "XAF", symbol: "FCFA" },
  { code: "ER", name: "Eritrea", currency: "ERN", symbol: "Nfk" },
  { code: "EE", name: "Estonia", currency: "EUR", symbol: "€" },
  { code: "SZ", name: "Eswatini", currency: "SZL", symbol: "E" },
  { code: "ET", name: "Ethiopia", currency: "ETB", symbol: "Br" },
  { code: "FJ", name: "Fiji", currency: "FJD", symbol: "FJ$" },
  { code: "FI", name: "Finland", currency: "EUR", symbol: "€" },
  { code: "FR", name: "France", currency: "EUR", symbol: "€" },
  { code: "GA", name: "Gabon", currency: "XAF", symbol: "FCFA" },
  { code: "GM", name: "Gambia", currency: "GMD", symbol: "D" },
  { code: "GE", name: "Georgia", currency: "GEL", symbol: "₾" },
  { code: "DE", name: "Germany", currency: "EUR", symbol: "€" },
  { code: "GH", name: "Ghana", currency: "GHS", symbol: "GH₵" },
  { code: "GR", name: "Greece", currency: "EUR", symbol: "€" },
  { code: "GT", name: "Guatemala", currency: "GTQ", symbol: "Q" },
  { code: "GN", name: "Guinea", currency: "GNF", symbol: "FG" },
  { code: "GW", name: "Guinea-Bissau", currency: "XOF", symbol: "CFA" },
  { code: "GY", name: "Guyana", currency: "GYD", symbol: "G$" },
  { code: "HT", name: "Haiti", currency: "HTG", symbol: "G" },
  { code: "HN", name: "Honduras", currency: "HNL", symbol: "L" },
  { code: "HK", name: "Hong Kong", currency: "HKD", symbol: "HK$" },
  { code: "HU", name: "Hungary", currency: "HUF", symbol: "Ft" },
  { code: "IS", name: "Iceland", currency: "ISK", symbol: "kr" },
  { code: "IN", name: "India", currency: "INR", symbol: "₹" },
  { code: "ID", name: "Indonesia", currency: "IDR", symbol: "Rp" },
  { code: "IR", name: "Iran", currency: "IRR", symbol: "﷼" },
  { code: "IQ", name: "Iraq", currency: "IQD", symbol: "ID" },
  { code: "IE", name: "Ireland", currency: "EUR", symbol: "€" },
  { code: "IL", name: "Israel", currency: "ILS", symbol: "₪" },
  { code: "IT", name: "Italy", currency: "EUR", symbol: "€" },
  { code: "JM", name: "Jamaica", currency: "JMD", symbol: "J$" },
  { code: "JP", name: "Japan", currency: "JPY", symbol: "¥" },
  { code: "JO", name: "Jordan", currency: "JOD", symbol: "JD" },
  { code: "KZ", name: "Kazakhstan", currency: "KZT", symbol: "₸" },
  { code: "KE", name: "Kenya", currency: "KES", symbol: "KSh" },
  { code: "KI", name: "Kiribati", currency: "AUD", symbol: "A$" },
  { code: "XK", name: "Kosovo", currency: "EUR", symbol: "€" },
  { code: "KW", name: "Kuwait", currency: "KWD", symbol: "KD" },
  { code: "KG", name: "Kyrgyzstan", currency: "KGS", symbol: "с" },
  { code: "LA", name: "Laos", currency: "LAK", symbol: "₭" },
  { code: "LV", name: "Latvia", currency: "EUR", symbol: "€" },
  { code: "LB", name: "Lebanon", currency: "LBP", symbol: "L£" },
  { code: "LS", name: "Lesotho", currency: "LSL", symbol: "L" },
  { code: "LR", name: "Liberia", currency: "LRD", symbol: "L$" },
  { code: "LY", name: "Libya", currency: "LYD", symbol: "LD" },
  { code: "LI", name: "Liechtenstein", currency: "CHF", symbol: "CHF" },
  { code: "LT", name: "Lithuania", currency: "EUR", symbol: "€" },
  { code: "LU", name: "Luxembourg", currency: "EUR", symbol: "€" },
  { code: "MO", name: "Macau", currency: "MOP", symbol: "MOP$" },
  { code: "MG", name: "Madagascar", currency: "MGA", symbol: "Ar" },
  { code: "MW", name: "Malawi", currency: "MWK", symbol: "MK" },
  { code: "MY", name: "Malaysia", currency: "MYR", symbol: "RM" },
  { code: "MV", name: "Maldives", currency: "MVR", symbol: "Rf" },
  { code: "ML", name: "Mali", currency: "XOF", symbol: "CFA" },
  { code: "MT", name: "Malta", currency: "EUR", symbol: "€" },
  { code: "MH", name: "Marshall Islands", currency: "USD", symbol: "$" },
  { code: "MR", name: "Mauritania", currency: "MRU", symbol: "UM" },
  { code: "MU", name: "Mauritius", currency: "MUR", symbol: "₨" },
  { code: "MX", name: "Mexico", currency: "MXN", symbol: "MX$" },
  { code: "FM", name: "Micronesia", currency: "USD", symbol: "$" },
  { code: "MD", name: "Moldova", currency: "MDL", symbol: "L" },
  { code: "MC", name: "Monaco", currency: "EUR", symbol: "€" },
  { code: "MN", name: "Mongolia", currency: "MNT", symbol: "₮" },
  { code: "ME", name: "Montenegro", currency: "EUR", symbol: "€" },
  { code: "MA", name: "Morocco", currency: "MAD", symbol: "MAD" },
  { code: "MZ", name: "Mozambique", currency: "MZN", symbol: "MT" },
  { code: "MM", name: "Myanmar", currency: "MMK", symbol: "K" },
  { code: "NA", name: "Namibia", currency: "NAD", symbol: "N$" },
  { code: "NR", name: "Nauru", currency: "AUD", symbol: "A$" },
  { code: "NP", name: "Nepal", currency: "NPR", symbol: "₨" },
  { code: "NL", name: "Netherlands", currency: "EUR", symbol: "€" },
  { code: "NZ", name: "New Zealand", currency: "NZD", symbol: "NZ$" },
  { code: "NI", name: "Nicaragua", currency: "NIO", symbol: "C$" },
  { code: "NE", name: "Niger", currency: "XOF", symbol: "CFA" },
  { code: "NG", name: "Nigeria", currency: "NGN", symbol: "₦" },
  { code: "KP", name: "North Korea", currency: "KPW", symbol: "₩" },
  { code: "MK", name: "North Macedonia", currency: "MKD", symbol: "ден" },
  { code: "NO", name: "Norway", currency: "NOK", symbol: "kr" },
  { code: "OM", name: "Oman", currency: "OMR", symbol: "OR" },
  { code: "PK", name: "Pakistan", currency: "PKR", symbol: "₨" },
  { code: "PW", name: "Palau", currency: "USD", symbol: "$" },
  { code: "PS", name: "Palestine", currency: "ILS", symbol: "₪" },
  { code: "PA", name: "Panama", currency: "PAB", symbol: "B/." },
  { code: "PG", name: "Papua New Guinea", currency: "PGK", symbol: "K" },
  { code: "PY", name: "Paraguay", currency: "PYG", symbol: "₲" },
  { code: "PE", name: "Peru", currency: "PEN", symbol: "S/" },
  { code: "PH", name: "Philippines", currency: "PHP", symbol: "₱" },
  { code: "PL", name: "Poland", currency: "PLN", symbol: "zł" },
  { code: "PT", name: "Portugal", currency: "EUR", symbol: "€" },
  { code: "QA", name: "Qatar", currency: "QAR", symbol: "QR" },
  { code: "RO", name: "Romania", currency: "RON", symbol: "lei" },
  { code: "RU", name: "Russia", currency: "RUB", symbol: "₽" },
  { code: "RW", name: "Rwanda", currency: "RWF", symbol: "RF" },
  { code: "WS", name: "Samoa", currency: "WST", symbol: "WS$" },
  { code: "SM", name: "San Marino", currency: "EUR", symbol: "€" },
  { code: "ST", name: "São Tomé and Príncipe", currency: "STN", symbol: "Db" },
  { code: "SA", name: "Saudi Arabia", currency: "SAR", symbol: "SR" },
  { code: "SN", name: "Senegal", currency: "XOF", symbol: "CFA" },
  { code: "RS", name: "Serbia", currency: "RSD", symbol: "дин" },
  { code: "SC", name: "Seychelles", currency: "SCR", symbol: "₨" },
  { code: "SL", name: "Sierra Leone", currency: "SLE", symbol: "Le" },
  { code: "SG", name: "Singapore", currency: "SGD", symbol: "S$" },
  { code: "SK", name: "Slovakia", currency: "EUR", symbol: "€" },
  { code: "SI", name: "Slovenia", currency: "EUR", symbol: "€" },
  { code: "SB", name: "Solomon Islands", currency: "SBD", symbol: "SI$" },
  { code: "SO", name: "Somalia", currency: "SOS", symbol: "Sh" },
  { code: "ZA", name: "South Africa", currency: "ZAR", symbol: "R" },
  { code: "KR", name: "South Korea", currency: "KRW", symbol: "₩" },
  { code: "SS", name: "South Sudan", currency: "SSP", symbol: "SSP" },
  { code: "ES", name: "Spain", currency: "EUR", symbol: "€" },
  { code: "LK", name: "Sri Lanka", currency: "LKR", symbol: "₨" },
  { code: "SD", name: "Sudan", currency: "SDG", symbol: "SDG" },
  { code: "SR", name: "Suriname", currency: "SRD", symbol: "Sr$" },
  { code: "SE", name: "Sweden", currency: "SEK", symbol: "kr" },
  { code: "CH", name: "Switzerland", currency: "CHF", symbol: "CHF" },
  { code: "SY", name: "Syria", currency: "SYP", symbol: "S£" },
  { code: "TW", name: "Taiwan", currency: "TWD", symbol: "NT$" },
  { code: "TJ", name: "Tajikistan", currency: "TJS", symbol: "SM" },
  { code: "TZ", name: "Tanzania", currency: "TZS", symbol: "TSh" },
  { code: "TH", name: "Thailand", currency: "THB", symbol: "฿" },
  { code: "TL", name: "Timor-Leste", currency: "USD", symbol: "$" },
  { code: "TG", name: "Togo", currency: "XOF", symbol: "CFA" },
  { code: "TO", name: "Tonga", currency: "TOP", symbol: "T$" },
  { code: "TT", name: "Trinidad and Tobago", currency: "TTD", symbol: "TT$" },
  { code: "TN", name: "Tunisia", currency: "TND", symbol: "DT" },
  { code: "TR", name: "Turkey", currency: "TRY", symbol: "₺" },
  { code: "TM", name: "Turkmenistan", currency: "TMT", symbol: "m" },
  { code: "TV", name: "Tuvalu", currency: "AUD", symbol: "A$" },
  { code: "UG", name: "Uganda", currency: "UGX", symbol: "USh" },
  { code: "UA", name: "Ukraine", currency: "UAH", symbol: "₴" },
  { code: "AE", name: "United Arab Emirates", currency: "AED", symbol: "AED" },
  { code: "GB", name: "United Kingdom", currency: "GBP", symbol: "£" },
  { code: "US", name: "United States", currency: "USD", symbol: "$" },
  { code: "UY", name: "Uruguay", currency: "UYU", symbol: "$U" },
  { code: "UZ", name: "Uzbekistan", currency: "UZS", symbol: "so'm" },
  { code: "VU", name: "Vanuatu", currency: "VUV", symbol: "VT" },
  { code: "VA", name: "Vatican City", currency: "EUR", symbol: "€" },
  { code: "VE", name: "Venezuela", currency: "VES", symbol: "Bs" },
  { code: "VN", name: "Vietnam", currency: "VND", symbol: "₫" },
  { code: "YE", name: "Yemen", currency: "YER", symbol: "﷼" },
  { code: "ZM", name: "Zambia", currency: "ZMW", symbol: "ZK" },
  { code: "ZW", name: "Zimbabwe", currency: "ZWL", symbol: "Z$" },
];

// Deduplicate by code, just in case (e.g. LY/SD appear once thanks to this guard)
const seen = new Set();
export const RUNAMBIZ_COUNTRIES_UNIQUE = RUNAMBIZ_COUNTRIES.filter((c) => {
  if (seen.has(c.code)) return false;
  seen.add(c.code);
  return true;
});

// A quick lookup map for O(1) access instead of Array.find() scans
const COUNTRY_BY_CODE = new Map(
  RUNAMBIZ_COUNTRIES_UNIQUE.map((c) => [c.code, c])
);

/**
 * Get a country record by its ISO 3166-1 alpha-2 code.
 * @param {string} code
 * @returns {{code:string,name:string,currency:string,symbol:string}|undefined}
 */
export function getCountryByCode(code) {
  if (!code) return undefined;
  return COUNTRY_BY_CODE.get(code.toUpperCase());
}

/**
 * Get the ISO 4217 currency code for a given country code.
 * Falls back to "USD" if the country is unknown.
 * @param {string} code
 * @returns {string}
 */
export function getCurrencyForCountry(code) {
  return getCountryByCode(code)?.currency || "USD";
}

/**
 * Get the display symbol for a given country code.
 * Falls back to "$" if the country is unknown.
 * @param {string} code
 * @returns {string}
 */
export function getSymbolForCountry(code) {
  return getCountryByCode(code)?.symbol || "$";
}

/**
 * Format an amount for a given country using its currency symbol.
 * e.g. formatAmount(10000, "NG") -> "₦10,000"
 * @param {number} amount
 * @param {string} code
 * @returns {string}
 */
export function formatAmount(
  amount,
  countryCode,
  currencyOverride = null
) {

  const country =
    getCountryByCode(
      countryCode
    );


  const currency =
    currencyOverride ||
    country?.currency ||
    "USD";


  const numericAmount =
    Number(
      amount || 0
    );


  try {

    return new Intl.NumberFormat(
      undefined,
      {
        style:
          "currency",

        currency,

        minimumFractionDigits:
          Number.isInteger(
            numericAmount
          )
            ? 0
            : 2,

        maximumFractionDigits:
          2
      }
    ).format(
      numericAmount
    );

  } catch {

    return (
      `${currency} ${numericAmount.toLocaleString()}`
    );

  }

}


/**
 * Search countries by name (case-insensitive, partial match).
 * Useful for building a country picker with search.
 * @param {string} query
 * @returns {Array}
 */
export function searchCountries(query) {
  if (!query) return RUNAMBIZ_COUNTRIES_UNIQUE;
  const q = query.trim().toLowerCase();
  return RUNAMBIZ_COUNTRIES_UNIQUE.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.currency.toLowerCase().includes(q)
  );
}