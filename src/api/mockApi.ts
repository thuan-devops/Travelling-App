import AsyncStorage from '@react-native-async-storage/async-storage';
import { Accommodation, CategoryItem, StayCategory, User, CATEGORIES } from '../types';

const MOCK_API_URL = 'https://6adf391c8e42963c8d5d9b65.mockapi.io/travelling';
const FAVORITES_STORAGE_KEY = '@travelling_app_favorite_ids';

class MockApiService {
  // Lấy danh mục
  async getCategories(): Promise<CategoryItem[]> {
    return CATEGORIES;
  }

  // Lấy danh sách nơi lưu trú từ URL MockAPI
  async getAccommodations(
    category?: StayCategory | 'All',
    searchQuery?: string
  ): Promise<Accommodation[]> {
    try {
      const response = await fetch(MOCK_API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let data: Accommodation[] = await response.json();

      // Kết hợp trạng thái Favorites đã lưu cục bộ
      const favoriteIds = await this.getStoredFavorites();
      data = data.map((item) => ({
        ...item,
        isFavorite: favoriteIds.includes(item.id) ? true : item.isFavorite,
      }));

      // Lọc theo danh mục
      if (category && category !== 'All') {
        data = data.filter(
          (item) => item.category?.toLowerCase() === category.toLowerCase()
        );
      }

      // Lọc theo từ khóa tìm kiếm
      if (searchQuery && searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        data = data.filter(
          (item) =>
            item.title?.toLowerCase().includes(q) ||
            item.location?.toLowerCase().includes(q) ||
            item.category?.toLowerCase().includes(q)
        );
      }

      return data;
    } catch (error) {
      console.warn('Lỗi khi gọi API https://6adf391c8e42963c8d5d9b65.mockapi.io/travelling:', error);
      throw error;
    }
  }

  // Đổi trạng thái Favorite (Lưu cục bộ và đồng bộ lên MockAPI nếu khả dụng)
  async toggleFavorite(id: string): Promise<boolean> {
    try {
      const favoriteIds = await this.getStoredFavorites();
      const isFav = favoriteIds.includes(id);
      let newFavorites: string[];

      if (isFav) {
        newFavorites = favoriteIds.filter((favId) => favId !== id);
      } else {
        newFavorites = [...favoriteIds, id];
      }

      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));

      // Thử đồng bộ PUT lên mockapi
      fetch(`${MOCK_API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !isFav }),
      }).catch(() => {
        // MockAPI id có thể khác dạng index, bỏ qua lỗi nếu API không hỗ trợ PUT dạng string id
      });

      return !isFav;
    } catch (e) {
      console.warn('Lỗi khi cập nhật favorite:', e);
      return false;
    }
  }

  private async getStoredFavorites(): Promise<string[]> {
    try {
      const raw = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  // Xác thực đăng nhập qua SĐT
  async loginWithPhone(phone: string, countryCode: string = '+1'): Promise<User> {
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const user: User = {
      id: `user-${Date.now()}`,
      name: `Traveler ${cleanPhone.slice(-4) || '9999'}`,
      phoneNumber: `${countryCode} ${cleanPhone}`,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      authProvider: 'phone',
    };
    return user;
  }

  // Xác thực đăng nhập qua MXH
  async loginWithSocial(provider: 'google' | 'facebook' | 'apple'): Promise<User> {
    const providerNames = {
      google: {
        name: 'Google Explorer',
        email: 'explorer@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      },
      facebook: {
        name: 'Facebook Wanderer',
        email: 'wanderer@facebook.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      },
      apple: {
        name: 'Apple Adventurer',
        email: 'adventurer@icloud.com',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      },
    };

    const info = providerNames[provider];
    return {
      id: `user-${provider}-${Date.now()}`,
      name: info.name,
      email: info.email,
      avatarUrl: info.avatar,
      authProvider: provider,
    };
  }
}

export const mockApi = new MockApiService();
