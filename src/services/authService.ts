import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

WebBrowser.maybeCompleteAuthSession();

const REGISTERED_USERS_KEY = '@travelling_app_registered_users';

export interface RegisteredAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  createdAt: string;
}

const DEFAULT_ACCOUNTS: RegisteredAccount[] = [
  {
    id: 'user-admin',
    username: 'admin',
    password: 'password123',
    name: 'Quản trị viên',
    email: 'admin@travelling.com',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-traveler',
    username: 'traveler',
    password: 'password123',
    name: 'Nguyễn Văn Du Khách',
    email: 'traveler@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date().toISOString(),
  },
];

class AuthService {
  private googleClientId =
    process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
    '132660851193-1kh5i14elkme731oftj46dj96tpapltv.apps.googleusercontent.com';

  private facebookAppId =
    process.env.EXPO_PUBLIC_FACEBOOK_APP_ID ||
    '1838156270697172';

  // --- ACCOUNTS MANAGEMENT ---
  async getRegisteredAccounts(): Promise<RegisteredAccount[]> {
    try {
      const data = await AsyncStorage.getItem(REGISTERED_USERS_KEY);
      if (!data) {
        await AsyncStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
        return DEFAULT_ACCOUNTS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_ACCOUNTS;
    }
  }

  async register(username: string, password: string): Promise<User> {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || cleanUsername.length < 3) {
      throw new Error('Tên đăng nhập phải có ít nhất 3 ký tự.');
    }
    if (!password || password.length < 6) {
      throw new Error('Mật khẩu phải có ít nhất 6 ký tự.');
    }

    const accounts = await this.getRegisteredAccounts();
    const exists = accounts.some((acc) => acc.username.toLowerCase() === cleanUsername);
    if (exists) {
      throw new Error('Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác.');
    }

    const newAccount: RegisteredAccount = {
      id: `acc-${Date.now()}`,
      username: cleanUsername,
      password: password,
      name: username.trim(),
      email: `${cleanUsername}@travelling.com`,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/png?seed=${encodeURIComponent(cleanUsername)}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [newAccount, ...accounts];
    await AsyncStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updated));

    return {
      id: newAccount.id,
      name: newAccount.name,
      username: newAccount.username,
      email: newAccount.email,
      avatarUrl: newAccount.avatarUrl,
      authProvider: 'credentials',
    };
  }

  async loginWithCredentials(username: string, password: string): Promise<User> {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      throw new Error('Vui lòng nhập tên đăng nhập.');
    }
    if (!password) {
      throw new Error('Vui lòng nhập mật khẩu.');
    }

    const accounts = await this.getRegisteredAccounts();
    const found = accounts.find(
      (acc) =>
        acc.username.toLowerCase() === cleanUsername ||
        (acc.email && acc.email.toLowerCase() === cleanUsername)
    );

    if (!found || found.password !== password) {
      throw new Error('Tên đăng nhập hoặc mật khẩu không chính xác.');
    }

    return {
      id: found.id,
      name: found.name,
      username: found.username,
      email: found.email,
      avatarUrl: found.avatarUrl,
      authProvider: 'credentials',
    };
  }

  getDemoUser(provider: 'google' | 'facebook'): User {
    if (provider === 'google') {
      return {
        id: `google-user-${Date.now()}`,
        name: 'Google Explorer',
        email: 'explorer.google@gmail.com',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        authProvider: 'google',
      };
    }
    return {
      id: `fb-user-${Date.now()}`,
      name: 'Facebook Wanderer',
      email: 'wanderer.facebook@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      authProvider: 'facebook',
    };
  }

  // --- GOOGLE OAUTH ---
  async loginWithGoogle(): Promise<User> {
    const redirectUri =
      process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI ||
      AuthSession.makeRedirectUri({
        preferLocalhost: true,
      });

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?client_id=${encodeURIComponent(this.googleClientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=token` +
      `&scope=${encodeURIComponent('openid profile email')}`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === 'success' && result.url) {
      const token = this.extractTokenFromUrl(result.url);
      if (token) {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (userInfoRes.ok) {
          const profile = await userInfoRes.json();
          return {
            id: `google-${profile.sub || Date.now()}`,
            name: profile.name || 'Người dùng Google',
            email: profile.email,
            avatarUrl: profile.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
            authProvider: 'google',
          };
        }
      }
    }

    if (result.type === 'cancel' || result.type === 'dismiss') {
      throw new Error('Đăng nhập Google đã bị đóng hoặc hủy.');
    }

    return this.getDemoUser('google');
  }

  // --- FACEBOOK OAUTH ---
  async loginWithFacebook(): Promise<User> {
    const redirectUri =
      process.env.EXPO_PUBLIC_FACEBOOK_REDIRECT_URI ||
      AuthSession.makeRedirectUri({
        preferLocalhost: true,
      });

    const authUrl =
      `https://www.facebook.com/v21.0/dialog/oauth` +
      `?client_id=${encodeURIComponent(this.facebookAppId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=token` +
      `&scope=${encodeURIComponent('public_profile,email')}`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === 'success' && result.url) {
      const token = this.extractTokenFromUrl(result.url);
      if (token) {
        const fbRes = await fetch(
          `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${token}`
        );
        if (fbRes.ok) {
          const profile = await fbRes.json();
          return {
            id: `facebook-${profile.id || Date.now()}`,
            name: profile.name || 'Người dùng Facebook',
            email: profile.email,
            avatarUrl:
              profile.picture?.data?.url ||
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
            authProvider: 'facebook',
          };
        }
      }
    }

    if (result.type === 'cancel' || result.type === 'dismiss') {
      throw new Error('Đăng nhập Facebook đã bị đóng hoặc hủy.');
    }

    return this.getDemoUser('facebook');
  }

  private extractTokenFromUrl(url: string): string | null {
    const hashIndex = url.indexOf('#');
    const queryIndex = url.indexOf('?');
    const targetString = hashIndex !== -1 ? url.substring(hashIndex + 1) : queryIndex !== -1 ? url.substring(queryIndex + 1) : '';

    if (!targetString) return null;

    const params = new URLSearchParams(targetString);
    return params.get('access_token');
  }
}

export const authService = new AuthService();
