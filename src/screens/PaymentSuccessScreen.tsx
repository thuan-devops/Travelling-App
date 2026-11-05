import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { BookingDetails } from '../types';
import { generateAndShareReceiptPdf } from '../utils/pdfGenerator';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';

interface PaymentSuccessScreenProps {
  booking: BookingDetails;
  onViewBooking: () => void;
  onExplore?: () => void;
}

export const PaymentSuccessScreen: React.FC<PaymentSuccessScreenProps> = ({
  booking,
  onViewBooking,
  onExplore,
}) => {
  const { formatPrice } = useCurrency();
  const { isDarkMode, colors } = useTheme();
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleDownloadReceipt = async () => {
    try {
      setIsExporting(true);
      await generateAndShareReceiptPdf(booking);
    } catch {
      Alert.alert('Lỗi', 'Không thể xuất file PDF lúc này.');
    } finally {
      setIsExporting(false);
    }
  };


  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* TOP HEADER WITH BACK / HOME BUTTON */}
      <View style={[styles.topHeaderBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={onExplore || onViewBooking}
          accessibilityLabel="Quay về trang chủ"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerBarTitle, { color: colors.text }]}>Kết quả giao dịch</Text>
        {onExplore ? (
          <TouchableOpacity
            style={styles.headerHomeBtn}
            onPress={onExplore}
            accessibilityLabel="Về trang chủ khám phá"
            activeOpacity={0.7}
          >
            <Ionicons name="home-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 60 }}
        showsVerticalScrollIndicator={true}
        bounces={true}
        overScrollMode="always"
      >
        {/* CELEBRATION ICON GRAPHIC (Page 15) */}
        <View style={styles.graphicContainer}>
          {/* Confetti elements */}
          <View style={[styles.confetti, styles.confetti1]} />
          <View style={[styles.confetti, styles.confetti2]} />
          <View style={[styles.confetti, styles.confetti3]} />
          <View style={[styles.confetti, styles.confetti4]} />
          <View style={[styles.confetti, styles.confetti5]} />

          {/* 3D-styled Green Checkmark Circle */}
          <View style={styles.checkCircleOuter}>
            <View style={styles.checkCircleInner}>
              <Ionicons name="checkmark" size={44} color="#FFFFFF" />
            </View>
          </View>
        </View>

        {/* TITLE */}
        <Text style={[styles.title, { color: colors.text }]}>Thanh toán thành công!</Text>

        {/* RECEIPT CARD */}
        <View style={[styles.receiptCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.receiptRow}>
            <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Mã tham chiếu</Text>
            <Text style={[styles.receiptValueBold, { color: colors.text }]}>{booking.bookingId}</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Ngày thanh toán</Text>
            <Text style={[styles.receiptValueBold, { color: colors.text }]}>{booking.paymentDate}</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Thời gian</Text>
            <Text style={[styles.receiptValueBold, { color: colors.text }]}>{booking.paymentTime}</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Phương thức thanh toán</Text>
            <Text style={[styles.receiptValueBold, { color: colors.text }]}>{booking.paymentMethod}</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Giờ nhận / trả phòng</Text>
            <Text style={[styles.receiptValueBold, { color: '#0F766E' }]}>
              Từ {booking.accommodation.rules?.checkIn || '14:00'} • Trước {booking.accommodation.rules?.checkOut || '12:00'}
            </Text>
          </View>

          {booking.estimatedCheckInTime && (
            <View style={styles.receiptRow}>
              <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Giờ đến dự kiến</Text>
              <Text style={[styles.receiptValueBold, { color: '#0F766E' }]}>
                {booking.estimatedCheckInTime}
              </Text>
            </View>
          )}

          {booking.servicePackageName && (
            <View style={styles.receiptRow}>
              <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Gói dịch vụ</Text>
              <Text style={[styles.receiptValueBold, { color: '#D97706' }]}>
                {booking.servicePackageName}
              </Text>
            </View>
          )}

          {booking.contactName && (
            <View style={styles.receiptRow}>
              <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Khách nhận phòng</Text>
              <Text style={[styles.receiptValueBold, { color: colors.text }]}>
                {booking.contactName} {booking.contactPhone ? `(${booking.contactPhone})` : ''}
              </Text>
            </View>
          )}

          <View style={styles.receiptRow}>
            <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>
              {booking.paymentType === 'part' ? 'Đã thanh toán trước (50%)' : 'Số tiền đã thanh toán'}
            </Text>
            <Text style={[styles.receiptAmount, { color: colors.text }]}>{formatPrice(booking.paidAmount)}</Text>
          </View>

          {booking.paymentType === 'part' && (
            <>
              <View style={styles.receiptRow}>
                <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Còn lại khi nhận phòng</Text>
                <Text style={[styles.receiptValueBold, { color: '#E11D48' }]}>
                  {formatPrice(booking.dueAmount || booking.totalPrice - booking.paidAmount)}
                </Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Tổng giá trị đơn đặt</Text>
                <Text style={[styles.receiptValueBold, { color: colors.text }]}>{formatPrice(booking.totalPrice)}</Text>
              </View>
            </>
          )}

          {/* GET PDF RECEIPT BUTTON */}
          <TouchableOpacity
            style={[styles.pdfButton, { borderColor: colors.border, backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF' }]}
            activeOpacity={0.8}
            onPress={handleDownloadReceipt}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color="#00BDD6" />
            ) : (
              <>
                <Ionicons name="download-outline" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <Text style={[styles.pdfButtonText, { color: colors.text }]}>Tải biên lai PDF</Text>
              </>
            )}
          </TouchableOpacity>

        </View>

        {/* BOTTOM ACTION BUTTONS */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.viewBookingButton}
            activeOpacity={0.8}
            onPress={onViewBooking}
          >
            <Text style={styles.viewBookingText}>Xem đặt phòng</Text>
          </TouchableOpacity>

          {onExplore && (
            <TouchableOpacity
              style={[styles.exploreButton, { backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF', borderColor: '#00BDD6' }]}
              activeOpacity={0.8}
              onPress={onExplore}
            >
              <Ionicons name="compass-outline" size={18} color="#00BDD6" style={{ marginRight: 6 }} />
              <Text style={styles.exploreButtonText}>Tiếp tục khám phá</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBarTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  headerHomeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  graphicContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 12,
    position: 'relative',
    height: 100,
  },
  checkCircleOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#34D399',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  checkCircleInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confetti: {
    position: 'absolute',
    borderRadius: 4,
  },
  confetti1: {
    width: 14,
    height: 7,
    backgroundColor: '#EC4899',
    transform: [{ rotate: '45deg' }],
    top: 10,
    left: '35%',
  },
  confetti2: {
    width: 10,
    height: 5,
    backgroundColor: '#6366F1',
    transform: [{ rotate: '-30deg' }],
    top: 25,
    right: '30%',
  },
  confetti3: {
    width: 16,
    height: 6,
    backgroundColor: '#F43F5E',
    transform: [{ rotate: '60deg' }],
    bottom: 20,
    right: '32%',
  },
  confetti4: {
    width: 10,
    height: 6,
    backgroundColor: '#FBBF24',
    transform: [{ rotate: '-15deg' }],
    bottom: 30,
    left: '30%',
  },
  confetti5: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    top: 40,
    right: '25%',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  receiptLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  receiptValueBold: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    flex: 1.3,
    textAlign: 'right',
    lineHeight: 20,
  },
  receiptAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    flex: 1.2,
    textAlign: 'right',
    lineHeight: 22,
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 18,
  },
  pdfButtonText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
  },
  footer: {
    marginTop: 20,
  },
  viewBookingButton: {
    backgroundColor: '#00BDD6',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewBookingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#00BDD6',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 10,
  },
  exploreButtonText: {
    color: '#00BDD6',
    fontSize: 15,
    fontWeight: '700',
  },
});
