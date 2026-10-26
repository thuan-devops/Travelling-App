import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { BookingDetails, BottomTabType } from '../types';
import { BottomTabBar } from '../components/BottomTabBar';

interface BookingsScreenProps {
  bookings: BookingDetails[];
  onExplore: () => void;
  onSelectBookingDetail: (booking: BookingDetails) => void;
  onTabChange: (tab: BottomTabType) => void;
}

export const BookingsScreen: React.FC<BookingsScreenProps> = ({
  bookings = [],
  onExplore,
  onSelectBookingDetail,
  onTabChange,
}) => {
  const renderBookingCard = ({ item }: { item: BookingDetails }) => (
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
        <View style={styles.badgeConfirmed}>
          <Ionicons name="checkmark-circle" size={14} color="#10B981" style={{ marginRight: 4 }} />
          <Text style={styles.badgeConfirmedText}>Đã xác nhận</Text>
        </View>
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
            <Text style={styles.detailLabel}>Số khách</Text>
            <Text style={styles.detailVal}>{item.guests} khách</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <View>
            <Text style={styles.totalLabel}>Mã đặt phòng: #{item.bookingId.slice(-8)}</Text>
            <Text style={styles.bookingDateText}>Ngày: {item.paymentDate}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.totalLabel}>Đã thanh toán</Text>
            <Text style={styles.totalAmount}>${item.paidAmount}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.viewDetailBtn}
          onPress={() => onSelectBookingDetail(item)}
        >
          <Text style={styles.viewDetailBtnText}>Xem biên lai & chi tiết</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chuyến đi của tôi ({bookings.length})</Text>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.bookingId}
        renderItem={renderBookingCard}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={54} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Chưa có chuyến đi nào</Text>
            <Text style={styles.emptySubtitle}>
              Khi bạn đặt phòng, thông tin chi tiết và biên lai sẽ xuất hiện tại đây.
            </Text>
            <TouchableOpacity style={styles.exploreBtn} onPress={onExplore}>
              <Text style={styles.exploreBtnText}>Bắt đầu khám phá</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* BOTTOM TAB BAR */}
      <BottomTabBar activeTab="Bookings" onTabChange={onTabChange} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  cardTop: {
    height: 180,
    position: 'relative',
  },
  stayImage: {
    width: '100%',
    height: '100%',
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
  cardBody: {
    padding: 16,
  },
  stayTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  stayLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
  },
  detailCol: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  detailVal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 14,
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
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  viewDetailBtn: {
    backgroundColor: '#00BDD6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewDetailBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  exploreBtn: {
    backgroundColor: '#00BDD6',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 20,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
