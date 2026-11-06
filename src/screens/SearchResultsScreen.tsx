import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
FlatList,
  TouchableOpacity,
  Image,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Accommodation, BottomTabType, SearchFilterState } from '../types';
import { mockApi } from '../api/mockApi';
import { FilterModal } from '../components/FilterModal';
import { BottomTabBar } from '../components/BottomTabBar';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import { useResponsive, formatGridData } from '../hooks/useResponsive';

interface SearchResultsScreenProps {
  filters: SearchFilterState;
  onOpenSearch: () => void;
  onSelectStay: (stay: Accommodation) => void;
  onTabChange: (tab: BottomTabType) => void;
  onBackToHome: () => void;
}

export const SearchResultsScreen: React.FC<SearchResultsScreenProps> = ({
  filters,
  onOpenSearch,
  onSelectStay,
  onTabChange,
  onBackToHome,
}) => {
  const { formatPrice } = useCurrency();
  const { isDarkMode, colors } = useTheme();
  const { isMobile, isTablet, isDesktop, gridColumns, contentMaxWidth, horizontalPadding } = useResponsive();
  const [stays, setStays] = useState<Accommodation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [presentTotalPrice, setPresentTotalPrice] = useState<boolean>(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [currentFilters, setCurrentFilters] = useState<SearchFilterState>(filters);

  useEffect(() => {
    setCurrentFilters(filters);
  }, [filters]);

  useEffect(() => {
    loadResults();
  }, [currentFilters]);

  const loadResults = async () => {
    try {
      setIsLoading(true);
      const data = await mockApi.getAccommodations(
        undefined,
        currentFilters.destination === 'Anywhere' ? undefined : currentFilters.destination,
        currentFilters
      );
      setStays(data);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    setStays((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
    await mockApi.toggleFavorite(id);
  };

  const dateSummary =
    currentFilters.startDate && currentFilters.endDate
      ? `${currentFilters.startDate} - ${currentFilters.endDate}`
      : 'Bất kỳ lúc nào';
  const destSummary =
    !currentFilters.destination || currentFilters.destination === 'Anywhere'
      ? 'Bất kỳ đâu'
      : currentFilters.destination;
  const totalGuests = (currentFilters.adults || 0) + (currentFilters.children || 0);
  const guestBadge = totalGuests > 0 ? `, ${totalGuests} khách` : '';
  const ratingBadge = currentFilters.minRating ? ` • ⭐ ${currentFilters.minRating}+` : '';
  const headerSummaryText = `${destSummary}, ${dateSummary}${guestBadge}${ratingBadge}`;

  const renderStayCard = ({ item }: { item: any }) => {
    if (item.empty) {
      return (
        <View
          style={{
            flex: gridColumns > 1 ? 1 : undefined,
            marginHorizontal: gridColumns > 1 ? 8 : 20,
          }}
        />
      );
    }
    const hasSpecificNights = !!(
      currentFilters.startDate &&
      currentFilters.endDate &&
      currentFilters.daysCount &&
      currentFilters.daysCount > 1
    );
    const displayPrice =
      presentTotalPrice && hasSpecificNights
        ? item.pricePerNight * currentFilters.daysCount
        : item.pricePerNight;

    return (
      <TouchableOpacity
        style={[
          styles.cardContainer,
          {
            flex: gridColumns > 1 ? 1 : undefined,
            marginHorizontal: gridColumns > 1 ? 8 : 20,
            marginBottom: 20,
          },
        ]}
        activeOpacity={0.9}
        onPress={() => onSelectStay(item)}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: item.images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80' }}
            style={styles.cardImage}
          />
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => handleToggleFavorite(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={item.isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={item.isFavorite ? '#EF4444' : '#1F2937'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardTitleRow}>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={[styles.ratingText, { color: colors.text }]}>{item.rating.toFixed(1)}</Text>
            </View>
          </View>

          <View style={styles.cardInfoRow}>
            <View style={styles.bedroomInfo}>
              <Ionicons name="bed-outline" size={14} color="#6B7280" style={{ marginRight: 4 }} />
              <Text style={[styles.bedroomText, { color: colors.textSecondary }]}>{item.bedrooms || 1} phòng ngủ</Text>
            </View>
            <Text style={[styles.priceText, { color: colors.textSecondary }]}>
              <Text style={[styles.priceBold, { color: colors.text }]}>{formatPrice(displayPrice)}</Text>
              {presentTotalPrice && hasSpecificNights ? '/' + currentFilters.daysCount + ' đêm' : '/đêm'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* SEARCH HEADER BAR (Page 7) */}
      <View style={{ width: '100%', backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <View style={[styles.header, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%', paddingHorizontal: horizontalPadding }]}>
          <TouchableOpacity style={[styles.searchPill, { backgroundColor: colors.surface, borderColor: colors.border }]} activeOpacity={0.8} onPress={onOpenSearch}>
            <Ionicons name="search" size={18} color={colors.text} style={{ marginRight: 8 }} />
            <Text style={[styles.searchSummaryText, { color: colors.text }]} numberOfLines={1}>
              {headerSummaryText}
            </Text>
            <TouchableOpacity
              style={styles.filterIconButton}
              onPress={() => setIsFilterModalOpen(true)}
            >
              <Ionicons name="options-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%', paddingHorizontal: horizontalPadding }}>
        {/* ACTIVE FILTER CHIPS */}
        {(currentFilters.minRating || (currentFilters.minPrice > 0 || (currentFilters.maxPrice && currentFilters.maxPrice < 10000000))) ? (
          <View style={styles.activeChipsRow}>
            {!!currentFilters.minRating && (
              <TouchableOpacity
                style={styles.activeChipPill}
                onPress={() => setCurrentFilters((prev) => ({ ...prev, minRating: undefined }))}
              >
                <Ionicons name="star" size={13} color="#F59E0B" style={{ marginRight: 4 }} />
                <Text style={styles.activeChipText}>Từ {currentFilters.minRating}★</Text>
                <Ionicons name="close-circle" size={14} color="#6B7280" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            )}

            {(currentFilters.minPrice > 0 || (currentFilters.maxPrice && currentFilters.maxPrice < 10000000)) && (
              <TouchableOpacity
                style={styles.activeChipPill}
                onPress={() => setCurrentFilters((prev) => ({ ...prev, minPrice: 0, maxPrice: 10000000 }))}
              >
                <Ionicons name="pricetag" size={12} color="#00BDD6" style={{ marginRight: 4 }} />
                <Text style={styles.activeChipText}>
                  {currentFilters.minPrice > 0 ? `${(currentFilters.minPrice / 1000000).toFixed(1)}Tr` : '0đ'} - {currentFilters.maxPrice && currentFilters.maxPrice < 10000000 ? `${(currentFilters.maxPrice / 1000000).toFixed(1)}Tr` : 'Max'}
                </Text>
                <Ionicons name="close-circle" size={14} color="#6B7280" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => setCurrentFilters((prev) => ({ ...prev, minRating: undefined, minPrice: 0, maxPrice: 10000000 }))}
              style={{ paddingHorizontal: 6, justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 12, color: '#EF4444', fontWeight: '600' }}>Xóa lọc</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* TOGGLE ROW: Present total price (Page 7) */}
        <View style={styles.totalPriceToggleRow}>
          <View>
            <Text style={styles.toggleTitle}>Hiển thị tổng giá</Text>
            <Text style={styles.toggleSubtitle}>Trọn gói, trước thuế</Text>
          </View>
          <TouchableOpacity
            style={[styles.checkbox, presentTotalPrice && styles.checkboxActive]}
            onPress={() => setPresentTotalPrice(!presentTotalPrice)}
          >
            {presentTotalPrice && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
          </TouchableOpacity>
        </View>
      </View>

      {/* LIST OF HOMES */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00BDD6" />
        </View>
      ) : (
        <FlatList
          key={`search-grid-${gridColumns}`}
          data={formatGridData(stays, gridColumns)}
          numColumns={gridColumns}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={gridColumns > 1 ? { paddingHorizontal: isDesktop ? 16 : 8, justifyContent: 'flex-start' } : undefined}
          renderItem={renderStayCard}
          contentContainerStyle={[
            styles.listContent,
            {
              maxWidth: contentMaxWidth,
              alignSelf: 'center',
              width: '100%',
              paddingHorizontal: gridColumns > 1 ? 8 : 0,
            },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={56} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>Không tìm thấy chuyến đi</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Không có chỗ ở nào phù hợp với tìm kiếm của bạn.{'\n'}Hãy thử điều chỉnh điểm đến hoặc ngày khác nhé!
              </Text>
            </View>
          }
        />
      )}

      {/* FILTER MODAL */}
      <FilterModal
        visible={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        initialFilters={currentFilters}
        onApply={(updated) => {
          setCurrentFilters((prev) => ({ ...prev, ...updated }));
        }}
      />

      {/* BOTTOM TAB BAR */}
      <BottomTabBar
        activeTab="Search"
        onTabChange={(tab) => {
          if (tab === 'Search') onBackToHome();
          else onTabChange(tab);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    paddingHorizontal: 14,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    backgroundColor: '#FFFFFF',
  },
  searchSummaryText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  filterIconButton: {
    padding: 6,
    borderLeftWidth: 1,
    borderLeftColor: '#F3F4F6',
    marginLeft: 6,
  },
  totalPriceToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  toggleSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: '#00BDD6',
    borderColor: '#00BDD6',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  cardContainer: {
    marginBottom: 24,
  },
  imageWrapper: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContent: {
    marginTop: 10,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 4,
  },
  cardInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  bedroomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bedroomText: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceText: {
    fontSize: 14,
    color: '#374151',
  },
  priceBold: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
  activeChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 6,
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  activeChipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#00BDD6',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activeChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F766E',
  },
});
