import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Accommodation, BottomTabType, CategoryItem, StayCategory } from '../types';
import { mockApi } from '../api/mockApi';
import { SearchHeader } from '../components/SearchHeader';
import { CategorySelector } from '../components/CategorySelector';
import { StayCard } from '../components/StayCard';
import { BottomTabBar } from '../components/BottomTabBar';
import { useAuth } from '../context/AuthContext';

export const HomeScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<StayCategory | 'All'>('Beach');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stays, setStays] = useState<Accommodation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<BottomTabType>('Search');
  const [selectedStay, setSelectedStay] = useState<Accommodation | null>(null);

  // Load categories and initial stays
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await mockApi.getCategories();
      setCategories(cats);
    } catch (e) {
      console.warn('Failed to fetch categories', e);
    }
  };

  const loadStays = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await mockApi.getAccommodations(
        activeTab === 'Favorites' ? undefined : selectedCategory,
        searchQuery
      );
      if (activeTab === 'Favorites') {
        setStays(data.filter((item) => item.isFavorite));
      } else {
        setStays(data);
      }
    } catch (e) {
      console.warn('Failed to load stays', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedCategory, searchQuery, activeTab]);

  useEffect(() => {
    loadStays();
  }, [loadStays]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadStays();
  };

  const handleToggleFavorite = async (id: string) => {
    // Optimistic UI update
    setStays((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
    if (selectedStay && selectedStay.id === id) {
      setSelectedStay((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }

    try {
      await mockApi.toggleFavorite(id);
    } catch {
      // Revert if error
      loadStays();
    }
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất không?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const favoritesCount = stays.filter((s) => s.isFavorite).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Main Content Area based on Tab */}
      {activeTab === 'Search' || activeTab === 'Favorites' ? (
        <View style={styles.container}>
          {/* Top Search Bar */}
          <SearchHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
          />

          {/* Category Tabs (Beach, Mountain, Camping...) only on Search tab */}
          {activeTab === 'Search' && (
            <CategorySelector
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
            />
          )}

          {activeTab === 'Favorites' && (
            <View style={styles.favoritesHeader}>
              <Text style={styles.favoritesTitle}>Mục yêu thích (Saved)</Text>
              <Text style={styles.favoritesSubtitle}>
                {stays.length} nơi lưu trú bạn đã lưu
              </Text>
            </View>
          )}

          {/* Stays List from Mock API */}
          {isLoading && !isRefreshing ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#00BDD6" />
              <Text style={styles.loadingText}>Đang tải danh sách nơi nghỉ ngơi...</Text>
            </View>
          ) : (
            <FlatList
              data={stays}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <StayCard
                  stay={item}
                  onToggleFavorite={handleToggleFavorite}
                  onPress={(stay) => setSelectedStay(stay)}
                />
              )}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  colors={['#00BDD6']}
                  tintColor="#00BDD6"
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="compass-outline" size={54} color="#D1D5DB" />
                  <Text style={styles.emptyTitle}>Không tìm thấy nơi lưu trú</Text>
                  <Text style={styles.emptySubtitle}>
                    {activeTab === 'Favorites'
                      ? 'Bạn chưa lưu địa điểm nào vào mục yêu thích.'
                      : 'Hãy thử tìm kiếm với từ khóa khác hoặc chuyển danh mục.'}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      ) : activeTab === 'Profile' ? (
        /* Profile Screen */
        <ScrollView style={styles.profileContainer} contentContainerStyle={styles.profileContent}>
          <View style={styles.profileHeader}>
            <Image
              source={{
                uri:
                  user?.avatarUrl ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
              }}
              style={styles.avatarImage}
            />
            <Text style={styles.profileName}>{user?.name || 'Khách du lịch'}</Text>
            <Text style={styles.profileSubtitle}>
              {user?.phoneNumber || user?.email || 'Đăng nhập ẩn danh'}
            </Text>
            <View style={styles.providerBadge}>
              <Text style={styles.providerBadgeText}>
                Phương thức: {user?.authProvider?.toUpperCase() || 'KHÁCH'}
              </Text>
            </View>
          </View>

          <View style={styles.profileMenu}>
            <TouchableOpacity style={styles.profileMenuItem}>
              <Ionicons name="card-outline" size={22} color="#374151" />
              <Text style={styles.profileMenuText}>Phương thức thanh toán</Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.profileMenuItem}>
              <Ionicons name="notifications-outline" size={22} color="#374151" />
              <Text style={styles.profileMenuText}>Thông báo & Tin nhắn</Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.profileMenuItem}>
              <Ionicons name="shield-checkmark-outline" size={22} color="#374151" />
              <Text style={styles.profileMenuText}>Bảo mật & Quyền riêng tư</Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.profileMenuItem}>
              <Ionicons name="help-circle-outline" size={22} color="#374151" />
              <Text style={styles.profileMenuText}>Trung tâm trợ giúp</Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.profileMenuItem, styles.logoutMenuItem]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={22} color="#EF4444" />
              <Text style={[styles.profileMenuText, styles.logoutText]}>
                Đăng xuất tài khoản
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        /* Bookings or Inbox Placeholder */
        <View style={styles.placeholderContainer}>
          <Ionicons
            name={activeTab === 'Bookings' ? 'calendar-outline' : 'chatbubbles-outline'}
            size={60}
            color="#00BDD6"
          />
          <Text style={styles.placeholderTitle}>
            {activeTab === 'Bookings' ? 'Lịch chuyến đi của bạn' : 'Hộp thư tin nhắn'}
          </Text>
          <Text style={styles.placeholderSubtitle}>
            {activeTab === 'Bookings'
              ? 'Tất cả các phòng và kỳ nghỉ đã đặt sẽ hiển thị tại đây.'
              : 'Trò chuyện trực tiếp với chủ nhà để chuẩn bị cho kỳ nghỉ hoàn hảo.'}
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => setActiveTab('Search')}
          >
            <Text style={styles.exploreButtonText}>Khám phá phòng ngay</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Navigation Tabs */}
      <BottomTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        favoritesCount={favoritesCount}
      />

      {/* Stay Detail Preview Modal */}
      {selectedStay && (
        <Modal
          visible={true}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setSelectedStay(null)}
        >
          <SafeAreaView style={styles.modalSafeArea}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedStay(null)}
                >
                  <Ionicons name="chevron-back" size={24} color="#111827" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalFavBtn}
                  onPress={() => handleToggleFavorite(selectedStay.id)}
                >
                  <Ionicons
                    name={selectedStay.isFavorite ? 'heart' : 'heart-outline'}
                    size={24}
                    color={selectedStay.isFavorite ? '#EF4444' : '#111827'}
                  />
                </TouchableOpacity>
              </View>

              <Image
                source={{ uri: selectedStay.images[0] }}
                style={styles.modalImage}
                resizeMode="cover"
              />

              <View style={styles.modalBody}>
                <Text style={styles.modalTitle}>{selectedStay.title}</Text>
                <View style={styles.modalMetaRow}>
                  <Ionicons name="star" size={16} color="#FBBF24" />
                  <Text style={styles.modalRatingText}>{selectedStay.rating.toFixed(1)}</Text>
                  <Text style={styles.modalReviewText}>({selectedStay.reviewCount} đánh giá)</Text>
                  <Text style={styles.modalDot}>•</Text>
                  <Text style={styles.modalLocationText}>{selectedStay.location}</Text>
                </View>

                <View style={styles.modalDivider} />

                <Text style={styles.sectionHeading}>Mô tả</Text>
                <Text style={styles.modalDesc}>{selectedStay.description}</Text>

                <View style={styles.modalDivider} />

                <Text style={styles.sectionHeading}>Tiện ích nổi bật</Text>
                <View style={styles.amenitiesWrap}>
                  {selectedStay.amenities.map((amenity, idx) => (
                    <View key={idx} style={styles.amenityChip}>
                      <Ionicons name="checkmark-circle" size={16} color="#00BDD6" />
                      <Text style={styles.amenityText}>{amenity}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.modalDivider} />

                <View style={styles.hostRow}>
                  <Image source={{ uri: selectedStay.host.avatar }} style={styles.hostAvatar} />
                  <View>
                    <Text style={styles.hostName}>Chủ nhà: {selectedStay.host.name}</Text>
                    <Text style={styles.hostStatus}>Chủ nhà siêu cấp (Superhost)</Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Modal Bottom Bar */}
            <View style={styles.modalBottomBar}>
              <View>
                <Text style={styles.modalPriceAmount}>${selectedStay.pricePerNight}</Text>
                <Text style={styles.modalPriceUnit}>/đêm</Text>
              </View>
              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => {
                  Alert.alert('Thành công', `Đã chọn đặt ${selectedStay.title}!`);
                  setSelectedStay(null);
                }}
              >
                <Text style={styles.bookButtonText}>Đặt phòng ngay</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  favoritesHeader: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  favoritesTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  favoritesSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  exploreButton: {
    marginTop: 24,
    backgroundColor: '#00BDD6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  profileContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  profileContent: {
    paddingBottom: 30,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatarImage: {
    width: 86,
    height: 86,
    borderRadius: 43,
    marginBottom: 12,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  profileSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  providerBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
  },
  providerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  profileMenu: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  profileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  profileMenuText: {
    flex: 1,
    marginLeft: 14,
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  logoutMenuItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#EF4444',
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalFavBtn: {
    padding: 6,
  },
  modalImage: {
    width: '100%',
    height: 280,
  },
  modalBody: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  modalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  modalRatingText: {
    fontWeight: '700',
    marginLeft: 4,
    fontSize: 14,
    color: '#111827',
  },
  modalReviewText: {
    marginLeft: 4,
    color: '#6B7280',
    fontSize: 14,
  },
  modalDot: {
    marginHorizontal: 8,
    color: '#9CA3AF',
  },
  modalLocationText: {
    color: '#4B5563',
    fontSize: 14,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 18,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  amenitiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 6,
  },
  amenityText: {
    fontSize: 13,
    color: '#0F766E',
    fontWeight: '500',
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hostAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  hostName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  hostStatus: {
    fontSize: 13,
    color: '#6B7280',
  },
  modalBottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  modalPriceAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalPriceUnit: {
    fontSize: 13,
    color: '#6B7280',
  },
  bookButton: {
    backgroundColor: '#00BDD6',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
