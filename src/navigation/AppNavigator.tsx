import React, { useState, useEffect } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Accommodation, BookingDetails, BottomTabType, SearchFilterState } from '../types';
import { INITIAL_ACCOMMODATIONS, mockApi } from '../api/mockApi';
import { notificationService } from '../services/notificationService';

// Screens
import { SplashScreen } from '../screens/SplashScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SearchResultsScreen } from '../screens/SearchResultsScreen';
import { RoomDetailScreen, SelectedStayDates } from '../screens/RoomDetailScreen';
import { FacilitiesScreen } from '../screens/FacilitiesScreen';
import { ReviewsScreen } from '../screens/ReviewsScreen';
import { DescriptionScreen } from '../screens/DescriptionScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { PaymentSuccessScreen } from '../screens/PaymentSuccessScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { BookingsScreen } from '../screens/BookingsScreen';
import { InboxScreen } from '../screens/InboxScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AiSupportScreen } from '../screens/AiSupportScreen';
import { SearchModal } from '../components/SearchModal';
import { SidebarNav } from '../components/SidebarNav';
import { useResponsive } from '../hooks/useResponsive';
import { useTheme } from '../context/ThemeContext';

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
  | 'PROFILE'
  | 'AI_SUPPORT';

export const AppNavigator: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode, colors } = useTheme();
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('HOME');
  const [history, setHistory] = useState<ScreenName[]>(['HOME']);

  // Search State & Modal
  const [isSearchModalVisible, setIsSearchModalVisible] = useState<boolean>(false);
  const { isMobile } = useResponsive();
  const [favoritesCount, setFavoritesCount] = useState<number>(0);

  const refreshFavorites = async () => {
    try {
      const stored = await mockApi.getStoredFavorites();
      setFavoritesCount(stored.length);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshFavorites();
  }, [user, currentScreen]);

  const getActiveTab = (): BottomTabType => {
    switch (currentScreen) {
      case 'FAVORITES':
        return 'Favorites';
      case 'BOOKINGS':
        return 'Bookings';
      case 'INBOX':
        return 'Inbox';
      case 'PROFILE':
        return 'Profile';
      case 'HOME':
      case 'SEARCH_RESULTS':
      default:
        return 'Search';
    }
  };

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

  // Active Stay & Bookings
  const [activeStay, setActiveStay] = useState<Accommodation>(INITIAL_ACCOMMODATIONS[0]);
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [lastBooking, setLastBooking] = useState<BookingDetails | null>(null);
  const [selectedBookingDates, setSelectedBookingDates] = useState<SelectedStayDates | undefined>();

  // Navigation Stack Helpers
  const navigateTo = (screen: ScreenName) => {
    setCurrentScreen(screen);
    setHistory((prev) => [...prev, screen]);
  };

  const goBack = () => {
    setHistory((prev) => {
      if (prev.length > 1) {
        const next = prev.slice(0, -1);
        setCurrentScreen(next[next.length - 1]);
        return next;
      }
      setCurrentScreen('HOME');
      return ['HOME'];
    });
  };

  // Android Hardware Back button handling
  useEffect(() => {
    const onHardwareBack = () => {
      if (history.length > 1 && currentScreen !== 'HOME') {
        goBack();
        return true; // handled, don't exit
      }
      return false; // at root HOME, allow system default
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
    return () => sub.remove();
  }, [history, currentScreen]);

  // Load persistent bookings on start and whenever user changes
  useEffect(() => {
    mockApi.setCurrentUserId(user ? user.id : null);
    notificationService.setCurrentUserId(user ? user.id : null);
    mockApi.getBookings().then((data) => {
      setBookings(data);
      if (data.length > 0) {
        setLastBooking(data[0]);
      } else {
        setLastBooking(null);
      }
    });
  }, [user]);

  useEffect(() => {
    if (!user) {
      setCurrentScreen('HOME');
      setHistory(['HOME']);
    }
  }, [user]);

  // Handle Tab navigation
  const handleTabChange = (tab: BottomTabType) => {
    let target: ScreenName = 'HOME';
    switch (tab) {
      case 'Search':
        target = 'HOME';
        break;
      case 'Favorites':
        target = 'FAVORITES';
        break;
      case 'Bookings':
        target = 'BOOKINGS';
        break;
      case 'Inbox':
        target = 'INBOX';
        break;
      case 'Profile':
        target = 'PROFILE';
        break;
    }
    setCurrentScreen(target);
    setHistory([target]);
  };

  const handleSelectStay = (stay: Accommodation) => {
    setActiveStay(stay);
    navigateTo('ROOM_DETAIL');
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
    refreshFavorites();
    if (activeStay.id === id) {
      setActiveStay((prev) => ({ ...prev, isFavorite: !prev.isFavorite }));
    }
  };

  // Render current screen
  return (
    <View style={[styles.container, !isMobile && styles.desktopLayoutRow, { backgroundColor: colors.background }]}>
      {/* 🖥️ THANH ĐIỀU HƯỚNG BÊN TRÁI CHO WEB / DESKTOP (Sidebar Navigation) */}
      {!isMobile && (
        <SidebarNav
          activeTab={currentScreen === 'AI_SUPPORT' ? 'AI_SUPPORT' : getActiveTab()}
          onTabChange={handleTabChange}
          favoritesCount={favoritesCount}
          onOpenSearch={() => setIsSearchModalVisible(true)}
          onOpenAiSupport={() => navigateTo('AI_SUPPORT')}
        />
      )}

      {/* KHÔNG GIAN NỘI DUNG MÀN HÌNH CHÍNH */}
      <View style={[styles.screenArea, !isMobile && styles.desktopScreenArea, { backgroundColor: colors.background }]}>
      {currentScreen === 'HOME' && (
        <HomeScreen
          onOpenSearch={() => setIsSearchModalVisible(true)}
          onSelectStay={handleSelectStay}
          onTabChange={handleTabChange}
          onOpenAiSupport={() => navigateTo('AI_SUPPORT')}
        />
      )}

      {currentScreen === 'SEARCH_RESULTS' && (
        <SearchResultsScreen
          filters={searchFilters}
          onOpenSearch={() => setIsSearchModalVisible(true)}
          onSelectStay={handleSelectStay}
          onBackToHome={() => {
            setCurrentScreen('HOME');
            setHistory(['HOME']);
          }}
          onTabChange={handleTabChange}
        />
      )}

      {currentScreen === 'ROOM_DETAIL' && (
        <RoomDetailScreen
          stay={activeStay}
          initialFilters={searchFilters}
          onBack={goBack}
          onToggleFavorite={handleToggleFavorite}
          onOpenFacilities={() => navigateTo('FACILITIES')}
          onOpenReviews={() => navigateTo('REVIEWS')}
          onOpenDescription={() => navigateTo('DESCRIPTION')}
          onBookNow={(dates) => {
            setSelectedBookingDates(dates);
            navigateTo('CHECKOUT');
          }}
        />
      )}

      {currentScreen === 'FACILITIES' && (
        <FacilitiesScreen
          stay={activeStay}
          onBack={goBack}
        />
      )}

      {currentScreen === 'REVIEWS' && (
        <ReviewsScreen
          stay={activeStay}
          onBack={goBack}
          onReviewAdded={(updatedStay) => setActiveStay(updatedStay)}
        />
      )}

      {currentScreen === 'DESCRIPTION' && (
        <DescriptionScreen
          stay={activeStay}
          onBack={goBack}
        />
      )}

      {currentScreen === 'CHECKOUT' && (
        <CheckoutScreen
          stay={activeStay}
          initialFilters={searchFilters}
          selectedDates={selectedBookingDates}
          onBack={goBack}
          onConfirmPayment={async (newBooking) => {
            const uniqueBooking: BookingDetails = {
              ...newBooking,
              bookingId: `000000${Math.floor(10000000 + Math.random() * 90000000)}`,
              paymentDate: new Date().toLocaleDateString('vi-VN'),
              paymentTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            };
            const updated = await mockApi.saveBooking(uniqueBooking);
            setBookings(updated);
            setLastBooking(uniqueBooking);

            try {
              await notificationService.addNotification({
                type: 'booking_success',
                title: 'Đặt chuyến thành công 🎉',
                message: `Chuyến đi đến "${uniqueBooking.accommodation.title}" đã được xác nhận. Nhận phòng: ${uniqueBooking.checkIn}, Trả phòng: ${uniqueBooking.checkOut}. Mã đặt chỗ: #${uniqueBooking.bookingId.slice(-8)}. Chúc bạn có kỳ nghỉ tuyệt vời!`,
                bookingId: uniqueBooking.bookingId,
                actionText: 'Xem chi tiết chuyến đi',
              });
            } catch (e) {
              console.warn('Lỗi khi thêm thông báo đặt phòng:', e);
            }

            setCurrentScreen('PAYMENT_SUCCESS');
            setHistory(['HOME', 'PAYMENT_SUCCESS']);
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
              fees: [],
              totalPrice: 20,
              paidAmount: 20,
              paymentDate: '09-05-2023',
              paymentTime: '05:40 AM',
              paymentMethod: 'Thẻ tín dụng (Credit card)',
            }
          }
          onViewBooking={() => {
            setCurrentScreen('BOOKINGS');
            setHistory(['BOOKINGS']);
          }}
          onExplore={() => {
            setCurrentScreen('HOME');
            setHistory(['HOME']);
          }}
        />
      )}

      {currentScreen === 'FAVORITES' && (
        <FavoritesScreen
          onBack={goBack}
          onSelectStay={handleSelectStay}
          onTabChange={handleTabChange}
        />
      )}

      {currentScreen === 'BOOKINGS' && (
        <BookingsScreen
          bookings={bookings}
          onExplore={() => {
            setCurrentScreen('HOME');
            setHistory(['HOME']);
          }}
          onSelectBookingDetail={(booking) => {
            setLastBooking(booking);
            navigateTo('PAYMENT_SUCCESS');
          }}
          onRebook={handleSelectStay}
          onTabChange={handleTabChange}
          onBookingsUpdated={setBookings}
        />
      )}

      {currentScreen === 'INBOX' && (
        <InboxScreen
          onTabChange={handleTabChange}
          onOpenAiSupport={() => navigateTo('AI_SUPPORT')}
          onViewBooking={(bookingId) => {
            const found = bookings.find((b) => b.bookingId === bookingId);
            if (found) {
              setLastBooking(found);
              navigateTo('PAYMENT_SUCCESS');
            } else {
              navigateTo('BOOKINGS');
            }
          }}
        />
      )}

      {currentScreen === 'PROFILE' && (
        <ProfileScreen
          onTabChange={handleTabChange}
          onOpenAiSupport={() => navigateTo('AI_SUPPORT')}
        />
      )}

      {currentScreen === 'AI_SUPPORT' && (
        <AiSupportScreen
          onBack={goBack}
          onSelectStay={handleSelectStay}
          onApplyFiltersToSearch={(filters) => {
            setSearchFilters((prev) => ({
              ...prev,
              destination: filters.destination || prev.destination,
              maxPrice: filters.maxPrice || prev.maxPrice,
              minPrice: filters.minPrice || prev.minPrice,
              facilities: filters.amenities && filters.amenities.length > 0 ? filters.amenities : prev.facilities,
            }));
            navigateTo('SEARCH_RESULTS');
          }}
          onTabChange={handleTabChange}
        />
      )}

      {/* MULTI-STEP SEARCH MODAL (Pages 4, 5, 6) */}
      <SearchModal
        visible={isSearchModalVisible}
        onClose={() => setIsSearchModalVisible(false)}
        initialFilters={searchFilters}
        onSearch={(newFilters) => {
          setSearchFilters(newFilters);
          navigateTo('SEARCH_RESULTS');
        }}
      />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  desktopLayoutRow: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  screenArea: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  desktopScreenArea: {
    flex: 1,
    height: '100%',
    overflow: 'hidden',
  },
});
