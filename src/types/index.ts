export type StayCategory = 'Beach' | 'Mountain' | 'Camping' | 'City' | 'Villa';

export interface User {
  id: string;
  name: string;
  username?: string;
  phoneNumber?: string;
  email?: string;
  avatarUrl?: string;
  authProvider: 'credentials' | 'phone' | 'google' | 'facebook' | 'apple';
}

export interface ReviewItem {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

export interface FacilityGroup {
  category: string;
  items: string[];
}

export interface Accommodation {
  id: string;
  title: string;
  category: StayCategory;
  location: string;
  city: string;
  country: string;
  pricePerNight: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  maxGuests: number;
  rating: number;
  reviewCount: number;
  images: string[];
  isFavorite: boolean;
  description: string;
  fullDescription?: string;
  amenities: string[];
  facilitiesBreakdown?: {
    facilities: string[];
    services: string[];
    bathroom: string[];
  };
  reviewsList?: ReviewItem[];
  host: {
    name: string;
    avatar: string;
  };
  rules?: {
    checkIn: string;
    checkOut: string;
    policyNote?: string;
  };
  fees?: {
    cleaningFee?: number;
    kayakFee?: number;
    parkingFee?: number;
  };
}

export interface CategoryItem {
  id: StayCategory;
  name: string;
  iconName: string;
}

export const CATEGORIES: CategoryItem[] = [
  { id: 'Beach', name: 'Bãi biển', iconName: 'umbrella-outline' },
  { id: 'Mountain', name: 'Núi non', iconName: 'triangle-outline' },
  { id: 'Camping', name: 'Cắm trại', iconName: 'bonfire-outline' },
  { id: 'City', name: 'Thành phố', iconName: 'business-outline' },
  { id: 'Villa', name: 'Biệt thự', iconName: 'home-outline' },
];

export type BottomTabType = 'Search' | 'Favorites' | 'Bookings' | 'Inbox' | 'Profile';

export interface SearchFilterState {
  destination: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  adults: number;
  children: number;
  minPrice: number;
  maxPrice: number;
  placeTypes: ('entire' | 'private' | 'dorm')[];
  bedrooms: number;
  beds: number;
  bathrooms: number;
  facilities: string[];
  presentTotalPrice: boolean;
}

export interface BookingDetails {
  bookingId: string;
  accommodation: Accommodation;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  paymentType: 'full' | 'part';
  roomTotal: number;
  fees: { label: string; amount: number }[];
  totalPrice: number;
  paidAmount: number;
  paymentDate: string;
  paymentTime: string;
  paymentMethod: string;
  status?: 'confirmed' | 'cancelled';
}
