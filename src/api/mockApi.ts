import AsyncStorage from '@react-native-async-storage/async-storage';
import { Accommodation, CategoryItem, StayCategory, User, CATEGORIES, ReviewItem, SearchFilterState, BookingDetails } from '../types';


const MOCK_API_URL = 'https://6adf391c8e42963c8d5d9b65.mockapi.io/travelling';
const FAVORITES_STORAGE_KEY = '@travelling_app_favorite_ids';

export const SAMPLE_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    author: 'Jinny Oslin',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    date: 'A day ago',
    comment: 'The location was perfect, the house was spacious and clean, and the amenities were exceptional. We truly enjoyed every second.',
  },
  {
    id: 'rev-2',
    author: 'John King',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    date: 'A day ago',
    comment: 'We loved staying in this charming home! It had all the amenities we needed, and the historic atmosphere added great character.',
  },
  {
    id: 'rev-3',
    author: 'Jennifer Harris',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    rating: 4,
    date: 'A day ago',
    comment: 'While the location of this home was convenient, we were slightly disappointed with the initial check-in delay, but overall great stay.',
  },
  {
    id: 'rev-4',
    author: 'John Edwards',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    date: 'A day ago',
    comment: 'This home was perfect for our family vacation! The kids loved the pool and the game room, and the view was breathtaking.',
  },
  {
    id: 'rev-5',
    author: 'Elizabeth Lopez',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    date: 'A day ago',
    comment: "The photos don't do this home justice - it's absolutely stunning in person! Clean, stylish, and relaxing.",
  },
];

export const INITIAL_ACCOMMODATIONS: Accommodation[] = [
  {
    id: 'stay-treehouse',
    title: 'Balian treehouse',
    category: 'Beach',
    location: 'Bali, Indonesia',
    city: 'Bali',
    country: 'Indonesia',
    pricePerNight: 20,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    maxGuests: 2,
    rating: 4.5,
    reviewCount: 262,
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80',
    ],
    isFavorite: true,
    description: 'Looking for the perfect place to relax and unwind? This stunning Balinese villa is the ultimate tropical getaway. Located on a quiet street just minutes from the beach, this beautiful home offers everything you need for a luxurious and comfortable stay.',
    fullDescription: 'Looking for the perfect place to relax and unwind? This stunning Balinese villa is the ultimate tropical getaway. Located on a quiet street just minutes from the beach, this beautiful home offers everything you need for a luxurious and comfortable stay.\n\nEnjoy lush garden views, private plunge pool, open-concept living pavilion, and serene surroundings that bring tranquility and rejuvenation.',
    amenities: ['Wifi', 'Kitchen', 'Exercise equipment', 'Pool', 'Garden', 'Washer', 'Free dryer - In unit', 'Iron', 'Bathtub', 'Hair dryer'],
    facilitiesBreakdown: {
      facilities: ['Wifi', 'Kitchen', 'Exercise equipment', 'Pool', 'Garden'],
      services: ['Washer', 'Free dryer - In unit', 'Iron'],
      bathroom: ['Bathtub', 'Hair dryer'],
    },
    reviewsList: SAMPLE_REVIEWS,
    host: {
      name: 'Ketut Astawa',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
    rules: {
      checkIn: '14:00',
      checkOut: '12:00',
      policyNote: "It's always a good idea to confirm the check-in policy directly with the owner/manager before your arrival so that you can organize your transport smoothly.",
    },
    fees: {
      cleaningFee: 0,
      kayakFee: 5,
      parkingFee: 5,
    },
  },
  {
    id: 'stay-omaha',
    title: 'Apartment in Omaha',
    category: 'Beach',
    location: 'Omaha, Nebraska',
    city: 'Omaha',
    country: 'United States',
    pricePerNight: 20,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    maxGuests: 2,
    rating: 5.0,
    reviewCount: 148,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
    ],
    isFavorite: true,
    description: 'Chic modern loft by the waterfront with cozy king-size bed, bohemian styling, sun-drenched windows, and quick access to coastal promenade.',
    amenities: ['Wifi', 'Kitchen', 'Pool', 'Garden', 'Internet access'],
    facilitiesBreakdown: {
      facilities: ['Wifi', 'Kitchen', 'Pool', 'Outdoor space'],
      services: ['Washer', 'Iron'],
      bathroom: ['Bathtub'],
    },
    reviewsList: SAMPLE_REVIEWS,
    host: {
      name: 'Sarah Connor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    rules: { checkIn: '15:00', checkOut: '11:00' },
    fees: { kayakFee: 5, parkingFee: 5 },
  },
  {
    id: 'stay-sanjose',
    title: 'Apartment in San Jose',
    category: 'Beach',
    location: 'San Jose, Costa Rica',
    city: 'San Jose',
    country: 'Costa Rica',
    pricePerNight: 28,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    maxGuests: 2,
    rating: 5.0,
    reviewCount: 94,
    images: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1000&q=80',
    ],
    isFavorite: false,
    description: 'Bright tropical sanctuary with artisan wooden accents, soothing palette, modern kitchen, and ocean breeze.',
    amenities: ['Wifi', 'Kitchen', 'Pool', 'Gym'],
    host: {
      name: 'Marco Rossi',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    },
    rules: { checkIn: '14:00', checkOut: '12:00' },
  },
  {
    id: 'stay-milwaukee',
    title: 'Apartment in Milwaukee',
    category: 'Beach',
    location: 'Milwaukee, Wisconsin',
    city: 'Milwaukee',
    country: 'United States',
    pricePerNight: 20,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    maxGuests: 2,
    rating: 5.0,
    reviewCount: 112,
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
    ],
    isFavorite: true,
    description: 'Impeccable studio apartment with high ceilings, minimalist luxury decor, king bed, and walking distance to lakefront cafes.',
    amenities: ['Wifi', 'Kitchen', 'Internet access', 'Outdoor space'],
    host: {
      name: 'Emily Watson',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    },
    rules: { checkIn: '14:00', checkOut: '11:00' },
    fees: { kayakFee: 5, parkingFee: 5 },
  },
  {
    id: 'stay-mountain-1',
    title: 'Alpine Cabin in Swiss Alps',
    category: 'Mountain',
    location: 'Zermatt, Switzerland',
    city: 'Zermatt',
    country: 'Switzerland',
    pricePerNight: 45,
    bedrooms: 2,
    beds: 3,
    bathrooms: 1,
    maxGuests: 4,
    rating: 4.9,
    reviewCount: 88,
    images: [
      'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80',
    ],
    isFavorite: false,
    description: 'Rustic wooden chalet nestled between snow-covered peaks, boasting a stone fireplace and heated outdoor deck.',
    amenities: ['Wifi', 'Kitchen', 'Gym', 'Outdoor space'],
    host: {
      name: 'Hans Gruber',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    },
  },
  {
    id: 'stay-camp-1',
    title: 'Eco Glamping Dome',
    category: 'Camping',
    location: 'Moab, Utah',
    city: 'Moab',
    country: 'United States',
    pricePerNight: 35,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    maxGuests: 2,
    rating: 4.8,
    reviewCount: 65,
    images: [
      'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=1000&q=80',
    ],
    isFavorite: false,
    description: 'Stargaze directly from your bed under dark desert skies inside a geodesic climate-controlled dome.',
    amenities: ['Wifi', 'Outdoor space', 'Internet access'],
    host: {
      name: 'Dakota Sky',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
  },
];

