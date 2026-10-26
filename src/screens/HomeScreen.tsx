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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Accommodation, BottomTabType, CategoryItem, StayCategory } from '../types';
import { mockApi } from '../api/mockApi';
import { SearchHeader } from '../components/SearchHeader';
import { CategorySelector } from '../components/CategorySelector';
import { StayCard } from '../components/StayCard';
import { BottomTabBar } from '../components/BottomTabBar';

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
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<StayCategory | 'All'>('Beach');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stays, setStays] = useState<Accommodation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

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
});
