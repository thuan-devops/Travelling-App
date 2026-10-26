import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Accommodation, BookingDetails, BottomTabType, SearchFilterState } from '../types';
import { INITIAL_ACCOMMODATIONS, mockApi } from '../api/mockApi';

// Screens
import { SplashScreen } from '../screens/SplashScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SearchResultsScreen } from '../screens/SearchResultsScreen';
import { RoomDetailScreen } from '../screens/RoomDetailScreen';
import { FacilitiesScreen } from '../screens/FacilitiesScreen';
import { ReviewsScreen } from '../screens/ReviewsScreen';
import { DescriptionScreen } from '../screens/DescriptionScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { PaymentSuccessScreen } from '../screens/PaymentSuccessScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { BookingsScreen } from '../screens/BookingsScreen';
import { InboxScreen } from '../screens/InboxScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SearchModal } from '../components/SearchModal';

export type ScreenName =
  | 'SPLASH'
  | 'AUTH'
  | 'HOME'
  | 'SEARCH_RESULTS'
  | 'ROOM_DETAIL'
  | 'FACILITIES'
  | 'REVIEWS'
  | 'DESCRIPTION'
  | 'CHECKOUT'
  | 'PAYMENT_SUCCESS'
  | 'FAVORITES'
  | 'BOOKINGS'
  | 'INBOX'
  | 'PROFILE';

