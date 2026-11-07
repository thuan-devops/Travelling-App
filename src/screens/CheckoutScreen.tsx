import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Accommodation, BookingDetails, SearchFilterState } from '../types';
import { CalendarPicker } from '../components/CalendarPicker';
import { mockApi } from '../api/mockApi';
import { useCurrency, USD_TO_VND_RATE } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SelectedStayDates } from './RoomDetailScreen';

interface CheckoutScreenProps {
  stay: Accommodation;
  initialFilters?: SearchFilterState;
  selectedDates?: SelectedStayDates;
  onBack: () => void;
  onHome?: () => void;
  onConfirmPayment: (booking: BookingDetails) => void;
}

export const CHECK_IN_TIME_SLOTS = [
  '14:00 - 15:00 (Tiêu chuẩn)',
  '15:00 - 17:00 (Buổi chiều)',
  '17:00 - 19:00 (Chiều tối)',
  'Sau 19:00 (Nhận phòng muộn - Tự check-in)',
  '11:00 - 13:00 (Yêu cầu nhận phòng sớm - Early Check-in)',
];

type PackageType = 'standard' | 'vip' | 'luxury';
type PaymentMethodType = 'vietqr' | 'momo' | 'card';

interface AddonItem {
  id: string;
  name: string;
  desc: string;
  priceVnd: number;
  priceUsd: number;
  icon: keyof typeof Ionicons.glyphMap;
}

