import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CurrencyType = 'USD' | 'VND';

const CURRENCY_STORAGE_KEY = '@travelling_app_currency';
// Tỷ giá quy đổi cố định chuẩn: 1 USD = 25.000 VND
export const USD_TO_VND_RATE = 25000;

interface CurrencyContextType {
  currency: CurrencyType;
  setCurrency: (c: CurrencyType) => Promise<void>;
  toggleCurrency: () => Promise<void>;
  formatPrice: (usdAmount: number | undefined | null) => string;
  formatNumberOnly: (usdAmount: number | undefined | null) => string;
  currencySymbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyType>('USD');

  useEffect(() => {
    AsyncStorage.getItem(CURRENCY_STORAGE_KEY)
      .then((stored) => {
        if (stored === 'USD' || stored === 'VND') {
          setCurrencyState(stored as CurrencyType);
        }
      })
      .catch(() => {});
  }, []);

  const setCurrency = async (newCurrency: CurrencyType) => {
    setCurrencyState(newCurrency);
    try {
      await AsyncStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
    } catch {}
  };

  const toggleCurrency = async () => {
    const next = currency === 'USD' ? 'VND' : 'USD';
    await setCurrency(next);
  };

  const formatPrice = (usdAmount: number | undefined | null): string => {
    const amount = Number(usdAmount) || 0;
    if (currency === 'VND') {
      const vndAmount = Math.round(amount * USD_TO_VND_RATE);
      // Format tiếng Việt 875.000 ₫
      return `${vndAmount.toLocaleString('vi-VN')} ₫`;
    }
    return `$${amount}`;
  };

  const formatNumberOnly = (usdAmount: number | undefined | null): string => {
    const amount = Number(usdAmount) || 0;
    if (currency === 'VND') {
      const vndAmount = Math.round(amount * USD_TO_VND_RATE);
      return vndAmount.toLocaleString('vi-VN');
    }
    return `${amount}`;
  };

  const currencySymbol = currency === 'USD' ? '$' : '₫';

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        toggleCurrency,
        formatPrice,
        formatNumberOnly,
        currencySymbol,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