export const AppNavigator: React.FC = () => {
  const { user } = useAuth();
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('HOME');

  // Search State & Modal
  const [isSearchModalVisible, setIsSearchModalVisible] = useState<boolean>(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilterState>({
    destination: 'Anywhere',
    startDate: '23 May',
    endDate: '31 May',
    daysCount: 1,
    adults: 2,
    children: 0,
    minPrice: 10,
    maxPrice: 250,
    placeTypes: ['entire'],
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    facilities: ['Kitchen', 'Outdoor space'],
    presentTotalPrice: true,
  });

  // Active Stay & Booking
  const [activeStay, setActiveStay] = useState<Accommodation>(INITIAL_ACCOMMODATIONS[0]);
  const [lastBooking, setLastBooking] = useState<BookingDetails | null>({
    bookingId: '00000072697027',
    accommodation: INITIAL_ACCOMMODATIONS[0],
    checkIn: '09-05-2023',
    checkOut: '15-05-2023',
    nights: 1,
    guests: 1,
    paymentType: 'full',
    roomTotal: 20,
    fees: [
      { label: 'Kayak fee', amount: 5 },
      { label: 'Street parking fee', amount: 5 },
    ],
    totalPrice: 30,
    paidAmount: 30,
    paymentDate: '09-05-2023',
    paymentTime: '05:40 AM',
    paymentMethod: 'Credit card',
  });

  // Handle Tab navigation
  const handleTabChange = (tab: BottomTabType) => {
    switch (tab) {
      case 'Search':
        setCurrentScreen('HOME');
        break;
      case 'Favorites':
        setCurrentScreen('FAVORITES');
        break;
      case 'Bookings':
        setCurrentScreen('BOOKINGS');
        break;
      case 'Inbox':
        setCurrentScreen('INBOX');
        break;
      case 'Profile':
        setCurrentScreen('PROFILE');
        break;
    }
  };

  // 1. Splash Screen
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // 2. Auth Screen
  if (!user) {
    return <AuthScreen />;
  }

  // Toggle favorite helper
  const handleToggleFavorite = async (id: string) => {
    await mockApi.toggleFavorite(id);
    if (activeStay.id === id) {
      setActiveStay((prev) => ({ ...prev, isFavorite: !prev.isFavorite }));
    }
  };

  // Render current screen
  return (
    <View style={styles.container}>
      {currentScreen === 'HOME' && (
        <HomeScreen
          onOpenSearch={() => setIsSearchModalVisible(true)}
          onSelectStay={(stay) => {
            setActiveStay(stay);
            setCurrentScreen('ROOM_DETAIL');
          }}
          onTabChange={handleTabChange}
        />
      )}

      {currentScreen === 'SEARCH_RESULTS' && (
        <SearchResultsScreen
          filters={searchFilters}
          onOpenSearch={() => setIsSearchModalVisible(true)}
          onSelectStay={(stay) => {
            setActiveStay(stay);
            setCurrentScreen('ROOM_DETAIL');
          }}
          onBackToHome={() => setCurrentScreen('HOME')}
          onTabChange={handleTabChange}
        />
      )}

      {currentScreen === 'ROOM_DETAIL' && (
        <RoomDetailScreen
          stay={activeStay}
          onBack={() => setCurrentScreen('HOME')}
          onToggleFavorite={handleToggleFavorite}
          onOpenFacilities={() => setCurrentScreen('FACILITIES')}
          onOpenReviews={() => setCurrentScreen('REVIEWS')}
          onOpenDescription={() => setCurrentScreen('DESCRIPTION')}
          onBookNow={() => setCurrentScreen('CHECKOUT')}
        />
      )}

      {currentScreen === 'FACILITIES' && (
        <FacilitiesScreen
          stay={activeStay}
          onBack={() => setCurrentScreen('ROOM_DETAIL')}
        />
      )}

      {currentScreen === 'REVIEWS' && (
        <ReviewsScreen
          stay={activeStay}
          onBack={() => setCurrentScreen('ROOM_DETAIL')}
        />
      )}

      {currentScreen === 'DESCRIPTION' && (
        <DescriptionScreen
          stay={activeStay}
          onBack={() => setCurrentScreen('ROOM_DETAIL')}
        />
      )}

      {currentScreen === 'CHECKOUT' && (
        <CheckoutScreen
          stay={activeStay}
          onBack={() => setCurrentScreen('ROOM_DETAIL')}
          onConfirmPayment={(booking) => {
            setLastBooking(booking);
            setCurrentScreen('PAYMENT_SUCCESS');
          }}
        />
      )}

      {currentScreen === 'PAYMENT_SUCCESS' && (
        <PaymentSuccessScreen
          booking={
            lastBooking || {
              bookingId: '00000072697027',
              accommodation: activeStay,
              checkIn: '09-05-2023',
              checkOut: '15-05-2023',
              nights: 1,
              guests: 1,
              paymentType: 'full',
              roomTotal: 20,
              fees: [
                { label: 'Kayak fee', amount: 5 },
                { label: 'Street parking fee', amount: 5 },
              ],
              totalPrice: 30,
              paidAmount: 30,
              paymentDate: '09-05-2023',
              paymentTime: '05:40 AM',
              paymentMethod: 'Credit card',
            }
          }
          onViewBooking={() => setCurrentScreen('BOOKINGS')}
        />
      )}

      {currentScreen === 'FAVORITES' && (
        <FavoritesScreen
          onBack={() => setCurrentScreen('HOME')}
          onSelectStay={(stay) => {
            setActiveStay(stay);
            setCurrentScreen('ROOM_DETAIL');
          }}
          onTabChange={handleTabChange}
        />
      )}

      {currentScreen === 'BOOKINGS' && (
        <BookingsScreen
          lastBooking={lastBooking}
          onExplore={() => setCurrentScreen('HOME')}
          onSelectBookingDetail={(booking) => {
            setActiveStay(booking.accommodation);
            setCurrentScreen('PAYMENT_SUCCESS');
          }}
          onTabChange={handleTabChange}
        />
      )}

      {currentScreen === 'INBOX' && (
        <InboxScreen onTabChange={handleTabChange} />
      )}

      {currentScreen === 'PROFILE' && (
        <ProfileScreen onTabChange={handleTabChange} />
      )}

      {/* MULTI-STEP SEARCH MODAL (Pages 4, 5, 6) */}
      <SearchModal
        visible={isSearchModalVisible}
        onClose={() => setIsSearchModalVisible(false)}
        initialFilters={searchFilters}
        onSearch={(newFilters) => {
          setSearchFilters(newFilters);
          setCurrentScreen('SEARCH_RESULTS');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
