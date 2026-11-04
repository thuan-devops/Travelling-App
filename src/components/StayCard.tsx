import React, { useState, useRef, useEffect } from 'react';
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
  PanResponder,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Accommodation } from '../types';
import { useCurrency } from '../context/CurrencyContext';

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
  const { formatPrice } = useCurrency();
  const { width: windowWidth } = useWindowDimensions();
  // Clamped to 440px inside the 480px mobile frame (480 - 40 margin)
  const initialWidth = Math.max(windowWidth > 480 ? 440 : windowWidth - 40, 200);
  const [cardWidth, setCardWidth] = useState<number>(initialWidth);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const scrollViewRef = useRef<any>(null);

  const images =
    stay.images && stay.images.length > 0
      ? stay.images
      : ['https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1000&q=80'];

  // Height proportional to width (aspect ratio ~ 1.15 : 1)
  const imageHeight = Math.round(cardWidth * 0.82);

  // Refs to avoid stale closures in PanResponder
  const activeIndexRef = useRef(activeImageIndex);
  const cardWidthRef = useRef(cardWidth);
  const imagesLengthRef = useRef(images.length);

  useEffect(() => {
    activeIndexRef.current = activeImageIndex;
  }, [activeImageIndex]);

  useEffect(() => {
    cardWidthRef.current = cardWidth;
  }, [cardWidth]);

  useEffect(() => {
    imagesLengthRef.current = images.length;
  }, [images.length]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0 && Math.abs(width - cardWidth) > 1) {
      setCardWidth(width);
      if (activeImageIndex > 0) {
        scrollViewRef.current?.scrollTo({ x: activeImageIndex * width, animated: false });
      }
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (cardWidth || 1));
    if (index !== activeImageIndex && index >= 0 && index < images.length) {
      setActiveImageIndex(index);
    }
  };

  const scrollToImage = (index: number) => {
    if (index >= 0 && index < images.length) {
      setActiveImageIndex(index);
      scrollViewRef.current?.scrollTo({ x: index * (cardWidthRef.current || 1), animated: true });
    }
  };

  const handlePrevImage = () => {
    if (activeImageIndex > 0) {
      scrollToImage(activeImageIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (activeImageIndex < images.length - 1) {
      scrollToImage(activeImageIndex + 1);
    }
  };

  // PanResponder to enable smooth mouse drag on Web & touch swipe on Mobile
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only capture horizontal swipes (dx > 12 and dx > dy)
        return (
          Math.abs(gestureState.dx) > 12 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
        );
      },
      onPanResponderRelease: (_, gestureState) => {
        const curIdx = activeIndexRef.current;
        const total = imagesLengthRef.current;
        const w = cardWidthRef.current || 1;

        if (gestureState.dx < -25) {
          // Dragged left -> Next image
          if (curIdx < total - 1) {
            const nextIdx = curIdx + 1;
            setActiveImageIndex(nextIdx);
            scrollViewRef.current?.scrollTo({ x: nextIdx * w, animated: true });
          } else {
            scrollViewRef.current?.scrollTo({ x: curIdx * w, animated: true });
          }
        } else if (gestureState.dx > 25) {
          // Dragged right -> Previous image
          if (curIdx > 0) {
            const prevIdx = curIdx - 1;
            setActiveImageIndex(prevIdx);
            scrollViewRef.current?.scrollTo({ x: prevIdx * w, animated: true });
          } else {
            scrollViewRef.current?.scrollTo({ x: curIdx * w, animated: true });
          }
        } else {
          scrollViewRef.current?.scrollTo({ x: curIdx * w, animated: true });
        }
      },
    })
  ).current;

  return (
    <View style={styles.cardContainer} onLayout={handleLayout}>
      {/* Image Carousel Wrapper */}
      <View
        style={[styles.imageWrapper, { height: imageHeight }]}
        {...panResponder.panHandlers}
      >
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={{ width: cardWidth, height: imageHeight }}
          contentContainerStyle={{ alignItems: 'center' }}
        >
          {images.map((imgUri, index) => (
            <TouchableOpacity
              key={`${stay.id}-img-${index}`}
              activeOpacity={0.95}
              onPress={() => onPress && onPress(stay)}
              style={{ width: cardWidth, height: imageHeight }}
            >
              <Image
                source={{ uri: imgUri }}
                style={[
                  styles.cardImage,
                  { width: cardWidth, height: imageHeight },
                  Platform.OS === 'web'
                    ? ({ userSelect: 'none', pointerEvents: 'none' } as any)
                    : null,
                ]}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Previous Image Arrow */}
        {images.length > 1 && activeImageIndex > 0 && (
          <TouchableOpacity
            style={[styles.arrowButton, styles.arrowButtonLeft]}
            activeOpacity={0.85}
            onPress={(e) => {
              e?.stopPropagation?.();
              handlePrevImage();
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="chevron-back" size={18} color="#111827" />
          </TouchableOpacity>
        )}

        {/* Next Image Arrow */}
        {images.length > 1 && activeImageIndex < images.length - 1 && (
          <TouchableOpacity
            style={[styles.arrowButton, styles.arrowButtonRight]}
            activeOpacity={0.85}
            onPress={(e) => {
              e?.stopPropagation?.();
              handleNextImage();
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="chevron-forward" size={18} color="#111827" />
          </TouchableOpacity>
        )}

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
              <TouchableOpacity
                key={`dot-${i}`}
                activeOpacity={0.8}
                onPress={(e) => {
                  e?.stopPropagation?.();
                  scrollToImage(i);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                style={styles.dotTouchable}
              >
                <View
                  style={[
                    styles.dot,
                    activeImageIndex === i ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Details (Click to view Stay Detail) */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onPress && onPress(stay)}
        style={styles.detailsClickable}
      >
        {/* Details Row 1: Title and Star Rating */}
        <View style={styles.detailsRow1}>
          <Text style={styles.titleText} numberOfLines={1}>
            {stay.title}
          </Text>
          <View style={styles.ratingBadge}>
            {stay.reviewCount > 0 ? (
              <>
                <Ionicons name="star" size={14} color="#FBBF24" style={styles.starIcon} />
                <Text style={styles.ratingText}>{Number(stay.rating).toFixed(1)}</Text>
              </>
            ) : (
              <View style={styles.newBadge}>
                <Ionicons name="sparkles" size={12} color="#00BDD6" style={{ marginRight: 3 }} />
                <Text style={styles.newBadgeText}>Mới</Text>
              </View>
            )}
          </View>
        </View>

        {/* Details Row 2: Category and Price */}
        <View style={styles.detailsRow2}>
          <Text style={styles.categoryText}>{stay.category}</Text>
          <Text style={styles.priceContainer}>
            <Text style={styles.priceAmount}>{formatPrice(stay.pricePerNight)}</Text>
            <Text style={styles.priceUnit}>/đêm</Text>
          </Text>
        </View>
      </TouchableOpacity>
    </View>
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
  arrowButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  arrowButtonLeft: {
    left: 12,
  },
  arrowButtonRight: {
    right: 12,
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
    zIndex: 10,
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
    gap: 4,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dotTouchable: {
    padding: 2,
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
  detailsClickable: {
    paddingTop: 8,
  },
  detailsRow1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  newBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00BDD6',
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