const AVAILABLE_ADDONS: AddonItem[] = [
  {
    id: 'motorcycle',
    name: 'Thuê xe máy tự lái',
    desc: 'Xe tay ga đời mới, bao gồm 2 nón bảo hiểm và 1 lít xăng',
    priceVnd: 150000,
    priceUsd: 6,
    icon: 'bicycle-outline',
  },
  {
    id: 'bbq',
    name: 'Tiệc nướng BBQ sân vườn',
    desc: 'Set nướng thịt & hải sản tươi ngon, phục vụ tại khuôn viên',
    priceVnd: 300000,
    priceUsd: 12,
    icon: 'flame-outline',
  },
  {
    id: 'airport_shuttle',
    name: 'Xe đưa đón sân bay (1 chiều)',
    desc: 'Xe riêng đón tận cổng ra sân bay về khách sạn',
    priceVnd: 250000,
    priceUsd: 10,
    icon: 'car-outline',
  },
];

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  stay,
  initialFilters,
  selectedDates,
  onBack,
  onHome,
  onConfirmPayment,
}) => {
  const { user } = useAuth();
  const { formatPrice, currency } = useCurrency();
  const { isDarkMode, colors } = useTheme();
  const isVnd = currency === 'VND';

  // Navigation between Step 1 (form & services) and Step 2 (payment)
  const [currentStep, setCurrentStep] = useState<'form' | 'payment'>('form');

  // Dates state
  const initialNights = selectedDates?.nights || initialFilters?.daysCount || 2;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const initialStart = selectedDates?.startDate || new Date(today);
  const initialEnd =
    selectedDates?.endDate || new Date(today.getTime() + initialNights * 24 * 60 * 60 * 1000);

  const [startDate, setStartDate] = useState<Date>(initialStart);
  const [endDate, setEndDate] = useState<Date>(initialEnd);
  const [nights, setNights] = useState<number>(initialNights);
  const [isDatesModalVisible, setIsDatesModalVisible] = useState<boolean>(false);
  const [conflictBooking, setConflictBooking] = useState<BookingDetails | null>(null);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState<boolean>(false);

  // Guests state
  const [adults, setAdults] = useState<number>(
    selectedDates?.adults !== undefined ? selectedDates.adults : (initialFilters?.adults || 2)
  );
  const [children, setChildren] = useState<number>(
    selectedDates?.children !== undefined ? selectedDates.children : (initialFilters?.children || 0)
  );
  const [isGuestsModalVisible, setIsGuestsModalVisible] = useState<boolean>(false);
  const [estimatedCheckInTime, setEstimatedCheckInTime] = useState<string>(CHECK_IN_TIME_SLOTS[0]);
  const [isTimeSlotModalVisible, setIsTimeSlotModalVisible] = useState<boolean>(false);

  // Service package selection
  const [selectedPackage, setSelectedPackage] = useState<PackageType>('standard');

  // Add-ons selection
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);

  // Contact Information state (prefilled from User profile)
  const [contactName, setContactName] = useState<string>(user?.name || 'Nguyễn Văn Du Khách');
  const [contactPhone, setContactPhone] = useState<string>(user?.phoneNumber || '0987 654 321');
  const [contactEmail, setContactEmail] = useState<string>(user?.email || 'traveler@gmail.com');
  const [specialRequest, setSpecialRequest] = useState<string>('');

  // Payment execution state (Step 2 - New Fintech Hub)
  const [paymentOption, setPaymentOption] = useState<'full' | 'part'>('full');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('vietqr');
  const [secondsLeft, setSecondsLeft] = useState<number>(14 * 60 + 59);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (selectedDates) {
      if (selectedDates.startDate) setStartDate(selectedDates.startDate);
      if (selectedDates.endDate) setEndDate(selectedDates.endDate);
      if (selectedDates.nights !== undefined) setNights(selectedDates.nights);
      if (selectedDates.adults !== undefined) setAdults(selectedDates.adults);
      if (selectedDates.children !== undefined) setChildren(selectedDates.children);
    } else {
      setAdults(initialFilters?.adults || 2);
      setChildren(initialFilters?.children || 0);
    }
  }, [selectedDates, initialFilters]);

  const formatCountdown = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Unique Travel Ticket Code: TB (Travelling Booking)
  const [ticketCode] = useState<string>(() => {
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randNum = Math.floor(1000 + Math.random() * 9000);
    return `TB-${dateStr}-${randNum}`;
  });

  // PRICING CALCULATIONS:
  // Standard capacity = 2 guests
  // Extra adults = +30% per night
  // Extra children = +15% per night
  const totalGuests = adults + children;
  const basePricePerNight = stay.pricePerNight || 20;
  const pricePerNight = isVnd ? Math.round(basePricePerNight * USD_TO_VND_RATE) : basePricePerNight;
  const roomBaseSubtotal = pricePerNight * nights;

  const baseCapacity = 2;
  const extraAdults = Math.max(0, adults - baseCapacity);
  const remainingBaseCapacity = Math.max(0, baseCapacity - adults);
  const extraChildren = Math.max(0, children - remainingBaseCapacity);

  const extraAdultsFeePerNight = Math.round(pricePerNight * 0.30 * extraAdults);
  const extraChildrenFeePerNight = Math.round(pricePerNight * 0.15 * extraChildren);
  const extraGuestFeePerNight = extraAdultsFeePerNight + extraChildrenFeePerNight;
  const extraGuestFeeTotal = extraGuestFeePerNight * nights;
  const totalExtraGuests = extraAdults + extraChildren;

  // Package surcharge rate: Standard: 0%, VIP: +20%, Luxury: +45%
  const packageSurchargeRate = selectedPackage === 'vip' ? 0.2 : selectedPackage === 'luxury' ? 0.45 : 0;
  const packageSurchargeTotal = Math.round(roomBaseSubtotal * packageSurchargeRate);

  // Addons total
  const addonsTotal = selectedAddonIds.reduce((sum, id) => {
    const item = AVAILABLE_ADDONS.find((a) => a.id === id);
    if (!item) return sum;
    return sum + (isVnd ? item.priceVnd : item.priceUsd);
  }, 0);

  // Grand Total Amount
  const totalAmount = roomBaseSubtotal + extraGuestFeeTotal + packageSurchargeTotal + addonsTotal;

  const isPartPayment = paymentOption === 'part';
  const dueNow = isPartPayment ? Math.round(totalAmount / 2) : totalAmount;
  const dueLater = isPartPayment ? totalAmount - dueNow : 0;

  const formatDisplay = (amount: number) => {
    if (isVnd) {
      return `${Math.round(amount).toLocaleString('vi-VN')}₫`;
    }
    return `$${amount}`;
  };

  const checkInStr = `${startDate.getDate() < 10 ? '0' : ''}${startDate.getDate()}/${startDate.getMonth() + 1 < 10 ? '0' : ''}${startDate.getMonth() + 1}/${startDate.getFullYear()}`;
  const checkOutStr = `${endDate.getDate() < 10 ? '0' : ''}${endDate.getDate()}/${endDate.getMonth() + 1 < 10 ? '0' : ''}${endDate.getMonth() + 1}/${endDate.getFullYear()}`;

  const getPackageName = (pkg: PackageType) => {
    switch (pkg) {
      case 'standard':
        return 'Gói Standard (Tiêu chuẩn)';
      case 'vip':
        return 'Gói VIP (Cao cấp)';
      case 'luxury':
        return 'Gói Luxury (Hoàng gia)';
    }
  };

  const toggleAddon = (id: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleProceedToPayment = async () => {
    if (!contactName.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ và tên người nhận phòng.');
      return;
    }
    if (!contactPhone.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập số điện thoại để nhận thông tin xác nhận.');
      return;
    }
    const conflict = await mockApi.checkBookingConflict(stay.id, startDate, endDate);
    if (conflict) {
      setConflictBooking(conflict);
      setIsConflictModalOpen(true);
      return;
    }
    setCurrentStep('payment');
  };

  const getPaymentMethodLabel = () => {
    switch (selectedMethod) {
      case 'vietqr':
        return isPartPayment ? 'Trả trước 50% (Chuyển khoản VietQR 24/7)' : 'Thanh toán toàn bộ (Chuyển khoản VietQR 24/7)';
      case 'momo':
        return isPartPayment ? 'Trả trước 50% (Ví điện tử MoMo/ZaloPay)' : 'Thanh toán toàn bộ (Ví điện tử MoMo/ZaloPay)';
      case 'card':
        return isPartPayment ? 'Trả trước 50% (Thẻ tín dụng Visa/Mastercard)' : 'Thanh toán toàn bộ (Thẻ tín dụng Visa/Mastercard)';
    }
  };

  const handleConfirmFinalPayment = async () => {
    const conflict = await mockApi.checkBookingConflict(stay.id, startDate, endDate);
    if (conflict) {
      setConflictBooking(conflict);
      setIsConflictModalOpen(true);
      return;
    }

    const sD = startDate.getDate();
    const sM = startDate.getMonth() + 1;
    const sY = startDate.getFullYear();
    const eD = endDate.getDate();
    const eM = endDate.getMonth() + 1;
    const eY = endDate.getFullYear();

    const chosenAddonObjects = AVAILABLE_ADDONS.filter((a) => selectedAddonIds.includes(a.id)).map((a) => ({
      id: a.id,
      name: a.name,
      price: isVnd ? a.priceVnd : a.priceUsd,
    }));

    const feesList: { label: string; amount: number }[] = [];
    if (extraAdults > 0) {
      feesList.push({ label: `Phụ thu ${extraAdults} người lớn thêm (+30%/đêm)`, amount: extraAdultsFeePerNight * nights });
    }
    if (extraChildren > 0) {
      feesList.push({ label: `Phụ thu ${extraChildren} trẻ em thêm (+15%/đêm)`, amount: extraChildrenFeePerNight * nights });
    }
    if (packageSurchargeTotal > 0) {
      feesList.push({ label: `Nâng cấp ${getPackageName(selectedPackage)}`, amount: packageSurchargeTotal });
    }
    chosenAddonObjects.forEach((a) => {
      feesList.push({ label: a.name, amount: a.price });
    });

    const booking: BookingDetails = {
      bookingId: ticketCode.replace('TB-', '').replace('-', '') || `${Date.now()}`,
      accommodation: stay,
      checkIn: `${sD < 10 ? '0' : ''}${sD}-${sM < 10 ? '0' : ''}${sM}-${sY}`,
      checkOut: `${eD < 10 ? '0' : ''}${eD}-${eM < 10 ? '0' : ''}${eM}-${eY}`,
      estimatedCheckInTime,
      nights,
      guests: totalGuests,
      paymentType: paymentOption,
      roomTotal: roomBaseSubtotal,
      fees: feesList,
      totalPrice: totalAmount,
      paidAmount: dueNow,
      dueAmount: dueLater,
      paymentDate: new Date().toLocaleDateString('vi-VN'),
      paymentTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: getPaymentMethodLabel(),
      servicePackage: selectedPackage,
      servicePackageName: getPackageName(selectedPackage),
      contactName: contactName.trim(),
      contactPhone: contactPhone.trim(),
      contactEmail: contactEmail.trim(),
      specialRequest: specialRequest.trim() || undefined,
      addons: chosenAddonObjects,
    };

    onConfirmPayment(booking);
  };

  const handleCopyTransferCode = () => {
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* HEADER */}
      <View style={{ width: '100%', backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <View style={[styles.header, { maxWidth: 840, alignSelf: 'center', width: '100%', backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => {
              if (currentStep === 'payment') {
                setCurrentStep('form');
              } else {
                onBack();
              }
            }}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {currentStep === 'form' ? 'Thông tin đặt phòng' : 'Xác nhận & Thanh toán'}
            </Text>
            {currentStep === 'payment' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <Ionicons name="shield-checkmark" size={12} color="#0D9488" style={{ marginRight: 3 }} />
                <Text style={{ fontSize: 11, color: '#0D9488', fontWeight: '600' }}>Bảo mật SSL 256-bit</Text>
              </View>
            )}
          </View>
          {onHome ? (
            <TouchableOpacity
              onPress={onHome}
              style={[styles.backButton, { alignItems: 'flex-end' }]}
              accessibilityLabel="Trở về trang chủ"
            >
              <Ionicons name="home-outline" size={22} color={colors.text} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 24 }} />
          )}
        </View>
      </View>

      {/* ============================================================== */}
      {/* STEP 1: FORM & SERVICE SELECTION */}
      {/* ============================================================== */}
      {currentStep === 'form' && (
        <>
          <ScrollView contentContainerStyle={[styles.content, { maxWidth: 840, alignSelf: 'center', width: '100%' }]} showsVerticalScrollIndicator={false}>
            {/* PROPERTY SUMMARY BANNER */}
            <View style={[styles.hotelBannerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Image
                source={{ uri: stay.images?.[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80' }}
                style={styles.hotelBannerImg}
              />
              <View style={styles.hotelBannerInfo}>
                <Text style={[styles.hotelBannerTitle, { color: colors.text }]} numberOfLines={1}>{stay.title}</Text>
                <Text style={[styles.hotelBannerLoc, { color: colors.textSecondary }]} numberOfLines={1}>📍 {stay.location}</Text>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={13} color="#F59E0B" />
                  <Text style={[styles.ratingText, { color: colors.textSecondary }]}> {stay.rating || 5.0} ({stay.reviewCount || 260})</Text>
                </View>
              </View>
            </View>

            {/* TRIP DETAILS & EDIT PILLS */}
            <View style={[styles.cardSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Thời gian & Khách</Text>
                <View style={[styles.datesTextRow, { backgroundColor: isDarkMode ? '#064E3B' : '#F0FDFA' }]}>
                  <Text style={styles.datesHighlightText}>{checkInStr} ➔ {checkOutStr}</Text>
                </View>
              </View>

              <View style={styles.quickEditRow}>
                <TouchableOpacity
                  style={styles.quickEditPill}
                  onPress={() => setIsDatesModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar-outline" size={14} color="#00BDD6" style={{ marginRight: 5 }} />
                  <Text style={styles.quickEditText}>{nights} đêm</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickEditPill}
                  onPress={() => setIsGuestsModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="people-outline" size={14} color="#00BDD6" style={{ marginRight: 5 }} />
                  <Text style={styles.quickEditText}>
                    {totalGuests} khách {totalExtraGuests > 0 ? `(+phụ thu ${totalExtraGuests})` : ''}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickEditPill}
                  onPress={() => setIsTimeSlotModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="time-outline" size={14} color="#00BDD6" style={{ marginRight: 5 }} />
                  <Text style={styles.quickEditText}>Đến: {estimatedCheckInTime.split(' ')[0]}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* SERVICE PACKAGE SELECTION (GÓI DỊCH VỤ VIP / THƯỜNG) */}
            <View style={[styles.cardSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Chọn gói dịch vụ lưu trú</Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>Nâng tầm trải nghiệm kỳ nghỉ của bạn:</Text>

              {/* Package 1: Standard */}
              <TouchableOpacity
                style={[styles.packageCard, { backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF', borderColor: colors.border }, selectedPackage === 'standard' && (isDarkMode ? { borderColor: '#00BDD6', backgroundColor: '#083344' } : styles.packageCardActive)]}
                onPress={() => setSelectedPackage('standard')}
                activeOpacity={0.8}
              >
                <View style={styles.packageHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={[styles.packageRadio, selectedPackage === 'standard' && styles.packageRadioActive]}>
                      {selectedPackage === 'standard' && <View style={styles.packageRadioInner} />}
                    </View>
                    <Text style={[styles.packageNameText, { color: colors.text }]}>Gói Standard (Tiêu chuẩn)</Text>
                  </View>
                  <Text style={styles.packagePriceText}>Giá gốc</Text>
                </View>
                <View style={{ marginLeft: 26, gap: 3 }}>
                  <Text style={[styles.packageDescText, { color: colors.textSecondary }]}>• Phòng nghỉ tiện nghi cao cấp, Wifi tốc độ cao</Text>
                  <Text style={[styles.packageDescText, { color: colors.textSecondary }]}>• Nước khoáng, trà & cà phê hòa tan miễn phí tại phòng</Text>
                  <Text style={[styles.packageDescText, { color: colors.textSecondary }]}>• Sử dụng hồ bơi vô cực & phòng gym</Text>
                </View>
              </TouchableOpacity>

              {/* Package 2: VIP */}
              <TouchableOpacity
                style={[styles.packageCard, { backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF', borderColor: colors.border }, selectedPackage === 'vip' && (isDarkMode ? { borderColor: '#F59E0B', backgroundColor: '#451A03' } : styles.packageCardActiveVIP)]}
                onPress={() => setSelectedPackage('vip')}
                activeOpacity={0.8}
              >
                <View style={styles.popularBadge}>
                  <Ionicons name="sparkles" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.popularBadgeText}>PHỔ BIẾN NHẤT</Text>
                </View>
                <View style={styles.packageHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={[styles.packageRadio, selectedPackage === 'vip' && styles.packageRadioActiveVIP]}>
                      {selectedPackage === 'vip' && <View style={[styles.packageRadioInner, { backgroundColor: '#D97706' }]} />}
                    </View>
                    <Text style={[styles.packageNameText, { color: '#B45309' }]}>Gói VIP (Cao cấp)</Text>
                  </View>
                  <Text style={[styles.packagePriceText, { color: '#D97706' }]}>+20% (+{formatDisplay(Math.round(roomBaseSubtotal * 0.2))})</Text>
                </View>
                <View style={{ marginLeft: 26, gap: 3 }}>
                  <Text style={[styles.packageDescText, { color: colors.textSecondary }]}>• Bao gồm toàn bộ quyền lợi Standard</Text>
                  <Text style={[styles.packageDescText, { color: colors.textSecondary }]}>• <Text style={{ fontWeight: '700', color: '#111827' }}>Miễn phí Bữa sáng Buffet quốc tế</Text> mỗi ngày</Text>
                  <Text style={[styles.packageDescText, { color: colors.textSecondary }]}>• Phòng view đẹp tầng cao thoáng mát</Text>
                  <Text style={[styles.packageDescText, { color: colors.textSecondary }]}>• Nhận phòng sớm linh hoạt từ 12:00</Text>
                </View>
              </TouchableOpacity>

              {/* Package 3: Luxury */}
              <TouchableOpacity
                style={[styles.packageCard, { backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF', borderColor: colors.border }, selectedPackage === 'luxury' && (isDarkMode ? { borderColor: '#7C3AED', backgroundColor: '#2E1065' } : styles.packageCardActiveLuxury)]}
                onPress={() => setSelectedPackage('luxury')}
                activeOpacity={0.8}
              >
                <View style={[styles.popularBadge, { backgroundColor: '#7C3AED' }]}>
                  <Ionicons name="diamond" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.popularBadgeText}>SIÊU VIP</Text>
                </View>
                <View style={styles.packageHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={[styles.packageRadio, selectedPackage === 'luxury' && styles.packageRadioActiveLuxury]}>
                      {selectedPackage === 'luxury' && <View style={[styles.packageRadioInner, { backgroundColor: '#7C3AED' }]} />}
                    </View>
                    <Text style={[styles.packageNameText, { color: '#6D28D9' }]}>Gói Luxury (Hoàng gia)</Text>
                  </View>
                  <Text style={[styles.packagePriceText, { color: '#7C3AED' }]}>+45% (+{formatDisplay(Math.round(roomBaseSubtotal * 0.45))})</Text>
                </View>
                <View style={{ marginLeft: 26, gap: 3 }}>
                  <Text style={[styles.packageDescText, { color: colors.textSecondary }]}>• Toàn bộ quyền lợi VIP cao cấp</Text>
                  <Text style={[styles.packageDescText, { color: colors.textSecondary }]}>• <Text style={{ fontWeight: '700', color: '#111827' }}>Xe riêng đưa đón sân bay 2 chiều</Text></Text>
                  <Text style={[styles.packageDescText, { color: colors.textSecondary }]}>• Tặng 1 suất Spa / Massage body 60 phút thư giãn</Text>
                  <Text style={[styles.packageDescText, { color: colors.textSecondary }]}>• Rượu vang chào đón & Quản gia hỗ trợ 24/7</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* ADD-ON SERVICES SELECTION */}
            <View style={[styles.cardSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Dịch vụ tiện ích cộng thêm</Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>Tùy chọn dịch vụ thuận tiện cho chuyến đi:</Text>

              {AVAILABLE_ADDONS.map((addon) => {
                const isChecked = selectedAddonIds.includes(addon.id);
                const priceFormatted = formatDisplay(isVnd ? addon.priceVnd : addon.priceUsd);
                return (
                  <TouchableOpacity
                    key={addon.id}
                    style={[styles.addonRow, { backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF', borderColor: colors.border }, isChecked && (isDarkMode ? { borderColor: '#0284C7', backgroundColor: '#082F49' } : styles.addonRowChecked)]}
                    onPress={() => toggleAddon(addon.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.checkbox, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF', borderColor: colors.border }, isChecked && styles.checkboxChecked]}>
                      {isChecked && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                    </View>
                    <View style={{ flex: 1, paddingHorizontal: 12 }}>
                      <Text style={[styles.addonName, { color: colors.text }]}>{addon.name}</Text>
                      <Text style={[styles.addonDesc, { color: colors.textSecondary }]}>{addon.desc}</Text>
                    </View>
                    <Text style={styles.addonPrice}>+{priceFormatted}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* CONTACT & GUEST INFORMATION FORM */}
            <View style={[styles.cardSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Thông tin người nhận phòng</Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>Thông tin chính xác để chủ nhà đón tiếp & gửi vé:</Text>

              <Text style={[styles.inputLabel, { color: colors.text }]}>Họ và tên người đại diện *</Text>
              <View style={[styles.inputWrap, { backgroundColor: isDarkMode ? '#0F172A' : '#F9FAFB', borderColor: colors.border }]}>
                <Ionicons name="person-outline" size={18} color="#6B7280" style={{ marginRight: 10 }} />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  value={contactName}
                  onChangeText={setContactName}
                  placeholder="Ví dụ: Nguyễn Văn Du Khách"
                  placeholderTextColor={isDarkMode ? '#64748B' : '#9CA3AF'}
                />
              </View>

              <Text style={[styles.inputLabel, { color: colors.text }]}>Số điện thoại liên hệ *</Text>
              <View style={[styles.inputWrap, { backgroundColor: isDarkMode ? '#0F172A' : '#F9FAFB', borderColor: colors.border }]}>
                <Ionicons name="call-outline" size={18} color="#6B7280" style={{ marginRight: 10 }} />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  value={contactPhone}
                  onChangeText={setContactPhone}
                  placeholder="Ví dụ: 0987 654 321"
                  placeholderTextColor={isDarkMode ? '#64748B' : '#9CA3AF'}
                  keyboardType="phone-pad"
                />
              </View>

              <Text style={[styles.inputLabel, { color: colors.text }]}>Địa chỉ Email (Nhận biên lai PDF & mã vé)</Text>
              <View style={[styles.inputWrap, { backgroundColor: isDarkMode ? '#0F172A' : '#F9FAFB', borderColor: colors.border }]}>
                <Ionicons name="mail-outline" size={18} color="#6B7280" style={{ marginRight: 10 }} />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  value={contactEmail}
                  onChangeText={setContactEmail}
                  placeholder="Ví dụ: traveler@gmail.com"
                  placeholderTextColor={isDarkMode ? '#64748B' : '#9CA3AF'}
                  keyboardType="email-address"
                />
              </View>

              <Text style={[styles.inputLabel, { color: colors.text }]}>Yêu cầu đặc biệt cho chỗ nghỉ (Tùy chọn)</Text>
              <View style={[styles.inputWrap, { height: 80, alignItems: 'flex-start', paddingTop: 10, backgroundColor: isDarkMode ? '#0F172A' : '#F9FAFB', borderColor: colors.border }]}>
                <TextInput
                  style={[styles.textInput, { height: '100%', textAlignVertical: 'top', color: colors.text }]}
                  value={specialRequest}
                  onChangeText={setSpecialRequest}
                  placeholder="Ví dụ: Tôi muốn phòng tầng cao, giường đôi, hoặc chuẩn bị hoa tươi kỷ niệm..."
                  placeholderTextColor={isDarkMode ? '#64748B' : '#9CA3AF'}
                  multiline
                />
              </View>
            </View>

            {/* PRICE BREAKDOWN */}
            <View style={[styles.cardSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Bảng tính chi phí</Text>

              <View style={styles.priceRow}>
                <Text style={[styles.priceRowLabel, { color: colors.textSecondary }]}>Tiền phòng ({nights} đêm):</Text>
                <Text style={[styles.priceRowVal, { color: colors.text }]}>{formatDisplay(roomBaseSubtotal)}</Text>
              </View>

              {extraAdults > 0 && (
                <View style={styles.priceRow}>
                  <Text style={[styles.priceRowLabel, { color: colors.textSecondary }]}>Phụ thu {extraAdults} người lớn (+30%/đêm):</Text>
                  <Text style={[styles.priceRowVal, { color: '#0D9488' }]}>+{formatDisplay(extraAdultsFeePerNight * nights)}</Text>
                </View>
              )}

              {extraChildren > 0 && (
                <View style={styles.priceRow}>
                  <Text style={[styles.priceRowLabel, { color: colors.textSecondary }]}>Phụ thu {extraChildren} trẻ em (+15%/đêm):</Text>
                  <Text style={[styles.priceRowVal, { color: '#0D9488' }]}>+{formatDisplay(extraChildrenFeePerNight * nights)}</Text>
                </View>
              )}

              {packageSurchargeTotal > 0 && (
                <View style={styles.priceRow}>
                  <Text style={[styles.priceRowLabel, { color: colors.textSecondary }]}>Nâng cấp {getPackageName(selectedPackage)}:</Text>
                  <Text style={[styles.priceRowVal, { color: selectedPackage === 'vip' ? '#D97706' : '#7C3AED' }]}>
                    +{formatDisplay(packageSurchargeTotal)}
                  </Text>
                </View>
              )}

              {addonsTotal > 0 && (
                <View style={styles.priceRow}>
                  <Text style={[styles.priceRowLabel, { color: colors.textSecondary }]}>Dịch vụ tiện ích cộng thêm ({selectedAddonIds.length}):</Text>
                  <Text style={[styles.priceRowVal, { color: '#0284C7' }]}>+{formatDisplay(addonsTotal)}</Text>
                </View>
              )}

              <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

              <View style={styles.priceRow}>
                <Text style={[styles.grandTotalLabel, { color: colors.text }]}>Tổng giá trị kỳ nghỉ:</Text>
                <Text style={styles.grandTotalVal}>{formatDisplay(totalAmount)}</Text>
              </View>
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* STEP 1 FOOTER: PROCEED TO PAYMENT */}
          <View style={[styles.footerContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
            <View style={{ maxWidth: 840, alignSelf: 'center', width: '100%' }}>
            <View style={{ marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>Tổng thanh toán ({nights} đêm):</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#00BDD6' }}>{formatDisplay(totalAmount)}</Text>
            </View>

            <TouchableOpacity
              style={styles.proceedButton}
              onPress={handleProceedToPayment}
              activeOpacity={0.88}
            >
              <Text style={styles.proceedButtonText}>Tiếp tục thanh toán ➔</Text>
            </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {/* ============================================================== */}
      {/* STEP 2: FINTECH TRAVEL CHECKOUT (ĐỘC QUYỀN - KHÔNG TRÙNG LẶP) */}
      {/* ============================================================== */}
      {currentStep === 'payment' && (
        <>
          <ScrollView contentContainerStyle={[styles.content, { maxWidth: 840, alignSelf: 'center', width: '100%' }]} showsVerticalScrollIndicator={false}>
            {/* COMPONENT 1: TRAVEL BOARDING PASS TICKET CARD */}
            <View style={[styles.ticketCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Ticket Header */}
              <View style={[styles.ticketHeader, { backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC', borderBottomColor: colors.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.appIconPill}>
                    <Ionicons name="airplane" size={14} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.appBrandText, { color: colors.text }]}>TRAVELLING PASS</Text>
                </View>
                <Text style={[styles.ticketCodeText, { backgroundColor: isDarkMode ? '#082F49' : '#E0F2FE' }]}>{ticketCode}</Text>
              </View>

              {/* Hotel Main Info */}
              <View style={styles.ticketHotelRow}>
                <Image
                  source={{ uri: stay.images?.[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80' }}
                  style={styles.ticketThumbnail}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.ticketHotelTitle, { color: colors.text }]} numberOfLines={1}>{stay.title}</Text>
                  <Text style={[styles.ticketHotelLoc, { color: colors.textSecondary }]} numberOfLines={1}>📍 {stay.location}</Text>
                  <View style={[styles.packagePillSmall, { backgroundColor: isDarkMode ? '#064E3B' : '#F0FDFA', borderColor: isDarkMode ? '#065F46' : '#CCFBF1' }]}>
                    <Ionicons name="shield-checkmark" size={11} color="#0D9488" style={{ marginRight: 4 }} />
                    <Text style={styles.packagePillText}>{getPackageName(selectedPackage)}</Text>
                  </View>
                </View>
              </View>

              {/* 3-Column Itinerary Flight-style Info */}
              <View style={[styles.itineraryBox, { backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC', borderColor: colors.border }]}>
                <View style={styles.itinCol}>
                  <Text style={styles.itinLabel}>NHẬN PHÒNG</Text>
                  <Text style={[styles.itinDate, { color: colors.text }]}>{checkInStr}</Text>
                  <Text style={styles.itinHour}>{estimatedCheckInTime.split(' ')[0]}</Text>
                </View>

                <View style={styles.itinCenterCol}>
                  <Ionicons name="bed-outline" size={18} color="#00BDD6" />
                  <View style={[styles.itinFlightLine, { backgroundColor: colors.border }]} />
                  <Text style={styles.itinNightsBadge}>{nights} ĐÊM</Text>
                </View>

                <View style={[styles.itinCol, { alignItems: 'flex-end' }]}>
                  <Text style={styles.itinLabel}>TRẢ PHÒNG</Text>
                  <Text style={[styles.itinDate, { color: colors.text }]}>{checkOutStr}</Text>
                  <Text style={styles.itinHour}>Trước 12:00</Text>
                </View>
              </View>

              {/* Guest & Contact row */}
              <View style={styles.ticketGuestRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="person-circle-outline" size={16} color="#6B7280" style={{ marginRight: 6 }} />
                  <Text style={[styles.ticketGuestText, { color: colors.text }]}>{contactName}</Text>
                </View>
                <Text style={[styles.ticketGuestCount, { color: colors.textSecondary }]}>
                  {totalGuests} khách {totalExtraGuests > 0 ? `(${totalExtraGuests} phụ thu)` : ''}
                </Text>
              </View>

              {/* Dashed Separator Line with Left & Right Cutout Circles */}
              <View style={styles.cutoutContainer}>
                <View style={[styles.cutoutLeft, { backgroundColor: colors.background }]} />
                <View style={[styles.dashedLine, { borderColor: colors.border }]} />
                <View style={[styles.cutoutRight, { backgroundColor: colors.background }]} />
              </View>

              {/* Bottom Stub of Ticket: Total price */}
              <View style={[styles.ticketStub, { backgroundColor: colors.card }]}>
                <View>
                  <Text style={[styles.stubTotalLabel, { color: colors.textSecondary }]}>TỔNG TIỀN PHÒNG</Text>
                  <Text style={[styles.stubTotalDesc, { color: colors.textSecondary }]}>Bao gồm thuế, phí & gói dịch vụ</Text>
                </View>
                <Text style={styles.stubTotalAmount}>{formatDisplay(totalAmount)}</Text>
              </View>
            </View>

            {/* COMPONENT 2: MODERN FINTECH PAYMENT HUB */}
            <View style={[styles.fintechCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Top Countdown Pill */}
              <View style={[styles.countdownBadge, { backgroundColor: isDarkMode ? '#064E3B' : '#F0FDFA', borderColor: isDarkMode ? '#065F46' : '#CCFBF1' }]}>
                <Ionicons name="hourglass-outline" size={15} color="#0D9488" style={{ marginRight: 6 }} />
                <Text style={styles.countdownBadgeText}>
                  Giữ giá ưu đãi trong <Text style={{ fontWeight: '800' }}>{formatCountdown(secondsLeft)}</Text>
                </Text>
              </View>

              {/* Payment Type Selection (100% vs 50%) */}
              <View style={[styles.modernToggleBox, { backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC', borderColor: colors.border }]}>
                <TouchableOpacity
                  style={[styles.modernTab, paymentOption === 'full' && (isDarkMode ? { backgroundColor: '#1E293B' } : styles.modernTabActive)]}
                  onPress={() => setPaymentOption('full')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={paymentOption === 'full' ? '#00BDD6' : '#9CA3AF'}
                    style={{ marginRight: 6 }}
                  />
                  <View>
                    <Text style={[styles.modernTabText, { color: colors.textSecondary }, paymentOption === 'full' && { color: colors.text, fontWeight: "700" }]}>
                      Thanh toán 100%
                    </Text>
                    <Text style={styles.modernTabSub}>{formatDisplay(totalAmount)}</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modernTab, paymentOption === 'part' && (isDarkMode ? { backgroundColor: '#1E293B' } : styles.modernTabActive)]}
                  onPress={() => setPaymentOption('part')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="pie-chart-outline"
                    size={16}
                    color={paymentOption === 'part' ? '#00BDD6' : '#9CA3AF'}
                    style={{ marginRight: 6 }}
                  />
                  <View>
                    <Text style={[styles.modernTabText, { color: colors.textSecondary }, paymentOption === 'part' && { color: colors.text, fontWeight: "700" }]}>
                      Đặt cọc 50%
                    </Text>
                    <Text style={styles.modernTabSub}>{formatDisplay(Math.round(totalAmount / 2))}</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Payment Method 3-Card Online Row */}
              <Text style={[styles.paymentMethodHeading, { color: colors.text }]}>Chọn cổng thanh toán trực tuyến:</Text>
              <View style={styles.methodsRow3}>
                {/* Method 1: VietQR */}
                <TouchableOpacity
                  style={[styles.methodCardCol3, { backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF', borderColor: colors.border }, selectedMethod === 'vietqr' && (isDarkMode ? { borderColor: '#00BDD6', backgroundColor: '#083344' } : styles.methodCardCol3Active)]}
                  onPress={() => setSelectedMethod('vietqr')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.methodIconBadge, { backgroundColor: '#E0F2FE' }]}>
                    <Ionicons name="qr-code" size={20} color="#0284C7" />
                  </View>
                  <Text style={[styles.gridMethodTitle, { color: colors.text }]}>VietQR 24/7</Text>
                  <Text style={[styles.gridMethodSub, { color: colors.textSecondary }]}>Liên ngân hàng</Text>
                </TouchableOpacity>

                {/* Method 2: MoMo */}
                <TouchableOpacity
                  style={[styles.methodCardCol3, { backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF', borderColor: colors.border }, selectedMethod === 'momo' && (isDarkMode ? { borderColor: '#DB2777', backgroundColor: '#500724' } : styles.methodCardCol3Active)]}
                  onPress={() => setSelectedMethod('momo')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.methodIconBadge, { backgroundColor: '#FDF2F8' }]}>
                    <Ionicons name="wallet" size={20} color="#DB2777" />
                  </View>
                  <Text style={[styles.gridMethodTitle, { color: colors.text }]}>Ví MoMo</Text>
                  <Text style={[styles.gridMethodSub, { color: colors.textSecondary }]}>ZaloPay / VNPay</Text>
                </TouchableOpacity>

                {/* Method 3: Credit Card */}
                <TouchableOpacity
                  style={[styles.methodCardCol3, { backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF', borderColor: colors.border }, selectedMethod === 'card' && (isDarkMode ? { borderColor: '#059669', backgroundColor: '#064E3B' } : styles.methodCardCol3Active)]}
                  onPress={() => setSelectedMethod('card')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.methodIconBadge, { backgroundColor: '#ECFDF5' }]}>
                    <Ionicons name="card" size={20} color="#059669" />
                  </View>
                  <Text style={[styles.gridMethodTitle, { color: colors.text }]}>Thẻ Quốc tế</Text>
                  <Text style={[styles.gridMethodSub, { color: colors.textSecondary }]}>Visa / Mastercard</Text>
                </TouchableOpacity>
              </View>

              {/* DYNAMIC PAYMENT DETAILS VIEW */}
              {/* Option A: VietQR 24/7 */}
              {selectedMethod === 'vietqr' && (
                <View style={[styles.paymentDetailBox, { backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC', borderColor: colors.border }]}>
                  <View style={styles.qrHeaderRow}>
                    <View style={styles.bankLogoBadge}>
                      <Text style={styles.bankLogoText}>MBBANK / VCB</Text>
                    </View>
                    <Text style={styles.qrTypeBadge}>VIETQR CHUYỂN KHOẢN NHANH</Text>
                  </View>

                  <View style={styles.qrCenterWrap}>
                    <View style={styles.styledQrContainer}>
                      {/* Stylized VietQR Matrix */}
                      <View style={styles.vietQrSquareTL} />
                      <View style={styles.vietQrSquareTR} />
                      <View style={styles.vietQrSquareBL} />
                      <View style={styles.vietQrCenterDot} />
                      <View style={styles.vietQrSmallDot1} />
                      <View style={styles.vietQrSmallDot2} />
                      <Ionicons name="shield-checkmark" size={16} color="#00BDD6" style={{ position: 'absolute', top: 38, left: 38 }} />
                    </View>
                  </View>

                  <View style={[styles.bankInfoTable, { borderTopColor: colors.border }]}>
                    <View style={styles.bankInfoRow}>
                      <Text style={[styles.bankInfoLabel, { color: colors.textSecondary }]}>Số tài khoản:</Text>
                      <Text style={[styles.bankInfoVal, { color: colors.text }]}>9988 2345 6789</Text>
                    </View>
                    <View style={styles.bankInfoRow}>
                      <Text style={[styles.bankInfoLabel, { color: colors.textSecondary }]}>Người thụ hưởng:</Text>
                      <Text style={[styles.bankInfoVal, { color: colors.text }]}>TRAVELLING APP VIETNAM</Text>
                    </View>
                    <View style={styles.bankInfoRow}>
                      <Text style={[styles.bankInfoLabel, { color: colors.textSecondary }]}>Nội dung chuyển:</Text>
                      <TouchableOpacity onPress={handleCopyTransferCode} style={styles.copyBtn}>
                        <Text style={styles.transferContentText}>{ticketCode}</Text>
                        <Ionicons name={copiedCode ? "checkmark" : "copy-outline"} size={13} color="#00BDD6" style={{ marginLeft: 4 }} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {/* Option B: MoMo / E-Wallet */}
              {selectedMethod === 'momo' && (
                <View style={[styles.paymentDetailBox, { backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC', borderColor: colors.border }]}>
                  <View style={styles.momoHeaderRow}>
                    <View style={styles.momoBadge}>
                      <Text style={styles.momoBadgeText}>MOMO / ZALOPAY</Text>
                    </View>
                    <Text style={{ fontSize: 12, color: '#DB2777', fontWeight: '600' }}>Ví điện tử tiện lợi</Text>
                  </View>

                  <View style={styles.qrCenterWrap}>
                    <View style={[styles.styledQrContainer, { borderColor: '#FBCFE8' }]}>
                      <View style={[styles.vietQrSquareTL, { borderColor: '#DB2777' }]} />
                      <View style={[styles.vietQrSquareTR, { borderColor: '#DB2777' }]} />
                      <View style={[styles.vietQrSquareBL, { borderColor: '#DB2777' }]} />
                      <Ionicons name="wallet" size={20} color="#DB2777" style={{ position: 'absolute', top: 35, left: 35 }} />
                    </View>
                  </View>
                  <Text style={[styles.methodInstructionText, { color: colors.textSecondary }]}>
                    Mở ứng dụng MoMo hoặc ZaloPay để quét mã QR thanh toán tức thì
                  </Text>
                </View>
              )}

              {/* Option C: Credit Card 3D Virtual Card */}
              {selectedMethod === 'card' && (
                <View style={styles.virtualCardGraphic}>
                  <View style={styles.virtualCardTop}>
                    <Ionicons name="hardware-chip" size={32} color="#FBBF24" />
                    <Text style={styles.virtualCardBrand}>VISA PLATINUM</Text>
                  </View>
                  <Text style={styles.virtualCardNumber}>•••• •••• •••• 8868</Text>
                  <View style={styles.virtualCardBottom}>
                    <View>
                      <Text style={styles.virtualCardHolderLabel}>CHỦ THẺ</Text>
                      <Text style={styles.virtualCardHolderName}>{contactName.toUpperCase()}</Text>
                    </View>
                    <View>
                      <Text style={styles.virtualCardHolderLabel}>HẾT HẠN</Text>
                      <Text style={styles.virtualCardHolderName}>12/28</Text>
                    </View>
                  </View>
                </View>
              )}


            </View>

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* STEP 2 FOOTER: XÁC NHẬN THANH TOÁN (MÀU CYAN THƯƠNG HIỆU APP) */}
          <View style={styles.footerContainer}>
            <View style={{ maxWidth: 840, alignSelf: 'center', width: '100%' }}>
            <View style={styles.footerSummaryRow}>
              <View>
                <Text style={[styles.footerDueLabel, { color: colors.textSecondary }]}>Số tiền thanh toán trực tuyến:</Text>
                <Text style={styles.footerDueSub}>
                  {paymentOption === 'part' ? 'Đặt cọc 50% giữ chỗ' : 'Thanh toán toàn bộ 100%'}
                </Text>
              </View>
              <Text style={[styles.footerDueAmount, { color: colors.text }]}>{formatDisplay(dueNow)}</Text>
            </View>

            <TouchableOpacity
              style={styles.brandPayButton}
              onPress={handleConfirmFinalPayment}
              activeOpacity={0.88}
            >
              <Ionicons name="lock-closed" size={17} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.brandPayButtonText}>
                Xác nhận thanh toán • {formatDisplay(dueNow)}
              </Text>
            </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {/* MODAL 1: CHỌN THỜI GIAN LƯU TRÚ */}
      <Modal
        visible={isDatesModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDatesModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Chọn thời gian lưu trú</Text>
              <TouchableOpacity onPress={() => setIsDatesModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 520 }} contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalSub, { color: colors.textSecondary }]}>Chọn ngày nhận phòng và trả phòng:</Text>

              <CalendarPicker
                initialStartDate={startDate}
                initialEndDate={endDate}
                onSelectRange={(range) => {
                  if (range.startDate) {
                    setStartDate(range.startDate);
                    if (range.endDate) {
                      setEndDate(range.endDate);
                    } else {
                      const next = new Date(range.startDate.getTime() + 86400000);
                      setEndDate(next);
                    }
                  }
                  if (range.nights) {
                    setNights(range.nights);
                  }
                }}
              />

              <TouchableOpacity
                style={[styles.confirmModalBtn, { marginTop: 16 }]}
                onPress={async () => {
                  const conflict = await mockApi.checkBookingConflict(stay.id, startDate, endDate);
                  if (conflict) {
                    setIsDatesModalVisible(false);
                    setConflictBooking(conflict);
                    setIsConflictModalOpen(true);
                    return;
                  }
                  setIsDatesModalVisible(false);
                }}
              >
                <Text style={styles.confirmModalBtnText}>Xong</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: CHỌN GIỜ NHẬN PHÒNG DỰ KIẾN */}
      <Modal
        visible={isTimeSlotModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsTimeSlotModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Giờ nhận phòng dự kiến</Text>
              <TouchableOpacity onPress={() => setIsTimeSlotModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
                Chọn khung giờ bạn sẽ tới nơi để chủ nhà hoặc khách sạn chuẩn bị chu đáo nhất:
              </Text>

              {CHECK_IN_TIME_SLOTS.map((slot) => {
                const isSelected = estimatedCheckInTime === slot;
                return (
                  <TouchableOpacity
                    key={slot}
                    style={[
                    styles.timeSlotOption,
                    { backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF', borderColor: colors.border },
                    isSelected && (isDarkMode ? { borderColor: '#00BDD6', backgroundColor: '#083344' } : styles.timeSlotOptionActive),
                  ]}
                    onPress={() => setEstimatedCheckInTime(slot)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.timeSlotRadio, isSelected && styles.timeSlotRadioActive]}>
                      {isSelected && <View style={styles.timeSlotRadioDot} />}
                    </View>
                    <Text style={[styles.timeSlotText, { color: colors.text }, isSelected && styles.timeSlotTextActive]}>
                      {slot}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                style={[styles.confirmModalBtn, { marginTop: 20 }]}
                onPress={() => setIsTimeSlotModalVisible(false)}
              >
                <Text style={styles.confirmModalBtnText}>Xác nhận khung giờ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: CHỌN SỐ LƯỢNG KHÁCH */}
      <Modal
        visible={isGuestsModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsGuestsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Số lượng khách</Text>
              <TouchableOpacity onPress={() => setIsGuestsModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
                Tiêu chuẩn 2 khách. Người lớn phát sinh phụ thu +30%/đêm, trẻ em phát sinh phụ thu +15%/đêm:
              </Text>

              {/* Adults */}
              <View style={styles.counterSection}>
                <View>
                  <Text style={[styles.counterLabel, { color: colors.text }]}>Người lớn</Text>
                  <Text style={[styles.counterDesc, { color: colors.textSecondary }]}>Từ 13 tuổi trở lên</Text>
                </View>
                <View style={styles.counterControls}>
                  <TouchableOpacity
                    style={[
                    styles.counterBtn,
                    { backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF', borderColor: colors.border },
                    adults <= 1 && (isDarkMode ? { backgroundColor: '#1E293B' } : styles.counterBtnDisabled),
                  ]}
                    onPress={() => setAdults((prev) => Math.max(1, prev - 1))}
                    disabled={adults <= 1}
                  >
                    <Ionicons name="remove" size={18} color={adults <= 1 ? (isDarkMode ? '#475569' : '#9CA3AF') : colors.text} />
                  </TouchableOpacity>
                  <Text style={[styles.counterValue, { color: colors.text }]}>{adults}</Text>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setAdults((prev) => Math.min(10, prev + 1))}
                  >
                    <Ionicons name="add" size={18} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.modalDivider, { backgroundColor: colors.border }]} />

              {/* Children */}
              <View style={styles.counterSection}>
                <View>
                  <Text style={[styles.counterLabel, { color: colors.text }]}>Trẻ em</Text>
                  <Text style={[styles.counterDesc, { color: colors.textSecondary }]}>Dưới 13 tuổi</Text>
                </View>
                <View style={styles.counterControls}>
                  <TouchableOpacity
                    style={[
                    styles.counterBtn,
                    { backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF', borderColor: colors.border },
                    children <= 0 && (isDarkMode ? { backgroundColor: '#1E293B' } : styles.counterBtnDisabled),
                  ]}
                    onPress={() => setChildren((prev) => Math.max(0, prev - 1))}
                    disabled={children <= 0}
                  >
                    <Ionicons name="remove" size={18} color={children <= 0 ? (isDarkMode ? '#475569' : '#9CA3AF') : colors.text} />
                  </TouchableOpacity>
                  <Text style={[styles.counterValue, { color: colors.text }]}>{children}</Text>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setChildren((prev) => Math.min(6, prev + 1))}
                  >
                    <Ionicons name="add" size={18} color="#111827" />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.confirmModalBtn, { marginTop: 20 }]}
                onPress={() => setIsGuestsModalVisible(false)}
              >
                <Text style={styles.confirmModalBtnText}>Xong</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 4: CẢNH BÁO TRÙNG NGÀY ĐẶT PHÒNG */}
      <Modal
        visible={isConflictModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsConflictModalOpen(false)}
      >
        <View style={[styles.modalOverlay, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }]}>
          <View
            style={{
              width: '100%',
              maxWidth: 370,
              borderRadius: 24,
              backgroundColor: colors.card,
              borderColor: isDarkMode ? colors.border : 'transparent',
              borderWidth: isDarkMode ? 1 : 0,
              paddingVertical: 24,
              paddingHorizontal: 22,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.18,
              shadowRadius: 20,
              elevation: 12,
            }}
          >
            {/* Icon Badge */}
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.14)' : '#FEE2E2',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14,
              }}
            >
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 23,
                  backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.24)' : '#FECACA',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="calendar-clear" size={24} color="#EF4444" />
              </View>
            </View>

            {/* Title & Room Name */}
            <Text style={{ fontSize: 19, fontWeight: '800', color: colors.text, textAlign: 'center' }}>
              Phòng đã kín lịch
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '700',
                color: '#00BDD6',
                textAlign: 'center',
                marginTop: 4,
              }}
              numberOfLines={2}
            >
              {stay.title}
            </Text>

            {/* Booked Date Range Box */}
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : '#FFF1F2',
                borderColor: isDarkMode ? 'rgba(239, 68, 68, 0.28)' : '#FECDD3',
                borderWidth: 1,
                borderRadius: 14,
                paddingVertical: 12,
                paddingHorizontal: 16,
                marginVertical: 16,
              }}
            >
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textSecondary, marginBottom: 3 }}>
                  ĐÃ ĐẶT TỪ NGÀY
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#EF4444' }}>
                  {conflictBooking?.checkIn?.replace(/-/g, '/')}
                </Text>
              </View>

              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.18)' : '#FFE4E6',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginHorizontal: 8,
                }}
              >
                <Ionicons name="arrow-forward" size={14} color="#EF4444" />
              </View>

              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textSecondary, marginBottom: 3 }}>
                  ĐẾN NGÀY
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#EF4444' }}>
                  {conflictBooking?.checkOut?.replace(/-/g, '/')}
                </Text>
              </View>
            </View>

            <Text
              style={{
                fontSize: 13.5,
                color: colors.textSecondary,
                textAlign: 'center',
                lineHeight: 20,
                marginBottom: 20,
              }}
            >
              Khoảng thời gian này đã có khách đặt trước. Bạn vui lòng chọn ngày lưu trú khác để tiếp tục nhé!
            </Text>

            {/* Balanced Action Buttons */}
            <View style={{ flexDirection: 'row', width: '100%' }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  height: 46,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: isDarkMode ? colors.surface : '#F9FAFB',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
                activeOpacity={0.8}
                onPress={() => setIsConflictModalOpen(false)}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textSecondary }}>Đóng</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1.4,
                  height: 46,
                  borderRadius: 12,
                  backgroundColor: '#00BDD6',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                activeOpacity={0.85}
                onPress={() => {
                  setIsConflictModalOpen(false);
                  setCurrentStep('form');
                  setIsDatesModalVisible(true);
                }}
              >
                <Ionicons name="calendar-outline" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF' }}>Chọn ngày khác</Text>
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
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },

  // CARD SECTIONS IN STEP 1
  cardSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  hotelBannerCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  hotelBannerImg: {
    width: 76,
    height: 76,
    borderRadius: 12,
    marginRight: 12,
  },
  hotelBannerInfo: {
    flex: 1,
  },
  hotelBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  hotelBannerLoc: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#4B5563',
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 14,
  },
  datesTextRow: {
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  datesHighlightText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D9488',
  },
  quickEditRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickEditPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quickEditText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#00BDD6',
  },

  // PACKAGE STYLES
  packageCard: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  packageCardActive: {
    borderColor: '#00BDD6',
    backgroundColor: '#F0FDFA',
  },
  packageCardActiveVIP: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  packageCardActiveLuxury: {
    borderColor: '#7C3AED',
    backgroundColor: '#F5F3FF',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 14,
    backgroundColor: '#D97706',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  popularBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  packageRadioActive: {
    borderColor: '#00BDD6',
  },
  packageRadioActiveVIP: {
    borderColor: '#D97706',
  },
  packageRadioActiveLuxury: {
    borderColor: '#7C3AED',
  },
  packageRadioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#00BDD6',
  },
  packageNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  packagePriceText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D9488',
  },
  packageDescText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#4B5563',
  },

  // ADDON STYLES
  addonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  addonRowChecked: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  addonName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  addonDesc: {
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 2,
  },
  addonPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
  },

  // INPUT FIELDS
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 10,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    backgroundColor: '#F9FAFB',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },

  // PRICE BREAKDOWN
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  priceRowLabel: {
    fontSize: 13.5,
    color: '#4B5563',
  },
  priceRowVal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  grandTotalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  grandTotalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#00BDD6',
  },

  cardDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  proceedButton: {
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
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // ===================================================
  // STEP 2: FINTECH TICKET PASS (ĐỘC QUYỀN - KHÔNG TRÙNG)
  // ===================================================
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  appIconPill: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00BDD6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  appBrandText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 1,
  },
  ticketCodeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  ticketHotelRow: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  ticketThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  ticketHotelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  ticketHotelLoc: {
    fontSize: 12.5,
    color: '#6B7280',
    marginBottom: 4,
  },
  packagePillSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  packagePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D9488',
  },

  itineraryBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  itinCol: {
    flex: 1,
  },
  itinLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  itinDate: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  itinHour: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00BDD6',
  },
  itinCenterCol: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  itinFlightLine: {
    width: 32,
    height: 1.5,
    backgroundColor: '#CBD5E1',
    marginVertical: 3,
  },
  itinNightsBadge: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },

  ticketGuestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
  },
  ticketGuestText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  ticketGuestCount: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },

  // CUTOUT NOTCH CIRCLES & DASHED LINE (Hiệu ứng xé vé độc quyền)
  cutoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    height: 20,
    overflow: 'hidden',
  },
  cutoutLeft: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F3F4F6', // Khớp với màu nền ngoài safeArea
    marginLeft: -10,
  },
  cutoutRight: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    marginRight: -10,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginHorizontal: 6,
  },

  ticketStub: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  stubTotalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  stubTotalDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  stubTotalAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#00BDD6',
  },

  // FINTECH PAYMENT HUB
  fintechCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  countdownBadgeText: {
    fontSize: 13,
    color: '#0D9488',
  },

  modernToggleBox: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 4,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modernTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  modernTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  modernTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  modernTabTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  modernTabSub: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#00BDD6',
    marginTop: 1,
  },

  paymentMethodHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },

  // 3 ONLINE METHODS ROW
  methodsRow3: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  methodCardCol3: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  methodCardCol3Active: {
    borderColor: '#00BDD6',
    backgroundColor: '#F0FDFA',
  },
  methodIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridMethodTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#111827',
  },
  gridMethodSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  // PAYMENT DETAIL BOX
  paymentDetailBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  qrHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bankLogoBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bankLogoText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  qrTypeBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  qrCenterWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  styledQrContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vietQrSquareTL: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 26,
    height: 26,
    borderWidth: 4,
    borderColor: '#0284C7',
    borderRadius: 4,
  },
  vietQrSquareTR: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderWidth: 4,
    borderColor: '#0284C7',
    borderRadius: 4,
  },
  vietQrSquareBL: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    width: 26,
    height: 26,
    borderWidth: 4,
    borderColor: '#0284C7',
    borderRadius: 4,
  },
  vietQrCenterDot: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 12,
    height: 12,
    backgroundColor: '#0284C7',
    borderRadius: 2,
  },
  vietQrSmallDot1: {
    position: 'absolute',
    top: 40,
    right: 12,
    width: 8,
    height: 8,
    backgroundColor: '#00BDD6',
    borderRadius: 2,
  },
  vietQrSmallDot2: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    width: 6,
    height: 6,
    backgroundColor: '#00BDD6',
    borderRadius: 2,
  },

  bankInfoTable: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
  },
  bankInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  bankInfoLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  bankInfoVal: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFEFF',
    borderWidth: 1,
    borderColor: '#A5F3FC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  transferContentText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0891B2',
  },

  // MOMO STYLES
  momoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  momoBadge: {
    backgroundColor: '#DB2777',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  momoBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  methodInstructionText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
  },

  // 3D VIRTUAL CARD (Thẻ kim loại Cyan/Slate độc quyền)
  virtualCardGraphic: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#00BDD6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  virtualCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  virtualCardBrand: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00BDD6',
    letterSpacing: 1.5,
  },
  virtualCardNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: 2.5,
    marginBottom: 16,
  },
  virtualCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  virtualCardHolderLabel: {
    fontSize: 9,
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  virtualCardHolderName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 1,
  },


  // FOOTER WITH BRAND CYAN PAY BUTTON
  footerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  footerSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  footerDueLabel: {
    fontSize: 12.5,
    color: '#6B7280',
  },
  footerDueSub: {
    fontSize: 11,
    color: '#0D9488',
    fontWeight: '600',
  },
  footerDueAmount: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },
  brandPayButton: {
    backgroundColor: '#00BDD6', // Màu Cyan thương hiệu Travelling App
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00BDD6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  brandPayButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 440,
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
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  modalContent: {
    padding: 20,
  },
  modalSub: {
    fontSize: 13.5,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 19,
  },
  confirmModalBtn: {
    backgroundColor: '#00BDD6',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  confirmModalBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  timeSlotOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  timeSlotOptionActive: {
    borderColor: '#00BDD6',
    backgroundColor: '#F0FDFA',
  },
  timeSlotRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  timeSlotRadioActive: {
    borderColor: '#00BDD6',
  },
  timeSlotRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00BDD6',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  timeSlotTextActive: {
    color: '#0F766E',
    fontWeight: '700',
  },
  counterSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  counterLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  counterDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  counterControls: {
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
  counterBtnDisabled: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  counterValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginHorizontal: 14,
    minWidth: 18,
    textAlign: 'center',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 14,
  },
});
