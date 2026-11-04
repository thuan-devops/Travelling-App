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
const REMOTE_CACHE_KEY = '@travelling_app_remote_cache';

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
  const reviewCount = itemReviews.length;
  // Khi người dùng đánh giá thật -> tính trung bình sao; chưa đánh giá -> 0 (hiển thị Mới)
  const rating = reviewCount > 0
    ? Math.round((itemReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
    : 0;

  const isFavorite = favoriteIds.includes(id) || (favoriteIds.length === 0 && Boolean(raw.isFavorite));

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

    // Lọc theo từ khóa tìm kiếm
    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.location?.toLowerCase().includes(q) ||
          item.city?.toLowerCase().includes(q) ||
          item.country?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q)
      );
    }

    // Lọc theo bộ lọc nâng cao
    if (filters) {
      if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
        list = list.filter(
          (item) => item.pricePerNight >= filters.minPrice! && item.pricePerNight <= filters.maxPrice!
        );
      }
      if (filters.facilities && filters.facilities.length > 0) {
        list = list.filter((item) =>
          filters.facilities!.every((fac) =>
            item.amenities.some((a) => a.toLowerCase().includes(fac.toLowerCase()))
          )
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

    return list;
  }

  // --- FAVORITES (AsyncStorage + sync mockapi) ---
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
      const raw = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (raw !== null) {
        return JSON.parse(raw);
      }
      const defaultFavs = ['beach-2', 'beach-3', 'mountain-1', 'villa-2'];
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(defaultFavs));
      return defaultFavs;
    } catch {
      return [];
    }
  }

  // --- BOOKINGS ---
  async getBookings(): Promise<BookingDetails[]> {
    try {
      const raw = await AsyncStorage.getItem(BOOKINGS_STORAGE_KEY);
      if (raw !== null) {
        return JSON.parse(raw);
      }
      const initialBooking: BookingDetails = {
        bookingId: '00000072697027',
        accommodation: INITIAL_ACCOMMODATIONS[0],
        checkIn: '09-05-2023',
        checkOut: '15-05-2023',
        nights: 1,
        guests: 1,
        paymentType: 'full',
        roomTotal: INITIAL_ACCOMMODATIONS[0].pricePerNight,
        fees: [
          { label: 'Phí chèo thuyền Kayak', amount: 5 },
          { label: 'Phí đỗ xe', amount: 5 },
        ],
        totalPrice: INITIAL_ACCOMMODATIONS[0].pricePerNight + 10,
        paidAmount: INITIAL_ACCOMMODATIONS[0].pricePerNight + 10,
        paymentDate: '09-05-2023',
        paymentTime: '05:40 AM',
        paymentMethod: 'Thẻ tín dụng (Credit card)',
      };
      await AsyncStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify([initialBooking]));
      return [initialBooking];
    } catch {
      return [];
    }
  }

  async saveBooking(newBooking: BookingDetails): Promise<BookingDetails[]> {
    try {
      const existing = await this.getBookings();
      const updated = [newBooking, ...existing];
      await AsyncStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  }

  async cancelBooking(bookingId: string, reason?: string): Promise<BookingDetails[]> {
    try {
      const existing = await this.getBookings();
      const updated = existing.map((b) =>
        b.bookingId === bookingId ? { ...b, status: 'cancelled' as const, cancellationReason: reason || 'Thay đổi lịch trình cá nhân', cancelledAt: new Date().toLocaleDateString('vi-VN') } : b
      );
      await AsyncStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  }
}

export const mockApi = new MockApiService();
