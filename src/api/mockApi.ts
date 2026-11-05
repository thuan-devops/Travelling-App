import { notificationService } from '../services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Accommodation,
  CategoryItem,
  StayCategory,
  User,
  CATEGORIES,
  ReviewItem,
  SearchFilterState,
  BookingDetails,
} from '../types';
import { MOCKAPI_RAW_DATA } from './mockapi_data';
import { ITEM_TRANSLATIONS, translateAmenity } from '../utils/vietnameseTranslations';

const MOCK_API_URL = 'https://6adf391c8e42963c8d5d9b65.mockapi.io/travelling';
const FAVORITES_STORAGE_KEY = '@travelling_app_favorite_ids';
const REVIEWS_STORAGE_KEY = '@travelling_app_all_reviews_v2';
const BOOKINGS_STORAGE_KEY = '@travelling_app_bookings';
const REMOTE_CACHE_KEY = '@travelling_app_remote_cache_v6';

export const isPastCheckout = (checkOutDateStr: string): boolean => {
  if (!checkOutDateStr) return false;
  try {
    const parts = checkOutDateStr.split(/[-/]/);
    if (parts.length === 3) {
      let d: number, m: number, y: number;
      if (parts[0].length === 4) {
        y = parseInt(parts[0], 10);
        m = parseInt(parts[1], 10) - 1;
        d = parseInt(parts[2], 10);
      } else {
        d = parseInt(parts[0], 10);
        m = parseInt(parts[1], 10) - 1;
        y = parseInt(parts[2], 10);
      }
      const checkout = new Date(y, m, d, 23, 59, 59);
      return checkout < new Date();
    }
  } catch {}
  return false;
};

// Helper loại bỏ dấu tiếng Việt để tìm kiếm không dấu (accent-insensitive)
export const removeVietnameseTones = (str: string): string => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
};

// Helper ánh xạ tên tiện ích sang Icon của Ionicons
export const getAmenityIcon = (name: string): any => {
  const n = (name || '').toLowerCase();
  if (n.includes('wifi') || n.includes('mạng') || n.includes('internet')) return 'wifi';
  if (n.includes('pool') || n.includes('hồ bơi') || n.includes('bể bơi')) return 'water';
  if (n.includes('kitchen') || n.includes('bếp') || n.includes('nấu')) return 'restaurant';
  if (n.includes('bbq') || n.includes('nướng') || n.includes('lửa') || n.includes('bonfire')) return 'bonfire';
  if (n.includes('ocean') || n.includes('beach') || n.includes('biển') || n.includes('bờ')) return 'umbrella';
  if (n.includes('paddle') || n.includes('kayak') || n.includes('thuyền')) return 'boat';
  if (n.includes('gym') || n.includes('thể dục') || n.includes('fitness')) return 'barbell';
  if (n.includes('breakfast') || n.includes('sáng') || n.includes('ăn')) return 'cafe';
  if (n.includes('mountain') || n.includes('núi') || n.includes('view') || n.includes('cảnh')) return 'image';
  if (n.includes('air') || n.includes('điều hòa') || n.includes('lạnh')) return 'snow';
  if (n.includes('parking') || n.includes('đỗ xe') || n.includes('gara')) return 'car';
  if (n.includes('security') || n.includes('bảo vệ') || n.includes('khóa')) return 'shield-checkmark';
  if (n.includes('garden') || n.includes('vườn') || n.includes('sân')) return 'leaf';
  if (n.includes('spa') || n.includes('tắm') || n.includes('bồn')) return 'sparkles';
  if (n.includes('tv') || n.includes('truyền hình')) return 'tv';
  if (n.includes('tea') || n.includes('trà') || n.includes('bar')) return 'wine';
  if (n.includes('fireplace') || n.includes('lò sưởi')) return 'flame';
  return 'checkmark-circle-outline';
};

