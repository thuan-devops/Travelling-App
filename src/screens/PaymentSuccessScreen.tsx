import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { BookingDetails } from '../types';

interface PaymentSuccessScreenProps {
  booking: BookingDetails;
  onViewBooking: () => void;
}

export const PaymentSuccessScreen: React.FC<PaymentSuccessScreenProps> = ({
  booking,
  onViewBooking,
}) => {
  const handleDownloadReceipt = () => {
    Alert.alert(
      'Đã tải biên lai',
      `Biên lai mã #${booking.bookingId} với số tiền $${booking.paidAmount} đã được lưu thành công.`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.container}>
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
        <Text style={styles.title}>Thanh toán thành công!</Text>

        {/* RECEIPT CARD */}
        <View style={styles.receiptCard}>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Mã tham chiếu</Text>
            <Text style={styles.receiptValueBold}>{booking.bookingId}</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Ngày thanh toán</Text>
            <Text style={styles.receiptValueBold}>{booking.paymentDate}</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Thời gian</Text>
            <Text style={styles.receiptValueBold}>{booking.paymentTime}</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Phương thức thanh toán</Text>
            <Text style={styles.receiptValueBold}>{booking.paymentMethod}</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Số tiền</Text>
            <Text style={styles.receiptAmount}>${booking.paidAmount}</Text>
          </View>

          {/* GET PDF RECEIPT BUTTON */}
          <TouchableOpacity
            style={styles.pdfButton}
            activeOpacity={0.8}
            onPress={handleDownloadReceipt}
          >
            <Ionicons name="download-outline" size={18} color="#6B7280" style={{ marginRight: 8 }} />
            <Text style={styles.pdfButtonText}>Tải biên lai PDF</Text>
          </TouchableOpacity>
        </View>

        {/* BOTTOM VIEW BOOKING BUTTON */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.viewBookingButton}
            activeOpacity={0.8}
            onPress={onViewBooking}
          >
            <Text style={styles.viewBookingText}>Xem đặt phòng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
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
    marginTop: 40,
    marginBottom: 20,
    position: 'relative',
    height: 140,
  },
  checkCircleOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#34D399',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  checkCircleInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
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
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
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
    alignItems: 'center',
    paddingVertical: 12,
  },
  receiptLabel: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  receiptValueBold: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  receiptAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
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
});
