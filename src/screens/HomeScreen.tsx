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
import { aiService } from '../services/aiService';
import { SearchHeader } from '../components/SearchHeader';
import { CategorySelector } from '../components/CategorySelector';
import { StayCard } from '../components/StayCard';
import { BottomTabBar } from '../components/BottomTabBar';
import { VoiceSearchModal } from '../components/VoiceSearchModal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface HomeScreenProps {
  onOpenSearch: () => void;
  onSelectStay: (stay: Accommodation) => void;
  onTabChange: (tab: BottomTabType) => void;
  onOpenAiSupport?: (prompt?: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenSearch,
  onSelectStay,
  onTabChange,
  onOpenAiSupport,
}) => {
  const { user, logout } = useAuth();
  const { colors, isDark } = useTheme();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<StayCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stays, setStays] = useState<Accommodation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

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

  const handleVoiceSearchResult = async (spokenText: string) => {
    setIsLoading(true);
    try {
      const result = await aiService.processVoiceQuery(spokenText);

      // Nếu là câu hỏi lập lịch trình hoặc FAQ, tự động chuyển sang Trợ lý AI chat
      if (result.isItineraryOrFaq && onOpenAiSupport) {
        onOpenAiSupport(spokenText);
        return;
      }

      // Cập nhật tìm kiếm theo từ khóa thông minh
      if (result.destination) {
        setSearchQuery(result.destination);
      } else {
        setSearchQuery('');
      }

      if (result.category && result.category !== 'All') {
        setSelectedCategory(result.category);
      } else {
        setSelectedCategory('All');
      }

      setStays(result.matchingStays);
      setAiNotice(result.aiMessage);
    } catch (err) {
      console.warn('Lỗi xử lý tìm kiếm giọng nói AI:', err);
      loadStays();
    } finally {
      setIsLoading(false);
    }
  };

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.container}>
        {/* TOP GREETING & LOGOUT BAR */}
        <View style={[styles.topBar, { backgroundColor: isDark ? colors.card : '#EDF9FA', borderBottomColor: colors.border, borderBottomWidth: isDark ? 1 : 0 }]}>
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
              <Text style={[styles.greetingSub, { color: colors.subText }]}>Xin chào 👋</Text>
              <Text style={[styles.greetingName, { color: colors.text }]} numberOfLines={1}>
                {user?.name || 'Du khách'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickLogoutBtn, { backgroundColor: isDark ? colors.card : '#FFFFFF', borderColor: isDark ? '#7F1D1D' : '#FEE2E2' }]}
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
          onVoicePress={() => setIsVoiceModalOpen(true)}
        />

        {/* CATEGORY TABS (Beach, Mountain, Camping) */}
        <CategorySelector
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setAiNotice(null);
            setSelectedCategory((prev) => (prev === cat ? 'All' : cat));
          }}
        />

        {/* AI VOICE SEARCH NOTICE */}
        {!!aiNotice && (
          <View style={styles.aiNoticeBanner}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 }}>
              <Ionicons name="sparkles" size={17} color="#00BDD6" style={{ marginRight: 8 }} />
              <Text style={styles.aiNoticeText}>{aiNotice}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setAiNotice(null);
                setSearchQuery('');
                setSelectedCategory('All');
                loadStays();
              }}
              style={{ padding: 4 }}
            >
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        )}

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
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Không tìm thấy nơi lưu trú phù hợp</Text>
                <Text style={[styles.emptySubtitle, { color: colors.subText }]}>Hãy thử chọn danh mục khác hoặc nhập từ khóa tìm kiếm mới.</Text>
              </View>
            }
          />
        )}
      </View>

      {/* VOICE SEARCH MODAL */}
      <VoiceSearchModal
        visible={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onResult={handleVoiceSearchResult}
      />

      {/* LOGOUT CONFIRMATION MODAL */}
      <Modal
        visible={isLogoutModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsLogoutModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.confirmModalBox, { backgroundColor: colors.card }]}>
            <View style={styles.logoutIconCircle}>
              <Ionicons name="log-out" size={32} color="#EF4444" />
            </View>

            <Text style={[styles.confirmModalTitle, { color: colors.text }]}>Đăng xuất tài khoản</Text>
            <Text style={[styles.confirmModalMessage, { color: colors.subText }]}>
              Bạn có chắc chắn muốn đăng xuất không? Khi đăng nhập lại, bạn sẽ cần nhập lại tên đăng nhập và mật khẩu.
            </Text>

            <View style={styles.confirmModalBtnRow}>
              <TouchableOpacity
                style={[styles.confirmCancelBtn, { backgroundColor: colors.inputBg }]}
                onPress={() => setIsLogoutModalOpen(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.confirmCancelText, { color: colors.subText }]}>Hủy</Text>
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
  aiNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: '#00BDD6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  aiNoticeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F766E',
    lineHeight: 18,
    flex: 1,
  },
});