// Chuyển đổi dữ liệu thô từ mockapi sang chuẩn Accommodation
const formatAccommodation = (
  raw: any,
  allReviews: Record<string, ReviewItem[]> = {},
  favoriteIds: string[] = []
): Accommodation => {
  const category: StayCategory = (
    ['Beach', 'Mountain', 'Camping', 'City', 'Villa'].includes(raw.category)
      ? raw.category
      : 'Beach'
  ) as StayCategory;

  const id = String(raw.id);
  const translation = ITEM_TRANSLATIONS[id];
  const itemReviews = allReviews[id] || [];
  const rawRating = typeof raw.rating === 'number' && raw.rating > 0 ? raw.rating : 4.85;
  const rawReviewCount = typeof raw.reviewCount === 'number' && raw.reviewCount > 0 ? raw.reviewCount : 24;
  const hasUserReviews = itemReviews.length > 0;

  const rating = hasUserReviews
    ? Math.round(
        ((itemReviews.reduce((sum, r) => sum + r.rating, 0) + rawRating * rawReviewCount) /
          (itemReviews.length + rawReviewCount)) *
          10
      ) / 10
    : Math.round(rawRating * 10) / 10;

  const reviewCount = rawReviewCount + itemReviews.length;

  const isFavorite = favoriteIds.includes(id);

  const images = Array.isArray(raw.images) && raw.images.length > 0
    ? raw.images
    : ['https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1000&q=80'];

  const rawAmenities: string[] = Array.isArray(raw.amenities) && raw.amenities.length > 0
    ? raw.amenities
    : ['Wifi tốc độ cao', 'Điều hòa 2 chiều', 'Phòng tắm riêng', 'Bãi đỗ xe'];

  const amenities: string[] = rawAmenities.map(translateAmenity);

  const title = translation?.title || raw.title || 'Chỗ nghỉ dưỡng tuyệt vời';
  const location = translation?.location || raw.location || 'Việt Nam';
  const parts = location.split(',').map((s: string) => s.trim());
  const country = parts.length > 1 ? parts[parts.length - 1] : 'Việt Nam';
  const city = parts.length > 2 ? parts[parts.length - 2] : (parts.length > 1 ? parts[0] : location);

  const pricePerNight = typeof raw.pricePerNight === 'number'
    ? raw.pricePerNight
    : Number(raw.pricePerNight) || 35;

  const bedrooms = translation?.bedrooms || raw.bedrooms || (category === 'Villa' ? 3 : category === 'Mountain' ? 2 : 1);
  const beds = translation?.beds || raw.beds || (category === 'Villa' ? 4 : 2);
  const bathrooms = translation?.bathrooms || raw.bathrooms || (category === 'Villa' ? 2 : 1);
  const maxGuests = translation?.maxGuests || raw.maxGuests || (category === 'Villa' ? 6 : category === 'Mountain' ? 4 : 2);

  const description = translation?.description || raw.description || '';
  const fullDescription =
    translation?.fullDescription ||
    raw.fullDescription ||
    `${description}\n\nTọa lạc tại ${location}, nơi đây mang đến không gian nghỉ ngơi thư thái, tầm nhìn tuyệt đẹp cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn.`;

  const host = raw.host && raw.host.name
    ? raw.host
    : {
        name: 'Chủ nhà thân thiện',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      };

  const services = translation?.services || [
    'Dọn phòng hàng ngày theo yêu cầu',
    'Lễ tân hỗ trợ 24/7',
    'Hỗ trợ đặt tour du lịch & thuê xe',
    'Wifi cáp quang toàn khuôn viên',
  ];

  const bathroom = translation?.bathroom || [
    'Khăn tắm cao cấp mềm mịn',
    'Vòi sen nóng lạnh áp lực cao',
    'Máy sấy tóc công suất lớn',
    'Đồ vệ sinh cá nhân miễn phí',
  ];

  const facilitiesBreakdown = {
    facilities: amenities,
    services,
    bathroom,
  };

  const rules = {
    checkIn: translation?.checkIn || raw.rules?.checkIn || '14:00',
    checkOut: translation?.checkOut || raw.rules?.checkOut || '12:00',
    policyNote:
      translation?.policyNote ||
      raw.rules?.policyNote ||
      'Nhận phòng trực tiếp với chủ nhà hoặc lễ tân. Quý khách vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.',
  };

  const fees = raw.fees || { cleaningFee: 0, kayakFee: 5, parkingFee: 5 };

  return {
    id,
    title,
    category,
    location,
    city: raw.city || city,
    country: raw.country || country,
    pricePerNight,
    bedrooms,
    beds,
    bathrooms,
    maxGuests,
    rating,
    reviewCount,
    images,
    isFavorite,
    description,
    fullDescription,
    amenities,
    facilitiesBreakdown,
    reviewsList: itemReviews,
    host,
    rules,
    fees,
  };
};

