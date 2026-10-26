export type StayCategory = 'Beach' | 'Mountain' | 'Camping' | 'City' | 'Villa';

export interface User {
  id: string;
  name: string;
  phoneNumber?: string;
  email?: string;
  avatarUrl?: string;
  authProvider: 'phone' | 'google' | 'facebook' | 'apple';
}

export interface Accommodation {
  id: string;
  title: string;
  category: StayCategory;
  location: string;
  pricePerNight: number;
  rating: number;
  reviewCount: number;
  images: string[];
  isFavorite: boolean;
  description: string;
  amenities: string[];
  host: {
    name: string;
    avatar: string;
  };
}

export interface CategoryItem {
  id: StayCategory;
  name: string;
  iconName: string;
}

export const CATEGORIES: CategoryItem[] = [
  { id: 'Beach', name: 'Beach', iconName: 'umbrella-outline' },
  { id: 'Mountain', name: 'Mountain', iconName: 'triangle-outline' },
  { id: 'Camping', name: 'Camping', iconName: 'bonfire-outline' },
  { id: 'City', name: 'City', iconName: 'business-outline' },
  { id: 'Villa', name: 'Villa', iconName: 'home-outline' },
];

export type BottomTabType = 'Search' | 'Favorites' | 'Bookings' | 'Inbox' | 'Profile';
