import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Accommodation, BookingDetails } from '../types';

interface CheckoutScreenProps {
  stay: Accommodation;
  onBack: () => void;
  onConfirmPayment: (booking: BookingDetails) => void;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  stay,
  onBack,
  onConfirmPayment,
}) => {
  const [paymentOption, setPaymentOption] = useState<'full' | 'part'>('full');
  const [datesText, setDatesText] = useState<string>('May 1 - 6');
  const [guestsCount, setGuestsCount] = useState<number>(1);

  const pricePerNight = stay.pricePerNight || 20;
  const nights = 1;
  const roomSubtotal = pricePerNight * nights;
  const kayakFee = 5;
  const parkingFee = 5;
  const totalAmount = roomSubtotal + kayakFee + parkingFee;

  const handleBookNow = () => {
    const booking: BookingDetails = {
      bookingId: '00000072697027',
      accommodation: stay,
      checkIn: '09-05-2023',
      checkOut: '15-05-2023',
      nights,
      guests: guestsCount,
      paymentType: paymentOption,
      roomTotal: roomSubtotal,
      fees: [
        { label: 'Kayak fee', amount: kayakFee },
        { label: 'Street parking fee', amount: parkingFee },
      ],
      totalPrice: totalAmount,
      paidAmount: paymentOption === 'full' ? totalAmount : Math.round(totalAmount / 2),
      paymentDate: '09-05-2023',
      paymentTime: '05:40 AM',
      paymentMethod: 'Credit card',
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
        <Text style={styles.headerTitle}>Confirm and pay</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* PROPERTY SUMMARY CARD (Page 14) */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryPrice}>
              <Text style={styles.boldPrice}>${pricePerNight}</Text>/night
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
        <Text style={styles.sectionTitle}>Your trip</Text>

        <View style={styles.tripRow}>
          <View>
            <Text style={styles.tripLabel}>Dates</Text>
            <Text style={styles.tripValue}>{datesText}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil-outline" size={18} color="#111827" />
          </TouchableOpacity>
        </View>

        <View style={styles.tripRow}>
          <View>
            <Text style={styles.tripLabel}>Guests</Text>
            <Text style={styles.tripValue}>{guestsCount} guest</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => setGuestsCount((p) => (p === 1 ? 2 : 1))}>
            <Ionicons name="pencil-outline" size={18} color="#111827" />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* PAYMENT OPTIONS */}
        <Text style={styles.sectionTitle}>Payment options</Text>

        <TouchableOpacity
          style={styles.paymentOptionRow}
          activeOpacity={0.8}
          onPress={() => setPaymentOption('full')}
        >
          <View style={styles.paymentOptionText}>
            <Text style={styles.paymentOptionTitle}>Pay in full</Text>
            <Text style={styles.paymentOptionDesc}>
              Pay ${totalAmount} now to finalize your booking.
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
            <Text style={styles.paymentOptionTitle}>Pay a part now</Text>
            <Text style={styles.paymentOptionDesc}>
              You can make a partial payment now and the remaining amount at a later time.
            </Text>
          </View>
          <View style={styles.radioOuter}>
            {paymentOption === 'part' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* PRICE DETAILS */}
        <Text style={styles.sectionTitle}>Price details</Text>

        <View style={styles.priceRow}>
          <Text style={styles.priceItemLabel}>${pricePerNight} x {nights} night</Text>
          <Text style={styles.priceItemValue}>${roomSubtotal}</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceItemLabel}>Kayak fee</Text>
          <Text style={styles.priceItemValue}>${kayakFee}</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceItemLabel}>Street parking fee</Text>
          <Text style={styles.priceItemValue}>${parkingFee}</Text>
        </View>

        <View style={[styles.priceRow, { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' }]}>
          <Text style={styles.totalLabel}>Total (USD)</Text>
          <Text style={styles.totalValue}>${totalAmount}</Text>
        </View>
      </ScrollView>

      {/* FOOTER BUTTON */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.bookNowBtn} activeOpacity={0.8} onPress={handleBookNow}>
          <Text style={styles.bookNowBtnText}>Book now</Text>
        </TouchableOpacity>
      </View>
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
    paddingVertical: 10,
  },
  tripLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  tripValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  editButton: {
    padding: 6,
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
});