// Danh sách khởi tạo ban đầu đồng bộ với 50 sản phẩm từ link MockAPI
export const INITIAL_ACCOMMODATIONS: Accommodation[] = MOCKAPI_RAW_DATA.map((raw) =>
  formatAccommodation(raw, {}, ['beach-2', 'beach-3', 'mountain-1', 'villa-2'])
);

export const SAMPLE_REVIEWS: ReviewItem[] = [];

class MockApiService {
  private lastFetchedAccommodations: Accommodation[] = INITIAL_ACCOMMODATIONS;

  // Lấy danh mục
  async getCategories(): Promise<CategoryItem[]> {
    return CATEGORIES;
  }

  // Hỗ trợ đăng nhập dự phòng
  async loginWithPhone(phoneNumber: string, countryCode: string = '+1'): Promise<User> {
    return {
      id: `user-${Date.now()}`,
      name: 'Khách hàng',
      phoneNumber: `${countryCode} ${phoneNumber}`,
      authProvider: 'phone',
      avatarUrl:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    };
  }

  async loginWithSocial(provider: 'google' | 'facebook' | 'apple'): Promise<User> {
    return {
      id: `user-${provider}-${Date.now()}`,
      name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
      email: `${provider}@example.com`,
      authProvider: provider,
      avatarUrl:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    };
  }

  // --- REVIEWS DATABASE (AsyncStorage) ---
  async getAllStoredReviews(): Promise<Record<string, ReviewItem[]>> {
    try {
      const raw = await AsyncStorage.getItem(REVIEWS_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
      return {};
    } catch {
      return {};
    }
  }

  async getReviews(stayId: string): Promise<ReviewItem[]> {
    const all = await this.getAllStoredReviews();
    return all[stayId] || [];
  }

  async addReview(
    stayId: string,
    review: Omit<ReviewItem, 'id' | 'date'>
  ): Promise<{ newReview: ReviewItem; updatedStay: Accommodation }> {
    const all = await this.getAllStoredReviews();
    const existing = all[stayId] || [];

    const newRev: ReviewItem = {
      ...review,
      id: `rev-${Date.now()}`,
      date: 'Vừa xong',
    };

    const updatedReviews = [newRev, ...existing];
    all[stayId] = updatedReviews;
    await AsyncStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(all));

    // Tìm chỗ ở từ danh sách đã nạp gần nhất hoặc initial
    const baseStay =
      this.lastFetchedAccommodations.find((s) => s.id === stayId) ||
      INITIAL_ACCOMMODATIONS.find((s) => s.id === stayId) ||
      INITIAL_ACCOMMODATIONS[0];

    const avgRating =
      Math.round(
        (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length) * 10
      ) / 10;

    const updatedStay: Accommodation = {
      ...baseStay,
      reviewsList: updatedReviews,
      reviewCount: updatedReviews.length,
      rating: avgRating,
    };

    return { newReview: newRev, updatedStay };
  }

  async updateReview(
    stayId: string,
    reviewId: string,
    data: { rating: number; comment: string }
  ): Promise<{ updatedReview: ReviewItem; updatedStay: Accommodation }> {
    const all = await this.getAllStoredReviews();
    const existing = all[stayId] || [];

    let updatedRev: ReviewItem | null = null;
    const updatedReviews = existing.map((r) => {
      if (r.id === reviewId) {
        updatedRev = {
          ...r,
          rating: data.rating,
          comment: data.comment.trim(),
          date: 'Đã chỉnh sửa',
        };
        return updatedRev;
      }
      return r;
    });

    if (!updatedRev) {
      if (updatedReviews.length > 0) {
        updatedRev = {
          ...updatedReviews[0],
          rating: data.rating,
          comment: data.comment.trim(),
          date: 'Đã chỉnh sửa',
        };
        updatedReviews[0] = updatedRev;
      } else {
        throw new Error('Review not found');
      }
    }

    all[stayId] = updatedReviews;
    await AsyncStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(all));

    const baseStay =
      this.lastFetchedAccommodations.find((s) => s.id === stayId) ||
      INITIAL_ACCOMMODATIONS.find((s) => s.id === stayId) ||
      INITIAL_ACCOMMODATIONS[0];

    const avgRating =
      Math.round(
        (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length) * 10
      ) / 10;

