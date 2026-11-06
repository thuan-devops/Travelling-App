import React, { useState, useEffect } from 'react';
import {
  View,
  Share,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  ScrollView,
  Platform,
  TextInput,
  StatusBar as RNStatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Accommodation, BookingDetails, BottomTabType, ReviewItem } from '../types';
import { BottomTabBar } from '../components/BottomTabBar';
import { mockApi, isPastCheckout } from '../api/mockApi';
import { notificationService } from '../services/notificationService';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useResponsive } from '../hooks/useResponsive';

const CANCELLATION_REASONS = [
  'Thay đổi lịch trình cá nhân',
  'Có việc bận đột xuất',
  'Tìm được phòng/khách sạn phù hợp hơn',
  'Thời tiết hoặc lý do khách quan không thuận lợi',
];

const RATING_EMOTIONS: Record<number, string> = {
  1: '😞 Rất không hài lòng',
  2: '🙁 Cần cải thiện thêm',
  3: '😐 Trải nghiệm tạm ổn',
  4: '😊 Rất hài lòng',
  5: '🤩 Tuyệt vời, vượt kỳ vọng!',
};

interface BookingsScreenProps {
  bookings: BookingDetails[];
  initialTab?: 'upcoming' | 'completed' | 'cancelled';
  onExplore: () => void;
  onSelectBookingDetail: (booking: BookingDetails) => void;
  onRebook?: (stay: Accommodation) => void;
  onViewReviews?: (stay: Accommodation) => void;
  onTabChange: (tab: BottomTabType) => void;
  onBookingsUpdated?: (updated: BookingDetails[]) => void;
}

