import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Accommodation, BottomTabType } from '../types';
import { mockApi } from '../api/mockApi';
import { BottomTabBar } from '../components/BottomTabBar';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';

import { useResponsive, formatGridData } from '../hooks/useResponsive';

interface FavoritesScreenProps {
  onBack: () => void;
  onSelectStay: (stay: Accommodation) => void;
  onTabChange: (tab: BottomTabType) => void;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({
  onBack,
  onSelectStay,
  onTabChange,
}) => {
  const { formatPrice } = useCurrency();
  const { isDarkMode, colors } = useTheme();
  const { isMobile, isTablet, isDesktop, gridColumns, contentMaxWidth, horizontalPadding } = useResponsive();

  const [favoriteStays, setFavoriteStays] = useState<Accommodation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadFavorites = useCallback(async () => {
    try {
      setIsLoading(true);
      const all = await mockApi.getAccommodations();
      const favs = all.filter((s) => s.isFavorite);
      setFavoriteStays(favs);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleToggleFavorite = async (id: string) => {
    setFavoriteStays((prev) => prev.filter((item) => item.id !== id));
    await mockApi.toggleFavorite(id);
  };

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
    return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
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
          source={{ uri: item.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80' }}
          style={styles.cardImage}
        />
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => handleToggleFavorite(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="heart" size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardTitleRow}>
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.cardInfoRow}>
          <View style={styles.bedroomInfo}>
            <Ionicons name="bed-outline" size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
            <Text style={[styles.bedroomText, { color: colors.textSecondary }]}>{item.bedrooms || 1} phòng ngủ</Text>
          </View>
          <Text style={[styles.priceText, { color: colors.textSecondary }]}>
            <Text style={[styles.priceBold, { color: colors.text }]}>{formatPrice(item.pricePerNight)}</Text>
            /đêm
          </Text>
        </View>
      </View>
    </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.statusBar} />

      {/* HEADER (Page 16) */}
      <View style={{ width: '100%', backgroundColor: colors.card, borderBottomColor: colors.border, borderBottomWidth: 1 }}>
        <View style={[styles.header, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%', paddingHorizontal: horizontalPadding }]}>
          <TouchableOpacity onPress={onBack} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Yêu thích</Text>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="ellipsis-horizontal" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* MAIN CONTENT */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00BDD6" />
        </View>
      ) : (
        <FlatList
          key={`fav-grid-${gridColumns}`}
          data={formatGridData(favoriteStays, gridColumns)}
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
          ListHeaderComponent={() => (
            <Text style={[styles.sectionTitle, { color: colors.text, paddingHorizontal: gridColumns > 1 ? 12 : 20 }]}>
              Những nơi bạn thích
            </Text>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="heart-dislike-outline" size={48} color={isDarkMode ? '#475569' : '#D1D5DB'} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Chưa có mục yêu thích nào</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Bấm biểu tượng trái tim ở bất kỳ nơi lưu trú nào để lưu lại tại đây.</Text>
            </View>
          )}
        />
      )}


      {/* BOTTOM TAB BAR (Favorites active) */}
      <BottomTabBar
        activeTab="Favorites"
        onTabChange={onTabChange}
        favoritesCount={favoriteStays.length}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 20,
    marginTop: 8,
  },
  listContent: {
    paddingHorizontal: 20,
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
});
