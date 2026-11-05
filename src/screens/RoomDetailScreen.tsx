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
import { Accommodation, ReviewItem, SearchFilterState } from '../types';
import { CalendarPicker } from '../components/CalendarPicker';
import { getAmenityIcon, mockApi } from '../api/mockApi';
import { useCurrency } from '../context/CurrencyContext';

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
  const scrollViewRef = useRef<any>(null);
  const heroWidth = Math.min(Dimensions.get('window').width, 480);

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
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* HERO IMAGE SLIDER */}
        <View style={styles.imageContainer} {...panResponder.panHandlers}>
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

        {/* DETAILS BODY */}
        <View style={styles.body}>
          {/* TITLE & LOCATION */}
          <Text style={styles.title}>{stay.title}</Text>

          <View style={styles.locationRow}>
            <View style={styles.locationLeft}>
              <Ionicons name="location-sharp" size={18} color="#00BDD6" style={{ marginRight: 6 }} />
              <Text style={styles.locationText}>{stay.location}</Text>
            </View>
            <TouchableOpacity onPress={handleOpenGoogleMaps} style={styles.viewMapButton}>
              <Ionicons name="map-outline" size={16} color="#00BDD6" style={{ marginRight: 4 }} />
              <Text style={styles.viewMapText}>Xem bản đồ</Text>
            </TouchableOpacity>
          </View>

          {/* RATING & REVIEWS */}
          <TouchableOpacity style={styles.ratingRow} activeOpacity={0.7} onPress={onOpenReviews}>
            <View style={styles.ratingLeft}>
              <Ionicons
                name={currentReviewCount > 0 ? 'star' : 'sparkles'}
                size={18}
                color={currentReviewCount > 0 ? '#F59E0B' : '#00BDD6'}
              />
              <Text style={styles.ratingNumber}>
                {currentReviewCount > 0
                  ? ` ${Number(currentRating).toFixed(1)}/5`
                  : ' Mới (Chưa có đánh giá)'}
              </Text>
            </View>
            <View style={styles.reviewsRight}>
              <Text style={styles.reviewCountText}>
                {currentReviewCount > 0 ? `${currentReviewCount} đánh giá` : '0 đánh giá'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* FACILITIES & SERVICES (Đặc thù riêng cho từng chỗ nghỉ) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tiện ích & dịch vụ</Text>

            <Text style={styles.facilitiesSub}>
              {stay.maxGuests || 2} Khách • {stay.bedrooms || 1} phòng ngủ • {stay.beds || 1} giường • {stay.bathrooms || 1} phòng tắm
            </Text>

            <View style={styles.facilitiesGrid}>
              {(stay.amenities || []).slice(0, 4).map((amenity, idx) => (
                <View key={idx} style={styles.facilityItem}>
                  <Ionicons name={getAmenityIcon(amenity)} size={22} color="#00BDD6" />
                  <Text style={styles.facilityName} numberOfLines={1}>
                    {amenity}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.outlineButton} onPress={onOpenFacilities}>
              <Text style={styles.outlineButtonText}>Xem tất cả tiện ích &gt;</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* REVIEWS PREVIEW & CHỈNH SỬA ĐÁNH GIÁ */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Đánh giá ({currentReviewCount})</Text>
              <TouchableOpacity onPress={onOpenReviews}>
                <Text style={styles.seeAllText}>Xem tất cả &gt;</Text>
              </TouchableOpacity>
            </View>

            {reviewsList && reviewsList.length > 0 ? (
              <>
                <Text style={styles.bigScore}>
                  {Number(currentRating).toFixed(1)}
                  <Text style={styles.scoreDenominator}>/5</Text>
                </Text>

                <View style={styles.reviewCard}>
                  <View style={styles.reviewAuthorRow}>
                    <Image
                      source={{ uri: reviewsList[0].avatar }}
                      style={styles.authorAvatar}
                    />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.authorName}>{reviewsList[0].author}</Text>
                      <Text style={styles.reviewDate}>{reviewsList[0].date}</Text>
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
                        <Text style={styles.editReviewActionText}>Sửa</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.reviewComment} numberOfLines={4}>
                    {reviewsList[0].comment}
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.emptyReviewBox}>
                <Ionicons name="chatbubble-ellipses-outline" size={36} color="#00BDD6" />
                <Text style={styles.emptyReviewTitle}>Chưa có đánh giá nào</Text>
                <Text style={styles.emptyReviewSub}>
                  Hãy là người đầu tiên trải nghiệm và chia sẻ cảm nhận về chỗ ở này!
                </Text>
                <TouchableOpacity style={styles.writeFirstReviewBtn} onPress={onOpenReviews}>
                  <Ionicons name="create-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.writeFirstReviewBtnText}>Viết đánh giá ngay</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* VỊ TRÍ TRÊN BẢN ĐỒ GOOGLE MAPS */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Vị trí chỗ ở</Text>
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

              <View style={styles.mapInfoRow}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={styles.mapAddressTitle} numberOfLines={1}>
                    {stay.title}
                  </Text>
                  <Text style={styles.mapAddressSub}>{stay.location}</Text>
                </View>
                <View style={styles.mapActionPill}>
                  <Ionicons name="navigate" size={15} color="#FFFFFF" style={{ marginRight: 5 }} />
                  <Text style={styles.mapActionPillText}>Chỉ đường</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* CHÍNH SÁCH & QUY ĐỊNH CHỖ Ở (RIÊNG BIỆT CHO TỪNG ĐỊA ĐIỂM) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chính sách</Text>
            <Text style={styles.policySubHeader}>Quy định chỗ ở</Text>

            <View style={styles.ruleItem}>
              <Ionicons name="time-outline" size={20} color="#00BDD6" />
              <Text style={styles.ruleText}>Giờ nhận phòng: từ {stay.rules?.checkIn || '14:00'}</Text>
            </View>
            <View style={styles.ruleItem}>
              <Ionicons name="time-outline" size={20} color="#00BDD6" />
              <Text style={styles.ruleText}>Giờ trả phòng: trước {stay.rules?.checkOut || '12:00'}</Text>
            </View>

            <Text style={[styles.policySubHeader, { marginTop: 14 }]}>Chính sách nhận phòng</Text>
            <Text style={styles.policyDesc} numberOfLines={4}>
              {stay.rules?.policyNote ||
                'Nên xác nhận trực tiếp chính sách nhận phòng với chủ nhà/quản lý trước khi đến để sắp xếp di chuyển thuận lợi.'}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* LỰA CHỌN THỜI GIAN LƯU TRÚ */}
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={styles.sectionTitle}>Thời gian lưu trú</Text>
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
                  <Text style={styles.dateLabel}>Nhận phòng</Text>
                  <Text style={styles.dateValue}>{formatDateStr(startDate)}</Text>
                  <Text style={styles.dateTime}>Từ {stay.rules?.checkIn || '14:00'}</Text>
                </View>

                <View style={styles.dateArrowCol}>
                  <Ionicons name="arrow-forward" size={18} color="#00BDD6" />
                  <Text style={styles.nightsBadge}>{nights} đêm</Text>
                </View>

                <View style={styles.dateCol}>
                  <Text style={styles.dateLabel}>Trả phòng</Text>
                  <Text style={styles.dateValue}>{formatDateStr(endDate)}</Text>
                  <Text style={styles.dateTime}>Trước {stay.rules?.checkOut || '12:00'}</Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.guestRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="people-outline" size={18} color="#00BDD6" style={{ marginRight: 8 }} />
                  <View>
                    <Text style={styles.dateLabel}>Số lượng khách</Text>
                    <Text style={styles.guestValueText}>
                      {totalGuests} khách ({adults} người lớn{children > 0 ? `, ${children} trẻ em` : ''})
                    </Text>
                  </View>
                </View>
                <View style={styles.guestBadgePill}>
                  <Text style={styles.guestBadgePillText}>Đổi khách</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* MÔ TẢ CHI TIẾT */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả</Text>

            <Image
              source={{ uri: stay.images?.[1] || stay.images?.[0] }}
              style={styles.descThumbnail}
            />

            <Text style={styles.descParagraph} numberOfLines={4}>
              {stay.description || stay.fullDescription}
            </Text>

            <TouchableOpacity style={styles.outlineButton} onPress={onOpenDescription}>
              <Text style={styles.outlineButtonText}>Xem chi tiết mô tả &gt;</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* FIXED BOTTOM BAR */}
      <View style={styles.bottomBar}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={styles.fromPriceLabel}>
            {totalExtraGuests > 0 
              ? `${formatPrice(stay.pricePerNight)} x ${nights}đ + ${totalExtraGuests} khách thêm:`
              : `${formatPrice(stay.pricePerNight)} x ${nights} đêm:`}
          </Text>
          <Text style={styles.bottomPrice}>
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

      {/* MODAL CHỌN LỊCH NGÀY NHẬN / TRẢ PHÒNG */}
      <Modal
        visible={isCalendarModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCalendarModalOpen(false)}
      >
        <View style={styles.calendarModalOverlay}>
          <View style={styles.calendarModalBox}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Chọn ngày lưu trú</Text>
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
              <View style={styles.modalSectionDivider} />
              <Text style={styles.modalSectionTitle}>Số lượng khách</Text>

              <View style={styles.guestCounterRow}>
                <View>
                  <Text style={styles.guestCounterLabel}>Người lớn</Text>
                  <Text style={styles.guestCounterSub}>Từ 13 tuổi trở lên</Text>
                </View>
                <View style={styles.counterControl}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setAdults((prev) => Math.max(1, prev - 1))}
                  >
                    <Ionicons name="remove" size={16} color="#111827" />
                  </TouchableOpacity>
                  <Text style={styles.counterNum}>{adults}</Text>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setAdults((prev) => Math.min(10, prev + 1))}
                  >
                    <Ionicons name="add" size={16} color="#111827" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.guestCounterRow}>
                <View>
                  <Text style={styles.guestCounterLabel}>Trẻ em</Text>
                  <Text style={styles.guestCounterSub}>Dưới 13 tuổi</Text>
                </View>
                <View style={styles.counterControl}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setChildren((prev) => Math.max(0, prev - 1))}
                  >
                    <Ionicons name="remove" size={16} color="#111827" />
                  </TouchableOpacity>
                  <Text style={styles.counterNum}>{children}</Text>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setChildren((prev) => Math.min(6, prev + 1))}
                  >
                    <Ionicons name="add" size={16} color="#111827" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* TẠM TÍNH TIỀN */}
              <View style={styles.priceEstimateBox}>
                <Ionicons name="calculator-outline" size={18} color="#00BDD6" style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.priceEstimateText}>
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
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh sửa đánh giá</Text>
              <TouchableOpacity onPress={() => setIsEditModalOpen(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.ratingLabel}>Đánh giá số sao:</Text>
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

              <Text style={styles.inputLabel}>Nội dung nhận xét</Text>
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
                  <Text style={styles.cancelBtnText}>Hủy</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
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
    top: Platform.OS === 'ios' ? 44 : 24,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    maxWidth: 480,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 16,
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
