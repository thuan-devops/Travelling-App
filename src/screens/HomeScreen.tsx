import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Image,
  Modal,
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

interface HomeScreenProps {
  onOpenSearch: () => void;
  onSelectStay: (stay: Accommodation) => void;
  onTabChange: (tab: BottomTabType) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenSearch,
  onSelectStay,
  onTabChange,
}) => {
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<StayCategory | 'All'>('Beach');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stays, setStays] = useState<Accommodation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);

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
      const data = await mockApi.getAccommodations(selectedCategory, searchQuery);
      setStays(data);
    } catch (e) {
      console.warn('Failed to load stays', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    loadStays();
  }, [loadStays]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadStays();
  };

  const handleToggleFavorite = async (id: string) => {
    setStays((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
    try {
      await mockApi.toggleFavorite(id);
    } catch {
      loadStays();
    }
  };

  const favoritesCount = stays.filter((s) => s.isFavorite).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.container}>
        {/* TOP GREETING & LOGOUT BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.userInfoRow}
            activeOpacity={0.7}
            onPress={() => onTabChange('Profile')}
          >
            <Image
              source={{
                uri:
                  user?.avatarUrl ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
              }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.greetingSub}>Xin chào 👋</Text>
              <Text style={styles.greetingName} numberOfLines={1}>
                {user?.name || 'Du khách'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickLogoutBtn}
            activeOpacity={0.7}
            onPress={() => setIsLogoutModalOpen(true)}
          >
            <Ionicons name="log-out-outline" size={17} color="#EF4444" style={{ marginRight: 4 }} />
            <Text style={styles.quickLogoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>

        {/* TOP SEARCH BAR (Page 3) */}
        <SearchHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
          onPress={onOpenSearch}
        />

        {/* CATEGORY TABS (Beach, Mountain, Camping) */}
        <CategorySelector
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />

        {/* STAYS LIST */}
        {isLoading && !isRefreshing ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#00BDD6" />
            <Text style={styles.loadingText}>Đang tải danh sách nơi lưu trú...</Text>
          </View>
        ) : (
          <FlatList
            data={stays}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <StayCard
                stay={item}
                onToggleFavorite={handleToggleFavorite}
                onPress={onSelectStay}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
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
                <Text style={styles.emptyTitle}>Không tìm thấy nơi lưu trú phù hợp</Text>
                <Text style={styles.emptySubtitle}>Hãy thử chọn danh mục khác hoặc nhập từ khóa tìm kiếm mới.</Text>
              </View>
            }
          />
        )}
      </View>

      {/* LOGOUT CONFIRMATION MODAL */}
      <Modal
        visible={isLogoutModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsLogoutModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalBox}>
            <View style={styles.logoutIconCircle}>
              <Ionicons name="log-out" size={32} color="#EF4444" />
            </View>

            <Text style={styles.confirmModalTitle}>Đăng xuất tài khoản</Text>
            <Text style={styles.confirmModalMessage}>
              Bạn có chắc chắn muốn đăng xuất không? Khi đăng nhập lại, bạn sẽ cần nhập lại tên đăng nhập và mật khẩu.
            </Text>

            <View style={styles.confirmModalBtnRow}>
              <TouchableOpacity
                style={styles.confirmCancelBtn}
                onPress={() => setIsLogoutModalOpen(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmCancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmLogoutBtn}
                onPress={async () => {
                  setIsLogoutModalOpen(false);
                  await logout();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmLogoutText}>Đăng xuất</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* BOTTOM TAB BAR (Page 3: Search active) */}
      <BottomTabBar
        activeTab="Search"
        onTabChange={onTabChange}
        favoritesCount={favoritesCount}
      />
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
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#EDF9FA',
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#00BDD6',
  },
  greetingSub: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  greetingName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  quickLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  quickLogoutText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 24,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#374151',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmModalBox: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  logoutIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmModalMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
  },
  confirmModalBtnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  confirmLogoutBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmLogoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
