import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Accommodation, BookingDetails, SearchFilterState } from '../types';
import { CalendarPicker, DateRange } from '../components/CalendarPicker';

interface CheckoutScreenProps {
  stay: Accommodation;
  initialFilters?: SearchFilterState;
  onBack: () => void;
  onConfirmPayment: (booking: BookingDetails) => void;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  stay,
  initialFilters,
  onBack,
  onConfirmPayment,
}) => {
  const [paymentOption, setPaymentOption] = useState<'full' | 'part'>('full');

  // Dates state
  const initialNights = initialFilters?.daysCount || 2;
  const initialStart = new Date(2026, 4, 23);
  const initialEnd = new Date(2026, 4, 23 + initialNights);

  const [startDate, setStartDate] = useState<Date>(initialStart);
  const [endDate, setEndDate] = useState<Date>(initialEnd);
  const [nights, setNights] = useState<number>(initialNights);
  const [isDatesModalVisible, setIsDatesModalVisible] = useState<boolean>(false);

  // Guests state
  const [adults, setAdults] = useState<number>(initialFilters?.adults || 1);
  const [children, setChildren] = useState<number>(initialFilters?.children || 0);
  const [isGuestsModalVisible, setIsGuestsModalVisible] = useState<boolean>(false);

  const totalGuests = adults + children;
  const pricePerNight = stay.pricePerNight || 20;
  const roomSubtotal = pricePerNight * nights;
  const kayakFee = 5;
  const parkingFee = 5;
  const totalAmount = roomSubtotal + kayakFee + parkingFee;

  const checkInText = `${startDate.getDate()} Thg ${startDate.getMonth() + 1}`;
  const checkOutText = `${endDate.getDate()} Thg ${endDate.getMonth() + 1}`;
  const datesSummary = `${checkInText} - ${checkOutText} (${nights} đêm)`;

  const handleBookNow = () => {
    const sD = startDate.getDate();
    const sM = startDate.getMonth() + 1;
    const sY = startDate.getFullYear();
    const eD = endDate.getDate();
    const eM = endDate.getMonth() + 1;
    const eY = endDate.getFullYear();

    const booking: BookingDetails = {
      bookingId: `000000${Math.floor(10000000 + Math.random() * 90000000)}`,
      accommodation: stay,
      checkIn: `${sD < 10 ? '0' : ''}${sD}-${sM < 10 ? '0' : ''}${sM}-${sY}`,
      checkOut: `${eD < 10 ? '0' : ''}${eD}-${eM < 10 ? '0' : ''}${eM}-${eY}`,
      nights,
      guests: totalGuests,
      paymentType: paymentOption,
      roomTotal: roomSubtotal,
      fees: [
        { label: 'Phí chèo thuyền Kayak', amount: kayakFee },
        { label: 'Phí đỗ xe', amount: parkingFee },
      ],
      totalPrice: totalAmount,
      paidAmount: paymentOption === 'full' ? totalAmount : Math.round(totalAmount / 2),
      paymentDate: new Date().toLocaleDateString('vi-VN'),
      paymentTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: 'Thẻ tín dụng (Credit card)',
    };
    onConfirmPayment(booking);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận và thanh toán</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* PROPERTY SUMMARY CARD (Page 14) */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryPrice}>
              <Text style={styles.boldPrice}>${pricePerNight}</Text>/đêm
            </Text>
            <Text style={styles.summaryTitle} numberOfLines={1}>{stay.title}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}> {stay.rating || 5.0} ({stay.reviewCount || 262})</Text>
            </View>
          </View>
          <Image
            source={{ uri: stay.images?.[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80' }}
            style={styles.summaryThumbnail}
          />
        </View>

        <View style={styles.divider} />

        {/* YOUR TRIP SECTION */}
        <Text style={styles.sectionTitle}>Chuyến đi của bạn</Text>

        {/* DATES ROW */}
        <TouchableOpacity
          style={styles.tripRow}
          activeOpacity={0.7}
          onPress={() => setIsDatesModalVisible(true)}
        >
          <View>
            <Text style={styles.tripLabel}>Thời gian lưu trú</Text>
            <Text style={styles.tripValue}>{datesSummary}</Text>
          </View>
          <View style={styles.editButton}>
            <Ionicons name="pencil-outline" size={20} color="#00BDD6" />
          </View>
        </TouchableOpacity>

        {/* GUESTS ROW */}
        <TouchableOpacity
          style={styles.tripRow}
          activeOpacity={0.7}
          onPress={() => setIsGuestsModalVisible(true)}
        >
          <View>
            <Text style={styles.tripLabel}>Số lượng khách</Text>
            <Text style={styles.tripValue}>
              {totalGuests} khách ({adults} người lớn{children > 0 ? `, ${children} trẻ em` : ''})
            </Text>
          </View>
          <View style={styles.editButton}>
            <Ionicons name="pencil-outline" size={20} color="#00BDD6" />
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* PAYMENT OPTIONS */}
        <Text style={styles.sectionTitle}>Tùy chọn thanh toán</Text>

        <TouchableOpacity
          style={styles.paymentOptionRow}
          activeOpacity={0.8}
          onPress={() => setPaymentOption('full')}
        >
          <View style={styles.paymentOptionText}>
            <Text style={styles.paymentOptionTitle}>Thanh toán toàn bộ</Text>
            <Text style={styles.paymentOptionDesc}>
              Thanh toán ${totalAmount} ngay để hoàn tất đặt chỗ.
            </Text>
          </View>
          <View style={styles.radioOuter}>
            {paymentOption === 'full' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.paymentOptionRow}
          activeOpacity={0.8}
          onPress={() => setPaymentOption('part')}
        >
          <View style={styles.paymentOptionText}>
            <Text style={styles.paymentOptionTitle}>Thanh toán một phần</Text>
            <Text style={styles.paymentOptionDesc}>
              Thanh toán trước ${Math.round(totalAmount / 2)}, phần còn lại thanh toán sau khi nhận phòng.
            </Text>
          </View>
          <View style={styles.radioOuter}>
            {paymentOption === 'part' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* PRICE DETAILS */}
        <Text style={styles.sectionTitle}>Chi tiết giá</Text>

        <View style={styles.priceRow}>
          <Text style={styles.priceItemLabel}>${pricePerNight} x {nights} đêm</Text>
          <Text style={styles.priceItemValue}>${roomSubtotal}</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceItemLabel}>Phí chèo thuyền Kayak</Text>
          <Text style={styles.priceItemValue}>${kayakFee}</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceItemLabel}>Phí đỗ xe</Text>
          <Text style={styles.priceItemValue}>${parkingFee}</Text>
        </View>

        <View style={[styles.priceRow, { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' }]}>
          <Text style={styles.totalLabel}>Tổng cộng (USD)</Text>
          <Text style={styles.totalValue}>${totalAmount}</Text>
        </View>
      </ScrollView>

      {/* FOOTER BUTTON */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.bookNowBtn} activeOpacity={0.8} onPress={handleBookNow}>
          <Text style={styles.bookNowBtnText}>Đặt phòng ngay • ${totalAmount}</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL 1: CHỌN THỜI GIAN LƯU TRÚ */}
      <Modal
        visible={isDatesModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDatesModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn thời gian lưu trú</Text>
              <TouchableOpacity onPress={() => setIsDatesModalVisible(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 520 }} contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSub}>Chọn ngày nhận phòng và trả phòng:</Text>

              <CalendarPicker
                initialStartDate={startDate}
                initialEndDate={endDate}
                onSelectRange={(range) => {
                  if (range.startDate) setStartDate(range.startDate);
                  if (range.endDate) setEndDate(range.endDate);
                  setNights(range.nights);
                }}
              />

              <TouchableOpacity
                style={[styles.confirmModalBtn, { marginTop: 16 }]}
                onPress={() => setIsDatesModalVisible(false)}
              >
                <Text style={styles.confirmModalBtnText}>Xong</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: CHỌN SỐ LƯỢNG KHÁCH */}
      <Modal
        visible={isGuestsModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsGuestsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Số lượng khách</Text>
              <TouchableOpacity onPress={() => setIsGuestsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              {/* Người lớn */}
              <View style={styles.counterSection}>
                <View>
                  <Text style={styles.counterLabel}>Người lớn</Text>
                  <Text style={styles.counterHint}>Từ 13 tuổi trở lên</Text>
                </View>
                <View style={styles.counterRow}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setAdults((prev) => Math.max(1, prev - 1))}
                  >
                    <Ionicons name="remove" size={18} color="#111827" />
                  </TouchableOpacity>
                  <Text style={styles.counterValText}>{adults}</Text>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setAdults((prev) => Math.min(10, prev + 1))}
                  >
                    <Ionicons name="add" size={18} color="#111827" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Trẻ em */}
              <View style={styles.counterSection}>
                <View>
                  <Text style={styles.counterLabel}>Trẻ em</Text>
                  <Text style={styles.counterHint}>Dưới 13 tuổi</Text>
                </View>
                <View style={styles.counterRow}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setChildren((prev) => Math.max(0, prev - 1))}
                  >
                    <Ionicons name="remove" size={18} color="#111827" />
                  </TouchableOpacity>
                  <Text style={styles.counterValText}>{children}</Text>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setChildren((prev) => Math.min(6, prev + 1))}
                  >
                    <Ionicons name="add" size={18} color="#111827" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.previewDatesBox}>
                <Ionicons name="people-outline" size={20} color="#00BDD6" style={{ marginRight: 8 }} />
                <Text style={styles.previewDatesText}>
                  Tổng cộng: {totalGuests} khách ({adults} người lớn, {children} trẻ em)
                </Text>
              </View>

              <TouchableOpacity
                style={styles.confirmModalBtn}
                onPress={() => setIsGuestsModalVisible(false)}
              >
                <Text style={styles.confirmModalBtnText}>Xác nhận số khách</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryInfo: {
    flex: 1,
    marginRight: 16,
  },
  summaryPrice: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 6,
  },
  boldPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#4B5563',
  },
  summaryThumbnail: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  tripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  tripLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  tripValue: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#EDF9FA',
  },
  paymentOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  paymentOptionText: {
    flex: 1,
    paddingRight: 16,
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  paymentOptionDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00BDD6',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  priceItemLabel: {
    fontSize: 15,
    color: '#4B5563',
  },
  priceItemValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  bookNowBtn: {
    backgroundColor: '#00BDD6',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookNowBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalContent: {
    padding: 20,
  },
  modalSub: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  counterSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  counterLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  counterHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  counterValText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginHorizontal: 14,
    minWidth: 40,
    textAlign: 'center',
  },
  previewDatesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF9FA',
    padding: 12,
    borderRadius: 10,
    marginVertical: 16,
  },
  previewDatesText: {
    fontSize: 13,
    color: '#008394',
    fontWeight: '600',
    flex: 1,
  },
  confirmModalBtn: {
    backgroundColor: '#00BDD6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  confirmModalBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
