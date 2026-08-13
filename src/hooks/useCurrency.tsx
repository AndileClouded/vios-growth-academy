import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface CurrencyData {
  code: string;
  rate: number;
}

export interface DetailedCurrency {
  code: string;
  name: string;
  flag: string;
  country: string;
}

export const COMMON_CURRENCIES: DetailedCurrency[] = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸', country: 'United States' },
  { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦', country: 'South Africa' },
  { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬', country: 'Nigeria' },
  { code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪', country: 'Kenya' },
  { code: 'GHS', name: 'Ghanaian Cedi', flag: '🇬🇭', country: 'Ghana' },
  { code: 'TZS', name: 'Tanzanian Shilling', flag: '🇹🇿', country: 'Tanzania' },
  { code: 'UGX', name: 'Ugandan Shilling', flag: '🇺🇬', country: 'Uganda' },
  { code: 'EGP', name: 'Egyptian Pound', flag: '🇪🇬', country: 'Egypt' },
  { code: 'ETB', name: 'Ethiopian Birr', flag: '🇪🇹', country: 'Ethiopia' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺', country: 'European Union' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧', country: 'United Kingdom' },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳', country: 'India' },
];

export const useCurrency = () => {
  const [data, setData] = useState<CurrencyData>({
    code: 'USD',
    rate: 1,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tries = [
      () => axios.get(`${window.location.origin}/api/currency`, { timeout: 5000 }),
      () => axios.get(`https://open.er-api.com/v6/latest/USD`, { timeout: 5000 }),
    ];
    let cancelled = false;
    (async () => {
      for (const t of tries) {
        try {
          const response = await t();
          if (cancelled) return;
          if (response.data?.code && response.data?.rate) {
            setData({ code: response.data.code, rate: response.data.rate });
            setLoading(false);
            return;
          }
          if (response.data?.rates) {
            const detected = navigator.language ? (
              COMMON_CURRENCIES.find(c =>
                response.data.rates[c.code]
              )
            ) : null;
            if (detected && response.data.rates[detected.code]) {
              setData({ code: detected.code, rate: response.data.rates[detected.code] });
            }
            setLoading(false);
            return;
          }
        } catch {}
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const convert = useCallback((usdAmount: number | string) => {
    const amount = typeof usdAmount === 'string' ? parseFloat(usdAmount) : usdAmount;
    if (isNaN(amount)) return 0;
    return amount * data.rate;
  }, [data.rate]);

  const convertFromLocal = useCallback((localAmount: number | string) => {
    const amount = typeof localAmount === 'string' 
      ? parseFloat(localAmount.replace(/\s/g, '').replace(/,/g, '')) 
      : localAmount;
    if (isNaN(amount) || data.rate === 0) return 0;
    return amount / data.rate;
  }, [data.rate]);

  const getSymbol = useCallback(() => {
    try {
      return (0).toLocaleString(undefined, { 
        style: 'currency', 
        currency: data.code, 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
      }).replace(/\d/g, '').trim();
    } catch {
      return data.code;
    }
  }, [data.code]);

  const format = useCallback((usdAmount: number | string) => {
    const converted = convert(usdAmount);
    try {
      const formatter = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: data.code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });

      const parts = formatter.formatToParts(converted);
      let result = '';
      let currencyFound = false;
      
      parts.forEach((part, index) => {
        if (part.type === 'currency') {
          currencyFound = true;
          if (index === 0) {
            result += part.value + '\u00A0'; // Space after symbol at start
          } else {
            result += '\u00A0' + part.value; // Space before symbol at end
          }
        } else if (part.type === 'group') {
          result += '\u00A0'; // Use non-breaking space as thousands separator
        } else {
          result += part.value;
        }
      });

      return currencyFound ? result.trim() : formatter.format(converted);
    } catch (e) {
      // Fallback if Intl fails
      return `${data.code}\u00A0${converted.toLocaleString()}`;
    }
  }, [convert, data.code]);

  const setCurrencyManual = useCallback(async (newCode: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://open.er-api.com/v6/latest/USD`, { timeout: 5000 });
      if (response.data?.rates && response.data.rates[newCode]) {
        setData({
          code: newCode,
          rate: response.data.rates[newCode]
        });
      }
    } catch (error) {
      console.error('Failed to manually update currency:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    ...data, 
    symbol: getSymbol(), 
    loading, 
    convert, 
    convertFromLocal,
    format,
    setCurrencyManual
  };
};
