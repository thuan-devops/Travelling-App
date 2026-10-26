import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
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
  const [stays, setStays] = useState<Accommodation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [presentTotalPrice, setPresentTotalPrice] = useState<boolean>(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [currentFilters, setCurrentFilters] = useState<SearchFilterState>(filters);

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

  const headerSummaryText = `${currentFilters.destination || 'Anywhere'}, ${currentFilters.startDate} - ${currentFilters.endDate}, ${currentFilters.adults + currentFilters.children || 2} guests`;

  const renderStayCard = ({ item }: { item: Accommodation }) => {
    const displayPrice = presentTotalPrice
      ? item.pricePerNight * (currentFilters.daysCount || 1)
      : item.pricePerNight;

    return (
      <TouchableOpacity
        style={styles.cardContainer}
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
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          </View>

          <View style={styles.cardInfoRow}>
            <View style={styles.bedroomInfo}>
              <Ionicons name="bed-outline" size={14} color="#6B7280" style={{ marginRight: 4 }} />
              <Text style={styles.bedroomText}>{item.bedrooms || 1} bedroom</Text>
            </View>
            <Text style={styles.priceText}>
              <Text style={styles.priceBold}>${displayPrice}</Text>
              /night
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* SEARCH HEADER BAR (Page 7) */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.searchPill} activeOpacity={0.8} onPress={onOpenSearch}>
          <Ionicons name="search" size={18} color="#111827" style={{ marginRight: 8 }} />
          <Text style={styles.searchSummaryText} numberOfLines={1}>
            {headerSummaryText}
          </Text>
          <TouchableOpacity
            style={styles.filterIconButton}
            onPress={() => setIsFilterModalOpen(true)}
          >
            <Ionicons name="options-outline" size={20} color="#111827" />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      {/* TOGGLE ROW: Present total price (Page 7) */}
      <View style={styles.totalPriceToggleRow}>
        <View>
          <Text style={styles.toggleTitle}>Present total price</Text>
          <Text style={styles.toggleSubtitle}>All-inclusive, pre-tax</Text>
        </View>
        <TouchableOpacity
          style={[styles.checkbox, presentTotalPrice && styles.checkboxActive]}
          onPress={() => setPresentTotalPrice(!presentTotalPrice)}
        >
          {presentTotalPrice && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
        </TouchableOpacity>
      </View>

      {/* LIST OF HOMES */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00BDD6" />
        </View>
      ) : (
        <FlatList
          data={stays}
          keyExtractor={(item) => item.id}
          renderItem={renderStayCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
});
