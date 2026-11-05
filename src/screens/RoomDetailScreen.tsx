import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Dimensions,
  PanResponder,
  Linking,
  Alert,
  Modal,
  TextInput,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { StatusBar as RNStatusBar } from 'react-native';
import { Accommodation, ReviewItem, SearchFilterState } from '../types';
import { CalendarPicker } from '../components/CalendarPicker';
import { getAmenityIcon, mockApi } from '../api/mockApi';
import { useCurrency } from '../context/CurrencyContext';
import { useResponsive } from '../hooks/useResponsive';
import { useTheme } from '../context/ThemeContext';

export interface SelectedStayDates {
  startDate: Date;
  endDate: Date;
  nights: number;
  adults?: number;
  children?: number;
}

interface RoomDetailScreenProps {
  stay: Accommodation;
  initialFilters?: SearchFilterState;
  onBack: () => void;
  onToggleFavorite: (id: string) => void;
  onOpenFacilities: () => void;
  onOpenReviews: () => void;
  onOpenDescription: () => void;
  onBookNow: (dates?: SelectedStayDates) => void;
}

export const RoomDetailScreen: React.FC<RoomDetailScreenProps> = ({
  stay,
  initialFilters,
  onBack,
  onToggleFavorite,
  onOpenFacilities,
  onOpenReviews,
  onOpenDescription,
  onBookNow,
}) => {
  const { formatPrice } = useCurrency();
  const { isDarkMode, colors } = useTheme();
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Date selection state
  const defaultToday = new Date();
  defaultToday.setHours(0, 0, 0, 0);
  const defaultEnd = new Date(defaultToday.getTime() + 2 * 24 * 60 * 60 * 1000);

  const [startDate, setStartDate] = useState<Date>(defaultToday);
  const [endDate, setEndDate] = useState<Date>(defaultEnd);
  const [nights, setNights] = useState<number>(2);
  const [adults, setAdults] = useState<number>(initialFilters?.adults || 2);
  const [children, setChildren] = useState<number>(initialFilters?.children || 0);
  const totalGuests = adults + children;

  // Tính phụ phí khách phát sinh: Tiêu chuẩn 2 khách
  // Người lớn thêm (từ khách thứ 3): +30% giá phòng/đêm
  // Trẻ em thêm: +15% giá phòng/đêm
  const baseCapacity = 2;
  const extraAdults = Math.max(0, adults - baseCapacity);
  const remainingBaseCapacity = Math.max(0, baseCapacity - adults);
  const extraChildren = Math.max(0, children - remainingBaseCapacity);

  const extraAdultsFeePerNight = Math.round(stay.pricePerNight * 0.30 * extraAdults);
  const extraChildrenFeePerNight = Math.round(stay.pricePerNight * 0.15 * extraChildren);
  const extraGuestFeePerNight = extraAdultsFeePerNight + extraChildrenFeePerNight;
  const extraGuestFeeTotal = extraGuestFeePerNight * nights;
  const totalExtraGuests = extraAdults + extraChildren;

  const roomBaseTotal = stay.pricePerNight * nights;
  const roomTotalWithGuests = roomBaseTotal + extraGuestFeeTotal;
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState<boolean>(false);

  const formatDateStr = (d: Date) => {
    return `${d.getDate()} Thg ${d.getMonth() + 1}, ${d.getFullYear()}`;
  };
  const { isMobile, isTablet, isDesktop, width: screenWidth, contentMaxWidth, horizontalPadding } = useResponsive();
  const [measuredHeroWidth, setMeasuredHeroWidth] = useState<number>(0);
  const heroWidth = measuredHeroWidth > 0 ? measuredHeroWidth : (isDesktop ? Math.min(contentMaxWidth as number, screenWidth - 48) : screenWidth);
  const scrollViewRef = useRef<any>(null);

  // Quản lý đánh giá và chỉnh sửa đánh giá
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(stay.reviewsList || []);
  const [currentRating, setCurrentRating] = useState<number>(stay.rating || 0);
  const [currentReviewCount, setCurrentReviewCount] = useState<number>(stay.reviewCount || 0);

  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);
  const [editRating, setEditRating] = useState<number>(5);
  const [editComment, setEditComment] = useState<string>('');
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setReviewsList(stay.reviewsList || []);
    setCurrentRating(stay.rating || 0);
    setCurrentReviewCount(stay.reviewCount || 0);
    setAdults(initialFilters?.adults || 2);
    setChildren(initialFilters?.children || 0);
  }, [stay.id, stay.reviewsList, stay.rating, stay.reviewCount, initialFilters?.adults, initialFilters?.children]);

  const handleOpenEditModal = (review: ReviewItem) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedReview = async () => {
    if (!editComment.trim()) {
      Alert.alert('Thông báo', 'Nội dung nhận xét không được để trống.');
      return;
    }
    if (!editingReview) return;

    try {
      const { updatedReview, updatedStay } = await mockApi.updateReview(
        stay.id,
        editingReview.id,
        {
          rating: editRating,
          comment: editComment.trim(),
        }
      );

      const updatedList = reviewsList.map((r) =>
        r.id === updatedReview.id ? updatedReview : r
      );
      setReviewsList(updatedList);
      setCurrentRating(updatedStay.rating);
      setCurrentReviewCount(updatedStay.reviewCount);

      // Đồng bộ vào stay prop
      stay.reviewsList = updatedList;
      stay.rating = updatedStay.rating;
      stay.reviewCount = updatedStay.reviewCount;

      setIsEditModalOpen(false);
      setEditingReview(null);
      Alert.alert('Thành công', 'Đã cập nhật đánh giá của bạn!');
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật đánh giá lúc này. Vui lòng thử lại.');
    }
  };

  const images =
    stay.images?.length > 0
      ? stay.images
      : ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80'];

  const activeIndexRef = useRef(activeImageIndex);
  useEffect(() => {
    activeIndexRef.current = activeImageIndex;
  }, [activeImageIndex]);

  const scrollToImage = (index: number) => {
    if (index >= 0 && index < images.length) {
      setActiveImageIndex(index);
      scrollViewRef.current?.scrollTo({ x: index * heroWidth, animated: true });
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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dx) > 12 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
        );
      },
      onPanResponderRelease: (_, gestureState) => {
        const curIdx = activeIndexRef.current;
        if (gestureState.dx < -25) {
          if (curIdx < images.length - 1) {
            scrollToImage(curIdx + 1);
          } else {
            scrollToImage(curIdx);
          }
        } else if (gestureState.dx > 25) {
          if (curIdx > 0) {
            scrollToImage(curIdx - 1);
          } else {
            scrollToImage(curIdx);
          }
        } else {
          scrollToImage(curIdx);
        }
      },
    })
  ).current;

  // Mở Google Maps cho từng địa điểm
  const handleShareStay = async () => {
    try {
      const shareMessage = `🌟 Khám phá "${stay.title}" tại ${stay.location} trên Travelling App!\n\n` +
        `• Giá chỉ từ: ${formatPrice(stay.pricePerNight)}/đêm\n` +
        `• Đánh giá: ⭐ ${stay.rating.toFixed(1)} (${currentReviewCount} nhận xét)\n` +
        `• Tiện ích: ${stay.amenities.slice(0, 4).join(', ')}\n\n` +
        `Đặt phòng ngay qua Travelling App nhé! 🌴`;

      await Share.share({
        message: shareMessage,
        title: stay.title,
      });
    } catch (e) {
      console.warn('Lỗi khi chia sẻ:', e);
    }
  };

  const handleOpenGoogleMaps = () => {
    const query = encodeURIComponent(`${stay.title}, ${stay.location}`);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(googleMapsUrl).catch(() => {
      Alert.alert('Thông báo', 'Không thể mở liên kết Google Maps trên thiết bị.');
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.mainDetailWrapper, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%', paddingHorizontal: isDesktop ? horizontalPadding : 0 }]}>
          {/* DESKTOP TOP NAV BAR */}
          {isDesktop && (
            <View style={[styles.desktopTopNav, { borderBottomColor: colors.border }]}>
              <TouchableOpacity style={[styles.desktopBackBtn, { backgroundColor: colors.surface }]} onPress={onBack}>
                <Ionicons name="arrow-back" size={18} color={colors.text} style={{ marginRight: 6 }} />
                <Text style={[styles.desktopBackText, { color: colors.text }]}>Quay lại danh sách</Text>
              </TouchableOpacity>
              <View style={styles.desktopNavActions}>
                <TouchableOpacity style={[styles.desktopActionBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={handleShareStay}>
                  <Ionicons name="share-social-outline" size={16} color={colors.text} style={{ marginRight: 6 }} />
                  <Text style={[styles.desktopActionText, { color: colors.text }]}>Chia sẻ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.desktopActionBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => onToggleFavorite(stay.id)}>
                  <Ionicons
                    name={stay.isFavorite ? 'heart' : 'heart-outline'}
                    size={16}
                    color={stay.isFavorite ? '#EF4444' : colors.text}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.desktopActionText, { color: colors.text }]}>{stay.isFavorite ? 'Đã lưu' : 'Lưu'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* HERO IMAGE SECTION */}
          {isDesktop ? (
            <View style={[styles.desktopHeroContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Main Photo (left 65% or 100% if 1 image) */}
              <View style={[styles.desktopMainImageCol, images.length === 1 && { flex: 1 }]}>
                <Image
                  source={{ uri: images[activeImageIndex] || images[0] }}
                  style={styles.desktopMainImage}
                />

                {/* Left/Right navigation arrows */}
                {images.length > 1 && (
                  <>
                    <TouchableOpacity
                      style={[styles.arrowButton, styles.arrowButtonLeft, { opacity: activeImageIndex > 0 ? 0.92 : 0.4 }]}
                      activeOpacity={0.85}
                      disabled={activeImageIndex === 0}
                      onPress={handlePrevImage}
                    >
                      <Ionicons name="chevron-back" size={20} color="#111827" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.arrowButton, styles.arrowButtonRight, { opacity: activeImageIndex < images.length - 1 ? 0.92 : 0.4 }]}
                      activeOpacity={0.85}
                      disabled={activeImageIndex >= images.length - 1}
                      onPress={handleNextImage}
                    >
                      <Ionicons name="chevron-forward" size={20} color="#111827" />
                    </TouchableOpacity>
                  </>
                )}

                {/* Photo counter badge */}
                <View style={styles.photoCountBadge}>
                  <Ionicons name="images-outline" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.photoCountText}>{`${activeImageIndex + 1}/${images.length}`}</Text>
                </View>
              </View>

              {/* Side Photo(s) on right (35% width) */}
              {images.length > 1 && (
                <View style={styles.desktopSideImagesCol}>
                  {images.slice(1, 3).map((imgUrl, idx) => {
                    const actualIdx = idx + 1;
                    const isActive = activeImageIndex === actualIdx;
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.desktopSideImageWrap,
                          images.length === 2 && { flex: 1, height: '100%' },
                          isActive && styles.desktopSideImageWrapActive,
                        ]}
                        activeOpacity={0.85}
                        onPress={() => setActiveImageIndex(actualIdx)}
                      >
                        <Image source={{ uri: imgUrl }} style={styles.desktopSideImage} />
                        {isActive && (
                          <View style={styles.activeSideIndicator}>
                            <Ionicons name="eye" size={16} color="#00BDD6" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          ) : (
            <View
              style={styles.imageContainer}
              onLayout={(e) => {
                const w = e.nativeEvent.layout.width;
                if (w > 0 && Math.abs(w - measuredHeroWidth) > 2) {
                  setMeasuredHeroWidth(w);
                }
              }}
              {...panResponder.panHandlers}
            >
              <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  const slide = Math.round(e.nativeEvent.contentOffset.x / heroWidth);
                  if (slide !== activeImageIndex && slide >= 0 && slide < images.length) {
                    setActiveImageIndex(slide);
                  }
                }}
                scrollEventThrottle={16}
              >
                {images.map((img, index) => (
                  <Image
                    key={index}
                    source={{ uri: img }}
                    style={[
                      styles.heroImage,
                      { width: heroWidth },
                      Platform.OS === 'web'
                        ? ({ userSelect: 'none', pointerEvents: 'none' } as any)
                        : null,
                    ]}
                  />
                ))}
              </ScrollView>

              {/* Previous Arrow Button */}
              {images.length > 1 && activeImageIndex > 0 && (
                <TouchableOpacity
                  style={[styles.arrowButton, styles.arrowButtonLeft]}
                  activeOpacity={0.85}
                  onPress={(e) => {
                    e?.stopPropagation?.();
                    handlePrevImage();
                  }}
                >
                  <Ionicons name="chevron-back" size={20} color="#111827" />
                </TouchableOpacity>
              )}

              {/* Next Arrow Button */}
              {images.length > 1 && activeImageIndex < images.length - 1 && (
                <TouchableOpacity
                  style={[styles.arrowButton, styles.arrowButtonRight]}
                  activeOpacity={0.85}
                  onPress={(e) => {
                    e?.stopPropagation?.();
                    handleNextImage();
                  }}
                >
                  <Ionicons name="chevron-forward" size={20} color="#111827" />
                </TouchableOpacity>
              )}

              {/* Floating Top Bar (Back & Favorite) */}
              <SafeAreaView style={styles.floatingHeader}>
                <TouchableOpacity style={styles.circleButton} onPress={onBack}>
                  <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.circleButton}
                  onPress={() => onToggleFavorite(stay.id)}
                >
                  <Ionicons
                    name={stay.isFavorite ? 'heart' : 'heart-outline'}
                    size={22}
                    color={stay.isFavorite ? '#EF4444' : '#FFFFFF'}
                  />
                </TouchableOpacity>
              </SafeAreaView>

              {/* Photos Counter Badge */}
              <View style={styles.photoCountBadge}>
                <Ionicons name="images-outline" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.photoCountText}>{`${activeImageIndex + 1}/${images.length}`}</Text>
              </View>
            </View>
          )}

        {/* DETAILS BODY CONTAINER */}
        <View style={[styles.mainColsRow, isDesktop && styles.desktopColsRow]}>
          <View style={[styles.body, isDesktop && styles.desktopBodyLeft]}>
          {/* TITLE & LOCATION */}
          <Text style={[styles.title, { color: colors.text }]}>{stay.title}</Text>

          <View style={styles.locationRow}>
            <View style={styles.locationLeft}>
              <Ionicons name="location-sharp" size={18} color="#00BDD6" style={{ marginRight: 6 }} />
              <Text style={[styles.locationText, { color: colors.textSecondary }]}>{stay.location}</Text>
            </View>
            <TouchableOpacity onPress={handleOpenGoogleMaps} style={[styles.viewMapButton, { backgroundColor: isDarkMode ? colors.surface : '#E0F7FA' }]}>
              <Ionicons name="map-outline" size={16} color="#00BDD6" style={{ marginRight: 4 }} />
              <Text style={[styles.viewMapText, { color: isDarkMode ? '#22D3EE' : '#00838F' }]}>Xem bản đồ</Text>
            </TouchableOpacity>
          </View>

          {/* RATING & REVIEWS */}
          <TouchableOpacity style={[styles.ratingRow, { backgroundColor: colors.surface }]} activeOpacity={0.7} onPress={onOpenReviews}>
            <View style={styles.ratingLeft}>
              <Ionicons
                name={currentReviewCount > 0 ? 'star' : 'sparkles'}
                size={18}
                color={currentReviewCount > 0 ? '#F59E0B' : '#00BDD6'}
              />
              <Text style={[styles.ratingNumber, { color: colors.text }]}>
                {currentReviewCount > 0
                  ? ` ${Number(currentRating).toFixed(1)}/5`
                  : ' Mới (Chưa có đánh giá)'}
              </Text>
            </View>
            <View style={styles.reviewsRight}>
              <Text style={[styles.reviewCountText, { color: colors.textSecondary }]}>
                {currentReviewCount > 0 ? `${currentReviewCount} đánh giá` : '0 đánh giá'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* FACILITIES & SERVICES (Đặc thù riêng cho từng chỗ nghỉ) */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Tiện ích & dịch vụ</Text>

            <Text style={[styles.facilitiesSub, { color: colors.textSecondary }]}>
              {stay.maxGuests || 2} Khách • {stay.bedrooms || 1} phòng ngủ • {stay.beds || 1} giường • {stay.bathrooms || 1} phòng tắm
            </Text>

            <View style={styles.facilitiesGrid}>
              {(stay.amenities || []).slice(0, 4).map((amenity, idx) => (
                <View key={idx} style={styles.facilityItem}>
                  <Ionicons name={getAmenityIcon(amenity)} size={22} color="#00BDD6" />
                  <Text style={[styles.facilityName, { color: colors.text }]} numberOfLines={1}>
                    {amenity}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={[styles.outlineButton, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={onOpenFacilities}>
              <Text style={[styles.outlineButtonText, { color: colors.text }]}>Xem tất cả tiện ích &gt;</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* REVIEWS PREVIEW & CHỈNH SỬA ĐÁNH GIÁ */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Đánh giá ({currentReviewCount})</Text>
              <TouchableOpacity onPress={onOpenReviews}>
                <Text style={styles.seeAllText}>Xem tất cả &gt;</Text>
              </TouchableOpacity>
            </View>

            {reviewsList && reviewsList.length > 0 ? (
              <>
                <Text style={[styles.bigScore, { color: colors.text }]}>
                  {Number(currentRating).toFixed(1)}
                  <Text style={[styles.scoreDenominator, { color: colors.textSecondary }]}>/5</Text>
                </Text>

                <View style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={styles.reviewAuthorRow}>
                    <Image
                      source={{ uri: reviewsList[0].avatar }}
                      style={styles.authorAvatar}
                    />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.authorName, { color: colors.text }]}>{reviewsList[0].author}</Text>
                      <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>{reviewsList[0].date}</Text>
                    </View>

                    {/* Cột hiển thị số sao + ICON CHỈNH SỬA ĐÁNH GIÁ */}
                    <View style={styles.reviewActionCol}>
                      <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Ionicons
                            key={s}
                            name={s <= reviewsList[0].rating ? 'star' : 'star-outline'}
                            size={16}
                            color="#F59E0B"
                          />
                        ))}
                      </View>

                      {/* NÚT CHỈNH SỬA ĐÁNH GIÁ */}
                      <TouchableOpacity
                        style={styles.editReviewActionBtn}
                        onPress={() => handleOpenEditModal(reviewsList[0])}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="create-outline" size={15} color="#00BDD6" />
                        <Text style={[styles.editReviewActionText, { color: isDarkMode ? '#22D3EE' : '#00838F' }]}>Sửa</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={[styles.reviewComment, { color: colors.text }]} numberOfLines={4}>
                    {reviewsList[0].comment}
                  </Text>
                </View>
              </>
            ) : (
              <View style={[styles.emptyReviewBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={36} color="#00BDD6" />
                <Text style={[styles.emptyReviewTitle, { color: colors.text }]}>Chưa có đánh giá nào</Text>
                <Text style={[styles.emptyReviewSub, { color: colors.textSecondary }]}>
                  Hãy là người đầu tiên trải nghiệm và chia sẻ cảm nhận về chỗ ở này!
                </Text>
                <TouchableOpacity style={styles.writeFirstReviewBtn} onPress={onOpenReviews}>
                  <Ionicons name="create-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.writeFirstReviewBtnText}>Viết đánh giá ngay</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* VỊ TRÍ TRÊN BẢN ĐỒ GOOGLE MAPS */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Vị trí chỗ ở</Text>
              <TouchableOpacity onPress={handleOpenGoogleMaps}>
                <Text style={styles.seeAllText}>Mở Google Maps &gt;</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.mapCard}
              activeOpacity={0.88}
              onPress={handleOpenGoogleMaps}
            >
              <View style={styles.mapVisualContainer}>
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
                  }}
                  style={styles.mapImage}
                />
                <View style={styles.mapOverlay}>
                  <View style={styles.mapPinBadge}>
                    <Ionicons name="location" size={26} color="#EF4444" />
                    <Text style={styles.mapPinText} numberOfLines={1}>
                      {stay.title}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.mapInfoRow, { backgroundColor: colors.card }]}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={[styles.mapAddressTitle, { color: colors.text }]} numberOfLines={1}>
                    {stay.title}
                  </Text>
                  <Text style={[styles.mapAddressSub, { color: colors.textSecondary }]}>{stay.location}</Text>
                </View>
                <View style={styles.mapActionPill}>
                  <Ionicons name="navigate" size={15} color="#FFFFFF" style={{ marginRight: 5 }} />
                  <Text style={styles.mapActionPillText}>Chỉ đường</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* CHÍNH SÁCH & QUY ĐỊNH CHỖ Ở (RIÊNG BIỆT CHO TỪNG ĐỊA ĐIỂM) */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Chính sách</Text>
            <Text style={[styles.policySubHeader, { color: colors.text }]}>Quy định chỗ ở</Text>

            <View style={styles.ruleItem}>
              <Ionicons name="time-outline" size={20} color="#00BDD6" />
              <Text style={[styles.ruleText, { color: colors.textSecondary }]}>Giờ nhận phòng: từ {stay.rules?.checkIn || '14:00'}</Text>
            </View>
            <View style={styles.ruleItem}>
              <Ionicons name="time-outline" size={20} color="#00BDD6" />
              <Text style={[styles.ruleText, { color: colors.textSecondary }]}>Giờ trả phòng: trước {stay.rules?.checkOut || '12:00'}</Text>
            </View>

            <Text style={[styles.policySubHeader, { marginTop: 14, color: colors.text }]}>Chính sách nhận phòng</Text>
            <Text style={[styles.policyDesc, { color: colors.textSecondary }]} numberOfLines={4}>
              {stay.rules?.policyNote ||
                'Nên xác nhận trực tiếp chính sách nhận phòng với chủ nhà/quản lý trước khi đến để sắp xếp di chuyển thuận lợi.'}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* LỰA CHỌN THỜI GIAN LƯU TRÚ */}
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Thời gian lưu trú</Text>
              <TouchableOpacity
                style={styles.changeDatesBtn}
                onPress={() => setIsCalendarModalOpen(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="calendar-outline" size={15} color="#00BDD6" style={{ marginRight: 4 }} />
                <Text style={styles.changeDatesBtnText}>Chọn / Đổi ngày</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.datesDisplayCard}
              onPress={() => setIsCalendarModalOpen(true)}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <View style={styles.dateCol}>
                  <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>Nhận phòng</Text>
                  <Text style={[styles.dateValue, { color: colors.text }]}>{formatDateStr(startDate)}</Text>
                  <Text style={styles.dateTime}>Từ {stay.rules?.checkIn || '14:00'}</Text>
                </View>

                <View style={styles.dateArrowCol}>
                  <Ionicons name="arrow-forward" size={18} color="#00BDD6" />
                  <Text style={styles.nightsBadge}>{nights} đêm</Text>
                </View>

                <View style={styles.dateCol}>
                  <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>Trả phòng</Text>
                  <Text style={[styles.dateValue, { color: colors.text }]}>{formatDateStr(endDate)}</Text>
                  <Text style={styles.dateTime}>Trước {stay.rules?.checkOut || '12:00'}</Text>
                </View>
              </View>

              <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

              <View style={styles.guestRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="people-outline" size={18} color="#00BDD6" style={{ marginRight: 8 }} />
                  <View>
                    <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>Số lượng khách</Text>
                    <Text style={[styles.guestValueText, { color: colors.text }]}>
                      {totalGuests} khách ({adults} người lớn{children > 0 ? `, ${children} trẻ em` : ''})
                    </Text>
                  </View>
                </View>
                <View style={[styles.guestBadgePill, { backgroundColor: isDarkMode ? colors.card : '#F0FDFA', borderColor: isDarkMode ? colors.border : '#CCFBF1' }]}>
                  <Text style={styles.guestBadgePillText}>Đổi khách</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* MÔ TẢ CHI TIẾT */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Mô tả</Text>

            <Image
              source={{ uri: stay.images?.[1] || stay.images?.[0] }}
              style={styles.descThumbnail}
            />

            <Text style={[styles.descParagraph, { color: colors.textSecondary }]} numberOfLines={4}>
              {stay.description || stay.fullDescription}
            </Text>

            <TouchableOpacity style={[styles.outlineButton, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={onOpenDescription}>
              <Text style={[styles.outlineButtonText, { color: colors.text }]}>Xem chi tiết mô tả &gt;</Text>
            </TouchableOpacity>
          </View>
          </View>

          {/* DESKTOP RIGHT COLUMN: STICKY BOOKING CARD */}
          {isDesktop && (
            <View style={styles.desktopStickyCardCol}>
              <View style={[styles.desktopStickyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {/* Header: Price & Rating */}
                <View style={styles.desktopCardHeader}>
                  <View>
                    <Text style={[styles.desktopCardPriceAmount, { color: colors.text }]}>
                      {formatPrice(stay.pricePerNight)}
                      <Text style={[styles.desktopCardPriceUnit, { color: colors.textSecondary }]}> /đêm</Text>
                    </Text>
                  </View>
                  <View style={styles.desktopCardRatingRow}>
                    <Ionicons name="star" size={15} color="#F59E0B" style={{ marginRight: 4 }} />
                    <Text style={[styles.desktopCardRatingNumber, { color: colors.text }]}>
                      {currentReviewCount > 0 ? Number(currentRating).toFixed(1) : 'Mới'}
                    </Text>
                    <Text style={[styles.desktopCardReviewCount, { color: colors.textSecondary }]}>
                      ({currentReviewCount} đánh giá)
                    </Text>
                  </View>
                </View>

                {/* Date & Guests Box */}
                <TouchableOpacity
                  style={styles.desktopDateBox}
                  activeOpacity={0.85}
                  onPress={() => setIsCalendarModalOpen(true)}
                >
                  <View style={[styles.desktopDateRow, { borderBottomColor: colors.border }]}>
                    <View style={styles.desktopDateCol}>
                      <Text style={[styles.desktopDateLabel, { color: colors.textSecondary }]}>NHẬN PHÒNG</Text>
                      <Text style={[styles.desktopDateVal, { color: colors.text }]}>{formatDateStr(startDate)}</Text>
                    </View>
                    <View style={[styles.desktopDateCol, { borderLeftWidth: 1, borderLeftColor: '#E5E7EB', paddingLeft: 12 }]}>
                      <Text style={[styles.desktopDateLabel, { color: colors.textSecondary }]}>TRẢ PHÒNG</Text>
                      <Text style={[styles.desktopDateVal, { color: colors.text }]}>{formatDateStr(endDate)}</Text>
                    </View>
                  </View>
                  <View style={styles.desktopGuestsRow}>
                    <View>
                      <Text style={[styles.desktopDateLabel, { color: colors.textSecondary }]}>KHÁCH</Text>
                      <Text style={[styles.desktopGuestsVal, { color: colors.text }]}>
                        {totalGuests} khách {totalExtraGuests > 0 ? `(${totalExtraGuests} phụ thu)` : ''}
                      </Text>
                    </View>
                    <Ionicons name="chevron-down" size={18} color="#6B7280" />
                  </View>
                </TouchableOpacity>

                {/* Primary CTA */}
                <TouchableOpacity
                  style={styles.desktopBookBtn}
                  activeOpacity={0.88}
                  onPress={() => onBookNow({ startDate, endDate, nights, adults, children })}
                >
                  <Text style={styles.desktopBookBtnText}>Đặt phòng ngay</Text>
                </TouchableOpacity>

                <Text style={[styles.desktopNoticeText, { color: colors.textSecondary }]}>
                  Bạn chưa bị trừ tiền lúc này • Giữ phòng linh hoạt
                </Text>

                {/* Price Breakdown */}
                <View style={[styles.desktopBreakdown, { borderTopColor: colors.border }]}>
                  <View style={styles.desktopBreakdownRow}>
                    <Text style={[styles.desktopBreakdownLabel, { color: colors.textSecondary }]}>
                      {formatPrice(stay.pricePerNight)} x {nights} đêm
                    </Text>
                    <Text style={[styles.desktopBreakdownVal, { color: colors.text }]}>
                      {formatPrice(roomBaseTotal)}
                    </Text>
                  </View>

                  {totalExtraGuests > 0 && (
                    <View style={styles.desktopBreakdownRow}>
                      <Text style={[styles.desktopBreakdownLabel, { color: colors.textSecondary }]}>
                        Phụ phí khách thêm ({totalExtraGuests} người)
                      </Text>
                      <Text style={[styles.desktopBreakdownVal, { color: '#0D9488' }]}>
                        +{formatPrice(extraGuestFeeTotal)}
                      </Text>
                    </View>
                  )}

                  <View style={styles.desktopBreakdownRow}>
                    <Text style={[styles.desktopBreakdownLabel, { color: colors.textSecondary }]}>Phí dọn dẹp & vệ sinh</Text>
                    <Text style={[styles.desktopBreakdownVal, { color: '#10B981' }]}>Miễn phí</Text>
                  </View>

                  <View style={[styles.desktopDivider, { backgroundColor: colors.border }]} />

                  <View style={styles.desktopTotalRow}>
                    <Text style={[styles.desktopTotalLabel, { color: colors.text }]}>Tổng thanh toán:</Text>
                    <Text style={styles.desktopTotalVal}>{formatPrice(roomTotalWithGuests)}</Text>
                  </View>
                </View>

                {/* Trust Badges */}
                <View style={[styles.desktopTrustList, { borderTopColor: colors.border }]}>
                  <View style={styles.desktopTrustItem}>
                    <Ionicons name="shield-checkmark" size={16} color="#0D9488" style={{ marginRight: 8 }} />
                    <Text style={[styles.desktopTrustText, { color: colors.textSecondary }]}>Đảm bảo giá tốt nhất trên ứng dụng</Text>
                  </View>
                  <View style={styles.desktopTrustItem}>
                    <Ionicons name="flash" size={16} color="#00BDD6" style={{ marginRight: 8 }} />
                    <Text style={[styles.desktopTrustText, { color: colors.textSecondary }]}>Xác nhận đặt phòng tức thì</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
        </View>
      </ScrollView>

      {/* FIXED BOTTOM BAR */}
      {!isDesktop && (
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={[styles.fromPriceLabel, { color: colors.textSecondary }]}>
            {totalExtraGuests > 0 
              ? `${formatPrice(stay.pricePerNight)} x ${nights}đ + ${totalExtraGuests} khách thêm:`
              : `${formatPrice(stay.pricePerNight)} x ${nights} đêm:`}
          </Text>
          <Text style={[styles.bottomPrice, { color: colors.text }]}>
            {formatPrice(roomTotalWithGuests)}
          </Text>
          <Text style={styles.guestSummarySub}>
            {totalGuests} khách {totalExtraGuests > 0 ? `(phụ thu +${formatPrice(extraGuestFeeTotal)})` : ''} • {formatDateStr(startDate).slice(0, -6)} ➔ {formatDateStr(endDate).slice(0, -6)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.bookNowButton}
          activeOpacity={0.85}
          onPress={() => onBookNow({ startDate, endDate, nights, adults, children })}
        >
          <Text style={styles.bookNowText}>Đặt phòng ngay</Text>
        </TouchableOpacity>
      </View>
      )}

      {/* MODAL CHỌN LỊCH NGÀY NHẬN / TRẢ PHÒNG */}
      <Modal
        visible={isCalendarModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCalendarModalOpen(false)}
      >
        <View style={styles.calendarModalOverlay}>
          <View style={[styles.calendarModalBox, { backgroundColor: colors.card, borderColor: isDarkMode ? colors.border : 'transparent', borderWidth: isDarkMode ? 1 : 0 }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Chọn ngày lưu trú</Text>
                <Text style={styles.calendarModalSubtitle}>
                  Nhận phòng từ {stay.rules?.checkIn || '14:00'} • Trả phòng trước {stay.rules?.checkOut || '12:00'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsCalendarModalOpen(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 520 }} showsVerticalScrollIndicator={false}>
              <CalendarPicker
                initialStartDate={startDate}
                initialEndDate={endDate}
                onSelectRange={(range) => {
                  if (range.startDate) setStartDate(range.startDate);
                  if (range.endDate) setEndDate(range.endDate);
                  setNights(range.nights);
                }}
              />

              {/* SỐ LƯỢNG KHÁCH */}
              <View style={[styles.modalSectionDivider, { backgroundColor: colors.border }]} />
              <Text style={[styles.modalSectionTitle, { color: colors.text }]}>Số lượng khách</Text>

              <View style={styles.guestCounterRow}>
                <View>
                  <Text style={[styles.guestCounterLabel, { color: colors.text }]}>Người lớn</Text>
                  <Text style={[styles.guestCounterSub, { color: colors.textSecondary }]}>Từ 13 tuổi trở lên</Text>
                </View>
                <View style={styles.counterControl}>
                  <TouchableOpacity
                    style={[styles.counterBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => setAdults((prev) => Math.max(1, prev - 1))}
                  >
                    <Ionicons name="remove" size={16} color="#111827" />
                  </TouchableOpacity>
                  <Text style={[styles.counterNum, { color: colors.text }]}>{adults}</Text>
                  <TouchableOpacity
                    style={[styles.counterBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => setAdults((prev) => Math.min(10, prev + 1))}
                  >
                    <Ionicons name="add" size={16} color="#111827" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.guestCounterRow}>
                <View>
                  <Text style={[styles.guestCounterLabel, { color: colors.text }]}>Trẻ em</Text>
                  <Text style={[styles.guestCounterSub, { color: colors.textSecondary }]}>Dưới 13 tuổi</Text>
                </View>
                <View style={styles.counterControl}>
                  <TouchableOpacity
                    style={[styles.counterBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => setChildren((prev) => Math.max(0, prev - 1))}
                  >
                    <Ionicons name="remove" size={16} color="#111827" />
                  </TouchableOpacity>
                  <Text style={[styles.counterNum, { color: colors.text }]}>{children}</Text>
                  <TouchableOpacity
                    style={[styles.counterBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => setChildren((prev) => Math.min(6, prev + 1))}
                  >
                    <Ionicons name="add" size={16} color="#111827" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* TẠM TÍNH TIỀN */}
              <View style={[styles.priceEstimateBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="calculator-outline" size={18} color="#00BDD6" style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.priceEstimateText, { color: colors.text }]}>
                    {formatPrice(stay.pricePerNight)} x {nights} đêm
                    {totalExtraGuests > 0 ? ` + Phụ thu (${formatPrice(extraGuestFeeTotal)})` : ''}
                    {' = '}
                    <Text style={{ fontWeight: '800', color: '#00BDD6' }}>{formatPrice(roomTotalWithGuests)}</Text>
                  </Text>
                  {totalExtraGuests > 0 && (
                    <Text style={{ fontSize: 11.5, color: '#0D9488', marginTop: 2 }}>
                      * Tiêu chuẩn 2 khách. Phụ thu ${extraAdults > 0 ? `${extraAdults} người lớn (+30%/đêm)` : ''}${extraAdults > 0 && extraChildren > 0 ? ', ' : ''}${extraChildren > 0 ? `${extraChildren} trẻ em (+15%/đêm)` : ''}
                    </Text>
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={styles.confirmDatesBtn}
                onPress={() => setIsCalendarModalOpen(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmDatesBtnText}>
                  Xác nhận ({nights} đêm • {totalGuests} khách • {formatPrice(roomTotalWithGuests)})
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL CHỈNH SỬA ĐÁNH GIÁ */}
      <Modal
        visible={isEditModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card, borderColor: isDarkMode ? colors.border : 'transparent', borderWidth: isDarkMode ? 1 : 0 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Chỉnh sửa đánh giá</Text>
              <TouchableOpacity onPress={() => setIsEditModalOpen(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={[styles.ratingLabel, { color: colors.text }]}>Đánh giá số sao:</Text>
              <View style={styles.starPickerRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setEditRating(s)}
                    style={{ padding: 6 }}
                  >
                    <Ionicons
                      name={s <= editRating ? 'star' : 'star-outline'}
                      size={34}
                      color="#F59E0B"
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { color: colors.text }]}>Nội dung nhận xét</Text>
              <TextInput
                style={styles.reviewInput}
                placeholder="Nhập nội dung đánh giá của bạn..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                value={editComment}
                onChangeText={setEditComment}
              />

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setIsEditModalOpen(false)}
                >
                  <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.submitReviewBtn}
                  onPress={handleSaveEditedReview}
                >
                  <Text style={styles.submitReviewBtnText}>Lưu cập nhật</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainColsRow: {
    width: '100%',
  },
  desktopColsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 32,
    marginTop: 10,
  },
  desktopBodyLeft: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  desktopStickyCardCol: {
    width: 380,
  },
  desktopStickyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  desktopCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  desktopCardPriceAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  desktopCardPriceUnit: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  desktopCardRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  desktopCardRatingNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginRight: 4,
  },
  desktopCardReviewCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  desktopDateBox: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  desktopDateRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  desktopDateCol: {
    flex: 1,
  },
  desktopDateLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4B5563',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  desktopDateVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  desktopGuestsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  desktopGuestsVal: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#111827',
  },
  desktopBookBtn: {
    backgroundColor: '#00BDD6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00BDD6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  desktopBookBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  desktopNoticeText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  desktopBreakdown: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
    marginBottom: 16,
  },
  desktopBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  desktopBreakdownLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  desktopBreakdownVal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  desktopDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
  desktopTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  desktopTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  desktopTotalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#00BDD6',
  },
  desktopTrustList: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 14,
    gap: 8,
  },
  desktopTrustItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  desktopTrustText: {
    fontSize: 12.5,
    color: '#4B5563',
    fontWeight: '500',
  },

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  mainDetailWrapper: {
    width: '100%',
  },
  desktopTopNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 8,
  },
  desktopBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  desktopBackText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  desktopNavActions: {
    flexDirection: 'row',
    gap: 10,
  },
  desktopActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  desktopActionText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#374151',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  imageContainer: {
    position: 'relative',
  },
  heroImage: {
    height: 330,
    resizeMode: 'cover',
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  arrowButtonLeft: {
    left: 14,
  },
  arrowButtonRight: {
    right: 14,
  },
  floatingHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : (Platform.OS === 'android' ? (RNStatusBar.currentHeight || 28) + 8 : 24),
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  desktopHeroContainer: {
    flexDirection: 'row',
    height: 440,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 12,
    marginBottom: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  desktopMainImageCol: {
    flex: 1.6,
    height: 440,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
  },
  desktopMainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  desktopSideImagesCol: {
    flex: 1,
    height: 440,
    gap: 10,
  },
  desktopSideImageWrap: {
    flex: 1,
    height: 215,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
  },
  desktopSideImageWrapActive: {
    borderWidth: 3,
    borderColor: '#00BDD6',
  },
  desktopSideImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  activeSideIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoCountText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
    lineHeight: 34,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  locationText: {
    fontSize: 15,
    color: '#4B5563',
    fontWeight: '600',
    flex: 1,
  },
  viewMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewMapText: {
    fontSize: 14,
    color: '#00838F',
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  ratingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  reviewsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewCountText: {
    fontSize: 15,
    color: '#4B5563',
    marginRight: 4,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 20,
  },
  section: {
    marginBottom: 6,
  },
  writeReviewHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  writeReviewHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00BDD6',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  seeAllText: {
    fontSize: 15,
    color: '#00BDD6',
    fontWeight: '700',
  },
  facilitiesSub: {
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 16,
    lineHeight: 22,
  },
  facilitiesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
  },
  facilityName: {
    fontSize: 15,
    color: '#374151',
    marginLeft: 8,
    fontWeight: '600',
    flex: 1,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    backgroundColor: '#FAFAFA',
  },
  outlineButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },
  bigScore: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  scoreDenominator: {
    fontSize: 17,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  reviewCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginTop: 6,
  },
  reviewAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  reviewDate: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  reviewActionCol: {
    alignItems: 'flex-end',
  },
  starsRow: {
    flexDirection: 'row',
  },
  editReviewActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },
  editReviewActionText: {
    fontSize: 12,
    color: '#00838F',
    fontWeight: '700',
    marginLeft: 3,
  },
  reviewComment: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 21,
  },
  emptyReviewBox: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 6,
  },
  emptyReviewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  emptyReviewSub: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    marginBottom: 16,
  },
  writeFirstReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00BDD6',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  writeFirstReviewBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  // Bản đồ Google Maps Card
  mapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  mapVisualContainer: {
    height: 150,
    position: 'relative',
    backgroundColor: '#E0E7FF',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    maxWidth: '85%',
  },
  mapPinText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 6,
  },
  mapInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  mapAddressTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  mapAddressSub: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  mapActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00BDD6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  mapActionPillText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  policySubHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ruleText: {
    fontSize: 15,
    color: '#4B5563',
    marginLeft: 8,
    fontWeight: '500',
  },
  policyDesc: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
  descThumbnail: {
    width: '100%',
    height: 170,
    borderRadius: 12,
    marginVertical: 12,
  },
  descParagraph: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 10,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 10,
  },
  fromPriceLabel: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  bottomPrice: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111827',
  },
  bookNowButton: {
    backgroundColor: '#00BDD6',
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 10,
  },
  bookNowText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  // Modal Edit Review
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  modalContent: {
    padding: 20,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  starPickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 18,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelBtnText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  submitReviewBtn: {
    backgroundColor: '#00BDD6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  submitReviewBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  changeDatesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  changeDatesBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#00BDD6',
  },
  datesDisplayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  dateCol: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 3,
  },
  dateValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  dateTime: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0D9488',
  },
  dateArrowCol: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  nightsBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00BDD6',
    backgroundColor: '#ECFEFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  calendarModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  calendarModalBox: {
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },
  calendarModalSubtitle: {
    fontSize: 12,
    color: '#0D9488',
    marginTop: 2,
    fontWeight: '500',
  },
  confirmDatesBtn: {
    backgroundColor: '#00BDD6',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    marginBottom: 8,
  },
  confirmDatesBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
    width: '100%',
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  guestValueText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  guestBadgePill: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  guestBadgePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00BDD6',
  },
  guestSummarySub: {
    fontSize: 11,
    color: '#0D9488',
    fontWeight: '600',
    marginTop: 2,
  },
  modalSectionDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  modalSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  guestCounterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  guestCounterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  guestCounterSub: {
    fontSize: 12,
    color: '#6B7280',
  },
  counterControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  counterNum: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginHorizontal: 12,
    minWidth: 16,
    textAlign: 'center',
  },
  priceEstimateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: 8,
    padding: 10,
    marginTop: 14,
  },
  priceEstimateText: {
    fontSize: 13,
    color: '#0F766E',
    fontWeight: '500',
  },
});
