import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { BookingDetails, BottomTabType } from '../types';
import { BottomTabBar } from '../components/BottomTabBar';
import { mockApi } from '../api/mockApi';

interface BookingsScreenProps {
  bookings: BookingDetails[];
  onExplore: () => void;
  onSelectBookingDetail: (booking: BookingDetails) => void;
  onTabChange: (tab: BottomTabType) => void;
  onBookingsUpdated?: (updated: BookingDetails[]) => void;
}

export const BookingsScreen: React.FC<BookingsScreenProps> = ({
  bookings = [],
  onExplore,
  onSelectBookingDetail,
  onTabChange,
  onBookingsUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'cancelled'>('upcoming');
  const [localBookings, setLocalBookings] = useState<BookingDetails[]>(bookings);

  React.useEffect(() => {
    setLocalBookings(bookings);
  }, [bookings]);

  const upcomingList = localBookings.filter((b) => b.status !== 'cancelled');
  const cancelledList = localBookings.filter((b) => b.status === 'cancelled');

  const displayedList = activeTab === 'upcoming' ? upcomingList : cancelledList;

  const handleCancelBooking = (booking: BookingDetails) => {
    Alert.alert(
      'Hủy đặt phòng',
      `Bạn có chắc chắn muốn hủy đặt phòng tại "${booking.accommodation.title}"?\n\nSố tiền $${booking.paidAmount} sẽ được hoàn trả về thẻ của bạn trong vòng 3-5 ngày làm việc.`,
      [
        { text: 'Giữ lại', style: 'cancel' },
        {
          text: 'Xác nhận hủy',
          style: 'destructive',
          onPress: async () => {
            const updated = await mockApi.cancelBooking(booking.bookingId);
            setLocalBookings(updated);
            if (onBookingsUpdated) {
              onBookingsUpdated(updated);
            }
            Alert.alert('Thành công', 'Đã hủy đặt phòng thành công. Bạn có thể xem lại tại tab Lịch sử & Đã hủy.');
          },
        },
      ]
    );
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

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>Mã đặt chỗ: #{item.bookingId.slice(-8)}</Text>
              <Text style={styles.bookingDateText}>Ngày: {item.paymentDate}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.totalLabel}>{isCancelled ? 'Đã hoàn tiền' : 'Đã thanh toán'}</Text>
              <Text style={[styles.totalAmount, isCancelled && { color: '#9CA3AF', textDecorationLine: 'line-through' }]}>
                ${item.paidAmount}
              </Text>
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

            {!isCancelled && (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => handleCancelBooking(item)}
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" style={{ marginRight: 4 }} />
                <Text style={styles.cancelBtnText}>Hủy phòng</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
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
            Sắp tới ({upcomingList.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabChip, activeTab === 'cancelled' && styles.tabChipActive]}
          onPress={() => setActiveTab('cancelled')}
        >
          <Text style={[styles.tabChipText, activeTab === 'cancelled' && styles.tabChipTextActive]}>
            Lịch sử & Đã hủy ({cancelledList.length})
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
                ? 'Hãy khám phá những điểm đến tuyệt vời và đặt phòng ngay!'
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

      <BottomTabBar activeTab="Bookings" onTabChange={onTabChange} />
    </SafeAreaView>
  );
};

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
    fontSize: 14,
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
