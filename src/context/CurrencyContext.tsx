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
  const [currency, setCurrencyState] = useState<CurrencyType>('VND');

  useEffect(() => {
    AsyncStorage.getItem(CURRENCY_STORAGE_KEY)
      .then((stored) => {
        if (stored === 'USD' || stored === 'VND') {
          setCurrencyState(stored as CurrencyType);
        } else {
          setCurrencyState('VND');
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

  // Ngưỡng phân biệt giữa số tiền USD và số tiền VND:
  // Giá phòng nghỉ ở VN luôn >= 50.000đ. Các giá trị < 50.000 (như 35, 78, 1014, 2500) là USD hợp lệ!
  const VND_THRESHOLD = 50000;

  const formatPrice = (usdAmount: number | undefined | null): string => {
    const amount = Number(usdAmount) || 0;
    if (currency === 'VND') {
      const vndAmount = amount >= VND_THRESHOLD ? amount : Math.round(amount * USD_TO_VND_RATE);
      return `${vndAmount.toLocaleString('vi-VN')} ₫`;
    }
    const finalUsd = amount >= VND_THRESHOLD ? Math.round(amount / USD_TO_VND_RATE) : amount;
    return `$${finalUsd.toLocaleString('en-US')}`;
  };

  const formatNumberOnly = (usdAmount: number | undefined | null): string => {
    const amount = Number(usdAmount) || 0;
    if (currency === 'VND') {
      const vndAmount = amount >= VND_THRESHOLD ? amount : Math.round(amount * USD_TO_VND_RATE);
      return vndAmount.toLocaleString('vi-VN');
    }
    const finalUsd = amount >= VND_THRESHOLD ? Math.round(amount / USD_TO_VND_RATE) : amount;
    return `${finalUsd.toLocaleString('en-US')}`;
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
