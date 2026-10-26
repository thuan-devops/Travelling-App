import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useWindowDimensions,
  LayoutChangeEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Accommodation } from '../types';

interface StayCardProps {
  stay: Accommodation;
  onToggleFavorite: (id: string) => void;
  onPress?: (stay: Accommodation) => void;
}

export const StayCard: React.FC<StayCardProps> = ({
  stay,
  onToggleFavorite,
  onPress,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  // Safe initial width: window width minus margins (20px each side), clamped to max mobile width
  const initialWidth = Math.max(windowWidth > 480 ? 440 : windowWidth - 40, 200);
  const [cardWidth, setCardWidth] = useState<number>(initialWidth);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const images =
    stay.images && stay.images.length > 0
      ? stay.images
      : ['https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1000&q=80'];

  // Height proportional to width (aspect ratio ~ 1.15 : 1) to show full wide-angle view
  const imageHeight = Math.round(cardWidth * 0.85);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0 && Math.abs(width - cardWidth) > 1) {
      setCardWidth(width);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (cardWidth || 1));
    if (index !== activeImageIndex && index >= 0 && index < images.length) {
      setActiveImageIndex(index);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => onPress && onPress(stay)}
      style={styles.cardContainer}
      onLayout={handleLayout}
    >
      {/* Image Carousel with Rounded Corners */}
      <View style={[styles.imageWrapper, { height: imageHeight }]}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={{ width: cardWidth, height: imageHeight }}
          contentContainerStyle={{ alignItems: 'center' }}
        >
          {images.map((imgUri, index) => (
            <Image
              key={`${stay.id}-img-${index}`}
              source={{ uri: imgUri }}
              style={[styles.cardImage, { width: cardWidth, height: imageHeight }]}
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        {/* Favorite Heart Button */}
        <TouchableOpacity
          style={styles.favoriteBadge}
          activeOpacity={0.8}
          onPress={() => onToggleFavorite(stay.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={stay.isFavorite ? 'heart' : 'heart-outline'}
            size={22}
            color={stay.isFavorite ? '#EF4444' : '#374151'}
          />
        </TouchableOpacity>

        {/* Carousel Pagination Dots */}
        {images.length > 1 && (
          <View style={styles.paginationDotsContainer}>
            {images.map((_, i) => (
              <View
                key={`dot-${i}`}
                style={[
                  styles.dot,
                  activeImageIndex === i ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>
        )}
      </View>

      {/* Details Row 1: Title and Star Rating */}
      <View style={styles.detailsRow1}>
        <Text style={styles.titleText} numberOfLines={1}>
          {stay.title}
        </Text>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={14} color="#FBBF24" style={styles.starIcon} />
          <Text style={styles.ratingText}>{Number(stay.rating || 5).toFixed(1)}</Text>
        </View>
      </View>

      {/* Details Row 2: Category and Price */}
      <View style={styles.detailsRow2}>
        <Text style={styles.categoryText}>{stay.category}</Text>
        <Text style={styles.priceContainer}>
          <Text style={styles.priceAmount}>${stay.pricePerNight}</Text>
          <Text style={styles.priceUnit}>/đêm</Text>
        </Text>
      </View>

    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 20,
    marginBottom: 28,
  },
  imageWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  cardImage: {
    backgroundColor: '#E5E7EB',
  },
  favoriteBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  paginationDotsContainer: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  detailsRow1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 10,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  detailsRow2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 3,
  },
  categoryText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  priceContainer: {
    fontSize: 14,
  },
  priceAmount: {
    fontWeight: '700',
    color: '#111827',
    fontSize: 15,
  },
  priceUnit: {
    color: '#374151',
    fontWeight: '400',
    fontSize: 14,
  },
});
