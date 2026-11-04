import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Accommodation, BookingDetails, BottomTabType } from '../types';
import { BottomTabBar } from '../components/BottomTabBar';
import { mockApi } from '../api/mockApi';
import { useCurrency } from '../context/CurrencyContext';

const CANCELLATION_REASONS = [
  'Thay đổi lịch trình cá nhân',
  'Có việc bận đột xuất',
  'Tìm được phòng/khách sạn phù hợp hơn',
  'Thời tiết hoặc lý do khách quan không thuận lợi',
];

interface BookingsScreenProps {
  bookings: BookingDetails[];
  onExplore: () => void;
  onSelectBookingDetail: (booking: BookingDetails) => void;
  onRebook?: (stay: Accommodation) => void;
  onTabChange: (tab: BottomTabType) => void;
  onBookingsUpdated?: (updated: BookingDetails[]) => void;
}

export const BookingsScreen: React.FC<BookingsScreenProps> = ({
  bookings = [],
  onExplore,
  onSelectBookingDetail,
  onRebook,
  onTabChange,
  onBookingsUpdated,
}) => {
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'cancelled'>('upcoming');
  const [localBookings, setLocalBookings] = useState<BookingDetails[]>(bookings);

  // Cancel modal state
  const [cancelModalVisible, setCancelModalVisible] = useState<boolean>(false);
  const [cancellingBooking, setCancellingBooking] = useState<BookingDetails | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>(CANCELLATION_REASONS[0]);

  React.useEffect(() => {
    setLocalBookings(bookings);
  }, [bookings]);

  const upcomingList = localBookings.filter((b) => b.status !== 'cancelled');
  const cancelledList = localBookings.filter((b) => b.status === 'cancelled');

  const displayedList = activeTab === 'upcoming' ? upcomingList : cancelledList;

  const handleOpenCancelModal = (booking: BookingDetails) => {
    setCancellingBooking(booking);
    setSelectedReason(CANCELLATION_REASONS[0]);
    setCancelModalVisible(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;

    const updated = await mockApi.cancelBooking(cancellingBooking.bookingId, selectedReason);
    setLocalBookings(updated);
    if (onBookingsUpdated) {
      onBookingsUpdated(updated);
    }
    setCancelModalVisible(false);
    setCancellingBooking(null);
    setActiveTab('cancelled');
  };

  const renderBookingCard = ({ item }: { item: BookingDetails }) => {
    const isCancelled = item.status === 'cancelled';

    return (
      <View style={styles.bookingCard}>
        <View style={styles.cardTop}>
          <Image
            source={{
              uri:
                item.accommodation.images?.[0] ||
                'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
            }}
            style={styles.stayImage}
          />
          {isCancelled ? (
            <View style={styles.badgeCancelled}>
              <Ionicons name="close-circle" size={14} color="#EF4444" style={{ marginRight: 4 }} />
              <Text style={styles.badgeCancelledText}>Đã hủy</Text>
            </View>
          ) : (
            <View style={styles.badgeConfirmed}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" style={{ marginRight: 4 }} />
              <Text style={styles.badgeConfirmedText}>Đã xác nhận</Text>
            </View>
          )}
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.stayTitle}>{item.accommodation.title}</Text>
          <Text style={styles.stayLocation}>{item.accommodation.location}</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Nhận phòng</Text>
              <Text style={styles.detailVal}>{item.checkIn}</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Trả phòng</Text>
              <Text style={styles.detailVal}>{item.checkOut}</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Thời gian & Khách</Text>
              <Text style={styles.detailVal}>
                {item.nights} đêm • {item.guests} khách
              </Text>
            </View>
          </View>

          {/* Cancellation Info box if trip is cancelled */}
          {isCancelled && (
            <View style={styles.cancelledInfoBox}>
              <View style={styles.cancelledInfoRow}>
                <Ionicons name="information-circle" size={15} color="#DC2626" style={{ marginRight: 6 }} />
                <Text style={styles.cancelledReasonText}>
                  Lý do hủy:{' '}
                  <Text style={styles.cancelledReasonBold}>
                    {item.cancellationReason || 'Thay đổi lịch trình cá nhân'}
                  </Text>
                </Text>
              </View>
              {item.cancelledAt && (
                <Text style={styles.cancelledDateText}>
                  Thời gian hủy: {item.cancelledAt}
                </Text>
              )}
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>Mã đặt chỗ: #{item.bookingId.slice(-8)}</Text>
              <Text style={styles.bookingDateText}>Ngày: {item.paymentDate}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.totalLabel}>
                {isCancelled
                  ? 'Đã hoàn tiền'
                  : item.paymentType === 'part'
                  ? 'Đã trả trước (50%)'
                  : 'Đã thanh toán'}
              </Text>
              <Text style={[styles.totalAmount, isCancelled && { color: '#9CA3AF', textDecorationLine: 'line-through' }]}>
                {formatPrice(item.paidAmount)}
              </Text>
              {!isCancelled && item.paymentType === 'part' && (
                <Text style={{ fontSize: 11, color: '#E11D48', marginTop: 2, fontWeight: '500' }}>
                  Còn lại: {formatPrice(item.dueAmount || item.totalPrice - item.paidAmount)}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.viewDetailBtn}
              onPress={() => onSelectBookingDetail(item)}
            >
              <Ionicons name="document-text-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.viewDetailBtnText}>Biên lai & Xuất PDF</Text>
            </TouchableOpacity>

            {isCancelled ? (
              <TouchableOpacity
                style={styles.rebookBtn}
                onPress={() => (onRebook ? onRebook(item.accommodation) : onExplore())}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh-outline" size={16} color="#00BDD6" style={{ marginRight: 4 }} />
                <Text style={styles.rebookBtnText}>Đặt lại chuyến này</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => handleOpenCancelModal(item)}
              >
                <Ionicons name="close-circle-outline" size={16} color="#EF4444" style={{ marginRight: 4 }} />
                <Text style={styles.cancelBtnText}>Hủy chuyến</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  // ============ CANCEL MODAL (like image 3) ============
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
          <View style={modalStyles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={modalStyles.header}>
                <View style={modalStyles.headerLeft}>
                  <View style={modalStyles.warningIcon}>
                    <Ionicons name="warning" size={22} color="#FFFFFF" />
                  </View>
                  <Text style={modalStyles.headerTitle}>Xác nhận hủy chuyến</Text>
                </View>
                <TouchableOpacity
                  style={modalStyles.closeBtn}
                  onPress={() => setCancelModalVisible(false)}
                >
                  <Ionicons name="close" size={22} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Booking Info Card */}
              <View style={modalStyles.bookingInfoCard}>
                <Text style={modalStyles.bookingTitle}>
                  {cancellingBooking.accommodation.title}
                </Text>
                <Text style={modalStyles.bookingDates}>
                  {cancellingBooking.checkIn} → {cancellingBooking.checkOut} ({cancellingBooking.nights} đêm)
                </Text>

                <View style={modalStyles.refundRow}>
                  <Text style={modalStyles.refundLabel}>Số tiền hoàn trả (100%):</Text>
                  <Text style={modalStyles.refundAmount}>{formatPrice(refundAmount)}</Text>
                </View>
              </View>

              {/* Refund Notice */}
              <View style={modalStyles.noticeBox}>
                <Ionicons name="information-circle" size={18} color="#0284C7" style={{ marginRight: 8, marginTop: 2 }} />
                <Text style={modalStyles.noticeText}>
                  Số tiền đã thanh toán sẽ được hoàn trả đầy đủ vào phương thức thanh toán ban đầu trong vòng 3-5 ngày làm việc.
                </Text>
              </View>

              {/* Cancellation Reasons */}
              <Text style={modalStyles.reasonsTitle}>Vui lòng chọn lý do hủy:</Text>

              {CANCELLATION_REASONS.map((reason, index) => {
                const isSelected = selectedReason === reason;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      modalStyles.reasonOption,
                      isSelected && modalStyles.reasonOptionSelected,
                    ]}
                    onPress={() => setSelectedReason(reason)}
                    activeOpacity={0.7}
                  >
                    <View style={[modalStyles.radioOuter, isSelected && modalStyles.radioOuterSelected]}>
                      {isSelected && <View style={modalStyles.radioInner} />}
                    </View>
                    <Text style={[modalStyles.reasonText, isSelected && modalStyles.reasonTextSelected]}>
                      {reason}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {/* Action Buttons */}
              <View style={modalStyles.actionRow}>
                <TouchableOpacity
                  style={modalStyles.keepBtn}
                  onPress={() => setCancelModalVisible(false)}
                  activeOpacity={0.8}
                >
                  <Text style={modalStyles.keepBtnText}>Giữ lại chuyến</Text>
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chuyến đi của tôi</Text>
      </View>

      {/* Segmented Filter */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.tabChip, activeTab === 'upcoming' && styles.tabChipActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabChipText, activeTab === 'upcoming' && styles.tabChipTextActive]}>
            Chuyến sắp tới ({upcomingList.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabChip, activeTab === 'cancelled' && styles.tabChipActive]}
          onPress={() => setActiveTab('cancelled')}
        >
          <Text style={[styles.tabChipText, activeTab === 'cancelled' && styles.tabChipTextActive]}>
            Chuyến đã hủy ({cancelledList.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayedList}
        keyExtractor={(item) => item.bookingId}
        renderItem={renderBookingCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons
              name={activeTab === 'upcoming' ? 'airplane-outline' : 'archive-outline'}
              size={64}
              color="#D1D5DB"
            />
            <Text style={styles.emptyTitle}>
              {activeTab === 'upcoming' ? 'Chưa có chuyến đi nào' : 'Không có chuyến đi đã hủy'}
            </Text>
            <Text style={styles.emptySub}>
              {activeTab === 'upcoming'
                ? 'Hãy khám phá những điểm đến tuyệt vời và lên kế hoạch chuyến đi ngay!'
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

      {/* Cancel Booking Modal */}
      {renderCancelModal()}

      <BottomTabBar activeTab="Bookings" onTabChange={onTabChange} />
    </SafeAreaView>
  );
};

// ============ MODAL STYLES ============
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  warningIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 19,
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
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  bookingDates: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  refundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refundLabel: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
  },
  refundAmount: {
    fontSize: 20,
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
  reasonOptionSelected: {
    borderColor: '#00BDD6',
    backgroundColor: '#F0FDFA',
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
  reasonTextSelected: {
    color: '#0F766E',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  keepBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },
  confirmCancelBtn: {
    flex: 1.3,
    flexDirection: 'row',
    paddingVertical: 15,
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
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 10,
  },
  tabChipActive: {
    backgroundColor: '#00BDD6',
  },
  tabChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  tabChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTop: {
    position: 'relative',
    height: 160,
  },
  stayImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badgeConfirmed: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeConfirmedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  badgeCancelled: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeCancelledText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  cardBody: {
    padding: 16,
  },
  stayTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  stayLocation: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 3,
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  cancelledInfoBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  cancelledInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelledReasonText: {
    fontSize: 12.5,
    color: '#991B1B',
  },
  cancelledReasonBold: {
    fontWeight: '700',
    color: '#B91C1C',
  },
  cancelledDateText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    marginLeft: 21,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
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
    color: '#6B7280',
  },
  bookingDateText: {
    fontSize: 11,
    color: '#9CA3AF',
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
    gap: 10,
  },
  viewDetailBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#00BDD6',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDetailBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  rebookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#00BDD6',
    backgroundColor: '#F0FDFA',
  },
  rebookBtnText: {
    color: '#00BDD6',
    fontSize: 13,
    fontWeight: '700',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  cancelBtnText: {
    color: '#EF4444',
    fontSize: 13,
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
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#6B7280',
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
