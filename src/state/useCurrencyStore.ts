import { create } from 'zustand';

interface CurrencyState {
  countryCode: string | null;
  loading: boolean;
  initializeCurrency: () => Promise<void>;
}

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  countryCode: null,
  loading: true,

  initializeCurrency: async () => {
    if (get().countryCode) return; // Already initialized

    // Check localStorage first
    const cachedCode = localStorage.getItem('xtrinox_user_country');
    if (cachedCode) {
      set({ countryCode: cachedCode, loading: false });
      return;
    }

    try {
      // Fetch from a free, reliable IP geolocation API
      const response = await fetch('https://get.geojs.io/v1/ip/country.json');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      const code = data.country;
      localStorage.setItem('xtrinox_user_country', code);
      set({ countryCode: code, loading: false });
    } catch (error) {
      console.warn('Failed to detect user country by IP, falling back to USD', error);
      set({ countryCode: 'US', loading: false }); // Fallback to US/USD
    }
  }
}));
