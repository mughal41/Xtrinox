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

const COUNTRY_CURRENCY_MAP: Record<string, { currency: string; locale: string }> = {
  PK: { currency: 'PKR', locale: 'en-PK' },
  IN: { currency: 'INR', locale: 'en-IN' },
  BD: { currency: 'BDT', locale: 'en-BD' },
  AE: { currency: 'AED', locale: 'en-AE' },
  SA: { currency: 'SAR', locale: 'en-SA' },
  GB: { currency: 'GBP', locale: 'en-GB' },
  DE: { currency: 'EUR', locale: 'de-DE' },
  FR: { currency: 'EUR', locale: 'fr-FR' },
  IT: { currency: 'EUR', locale: 'it-IT' },
  ES: { currency: 'EUR', locale: 'es-ES' },
  CA: { currency: 'CAD', locale: 'en-CA' },
  AU: { currency: 'AUD', locale: 'en-AU' },
};

export const parseUsdPrice = (price: string | number | null | undefined) => {
  if (typeof price === 'number') {
    return Number.isFinite(price) ? price : 0;
  }

  const match = String(price || '').match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
};

export const getCurrencyForCountry = (countryCode: string) => {
  return COUNTRY_CURRENCY_MAP[countryCode] || null;
};

export function getLocalizedPrice(usdPrice: number, countryCode: string | null) {
  const safeUsdPrice = Number.isFinite(usdPrice) ? usdPrice : 0;
  const baseUsdDisplay = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(safeUsdPrice);

  const currencyMatch = countryCode ? getCurrencyForCountry(countryCode) : null;
  if (!currencyMatch) {
    return {
      amount: safeUsdPrice,
      currency: 'USD',
      display: baseUsdDisplay,
      baseUsdDisplay,
      isConverted: false,
    };
  }

  const { currency, locale } = currencyMatch;
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
