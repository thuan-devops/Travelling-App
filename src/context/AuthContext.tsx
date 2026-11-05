import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { authService } from '../services/authService';
import { mockApi } from '../api/mockApi';
import { notificationService } from '../services/notificationService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginWithCredentials: (username: string, password: string) => Promise<User>;
  register: (username: string, password: string) => Promise<User>;
  loginWithPhone: (phone: string, countryCode?: string) => Promise<User>;
  loginWithSocial: (provider: 'google' | 'facebook' | 'apple') => Promise<User>;
  loginWithSocialDemo: (provider: 'google' | 'facebook') => Promise<User>;
  logout: () => Promise<void>;
  skipToGuest: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateUserProfile: (data: { name?: string; phoneNumber?: string; email?: string; avatarUrl?: string }) => Promise<User>;
}

const AUTH_STORAGE_KEY = '@travelling_app_user_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  useEffect(() => {
    mockApi.setCurrentUserId(user ? user.id : null);
    notificationService.setCurrentUserId(user ? user.id : null);
  }, [user]);

  const loadStoredUser = async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        mockApi.setCurrentUserId(parsed ? parsed.id : null);
        notificationService.setCurrentUserId(parsed ? parsed.id : null);
      }
    } catch (e) {
      console.warn('Error reading stored user', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithCredentials = async (username: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const loggedUser = await authService.loginWithCredentials(username, password);
      setUser(loggedUser);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser));
      return loggedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const newUser = await authService.register(username, password);
      // Không tự động đăng nhập sau khi đăng ký, để người dùng quay lại màn hình đăng nhập
      return newUser;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPhone = async (phone: string, countryCode: string = '+1'): Promise<User> => {
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

  const loginWithSocial = async (provider: 'google' | 'facebook' | 'apple'): Promise<User> => {
    setIsLoading(true);
    try {
      let loggedUser: User;
      if (provider === 'google') {
        loggedUser = await authService.loginWithGoogle();
      } else if (provider === 'facebook') {
        loggedUser = await authService.loginWithFacebook();
      } else {
        loggedUser = await mockApi.loginWithSocial(provider);
      }

      setUser(loggedUser);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser));
      return loggedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithSocialDemo = async (provider: 'google' | 'facebook'): Promise<User> => {
    setIsLoading(true);
    try {
      const demoUser = authService.getDemoUser(provider);
      setUser(demoUser);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoUser));
      return demoUser;
    } finally {
      setIsLoading(false);
    }
  };

    const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    if (!user) {
      throw new Error('Vui lòng đăng nhập để đổi mật khẩu.');
    }
    await authService.changePassword(user.id, currentPassword, newPassword, user.username, user.email);
  };

  const updateUserProfile = async (data: { name?: string; phoneNumber?: string; email?: string; avatarUrl?: string }): Promise<User> => {
    if (!user) {
      throw new Error('Vui lòng đăng nhập để cập nhật hồ sơ.');
    }
    const updatedUser: User = {
      ...user,
      name: data.name !== undefined ? data.name : user.name,
      phoneNumber: data.phoneNumber !== undefined ? data.phoneNumber : user.phoneNumber,
      email: data.email !== undefined ? data.email : user.email,
      avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : user.avatarUrl,
    };
    setUser(updatedUser);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      setUser(null);
      mockApi.setCurrentUserId(null);
      notificationService.setCurrentUserId(null);
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
        loginWithCredentials,
        register,
        loginWithPhone,
        loginWithSocial,
        loginWithSocialDemo,
        logout,
        skipToGuest,
        changePassword,
        updateUserProfile,
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