export const BookingsScreen: React.FC<BookingsScreenProps> = ({
  bookings = [],
  initialTab = 'upcoming',
  onExplore,
  onSelectBookingDetail,
  onRebook,
  onViewReviews,
  onTabChange,
  onBookingsUpdated,
}) => {
  const { formatPrice } = useCurrency();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { isMobile, isDesktop, contentMaxWidth, horizontalPadding } = useResponsive();
  const insets = useSafeAreaInsets();
  const mobileTopInset = isMobile ? Math.max(insets.top, Platform.OS === 'android' ? (RNStatusBar.currentHeight || 28) : 0) : 0;

  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>(initialTab);
  const [localBookings, setLocalBookings] = useState<BookingDetails[]>(bookings);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Cancel modal state
  const [cancelModalVisible, setCancelModalVisible] = useState<boolean>(false);
  const [cancellingBooking, setCancellingBooking] = useState<BookingDetails | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>(CANCELLATION_REASONS[0]);

  // Review modal state
  const [reviewModalVisible, setReviewModalVisible] = useState<boolean>(false);
  const [reviewingBooking, setReviewingBooking] = useState<BookingDetails | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  // Early complete confirm modal
  const [completeModalVisible, setCompleteModalVisible] = useState<boolean>(false);
  const [completingBooking, setCompletingBooking] = useState<BookingDetails | null>(null);

  // Modal thông báo yêu cầu thanh toán đủ 100% mới được trả phòng
  const [paymentRequiredModalVisible, setPaymentRequiredModalVisible] = useState<boolean>(false);
  const [pendingPaymentBooking, setPendingPaymentBooking] = useState<BookingDetails | null>(null);

  // Modal thực hiện thanh toán số tiền còn lại
  const [payRemainingModalVisible, setPayRemainingModalVisible] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('vietqr');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  // Helper kiểm tra xem chuyến đi có mới thanh toán 50% và chưa hoàn tất thanh toán nốt không
  const isBookingPartUnpaid = (b: BookingDetails): boolean => {
    const remaining = b.dueAmount !== undefined ? b.dueAmount : Math.max(0, b.totalPrice - b.paidAmount);
    return b.paymentType === 'part' && remaining > 0;
  };

  const getRemainingAmount = (b: BookingDetails): number => {
    return b.dueAmount !== undefined ? b.dueAmount : Math.max(0, b.totalPrice - b.paidAmount);
  };

  useEffect(() => {
    setLocalBookings(bookings);
  }, [bookings]);

  // Phân loại 3 danh sách dựa trên trạng thái và ngày checkout
  const cancelledList = localBookings.filter((b) => b.status === 'cancelled');
  const completedList = localBookings.filter(
    (b) => b.status === 'completed' || (b.status !== 'cancelled' && isPastCheckout(b.checkOut) && !isBookingPartUnpaid(b))
  );
  const upcomingList = localBookings.filter(
    (b) => b.status !== 'cancelled' && b.status !== 'completed' && (!isPastCheckout(b.checkOut) || isBookingPartUnpaid(b))
  );

  const displayedList =
    activeTab === 'upcoming'
      ? upcomingList
      : activeTab === 'completed'
      ? completedList
      : cancelledList;

  // Chia sẻ chuyến đi
  const handleShareBooking = async (booking: BookingDetails) => {
    try {
      const checkInHour = booking.accommodation.rules?.checkIn || '14:00';
      const checkOutHour = booking.accommodation.rules?.checkOut || '12:00';
      const statusText =
        booking.status === 'cancelled'
          ? 'Đã hủy'
          : booking.status === 'completed' || isPastCheckout(booking.checkOut)
          ? 'Đã hoàn thành'
          : 'Đã xác nhận';

      const shareMsg =
        `✈️ Thông tin chuyến đi [${statusText}] tại "${booking.accommodation.title}"!\n\n` +
        `📍 Nơi lưu trú: ${booking.accommodation.location}\n` +
        `📅 Nhận phòng: ${booking.checkIn} (${booking.estimatedCheckInTime ? `Giờ đến: ${booking.estimatedCheckInTime}` : `từ ${checkInHour}`})\n` +
        `📅 Trả phòng: ${booking.checkOut} (trước ${checkOutHour})\n` +
        `⏳ Thời gian: ${booking.nights} đêm\n` +
        `👥 Số lượng: ${booking.guests} khách\n` +
        `🔖 Mã đặt chỗ: #${booking.bookingId.slice(-8)}\n` +
        `💳 Đã thanh toán: ${formatPrice(booking.paidAmount)}\n\n` +
        `Cùng trải nghiệm du lịch tuyệt vời với Travelling App nhé! 🌟`;

      await Share.share({
        message: shareMsg,
        title: `Chuyến đi: ${booking.accommodation.title}`,
      });
    } catch (e) {
      console.warn('Lỗi khi chia sẻ chuyến đi:', e);
    }
  };

  // Mở modal hủy chuyến
  const handleOpenCancelModal = (booking: BookingDetails) => {
    setCancellingBooking(booking);
    setSelectedReason(CANCELLATION_REASONS[0]);
    setCancelModalVisible(true);
  };

  // Xác nhận hủy
  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    const cancelledItem = cancellingBooking;
    const updated = await mockApi.cancelBooking(cancelledItem.bookingId, selectedReason);
    setLocalBookings(updated);
    if (onBookingsUpdated) {
      onBookingsUpdated(updated);
    }

    try {
      await notificationService.addNotification({
        type: 'booking_cancelled',
        title: 'Hủy chuyến thành công ℹ️',
        message: `Chuyến đi tại "${cancelledItem.accommodation.title}" (mã #${cancelledItem.bookingId.slice(-8)}) đã được hủy. Số tiền ${formatPrice(cancelledItem.paidAmount)} sẽ được hoàn trả theo quy định.`,
        bookingId: cancelledItem.bookingId,
        actionText: 'Xem chi tiết',
      });
    } catch (e) {
      console.warn('Lỗi khi gửi thông báo hủy:', e);
    }

    setCancelModalVisible(false);
    setCancellingBooking(null);
    setActiveTab('cancelled');
  };

  // Mở modal xác nhận hoàn thành sớm (hoặc cảnh báo thanh toán nếu mới trả 50%)
  const handleOpenCompleteModal = (booking: BookingDetails) => {
    if (isBookingPartUnpaid(booking)) {
      setPendingPaymentBooking(booking);
      setPaymentRequiredModalVisible(true);
      return;
    }
    setCompletingBooking(booking);
    setCompleteModalVisible(true);
  };

  const handleConfirmComplete = async () => {
    if (!completingBooking) return;
    const item = completingBooking;

    // Kiểm tra an toàn: nếu mới trả 50% thì tuyệt đối không cho trả phòng thành công
    if (isBookingPartUnpaid(item)) {
      setCompleteModalVisible(false);
      setPendingPaymentBooking(item);
      setPaymentRequiredModalVisible(true);
      return;
    }

    const updated = await mockApi.completeBooking(item.bookingId);
    setLocalBookings(updated);
    if (onBookingsUpdated) {
      onBookingsUpdated(updated);
    }

    try {
      await notificationService.addNotification({
        type: 'trip_reminder',
        title: 'Hoàn thành chuyến đi 🎉',
        message: `Chúc mừng bạn đã hoàn thành kỳ nghỉ tại "${item.accommodation.title}"! Hãy viết đánh giá để chia sẻ trải nghiệm nhé.`,
        bookingId: item.bookingId,
        actionText: 'Viết đánh giá ngay',
      });
    } catch (e) {
      console.warn('Lỗi khi gửi thông báo hoàn thành:', e);
    }

    setCompleteModalVisible(false);
    setCompletingBooking(null);
    setActiveTab('completed');
  };

  // Mở modal thanh toán số tiền còn lại (nốt 50%)
  const handleOpenPayRemaining = (booking: BookingDetails) => {
    setPendingPaymentBooking(booking);
    setSelectedPaymentMethod('vietqr');
    setPaymentRequiredModalVisible(false);
    setPayRemainingModalVisible(true);
  };

  // Xác nhận thanh toán nốt số tiền còn lại
  const handleConfirmPayRemaining = async () => {
    if (!pendingPaymentBooking) return;
    setIsProcessingPayment(true);

    try {
      // Giả lập thời gian xử lý thanh toán 600ms
      await new Promise((resolve) => setTimeout(resolve, 600));

      const remainingAmt = getRemainingAmount(pendingPaymentBooking);
      const methodName =
        selectedPaymentMethod === 'vietqr'
          ? 'VietQR Chuyển khoản (Nốt 50%)'
          : selectedPaymentMethod === 'momo'
          ? 'Ví MoMo (Nốt 50%)'
          : selectedPaymentMethod === 'card'
          ? 'Thẻ quốc tế Visa/Master (Nốt 50%)'
          : 'Tiền mặt tại quầy lễ tân (Nốt 50%)';

      const updated = await mockApi.payRemainingAmount(pendingPaymentBooking.bookingId, methodName);
      setLocalBookings(updated);
      if (onBookingsUpdated) {
        onBookingsUpdated(updated);
      }

      try {
        await notificationService.addNotification({
          type: 'booking_success',
          title: 'Thanh toán thành công 💳',
          message: `Bạn đã thanh toán toàn bộ số tiền còn lại (${formatPrice(remainingAmt)}) cho đơn đặt tại "${pendingPaymentBooking.accommodation.title}". Bây giờ bạn có thể thực hiện trả phòng!`,
          bookingId: pendingPaymentBooking.bookingId,
          actionText: 'Xem chuyến đi',
        });
      } catch (err) {
        console.warn('Lỗi khi gửi thông báo thanh toán:', err);
      }

      const justPaidBooking = updated.find((b) => b.bookingId === pendingPaymentBooking.bookingId) || {
        ...pendingPaymentBooking,
        paidAmount: pendingPaymentBooking.totalPrice,
        dueAmount: 0,
        paymentType: 'full' as const,
      };

      setPayRemainingModalVisible(false);
      setPendingPaymentBooking(null);

      // Tự động mở modal xác nhận trả phòng ngay sau khi thanh toán thành công
      setTimeout(() => {
        setCompletingBooking(justPaidBooking);
        setCompleteModalVisible(true);
      }, 350);
    } catch (e) {
      console.warn('Lỗi khi thanh toán số tiền còn lại:', e);
      Alert.alert('Lỗi', 'Không thể hoàn tất thanh toán lúc này. Vui lòng thử lại!');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Mở modal viết hoặc sửa đánh giá
  const handleOpenReviewModal = (booking: BookingDetails) => {
    setReviewingBooking(booking);
    if (booking.review) {
      setReviewRating(booking.review.rating || 5);
      setReviewComment(booking.review.comment || '');
    } else {
      setReviewRating(5);
      setReviewComment('');
    }
    setReviewModalVisible(true);
  };

  // Gửi đánh giá
  const handleSubmitReview = async () => {
    if (!reviewingBooking) return;
    setIsSubmittingReview(true);

    try {
      const authorName = user?.name || 'Du khách Travelling';
      const authorAvatar =
        user?.avatarUrl ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';

      const result = await mockApi.addBookingReview(reviewingBooking.bookingId, {
        rating: reviewRating,
        comment: reviewComment.trim() || 'Dịch vụ và phòng nghỉ rất tốt, tôi rất hài lòng!',
        author: authorName,
        avatar: authorAvatar,
      });

      setLocalBookings(result.updatedBookings);
      if (onBookingsUpdated) {
        onBookingsUpdated(result.updatedBookings);
      }

      await notificationService.addNotification({
        type: 'system_promo',
        title: 'Đánh giá thành công ⭐',
        message: `Cảm ơn bạn đã gửi đánh giá (${reviewRating} sao) cho "${reviewingBooking.accommodation.title}". Đánh giá của bạn sẽ giúp ích cho cộng đồng du lịch!`,
        bookingId: reviewingBooking.bookingId,
        actionText: 'Xem đánh giá',
      });

      setReviewModalVisible(false);
      setReviewingBooking(null);
    } catch (e) {
      console.warn('Lỗi khi gửi đánh giá:', e);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Render thẻ chuyến đi
  const renderBookingCard = ({ item }: { item: BookingDetails }) => {
    const isCancelled = item.status === 'cancelled';
    const hasRemainingDebt = isBookingPartUnpaid(item);
    const isCompleted = item.status === 'completed' || (!isCancelled && isPastCheckout(item.checkOut) && !hasRemainingDebt);
    const isUpcoming = !isCancelled && !isCompleted;
    const hasReviewed = !!item.hasReviewed && !!item.review;

    return (
      <View
        style={[
          styles.bookingCard,
          {
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            borderColor: isDark ? '#334155' : '#E5E7EB',
          },
        ]}
      >
        <View style={styles.cardTop}>
          <Image
            source={{
              uri:
                item.accommodation.images?.[0] ||
                'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
            }}
            style={styles.stayImage}
          />

          {/* BADGES TRỰC QUAN PHÂN BIỆT TRẠNG THÁI */}
          {isCancelled && (
            <View style={[styles.statusBadge, { backgroundColor: 'rgba(239, 68, 68, 0.95)' }]}>
              <Ionicons name="close-circle" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.statusBadgeText}>Đã hủy</Text>
            </View>
          )}

          {isCompleted && (
            <View style={[styles.statusBadge, { backgroundColor: 'rgba(16, 185, 129, 0.95)' }]}>
              <Ionicons name="checkmark-done-circle" size={15} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.statusBadgeText}>Đã hoàn thành</Text>
            </View>
          )}

          {isUpcoming && (
            <View style={[styles.statusBadge, { backgroundColor: 'rgba(0, 189, 214, 0.95)' }]}>
              <Ionicons name="airplane" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.statusBadgeText}>Chuyến sắp tới</Text>
            </View>
          )}
        </View>

        <View style={styles.cardBody}>
          <Text style={[styles.stayTitle, { color: isDark ? '#F8FAFC' : '#111827' }]}>
            {item.accommodation.title}
          </Text>
          <Text style={[styles.stayLocation, { color: isDark ? '#94A3B8' : '#6B7280' }]}>
            {item.accommodation.location}
          </Text>

          {/* BẢNG THÔNG TIN LƯU TRÚ */}
          <View
            style={[
              styles.detailRow,
              {
                backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                borderColor: isDark ? '#334155' : '#E2E8F0',
                borderWidth: 1,
              },
            ]}
          >
            <View style={styles.detailCol}>
              <Text style={[styles.detailLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>Nhận phòng</Text>
              <Text style={[styles.detailVal, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>{item.checkIn}</Text>
              <Text style={[styles.timeDetailVal, { color: isDark ? '#38BDF8' : '#0D9488' }]}>
                {item.estimatedCheckInTime ? `Đến: ${item.estimatedCheckInTime.split(' ')[0]}` : `Từ ${item.accommodation.rules?.checkIn || '14:00'}`}
              </Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={[styles.detailLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>Trả phòng</Text>
              <Text style={[styles.detailVal, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>{item.checkOut}</Text>
              <Text style={[styles.timeDetailVal, { color: isDark ? '#F59E0B' : '#D97706' }]}>
                Trước {item.accommodation.rules?.checkOut || '12:00'}
              </Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={[styles.detailLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>Thời gian & Khách</Text>
              <Text style={[styles.detailVal, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                {item.nights} đêm • {item.guests} khách
              </Text>
              {item.servicePackageName && (
                <Text style={{ fontSize: 11, color: '#00BDD6', fontWeight: '600', marginTop: 2 }}>
                  {item.servicePackageName}
                </Text>
              )}
            </View>
          </View>

          {/* LÝ DO HỦY NẾU CHUYẾN BỊ HỦY */}
          {isCancelled && (
            <View
              style={[
                styles.cancelledInfoBox,
                {
                  backgroundColor: isDark ? '#371818' : '#FEF2F2',
                  borderColor: isDark ? '#7F1D1D' : '#FEE2E2',
                },
              ]}
            >
              <View style={styles.cancelledInfoRow}>
                <Ionicons name="information-circle" size={15} color="#EF4444" style={{ marginRight: 6 }} />
                <Text style={[styles.cancelledReasonText, { color: isDark ? '#FCA5A5' : '#991B1B' }]}>
                  Lý do hủy:{' '}
                  <Text style={[styles.cancelledReasonBold, { color: isDark ? '#F87171' : '#B91C1C' }]}>
                    {item.cancellationReason || 'Thay đổi lịch trình cá nhân'}
                  </Text>
                </Text>
              </View>
              {item.cancelledAt && (
                <Text style={[styles.cancelledDateText, { color: isDark ? '#94A3B8' : '#6B7280' }]}>
                  Thời gian hủy: {item.cancelledAt}
                </Text>
              )}
            </View>
          )}

          {/* KHUNG ĐÁNH GIÁ CỦA BẠN NẾU ĐÃ HOÀN THÀNH */}
          {isCompleted && (
            <View
              style={[
                styles.reviewBoxContainer,
                {
                  backgroundColor: isDark ? '#0F172A' : (hasReviewed ? '#F0FDF4' : '#FFFBEB'),
                  borderColor: isDark ? (hasReviewed ? '#065F46' : '#78350F') : (hasReviewed ? '#BBF7D0' : '#FDE68A'),
                },
              ]}
            >
              {hasReviewed ? (
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#34D399' : '#15803D', marginRight: 6 }}>
                        ⭐ Đánh giá của bạn ({item.review?.rating || 5}.0/5)
                      </Text>
                      <View style={{ flexDirection: 'row' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Ionicons
                            key={s}
                            name={s <= (item.review?.rating || 5) ? 'star' : 'star-outline'}
                            size={13}
                            color="#F59E0B"
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={{ fontSize: 11, color: isDark ? '#94A3B8' : '#64748B' }}>
                      {item.review?.date || 'Gần đây'}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 13, color: isDark ? '#E2E8F0' : '#334155', fontStyle: 'italic', lineHeight: 18 }}>
                    "{item.review?.comment}"
                  </Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#FBBF24' : '#B45309', marginBottom: 2 }}>
                      🌟 Bạn thấy kỳ nghỉ này thế nào?
                    </Text>
                    <Text style={{ fontSize: 12, color: isDark ? '#94A3B8' : '#6B7280' }}>
                      Hãy để lại đánh giá để chia sẻ cảm nhận và giúp chỗ nghỉ cải thiện hơn nhé!
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.writeReviewDirectBtn, { backgroundColor: '#F59E0B' }]}
                    onPress={() => handleOpenReviewModal(item)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="star" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.writeReviewDirectText}>Đánh giá ngay</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]} />

          {/* DÒNG TỔNG TIỀN VÀ MÃ ĐẶT CHỖ */}
          <View style={styles.totalRow}>
            <View>
              <Text style={[styles.totalLabel, { color: isDark ? '#94A3B8' : '#6B7280' }]}>
                Mã đặt chỗ: #{item.bookingId.slice(-8)}
              </Text>
              <Text style={[styles.bookingDateText, { color: isDark ? '#94A3B8' : '#9CA3AF' }]}>
                Ngày: {item.paymentDate}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.totalLabel, { color: isDark ? '#94A3B8' : '#6B7280' }]}>
                {isCancelled
                  ? 'Đã hoàn tiền'
                  : item.paymentType === 'part'
                  ? 'Đã trả trước (50%)'
                  : 'Đã thanh toán'}
              </Text>
              <Text
                style={[
                  styles.totalAmount,
                  isCancelled && { color: '#9CA3AF', textDecorationLine: 'line-through' },
                ]}
              >
                {formatPrice(item.paidAmount)}
              </Text>
              {!isCancelled && item.paymentType === 'part' && (
                <Text style={{ fontSize: 11, color: '#E11D48', marginTop: 2, fontWeight: '500' }}>
                  Còn lại: {formatPrice(item.dueAmount || item.totalPrice - item.paidAmount)}
                </Text>
              )}
            </View>
          </View>

          {/* HÀNG CÁC NÚT THAO TÁC */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.viewDetailBtn}
              onPress={() => onSelectBookingDetail(item)}
              activeOpacity={0.8}
            >
              <Ionicons name="document-text-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.viewDetailBtnText}>Biên lai</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.shareTripBtn,
                {
                  backgroundColor: isDark ? '#0F172A' : '#F0FDFA',
                  borderColor: isDark ? '#334155' : '#CCFBF1',
                },
              ]}
              onPress={() => handleShareBooking(item)}
              activeOpacity={0.8}
            >
              <Ionicons name="share-social-outline" size={16} color={isDark ? '#38BDF8' : '#0D9488'} />
            </TouchableOpacity>

            {/* NÚT THAO TÁC THEO TRẠNG THÁI */}
            {isUpcoming && (
              <>
                {hasRemainingDebt && (
                  <TouchableOpacity
                    style={[
                      styles.payRemainingBtn,
                      {
                        backgroundColor: isDark ? '#431407' : '#FFF7ED',
                        borderColor: isDark ? '#EA580C' : '#FDBA74',
                      },
                    ]}
                    onPress={() => handleOpenPayRemaining(item)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="card-outline" size={15} color={isDark ? '#FB923C' : '#EA580C'} style={{ marginRight: 4 }} />
                    <Text style={[styles.payRemainingText, { color: isDark ? '#FB923C' : '#C2410C' }]}>
                      Thanh toán
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.completeEarlyBtn,
                    {
                      backgroundColor: isDark ? '#064E3B' : '#ECFDF5',
                      borderColor: isDark ? '#059669' : '#A7F3D0',
                    },
                  ]}
                  onPress={() => handleOpenCompleteModal(item)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark-circle-outline" size={15} color="#10B981" style={{ marginRight: 4 }} />
                  <Text style={[styles.completeEarlyText, { color: isDark ? '#6EE7B7' : '#059669' }]}>
                    Trả phòng
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.cancelBtn,
                    {
                      backgroundColor: isDark ? '#371818' : '#FEF2F2',
                      borderColor: isDark ? '#7F1D1D' : '#FECACA',
                    },
                  ]}
                  onPress={() => handleOpenCancelModal(item)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close-circle-outline" size={15} color="#EF4444" style={{ marginRight: 4 }} />
                  <Text style={[styles.cancelBtnText, { color: isDark ? '#F87171' : '#EF4444' }]}>
                    Hủy chuyến
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {isCompleted && (
              <>
                <TouchableOpacity
                  style={[
                    styles.reviewActionBtn,
                    {
                      backgroundColor: hasReviewed
                        ? (isDark ? '#0F172A' : '#F3F4F6')
                        : '#F59E0B',
                      borderColor: hasReviewed
                        ? (isDark ? '#334155' : '#D1D5DB')
                        : '#D97706',
                    },
                  ]}
                  onPress={() => handleOpenReviewModal(item)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={hasReviewed ? 'create-outline' : 'star'}
                    size={15}
                    color={hasReviewed ? (isDark ? '#E2E8F0' : '#374151') : '#FFFFFF'}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      styles.reviewActionBtnText,
                      { color: hasReviewed ? (isDark ? '#E2E8F0' : '#374151') : '#FFFFFF' },
                    ]}
                  >
                    {hasReviewed ? 'Sửa đánh giá' : 'Viết đánh giá'}
                  </Text>
                </TouchableOpacity>

                {onViewReviews && (
                  <TouchableOpacity
                    style={[
                      styles.reviewActionBtn,
                      {
                        backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                        borderColor: isDark ? '#334155' : '#E2E8F0',
                      },
                    ]}
                    onPress={() => onViewReviews(item.accommodation)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="chatbubbles-outline" size={15} color="#00BDD6" style={{ marginRight: 4 }} />
                    <Text style={[styles.reviewActionBtnText, { color: isDark ? '#38BDF8' : '#0284C7' }]}>
                      Xem đánh giá
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.rebookBtn,
                    {
                      backgroundColor: isDark ? '#042F2E' : '#F0FDFA',
                      borderColor: '#00BDD6',
                    },
                  ]}
                  onPress={() => (onRebook ? onRebook(item.accommodation) : onExplore())}
                  activeOpacity={0.8}
                >
                  <Ionicons name="refresh-outline" size={15} color="#00BDD6" style={{ marginRight: 4 }} />
                  <Text style={styles.rebookBtnText}>Đặt lại</Text>
                </TouchableOpacity>
              </>
            )}

            {isCancelled && (
              <TouchableOpacity
                style={[
                  styles.rebookBtn,
                  {
                    backgroundColor: isDark ? '#042F2E' : '#F0FDFA',
                    borderColor: '#00BDD6',
                  },
                ]}
                onPress={() => (onRebook ? onRebook(item.accommodation) : onExplore())}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh-outline" size={16} color="#00BDD6" style={{ marginRight: 4 }} />
                <Text style={styles.rebookBtnText}>Đặt lại chuyến này</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  // ============ MODAL 1: REVIEW MODAL (VIẾT & SỬA ĐÁNH GIÁ) ============
  const renderReviewModal = () => {
    if (!reviewingBooking) return null;

    return (
      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.container, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={modalStyles.header}>
                <View style={modalStyles.headerLeft}>
                  <View style={[modalStyles.reviewIconWrap, { backgroundColor: '#F59E0B' }]}>
                    <Ionicons name="star" size={20} color="#FFFFFF" />
                  </View>
                  <Text style={[modalStyles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    {reviewingBooking.hasReviewed ? 'Chỉnh sửa đánh giá' : 'Đánh giá chuyến đi'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[modalStyles.closeBtn, { backgroundColor: isDark ? '#334155' : '#F3F4F6' }]}
                  onPress={() => setReviewModalVisible(false)}
                >
                  <Ionicons name="close" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
                </TouchableOpacity>
              </View>

              {/* Thông tin phòng */}
              <View
                style={[
                  modalStyles.bookingInfoCard,
                  {
                    backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                  },
                ]}
              >
                <Text style={[modalStyles.bookingTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                  {reviewingBooking.accommodation.title}
                </Text>
                <Text style={[modalStyles.bookingDates, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                  {reviewingBooking.checkIn} → {reviewingBooking.checkOut} • {reviewingBooking.nights} đêm
                </Text>
              </View>

              {/* CHỌN SỐ SAO VÀ CẢM XÚC */}
              <Text style={[modalStyles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Mức độ hài lòng của bạn:
              </Text>
              <View style={modalStyles.starRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    style={modalStyles.starButton}
                    onPress={() => setReviewRating(star)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={star <= reviewRating ? 'star' : 'star-outline'}
                      size={36}
                      color="#F59E0B"
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <View
                style={[
                  modalStyles.emotionPill,
                  {
                    backgroundColor: isDark ? '#0F172A' : '#FFFBEB',
                    borderColor: isDark ? '#334155' : '#FDE68A',
                  },
                ]}
              >
                <Text style={[modalStyles.emotionText, { color: isDark ? '#FBBF24' : '#B45309' }]}>
                  {RATING_EMOTIONS[reviewRating] || 'Tuyệt vời'}
                </Text>
              </View>

              {/* Ô NHẬP NHẬN XÉT */}
              <Text style={[modalStyles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827', marginTop: 18 }]}>
                Nhận xét & cảm nhận của bạn:
              </Text>
              <TextInput
                style={[
                  modalStyles.commentInput,
                  {
                    backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                    color: isDark ? '#FFFFFF' : '#111827',
                  },
                ]}
                placeholder="Phòng nghỉ, dịch vụ, vị trí, chủ nhà... có đáp ứng đúng mong đợi của bạn không? Hãy chia sẻ nhé!"
                placeholderTextColor={isDark ? '#64748B' : '#9CA3AF'}
                multiline
                numberOfLines={4}
                value={reviewComment}
                onChangeText={setReviewComment}
                textAlignVertical="top"
              />

              {/* NÚT HÀNH ĐỘNG */}
              <View style={modalStyles.actionRow}>
                <TouchableOpacity
                  style={[modalStyles.keepBtn, { backgroundColor: isDark ? '#334155' : '#F3F4F6' }]}
                  onPress={() => setReviewModalVisible(false)}
                  activeOpacity={0.8}
                >
                  <Text style={[modalStyles.keepBtnText, { color: isDark ? '#E2E8F0' : '#4B5563' }]}>
                    Để sau
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[modalStyles.submitReviewBtn, { backgroundColor: '#F59E0B' }]}
                  onPress={handleSubmitReview}
                  disabled={isSubmittingReview}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={modalStyles.submitReviewBtnText}>
                    {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // ============ MODAL 2: CONFIRM COMPLETE EARLY MODAL ============
  const renderCompleteModal = () => {
    if (!completingBooking) return null;

    return (
      <Modal
        visible={completeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCompleteModalVisible(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.container, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            <View style={modalStyles.header}>
              <View style={modalStyles.headerLeft}>
                <View style={[modalStyles.reviewIconWrap, { backgroundColor: '#10B981' }]}>
                  <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
                </View>
                <Text style={[modalStyles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Xác nhận trả phòng
                </Text>
              </View>
              <TouchableOpacity
                style={[modalStyles.closeBtn, { backgroundColor: isDark ? '#334155' : '#F3F4F6' }]}
                onPress={() => setCompleteModalVisible(false)}
              >
                <Ionicons name="close" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 14, color: isDark ? '#CBD5E1' : '#4B5563', lineHeight: 21, marginBottom: 12 }}>
              Bạn có chắc chắn muốn xác nhận đã hoàn tất kỳ nghỉ tại{' '}
              <Text style={{ fontWeight: '700', color: isDark ? '#FFFFFF' : '#111827' }}>
                "{completingBooking.accommodation.title}"
              </Text>
              ? Chuyến đi sẽ được chuyển sang mục "Đã hoàn thành" để bạn có thể viết đánh giá.
            </Text>

            {/* Thông tin xác nhận thanh toán đủ 100% */}
            <View
              style={{
                backgroundColor: isDark ? '#064E3B' : '#ECFDF5',
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 10,
                marginBottom: 16,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: isDark ? '#059669' : '#A7F3D0',
              }}
            >
              <Ionicons name="checkmark-circle" size={18} color="#10B981" style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: isDark ? '#6EE7B7' : '#047857', fontWeight: '700' }}>
                  Đã thanh toán đủ 100%
                </Text>
                <Text style={{ fontSize: 12, color: isDark ? '#A7F3D0' : '#065F46', marginTop: 1 }}>
                  Tổng tiền đã thanh toán: {formatPrice(completingBooking.paidAmount)}
                </Text>
              </View>
            </View>

            <View style={modalStyles.actionRow}>
              <TouchableOpacity
                style={[modalStyles.keepBtn, { backgroundColor: isDark ? '#334155' : '#F3F4F6' }]}
                onPress={() => setCompleteModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={[modalStyles.keepBtnText, { color: isDark ? '#E2E8F0' : '#4B5563' }]}>
                  Chưa trả phòng
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[modalStyles.submitReviewBtn, { backgroundColor: '#10B981' }]}
                onPress={handleConfirmComplete}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={modalStyles.submitReviewBtnText}>Xác nhận hoàn thành</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // ============ MODAL: YÊU CẦU THANH TOÁN ĐỦ 100% MỚI ĐƯỢC TRẢ PHÒNG ============
  const renderPaymentRequiredModal = () => {
    if (!pendingPaymentBooking) return null;
    const remainingAmount = getRemainingAmount(pendingPaymentBooking);

    return (
      <Modal
        visible={paymentRequiredModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPaymentRequiredModalVisible(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.container, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            {/* Header */}
            <View style={modalStyles.header}>
              <View style={modalStyles.headerLeft}>
                <View style={[modalStyles.warningIcon, { backgroundColor: '#EF4444' }]}>
                  <Ionicons name="alert-circle" size={22} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[modalStyles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Chưa thể trả phòng
                  </Text>
                  <Text style={{ fontSize: 12, color: '#EF4444', fontWeight: '700', marginTop: 1 }}>
                    Yêu cầu thanh toán đủ 100%
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[modalStyles.closeBtn, { backgroundColor: isDark ? '#334155' : '#F3F4F6' }]}
                onPress={() => setPaymentRequiredModalVisible(false)}
              >
                <Ionicons name="close" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            {/* Thông báo cảnh báo nổi bật */}
            <View
              style={[
                modalStyles.noticeBox,
                {
                  backgroundColor: isDark ? '#371818' : '#FEF2F2',
                  borderColor: isDark ? '#7F1D1D' : '#FECACA',
                  marginBottom: 16,
                },
              ]}
            >
              <Ionicons name="warning" size={20} color="#EF4444" style={{ marginRight: 8, marginTop: 2 }} />
              <Text style={[modalStyles.noticeText, { color: isDark ? '#FCA5A5' : '#991B1B', fontWeight: '500' }]}>
                Đơn đặt phòng này mới được thanh toán <Text style={{ fontWeight: '800' }}>50%</Text>. Bạn phải thanh toán hết toàn bộ số tiền còn lại mới được thực hiện thủ tục trả phòng!
              </Text>
            </View>

            {/* Thẻ chi tiết số tiền */}
            <View
              style={[
                modalStyles.bookingInfoCard,
                {
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                  marginBottom: 18,
                },
              ]}
            >
              <Text style={[modalStyles.bookingTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                {pendingPaymentBooking.accommodation.title}
              </Text>
              <Text style={[modalStyles.bookingDates, { color: isDark ? '#94A3B8' : '#64748B', marginBottom: 12 }]}>
                Mã đặt chỗ: #{pendingPaymentBooking.bookingId.slice(-8)} • {pendingPaymentBooking.nights} đêm
              </Text>

              <View style={{ gap: 8, borderTopWidth: 1, borderTopColor: isDark ? '#334155' : '#E2E8F0', paddingTop: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, color: isDark ? '#94A3B8' : '#64748B' }}>Tổng tiền phòng:</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: isDark ? '#F8FAFC' : '#111827' }}>
                    {formatPrice(pendingPaymentBooking.totalPrice)}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, color: isDark ? '#94A3B8' : '#64748B' }}>Đã thanh toán trước (50%):</Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#10B981' }}>
                    {formatPrice(pendingPaymentBooking.paidAmount)}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 6,
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: isDark ? '#334155' : '#E2E8F0',
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#E11D48' }}>
                    Số tiền cần thanh toán:
                  </Text>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#E11D48' }}>
                    {formatPrice(remainingAmount)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Các nút hành động */}
            <View style={modalStyles.actionRow}>
              <TouchableOpacity
                style={[modalStyles.keepBtn, { backgroundColor: isDark ? '#334155' : '#F3F4F6' }]}
                onPress={() => setPaymentRequiredModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={[modalStyles.keepBtnText, { color: isDark ? '#E2E8F0' : '#4B5563' }]}>
                  Để sau
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[modalStyles.submitReviewBtn, { backgroundColor: '#00BDD6' }]}
                onPress={() => handleOpenPayRemaining(pendingPaymentBooking)}
                activeOpacity={0.8}
              >
                <Ionicons name="card" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={modalStyles.submitReviewBtnText}>Thanh toán ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // ============ MODAL: THANH TOÁN SỐ TIỀN CÒN LẠI (NỐT 50%) ============
  const renderPayRemainingModal = () => {
    if (!pendingPaymentBooking) return null;
    const remainingAmount = getRemainingAmount(pendingPaymentBooking);

    const paymentMethods = [
      { id: 'vietqr', label: 'Chuyển khoản VietQR 24/7', icon: 'qr-code-outline', sub: 'Quét mã thanh toán tức thì qua ứng dụng ngân hàng' },
      { id: 'momo', label: 'Ví MoMo', icon: 'wallet-outline', sub: 'Thanh toán siêu tốc qua ví điện tử MoMo' },
      { id: 'card', label: 'Thẻ quốc tế (Visa / Mastercard)', icon: 'card-outline', sub: 'Thanh toán bảo mật chuẩn EMV' },
      { id: 'cash', label: 'Tiền mặt tại quầy lễ tân', icon: 'cash-outline', sub: 'Xác nhận thu tiền mặt trực tiếp tại chỗ nghỉ' },
    ];

    return (
      <Modal
        visible={payRemainingModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!isProcessingPayment) {
            setPayRemainingModalVisible(false);
          }
        }}
      >
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.container, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', maxHeight: '92%' }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={modalStyles.header}>
                <View style={modalStyles.headerLeft}>
                  <View style={[modalStyles.reviewIconWrap, { backgroundColor: '#00BDD6' }]}>
                    <Ionicons name="card" size={20} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[modalStyles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                      Thanh toán còn lại
                    </Text>
                    <Text style={{ fontSize: 12, color: isDark ? '#94A3B8' : '#64748B' }}>
                      Hoàn tất để tiến hành trả phòng
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[modalStyles.closeBtn, { backgroundColor: isDark ? '#334155' : '#F3F4F6' }]}
                  onPress={() => {
                    if (!isProcessingPayment) {
                      setPayRemainingModalVisible(false);
                    }
                  }}
                  disabled={isProcessingPayment}
                >
                  <Ionicons name="close" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
                </TouchableOpacity>
              </View>

              {/* Hộp số tiền cần thanh toán */}
              <View
                style={[
                  modalStyles.bookingInfoCard,
                  {
                    backgroundColor: isDark ? '#042F2E' : '#F0FDFA',
                    borderColor: isDark ? '#0D9488' : '#99F6E4',
                    alignItems: 'center',
                    paddingVertical: 16,
                  },
                ]}
              >
                <Text style={{ fontSize: 12, color: isDark ? '#99F6E4' : '#0F766E', fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 }}>
                  SỐ TIỀN CẦN THANH TOÁN (50% CÒN LẠI)
                </Text>
                <Text style={{ fontSize: 26, fontWeight: '800', color: isDark ? '#2DD4BF' : '#0D9488' }}>
                  {formatPrice(remainingAmount)}
                </Text>
                <Text style={{ fontSize: 12, color: isDark ? '#94A3B8' : '#64748B', marginTop: 4 }}>
                  {pendingPaymentBooking.accommodation.title}
                </Text>
              </View>

              {/* Chọn phương thức thanh toán */}
              <Text style={[modalStyles.sectionTitle, { color: isDark ? '#FFFFFF' : '#111827', marginTop: 6, marginBottom: 10 }]}>
                Chọn phương thức thanh toán:
              </Text>

              {paymentMethods.map((m) => {
                const isSelected = selectedPaymentMethod === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[
                      modalStyles.reasonOption,
                      {
                        backgroundColor: isDark
                          ? isSelected
                            ? '#042F2E'
                            : '#0F172A'
                          : isSelected
                          ? '#F0FDFA'
                          : '#FFFFFF',
                        borderColor: isSelected ? '#00BDD6' : isDark ? '#334155' : '#E5E7EB',
                        paddingVertical: 12,
                      },
                    ]}
                    onPress={() => setSelectedPaymentMethod(m.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[modalStyles.radioOuter, isSelected && modalStyles.radioOuterSelected]}>
                      {isSelected && <View style={modalStyles.radioInner} />}
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons
                        name={m.icon as any}
                        size={20}
                        color={isSelected ? '#00BDD6' : isDark ? '#94A3B8' : '#64748B'}
                        style={{ marginRight: 10 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: isSelected ? '700' : '600',
                            color: isSelected ? '#00BDD6' : isDark ? '#E2E8F0' : '#1F2937',
                          }}
                        >
                          {m.label}
                        </Text>
                        <Text style={{ fontSize: 11, color: isDark ? '#94A3B8' : '#6B7280', marginTop: 2 }}>
                          {m.sub}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Hướng dẫn chuyển khoản nếu chọn VietQR */}
              {selectedPaymentMethod === 'vietqr' && (
                <View
                  style={[
                    modalStyles.noticeBox,
                    {
                      backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                      borderColor: isDark ? '#334155' : '#E2E8F0',
                      marginTop: 6,
                    },
                  ]}
                >
                  <Ionicons name="information-circle" size={18} color="#00BDD6" style={{ marginRight: 8, marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12.5, fontWeight: '700', color: isDark ? '#E2E8F0' : '#1E293B', marginBottom: 2 }}>
                      Thông tin chuyển khoản:
                    </Text>
                    <Text style={{ fontSize: 12, color: isDark ? '#94A3B8' : '#475569' }}>
                      • Ngân hàng: <Text style={{ fontWeight: '600' }}>MBBank (Quân Đội)</Text>
                    </Text>
                    <Text style={{ fontSize: 12, color: isDark ? '#94A3B8' : '#475569' }}>
                      • Số tài khoản: <Text style={{ fontWeight: '600' }}>0987654321</Text>
                    </Text>
                    <Text style={{ fontSize: 12, color: isDark ? '#94A3B8' : '#475569' }}>
                      • Nội dung: <Text style={{ fontWeight: '700', color: '#00BDD6' }}>TB {pendingPaymentBooking.bookingId.slice(-8)}</Text>
                    </Text>
                  </View>
                </View>
              )}

              {/* Hàng nút hành động */}
              <View style={modalStyles.actionRow}>
                <TouchableOpacity
                  style={[modalStyles.keepBtn, { backgroundColor: isDark ? '#334155' : '#F3F4F6' }]}
                  onPress={() => setPayRemainingModalVisible(false)}
                  disabled={isProcessingPayment}
                  activeOpacity={0.8}
                >
                  <Text style={[modalStyles.keepBtnText, { color: isDark ? '#E2E8F0' : '#4B5563' }]}>
                    Hủy
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    modalStyles.submitReviewBtn,
                    { backgroundColor: '#10B981', opacity: isProcessingPayment ? 0.7 : 1 },
                  ]}
                  onPress={handleConfirmPayRemaining}
                  disabled={isProcessingPayment}
                  activeOpacity={0.8}
                >
                  {isProcessingPayment ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={modalStyles.submitReviewBtnText}>
                        Xác nhận thanh toán
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // ============ MODAL 3: CANCEL MODAL ============
  const renderCancelModal = () => {
    if (!cancellingBooking) return null;
    const refundAmount = cancellingBooking.paidAmount;

    return (
      <Modal
        visible={cancelModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.container, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={modalStyles.header}>
                <View style={modalStyles.headerLeft}>
                  <View style={modalStyles.warningIcon}>
                    <Ionicons name="warning" size={20} color="#FFFFFF" />
                  </View>
                  <Text style={[modalStyles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    Xác nhận hủy chuyến
                  </Text>
                </View>
                <TouchableOpacity
                  style={[modalStyles.closeBtn, { backgroundColor: isDark ? '#334155' : '#F3F4F6' }]}
                  onPress={() => setCancelModalVisible(false)}
                >
                  <Ionicons name="close" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
                </TouchableOpacity>
              </View>

              {/* Thông tin chuyến đi */}
              <View
                style={[
                  modalStyles.bookingInfoCard,
                  {
                    backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                  },
                ]}
              >
                <Text style={[modalStyles.bookingTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                  {cancellingBooking.accommodation.title}
                </Text>
                <Text style={[modalStyles.bookingDates, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                  {cancellingBooking.checkIn} → {cancellingBooking.checkOut} • {cancellingBooking.nights} đêm
                </Text>

                <View style={modalStyles.refundRow}>
                  <Text style={modalStyles.refundLabel}>Số tiền hoàn trả (100%):</Text>
                  <Text style={modalStyles.refundAmount}>{formatPrice(refundAmount)}</Text>
                </View>
              </View>

              {/* Thông báo hoàn tiền */}
              <View
                style={[
                  modalStyles.noticeBox,
                  {
                    backgroundColor: isDark ? '#082F49' : '#EFF6FF',
                    borderColor: isDark ? '#0284C7' : '#BFDBFE',
                  },
                ]}
              >
                <Ionicons name="information-circle" size={18} color="#0284C7" style={{ marginRight: 8, marginTop: 2 }} />
                <Text style={[modalStyles.noticeText, { color: isDark ? '#BAE6FD' : '#1E40AF' }]}>
                  Số tiền đã thanh toán sẽ được hoàn trả đầy đủ vào phương thức thanh toán ban đầu trong vòng 3-5 ngày làm việc.
                </Text>
              </View>

              {/* Lý do hủy */}
              <Text style={[modalStyles.reasonsTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Vui lòng chọn lý do hủy:
              </Text>

              {CANCELLATION_REASONS.map((reason, index) => {
                const isSelected = selectedReason === reason;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      modalStyles.reasonOption,
                      {
                        backgroundColor: isDark
                          ? isSelected
                            ? '#042F2E'
                            : '#0F172A'
                          : isSelected
                          ? '#F0FDFA'
                          : '#FFFFFF',
                        borderColor: isSelected ? '#00BDD6' : isDark ? '#334155' : '#E5E7EB',
                      },
                    ]}
                    onPress={() => setSelectedReason(reason)}
                    activeOpacity={0.7}
                  >
                    <View style={[modalStyles.radioOuter, isSelected && modalStyles.radioOuterSelected]}>
                      {isSelected && <View style={modalStyles.radioInner} />}
                    </View>
                    <Text
                      style={[
                        modalStyles.reasonText,
                        { color: isSelected ? '#00BDD6' : isDark ? '#E2E8F0' : '#374151' },
                      ]}
                    >
                      {reason}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {/* Nút hành động */}
              <View style={modalStyles.actionRow}>
                <TouchableOpacity
                  style={[modalStyles.keepBtn, { backgroundColor: isDark ? '#334155' : '#F3F4F6' }]}
                  onPress={() => setCancelModalVisible(false)}
                  activeOpacity={0.8}
                >
                  <Text style={[modalStyles.keepBtnText, { color: isDark ? '#E2E8F0' : '#4B5563' }]}>
                    Giữ lại chuyến
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={modalStyles.confirmCancelBtn}
                  onPress={handleConfirmCancel}
                  activeOpacity={0.8}
                >
                  <Ionicons name="trash-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={modalStyles.confirmCancelBtnText}>Xác nhận hủy</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: isDark ? colors.background : '#F9FAFB' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* HEADER SECTION CẢI THIỆN NỀN TỐI & AN TOÀN MOBILE */}
      <View
        style={{
          width: '100%',
          backgroundColor: isDark ? colors.background : '#FFFFFF',
          borderBottomColor: isDark ? colors.border : '#F3F4F6',
          borderBottomWidth: 1,
          paddingTop: mobileTopInset,
        }}
      >
        <View
          style={[
            styles.header,
            {
              maxWidth: contentMaxWidth,
              alignSelf: 'center',
              width: '100%',
              paddingHorizontal: horizontalPadding,
              backgroundColor: 'transparent',
            },
          ]}
        >
          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
            Chuyến đi của tôi
          </Text>
        </View>
      </View>

      {/* 3 TABS LỌC: SẮP TỚI - ĐÃ HOÀN THÀNH - ĐÃ HỦY */}
      <View
        style={{
          width: '100%',
          backgroundColor: isDark ? colors.background : '#FFFFFF',
          borderBottomColor: isDark ? colors.border : '#E5E7EB',
          borderBottomWidth: 1,
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.filterRow,
            {
              paddingHorizontal: horizontalPadding,
              backgroundColor: 'transparent',
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.tabChip,
              {
                backgroundColor: activeTab === 'upcoming' ? '#00BDD6' : isDark ? '#1E293B' : '#F3F4F6',
                borderColor: activeTab === 'upcoming' ? '#00BDD6' : isDark ? '#334155' : '#E2E8F0',
                borderWidth: 1,
              },
            ]}
            onPress={() => setActiveTab('upcoming')}
          >
            <Text
              style={[
                styles.tabChipText,
                {
                  color: activeTab === 'upcoming' ? '#FFFFFF' : isDark ? '#94A3B8' : '#4B5563',
                  fontWeight: activeTab === 'upcoming' ? '700' : '600',
                },
              ]}
            >
              Chuyến sắp tới ({upcomingList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabChip,
              {
                backgroundColor: activeTab === 'completed' ? '#00BDD6' : isDark ? '#1E293B' : '#F3F4F6',
                borderColor: activeTab === 'completed' ? '#00BDD6' : isDark ? '#334155' : '#E2E8F0',
                borderWidth: 1,
              },
            ]}
            onPress={() => setActiveTab('completed')}
          >
            <Text
              style={[
                styles.tabChipText,
                {
                  color: activeTab === 'completed' ? '#FFFFFF' : isDark ? '#94A3B8' : '#4B5563',
                  fontWeight: activeTab === 'completed' ? '700' : '600',
                },
              ]}
            >
              Đã hoàn thành ({completedList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabChip,
              {
                backgroundColor: activeTab === 'cancelled' ? '#00BDD6' : isDark ? '#1E293B' : '#F3F4F6',
                borderColor: activeTab === 'cancelled' ? '#00BDD6' : isDark ? '#334155' : '#E2E8F0',
                borderWidth: 1,
              },
            ]}
            onPress={() => setActiveTab('cancelled')}
          >
            <Text
              style={[
                styles.tabChipText,
                {
                  color: activeTab === 'cancelled' ? '#FFFFFF' : isDark ? '#94A3B8' : '#4B5563',
                  fontWeight: activeTab === 'cancelled' ? '700' : '600',
                },
              ]}
            >
              Chuyến đã hủy ({cancelledList.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* DANH SÁCH CHUYẾN ĐI */}
      <FlatList
        data={displayedList}
        keyExtractor={(item) => item.bookingId}
        renderItem={renderBookingCard}
        contentContainerStyle={[
          styles.listContent,
          {
            maxWidth: contentMaxWidth,
            alignSelf: 'center',
            width: '100%',
            paddingHorizontal: horizontalPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons
              name={
                activeTab === 'upcoming'
                  ? 'airplane-outline'
                  : activeTab === 'completed'
                  ? 'ribbon-outline'
                  : 'archive-outline'
              }
              size={64}
              color={isDark ? '#475569' : '#D1D5DB'}
            />
            <Text style={[styles.emptyTitle, { color: isDark ? '#F8FAFC' : '#374151' }]}>
              {activeTab === 'upcoming'
                ? 'Chưa có chuyến đi sắp tới'
                : activeTab === 'completed'
                ? 'Chưa có chuyến đi hoàn thành'
                : 'Không có chuyến đi đã hủy'}
            </Text>
            <Text style={[styles.emptySub, { color: isDark ? '#94A3B8' : '#6B7280' }]}>
              {activeTab === 'upcoming'
                ? 'Hãy khám phá những điểm đến tuyệt vời và lên kế hoạch chuyến đi ngay!'
                : activeTab === 'completed'
                ? 'Các chuyến đi sau khi hoàn tất trả phòng sẽ xuất hiện ở đây để bạn viết đánh giá.'
                : 'Các chuyến đi bạn hủy sẽ được lưu giữ tại đây.'}
            </Text>
            {activeTab === 'upcoming' && (
              <TouchableOpacity style={styles.exploreButton} onPress={onExplore}>
                <Text style={styles.exploreButtonText}>Khám phá ngay</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      {/* CÁC MODAL */}
      {renderCancelModal()}
      {renderReviewModal()}
      {renderCompleteModal()}
      {renderPaymentRequiredModal()}
      {renderPayRemainingModal()}

      <BottomTabBar activeTab="Bookings" onTabChange={onTabChange} />
    </View>
  );
};

// ============ MODAL STYLES ============
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  warningIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingInfoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bookingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  bookingDates: {
    fontSize: 13,
    color: '#64748B',
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginVertical: 6,
  },
  starButton: {
    padding: 4,
  },
  emotionPill: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 6,
    marginBottom: 8,
  },
  emotionText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  commentInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    minHeight: 95,
  },
  submitReviewBtn: {
    flex: 1.4,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitReviewBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  refundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
  },
  refundLabel: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
  },
  refundAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10B981',
  },
  noticeBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'flex-start',
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: '#1E40AF',
  },
  reasonsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioOuterSelected: {
    borderColor: '#00BDD6',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00BDD6',
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  keepBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#374151',
  },
  confirmCancelBtn: {
    flex: 1.3,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

// ============ SCREEN STYLES ============
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  filterRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    gap: 8,
  },
  tabChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  tabChipText: {
    fontSize: 12.5,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 95,
  },
  bookingCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTop: {
    position: 'relative',
    height: 165,
  },
  stayImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardBody: {
    padding: 16,
  },
  stayTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  stayLocation: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    marginBottom: 3,
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  timeDetailVal: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  cancelledInfoBox: {
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
  },
  cancelledInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelledReasonText: {
    fontSize: 12.5,
  },
  cancelledReasonBold: {
    fontWeight: '700',
  },
  cancelledDateText: {
    fontSize: 11,
    marginTop: 4,
    marginLeft: 21,
  },
  reviewBoxContainer: {
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
  },
  writeReviewDirectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  writeReviewDirectText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  totalLabel: {
    fontSize: 12,
  },
  bookingDateText: {
    fontSize: 11,
    marginTop: 2,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#00BDD6',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  shareTripBtn: {
    width: 38,
    height: 38,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDetailBtn: {
    flex: 1,
    minWidth: 100,
    flexDirection: 'row',
    backgroundColor: '#00BDD6',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDetailBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  payRemainingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderRadius: 9,
    borderWidth: 1,
  },
  payRemainingText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  completeEarlyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderRadius: 9,
    borderWidth: 1,
  },
  completeEarlyText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  reviewActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 9,
    borderWidth: 1,
  },
  reviewActionBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  rebookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 9,
    borderWidth: 1.5,
  },
  rebookBtnText: {
    color: '#00BDD6',
    fontSize: 12.5,
    fontWeight: '700',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderRadius: 9,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#00BDD6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