    const updatedStay: Accommodation = {
      ...baseStay,
      reviewsList: updatedReviews,
      reviewCount: updatedReviews.length,
      rating: avgRating,
    };

    return { updatedReview: updatedRev, updatedStay };
  }

  // --- LẤY DANH SÁCH NƠI LƯU TRÚ TỪ LINK MOCKAPI ---
  async getAccommodations(
    category?: StayCategory | 'All',
    searchQuery?: string,
    filters?: Partial<SearchFilterState>
  ): Promise<Accommodation[]> {
    let rawData: any[] = [];

    // 1. Fetch trực tiếp từ URL mockapi được cung cấp
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(MOCK_API_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const fetchedData = await res.json();
        if (Array.isArray(fetchedData) && fetchedData.length > 0) {
          rawData = fetchedData;
          // Lưu cache vào AsyncStorage để dùng khi offline
          AsyncStorage.setItem(REMOTE_CACHE_KEY, JSON.stringify(fetchedData)).catch(() => {});
        }
      }
    } catch {
      // 2. Nếu fetch thất bại (mất mạng/timeout), đọc từ cache
      try {
        const cached = await AsyncStorage.getItem(REMOTE_CACHE_KEY);
        if (cached) {
          rawData = JSON.parse(cached);
        }
      } catch {}
    }

    // 3. Fallback sang dữ liệu 50 sản phẩm đã bundle sẵn nếu chưa có mạng
    if (!rawData || rawData.length === 0) {
      rawData = MOCKAPI_RAW_DATA;
    }

    // Nạp Đánh giá thực tế và Danh sách Yêu thích từ AsyncStorage
    const allReviews = await this.getAllStoredReviews();
    const favoriteIds = await this.getStoredFavorites();

    // Định dạng toàn bộ sản phẩm
    let list = rawData.map((raw) => formatAccommodation(raw, allReviews, favoriteIds));
    this.lastFetchedAccommodations = list;

    // Lọc theo danh mục
    if (category && category !== 'All') {
      list = list.filter(
        (item) => item.category?.toLowerCase() === category.toLowerCase()
      );
    }

    // Lọc theo từ khóa tìm kiếm (hỗ trợ có dấu, không dấu và khớp theo từ ngữ chuẩn)
    if (searchQuery && searchQuery.trim() !== '' && searchQuery !== 'Anywhere' && searchQuery !== 'Bất kỳ đâu') {
      const rawQ = searchQuery.toLowerCase().trim();
      const cleanQ = removeVietnameseTones(searchQuery);
      const queryTokens = cleanQ.split(/\s+/).filter((t) => t.length > 0);

      list = list.filter((item) => {
        const rawTitle = (item.title || '').toLowerCase();
        const rawLoc = (item.location || '').toLowerCase();
        const rawCity = (item.city || '').toLowerCase();
        const rawCountry = (item.country || '').toLowerCase();
        const rawCat = (item.category || '').toLowerCase();
        const rawDesc = (item.description || '').toLowerCase();

        // 1. Khớp cụm tìm kiếm có dấu
        if (
          rawTitle.includes(rawQ) ||
          rawLoc.includes(rawQ) ||
          rawCity.includes(rawQ) ||
          rawCountry.includes(rawQ) ||
          rawCat.includes(rawQ)
        ) {
          return true;
        }

        // 2. Khớp cụm tìm kiếm không dấu
        const cleanTitle = removeVietnameseTones(item.title || '');
        const cleanLoc = removeVietnameseTones(item.location || '');
        const cleanCity = removeVietnameseTones(item.city || '');
        const cleanCountry = removeVietnameseTones(item.country || '');
        const cleanCat = removeVietnameseTones(item.category || '');
        const cleanDesc = removeVietnameseTones(item.description || '');

        if (
          cleanTitle.includes(cleanQ) ||
          cleanLoc.includes(cleanQ) ||
          cleanCity.includes(cleanQ) ||
          cleanCountry.includes(cleanQ) ||
          cleanCat.includes(cleanQ)
        ) {
          return true;
        }

        // 3. Khớp cụm nguyên vẹn trong phần mô tả
        if (rawDesc.includes(rawQ) || cleanDesc.includes(cleanQ)) {
          return true;
        }

        // 4. Nếu tìm nhiều từ (ví dụ "villa nha trang", "ha long beach"):
        // So khớp theo từng từ vựng riêng biệt (Word boundary), không so sánh substring bừa bãi
        if (queryTokens.length > 1) {
          const combinedClean = `${cleanTitle} ${cleanLoc} ${cleanCity} ${cleanCountry} ${cleanCat}`;
          const words = combinedClean.split(/[\s,./\-+()]+/).filter(Boolean);

          const allTokensMatchWords = queryTokens.every((token) => {
            return words.some((w) => w === token || (token.length >= 4 && w.startsWith(token)));
          });

          if (allTokensMatchWords) return true;
        }

        return false;
      });
    }

    // Lọc theo bộ lọc nâng cao
    if (filters) {
      if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
        list = list.filter((item) => {
          const itemVnd = item.pricePerNight >= 1000 ? item.pricePerNight : item.pricePerNight * 25000;
          const itemUsd = item.pricePerNight >= 1000 ? item.pricePerNight / 25000 : item.pricePerNight;
          if (filters.maxPrice! > 1000) {
            return itemVnd >= filters.minPrice! && itemVnd <= filters.maxPrice!;
          } else {
            return itemUsd >= filters.minPrice! && itemUsd <= filters.maxPrice!;
          }
        });
      }
      if (filters.placeTypes && filters.placeTypes.length > 0 && filters.placeTypes.length < 3) {
        list = list.filter((item) => {
          const cat = (item.category || '').toLowerCase();
          const cleanT = removeVietnameseTones(item.title || '');
          const isEntire =
            cat === 'villa' ||
            cat === 'camping' ||
            cleanT.includes('can ho') ||
            cleanT.includes('villa') ||
            cleanT.includes('bungalow') ||
            cleanT.includes('nha') ||
            cleanT.includes('biet thu') ||
            cleanT.includes('chalet') ||
            cleanT.includes('nguyen can') ||
            cleanT.includes('penthouse') ||
            cleanT.includes('resort');
          const isDorm =
            cleanT.includes('ky tuc') ||
            cleanT.includes('dorm') ||
            cleanT.includes('tap the') ||
            cat === 'camping';
          const isPrivate = !isEntire && !isDorm;

          if (filters.placeTypes!.includes('entire') && isEntire) return true;
          if (filters.placeTypes!.includes('private') && isPrivate) return true;
          if (filters.placeTypes!.includes('dorm') && isDorm) return true;
          return false;
        });
      }

      if (filters.facilities && filters.facilities.length > 0) {
        list = list.filter((item) =>
          filters.facilities!.every((fac) => {
            const fLower = fac.toLowerCase();
            return item.amenities.some((a) => {
              const aLower = a.toLowerCase();
              if (fLower === 'kitchen' || fLower === 'bếp') {
                return aLower.includes('bếp') || aLower.includes('kitchen');
              }
              if (fLower === 'pool' || fLower === 'hồ bơi' || fLower === 'bể bơi') {
                return aLower.includes('hồ bơi') || aLower.includes('bể bơi') || aLower.includes('pool');
              }
              if (fLower === 'gym' || fLower === 'phòng gym') {
                return aLower.includes('gym') || aLower.includes('thể dục') || aLower.includes('fitness');
              }
              if (fLower.includes('outdoor') || fLower.includes('ngoài trời') || fLower.includes('vườn') || fLower.includes('space')) {
                return aLower.includes('ngoài trời') || aLower.includes('vườn') || aLower.includes('outdoor') || aLower.includes('garden') || aLower.includes('sân');
              }
              if (fLower.includes('internet') || fLower.includes('wifi') || fLower.includes('mạng')) {
                return aLower.includes('wifi') || aLower.includes('internet') || aLower.includes('mạng');
              }
              return aLower.includes(fLower);
            });
          })
        );
      }
      if (filters.bedrooms && filters.bedrooms > 0) {
        list = list.filter((item) => item.bedrooms >= filters.bedrooms!);
      }
      if (filters.beds && filters.beds > 0) {
        list = list.filter((item) => item.beds >= filters.beds!);
      }
      if (filters.bathrooms && filters.bathrooms > 0) {
        list = list.filter((item) => item.bathrooms >= filters.bathrooms!);
      }
      if (filters.minRating !== undefined && filters.minRating > 0) {
        list = list.filter((item) => item.rating >= filters.minRating!);
      }
    }

    // Đưa các sản phẩm được đánh giá cao lên đầu
    list.sort((a, b) => {
      const diff = (b.rating || 0) - (a.rating || 0);
      if (Math.abs(diff) > 0.01) {
        return diff;
      }
      return (b.reviewCount || 0) - (a.reviewCount || 0);
    });

    return list;
  }

  // --- USER ISOLATION HELPERS ---
  private currentUserId: string | null = null;

  setCurrentUserId(userId: string | null) {
    this.currentUserId = userId ? String(userId) : null;
  }

  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  private async resolveUserId(): Promise<string> {
    if (this.currentUserId) return this.currentUserId;
    try {
      const stored = await AsyncStorage.getItem('@travelling_app_user_session');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && (u.id || u.email || u.phoneNumber)) {
          this.currentUserId = String(u.id || u.email || u.phoneNumber);
          return this.currentUserId;
        }
      }
    } catch {}
    return 'guest';
  }

  private async getFavoritesKey(): Promise<string> {
    const uid = await this.resolveUserId();
    return `@travelling_app_favs_${uid}`;
  }

  private async getBookingsKey(): Promise<string> {
    const uid = await this.resolveUserId();
    return `@travelling_app_bookings_${uid}`;
  }

  // --- FAVORITES (AsyncStorage per User) ---
  async toggleFavorite(id: string): Promise<boolean> {
    try {
      const key = await this.getFavoritesKey();
      const favoriteIds = await this.getStoredFavorites();
      const isFav = favoriteIds.includes(id);
      let newFavorites: string[];

      if (isFav) {
        newFavorites = favoriteIds.filter((favId) => favId !== id);
      } else {
        newFavorites = [...favoriteIds, id];
      }

      await AsyncStorage.setItem(key, JSON.stringify(newFavorites));

      // Thử đồng bộ PUT lên mockapi nếu có mạng
      fetch(`${MOCK_API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !isFav }),
      }).catch(() => {});

      return !isFav;
    } catch (e) {
      console.warn('Lỗi khi cập nhật favorite:', e);
      return false;
    }
  }

  async getStoredFavorites(): Promise<string[]> {
    try {
      const key = await this.getFavoritesKey();
      const raw = await AsyncStorage.getItem(key);
      if (raw !== null) {
        return JSON.parse(raw);
      }
      // Người dùng mới: bắt đầu với danh sách yêu thích rỗng
      await AsyncStorage.setItem(key, JSON.stringify([]));
      return [];
    } catch {
      return [];
    }
  }

  // --- BOOKINGS (AsyncStorage per User) ---
  async getBookings(): Promise<BookingDetails[]> {
    try {
      const key = await this.getBookingsKey();
      const raw = await AsyncStorage.getItem(key);
      let list: BookingDetails[] = [];
      if (raw !== null) {
        list = JSON.parse(raw);
      }

      // Tự động phân loại: nếu chuyến đã qua ngày checkout thì chuyển status thành completed
      let hasChanges = false;
      list = list.map((b) => {
        if (b.status !== 'cancelled' && b.status !== 'completed' && isPastCheckout(b.checkOut)) {
          hasChanges = true;
          return {
            ...b,
            status: 'completed' as const,
            completedAt: b.checkOut,
          };
        }
        return b;
      });

      // Tự động bổ sung chuyến mẫu đã hoàn thành (kèm đánh giá) và chuyến đã hủy nếu chưa có
      const hasCompleted = list.some((b) => b.status === 'completed');
      const hasCancelled = list.some((b) => b.status === 'cancelled');

      if (!hasCompleted) {
        const sampleCompleted: BookingDetails = {
          bookingId: '00000088921456',
          accommodation: INITIAL_ACCOMMODATIONS[1] || INITIAL_ACCOMMODATIONS[0],
          checkIn: '18-10-2026',
          checkOut: '21-10-2026',
          nights: 3,
          guests: 2,
          paymentType: 'full',
          roomTotal: 3375000,
          fees: [
            { label: 'Phí dịch vụ & dọn dẹp', amount: 150000 },
            { label: 'Thuế GTGT (VAT)', amount: 120000 },
          ],
          totalPrice: 3645000,
          paidAmount: 3645000,
          paymentDate: '15/10/2026',
          paymentTime: '14:20',
          paymentMethod: 'VietQR Chuyển khoản',
          estimatedCheckInTime: '14:00 - 15:00 (Tiêu chuẩn)',
          status: 'completed',
          completedAt: '21/10/2026',
          hasReviewed: true,
          review: {
            id: 'rev-sample-1',
            author: 'Bạn (Người dùng)',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
            rating: 5,
            date: '21/10/2026',
            comment: 'Không gian nghỉ dưỡng tuyệt đẹp, hồ bơi riêng sạch sẽ và dịch vụ chu đáo 24/7. Trải nghiệm rất đáng tiền!',
          },
        };
        list.push(sampleCompleted);
        hasChanges = true;
      }

      if (!hasCancelled) {
        const halongStay = INITIAL_ACCOMMODATIONS.find((a) => a.id === 'beach-2') || INITIAL_ACCOMMODATIONS[0];
        const sampleCancelled: BookingDetails = {
          bookingId: '00000099412034',
          accommodation: halongStay,
          checkIn: '05-10-2026',
          checkOut: '07-10-2026',
          nights: 2,
          guests: 2,
          paymentType: 'full',
          roomTotal: 3900000,
          fees: [
            { label: 'Phí bảo hiểm du lịch', amount: 100000 },
          ],
          totalPrice: 4000000,
          paidAmount: 4000000,
          paymentDate: '01/10/2026',
          paymentTime: '10:30',
          paymentMethod: 'Ví MoMo 24/7',
          status: 'cancelled',
          cancellationReason: 'Thay đổi lịch trình gia đình',
          cancelledAt: '03/10/2026',
          hasReviewed: false,
        };
        list.push(sampleCancelled);
        hasChanges = true;
      }

      if (hasChanges || raw === null) {
        await AsyncStorage.setItem(key, JSON.stringify(list));
      }

      return list;
    } catch {
      return [];
    }
  }

  async saveBooking(newBooking: BookingDetails): Promise<BookingDetails[]> {
    try {
      const key = await this.getBookingsKey();
      const existing = await this.getBookings();
      const updated = [newBooking, ...existing];
      await AsyncStorage.setItem(key, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  }

  async cancelBooking(bookingId: string, reason?: string): Promise<BookingDetails[]> {
    try {
      const key = await this.getBookingsKey();
      const existing = await this.getBookings();
      const updated = existing.map((b) =>
        b.bookingId === bookingId
          ? {
              ...b,
              status: 'cancelled' as const,
              cancellationReason: reason || 'Thay đổi lịch trình cá nhân',
              cancelledAt: new Date().toLocaleDateString('vi-VN'),
            }
          : b
      );
      await AsyncStorage.setItem(key, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  }

  async completeBooking(bookingId: string): Promise<BookingDetails[]> {
    try {
      const key = await this.getBookingsKey();
      const existing = await this.getBookings();
      const updated = existing.map((b) =>
        b.bookingId === bookingId
          ? {
              ...b,
              status: 'completed' as const,
              completedAt: new Date().toLocaleDateString('vi-VN'),
            }
          : b
      );
      await AsyncStorage.setItem(key, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  }

  async addBookingReview(
    bookingId: string,
    review: { rating: number; comment: string; author: string; avatar: string }
  ): Promise<{ updatedBookings: BookingDetails[]; newReview: ReviewItem; updatedStay?: Accommodation }> {
    try {
      const key = await this.getBookingsKey();
      const existing = await this.getBookings();
      const targetBooking = existing.find((b) => b.bookingId === bookingId);
      if (!targetBooking) {
        return {
          updatedBookings: existing,
          newReview: {
            id: `rev-${Date.now()}`,
            author: review.author,
            avatar: review.avatar,
            rating: review.rating,
            date: 'Vừa xong',
            comment: review.comment,
          },
        };
      }

      // Add review to accommodation
      const { newReview, updatedStay } = await this.addReview(targetBooking.accommodation.id, {
        author: review.author,
        avatar: review.avatar,
        rating: review.rating,
        comment: review.comment,
      });

      // Update booking
      const updated = existing.map((b) =>
        b.bookingId === bookingId
          ? {
              ...b,
              hasReviewed: true,
              review: newReview,
              status: 'completed' as const,
            }
          : b
      );

      await AsyncStorage.setItem(key, JSON.stringify(updated));
      return { updatedBookings: updated, newReview, updatedStay };
    } catch (e) {
      console.warn('Lỗi khi lưu đánh giá chuyến đi:', e);
      return { updatedBookings: [], newReview: {} as any };
    }
  }
}

export const mockApi = new MockApiService();
