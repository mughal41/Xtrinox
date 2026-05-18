const USD_EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  PKR: 278.646,
  INR: 83.5,
  BDT: 117.5,
  AED: 3.6725,
  SAR: 3.75,
  GBP: 0.79,
  EUR: 0.92,
  CAD: 1.37,
  AUD: 1.52,
};

const TIMEZONE_CURRENCY_PREFIXES: Array<[string, string, string]> = [
  ['Asia/Karachi', 'PKR', 'en-PK'],
  ['Asia/Calcutta', 'INR', 'en-IN'],
  ['Asia/Kolkata', 'INR', 'en-IN'],
  ['Asia/Dhaka', 'BDT', 'en-BD'],
  ['Asia/Dubai', 'AED', 'en-AE'],
  ['Asia/Riyadh', 'SAR', 'en-SA'],
  ['Europe/London', 'GBP', 'en-GB'],
  ['Europe/', 'EUR', 'en-DE'],
  ['America/Toronto', 'CAD', 'en-CA'],
  ['America/Vancouver', 'CAD', 'en-CA'],
  ['Australia/', 'AUD', 'en-AU'],
];

export const parseUsdPrice = (price: string | number | null | undefined) => {
  if (typeof price === 'number') {
    return Number.isFinite(price) ? price : 0;
  }

  const match = String(price || '').match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
};

export const getUserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};

const getCurrencyForTimezone = (timezone: string) => {
  return TIMEZONE_CURRENCY_PREFIXES.find(([prefix]) => timezone.startsWith(prefix)) || null;
};

export function getLocalizedPrice(usdPrice: number, timezone: string) {
  const safeUsdPrice = Number.isFinite(usdPrice) ? usdPrice : 0;
  const baseUsdDisplay = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(safeUsdPrice);

  const currencyMatch = getCurrencyForTimezone(timezone);
  if (!currencyMatch) {
    return {
      amount: safeUsdPrice,
      currency: 'USD',
      display: baseUsdDisplay,
      baseUsdDisplay,
      isConverted: false,
    };
  }

  const [, currency, locale] = currencyMatch;
  const rate = USD_EXCHANGE_RATES[currency] || 1;
  const amount = safeUsdPrice * rate;

  return {
    amount,
    currency,
    display: new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount),
    baseUsdDisplay,
    isConverted: currency !== 'USD',
  };
}