const BOOKINGS_STORAGE_KEY = '@travelling_app_bookings';

class MockApiService {
  // Lấy danh mục
  async getCategories(): Promise<CategoryItem[]> {
    return CATEGORIES;
  }

  // Lấy danh sách nơi lưu trú
  async getAccommodations(
    category?: StayCategory | 'All',
    searchQuery?: string,
    filters?: Partial<SearchFilterState>
  ): Promise<Accommodation[]> {
    let list = [...INITIAL_ACCOMMODATIONS];

    // Cố gắng fetch thêm từ remote nếu có mạng
    try {
      const response = await fetch(MOCK_API_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const remoteData: any[] = await response.json();
        if (Array.isArray(remoteData) && remoteData.length > 0) {
          list = INITIAL_ACCOMMODATIONS.map((local) => {
            const match = remoteData.find((r) => r.id === local.id || r.title === local.title);
            return match ? { ...local, ...match } : local;
          });
        }
      }
    } catch {
      // Fallback về INITIAL_ACCOMMODATIONS
    }

    // Kết hợp trạng thái Favorites ĐÚNG CHUẨN từ AsyncStorage
    const favoriteIds = await this.getStoredFavorites();
    list = list.map((item) => ({
      ...item,
      isFavorite: favoriteIds.includes(item.id),
    }));

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
    }

    return list;
  }

  // Đổi trạng thái Favorite (Lưu thật vào AsyncStorage)
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
      // Lần đầu mở app: khởi tạo và lưu ngay
      const defaultFavs = ['stay-treehouse', 'stay-omaha', 'stay-milwaukee'];
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(defaultFavs));
      return defaultFavs;
    } catch {
      return [];
    }
  }

  // Quản lý danh sách chuyến đi đã đặt (Bookings)
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
        roomTotal: 20,
        fees: [
          { label: 'Phí chèo thuyền Kayak', amount: 5 },
          { label: 'Phí đỗ xe', amount: 5 },
        ],
        totalPrice: 30,
        paidAmount: 30,
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
      const current = await this.getBookings();
      const bookingWithStatus: BookingDetails = {
        ...newBooking,
        status: newBooking.status || 'confirmed',
      };
      const updated = [bookingWithStatus, ...current.filter((b) => b.bookingId !== newBooking.bookingId)];
      await AsyncStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn('Lỗi lưu booking:', e);
      return [newBooking];
    }
  }

  async cancelBooking(bookingId: string): Promise<BookingDetails[]> {
    try {
      const current = await this.getBookings();
      const updated = current.map((b) =>
        b.bookingId === bookingId ? { ...b, status: 'cancelled' as const } : b
      );
      await AsyncStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn('Lỗi hủy booking:', e);
      return [];
    }
  }

  async addReview(stayId: string, review: Omit<ReviewItem, 'id' | 'date'>): Promise<ReviewItem> {
    const newRev: ReviewItem = {
      ...review,
      id: `rev-${Date.now()}`,
      date: 'Vừa xong',
    };
    const target = INITIAL_ACCOMMODATIONS.find((s) => s.id === stayId);
    if (target) {
      target.reviewsList = [newRev, ...(target.reviewsList || SAMPLE_REVIEWS)];
      target.reviewCount = (target.reviewCount || 0) + 1;
    }
    return newRev;
  }


  // Xác thực đăng nhập qua SĐT
  async loginWithPhone(phone: string, countryCode: string = '+1'): Promise<User> {
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const user: User = {
      id: `user-${Date.now()}`,
      name: `Traveler ${cleanPhone.slice(-4) || '9999'}`,
      phoneNumber: `${countryCode} ${cleanPhone || '987 654 321'}`,
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

