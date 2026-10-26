import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { mockApi } from '../api/mockApi';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginWithPhone: (phone: string, countryCode?: string) => Promise<User>;
  loginWithSocial: (provider: 'google' | 'facebook' | 'apple') => Promise<User>;
  logout: () => Promise<void>;
  skipToGuest: () => void;
}

const AUTH_STORAGE_KEY = '@travelling_app_user_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Error reading stored user', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPhone = async (phone: string, countryCode: string = '+1') => {
    setIsLoading(true);
    try {
      const loggedUser = await mockApi.loginWithPhone(phone, countryCode);
      setUser(loggedUser);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser));
      return loggedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithSocial = async (provider: 'google' | 'facebook' | 'apple') => {
    setIsLoading(true);
    try {
      const loggedUser = await mockApi.loginWithSocial(provider);
      setUser(loggedUser);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser));
      return loggedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      setUser(null);
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  const skipToGuest = () => {
    const guestUser: User = {
      id: 'guest-user',
      name: 'Guest Traveler',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      authProvider: 'phone',
    };
    setUser(guestUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loginWithPhone,
        loginWithSocial,
        logout,
        skipToGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
