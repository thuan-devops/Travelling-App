import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchFilterState } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: Partial<SearchFilterState>) => void;
  initialFilters?: Partial<SearchFilterState>;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters,
}) => {
  const { formatPrice } = useCurrency();
  const [minPrice, setMinPrice] = useState<number>(initialFilters?.minPrice || 10);
  const [maxPrice, setMaxPrice] = useState<number>(initialFilters?.maxPrice || 250);

  // Type of place
  const [entirePlace, setEntirePlace] = useState<boolean>(true);
  const [privateRoom, setPrivateRoom] = useState<boolean>(false);
  const [dormitories, setDormitories] = useState<boolean>(false);

  // Rooms and beds
  const [bedrooms, setBedrooms] = useState<number>(initialFilters?.bedrooms || 1);
  const [beds, setBeds] = useState<number>(initialFilters?.beds || 1);
  const [bathrooms, setBathrooms] = useState<number>(initialFilters?.bathrooms || 1);

  // Facilities
  const [kitchen, setKitchen] = useState<boolean>(true);
  const [pool, setPool] = useState<boolean>(false);
  const [gym, setGym] = useState<boolean>(false);
  const [outdoorSpace, setOutdoorSpace] = useState<boolean>(true);
  const [internetAccess, setInternetAccess] = useState<boolean>(true);

  // Star Rating
  const [minRating, setMinRating] = useState<number>(initialFilters?.minRating || 0);

  const handleClearAll = () => {
    setMinPrice(100000);
    setMaxPrice(5000000);
    setEntirePlace(true);
    setPrivateRoom(false);
    setDormitories(false);
    setBedrooms(1);
    setBeds(1);
    setBathrooms(1);
    setKitchen(false);
    setPool(false);
    setGym(false);
    setOutdoorSpace(false);
    setInternetAccess(false);
    setMinRating(0);
  };

  const handleApply = () => {
    const selectedFacilities: string[] = [];
    if (kitchen) selectedFacilities.push('Kitchen');
    if (pool) selectedFacilities.push('Pool');
    if (gym) selectedFacilities.push('Gym');
    if (outdoorSpace) selectedFacilities.push('Outdoor space');
    if (internetAccess) selectedFacilities.push('Internet access');

    onApply({
      minPrice,
      maxPrice,
      bedrooms,
      beds,
      bathrooms,
      minRating: minRating > 0 ? minRating : undefined,
      facilities: selectedFacilities,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={Platform.OS === 'web'}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.phoneContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ width: 24 }} />
          <Text style={styles.headerTitle}>Bộ lọc</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* PRICE RANGE */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Khoảng giá</Text>

            {/* Slider track visual representation */}
            <View style={styles.sliderContainer}>
              <View style={styles.sliderTrackBackground} />
              <View style={styles.sliderTrackActive} />
              <View style={[styles.sliderHandle, { left: '15%' }]}>
                <Ionicons name="chevron-back" size={14} color="#FFFFFF" />
              </View>
              <View style={[styles.sliderHandle, { right: '15%' }]}>
                <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.priceBoxesRow}>
              <View style={styles.priceBox}>
                <Text style={styles.priceLabel}>Tối thiểu</Text>
                <Text style={styles.priceValue}>{formatPrice(minPrice)}</Text>
              </View>
              <Text style={styles.priceDivider}>—</Text>
              <View style={styles.priceBox}>
                <Text style={styles.priceLabel}>Tối đa</Text>
                <Text style={styles.priceValue}>{formatPrice(maxPrice)}</Text>
              </View>
            </View>
          </View>

          {/* TYPE OF PLACE */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Loại chỗ ở</Text>

            <TouchableOpacity
              style={styles.checkboxRow}
              activeOpacity={0.7}
              onPress={() => setEntirePlace(!entirePlace)}
            >
              <View style={styles.checkboxInfo}>
                <Text style={styles.optionTitle}>Toàn bộ nhà</Text>
                <Text style={styles.optionSubtitle}>Toàn bộ căn hộ, chung cư, nhà riêng</Text>
              </View>
              <View style={[styles.checkbox, entirePlace && styles.checkboxActive]}>
                {entirePlace && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkboxRow}
              activeOpacity={0.7}
              onPress={() => setPrivateRoom(!privateRoom)}
            >
              <View style={styles.checkboxInfo}>
                <Text style={styles.optionTitle}>Phòng riêng</Text>
                <Text style={styles.optionSubtitle}>
                  Thường có phòng tắm riêng trừ khi có ghi chú khác
                </Text>
              </View>
              <View style={[styles.checkbox, privateRoom && styles.checkboxActive]}>
                {privateRoom && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkboxRow}
              activeOpacity={0.7}
              onPress={() => setDormitories(!dormitories)}
            >
              <View style={styles.checkboxInfo}>
                <Text style={styles.optionTitle}>Phòng tập thể / Ký túc xá</Text>
                <Text style={styles.optionSubtitle}>
                  Phòng lớn nhiều giường chia sẻ với người khác
                </Text>
              </View>
              <View style={[styles.checkbox, dormitories && styles.checkboxActive]}>
                {dormitories && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
              </View>
            </TouchableOpacity>
          </View>

          {/* ROOMS AND BEDS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phòng ngủ và giường</Text>

            <View style={styles.counterItemRow}>
              <Text style={styles.counterItemLabel}>Phòng ngủ</Text>
              <View style={styles.pillSelectorRow}>
                {[1, 2, 3, 4].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[styles.countPill, bedrooms === num && styles.countPillActive]}
                    onPress={() => setBedrooms(num)}
                  >
                    <Text style={[styles.countPillText, bedrooms === num && styles.countPillTextActive]}>
                      {num}+
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.counterItemRow}>
              <Text style={styles.counterItemLabel}>Giường</Text>
              <View style={styles.pillSelectorRow}>
                {[1, 2, 3, 4].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[styles.countPill, beds === num && styles.countPillActive]}
                    onPress={() => setBeds(num)}
                  >
                    <Text style={[styles.countPillText, beds === num && styles.countPillTextActive]}>
                      {num}+
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.counterItemRow}>
              <Text style={styles.counterItemLabel}>Phòng tắm</Text>
              <View style={styles.pillSelectorRow}>
                {[1, 2, 3].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[styles.countPill, bathrooms === num && styles.countPillActive]}
                    onPress={() => setBathrooms(num)}
                  >
                    <Text style={[styles.countPillText, bathrooms === num && styles.countPillTextActive]}>
                      {num}+
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* STAR RATING FILTER */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Đánh giá sao</Text>
            <View style={styles.ratingChipsRow}>
              {[
                { value: 0, label: 'Tất cả' },
                { value: 5, label: '5★' },
                { value: 4, label: '4★ trở lên' },
                { value: 3, label: '3★ trở lên' },
                { value: 2, label: '2★ trở lên' },
                { value: 1, label: '1★ trở lên' },
              ].map((rate) => (
                <TouchableOpacity
                  key={rate.value}
                  style={[
                    styles.ratingChip,
                    minRating === rate.value && styles.ratingChipActive,
                  ]}
                  onPress={() => setMinRating(rate.value)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="star"
                    size={14}
                    color={minRating === rate.value ? '#FFFFFF' : '#F59E0B'}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      styles.ratingChipText,
                      minRating === rate.value && styles.ratingChipTextActive,
                    ]}
                  >
                    {rate.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* FACILITIES */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tiện nghi</Text>

            {[
              { label: 'Bếp', checked: kitchen, setChecked: setKitchen },
              { label: 'Hồ bơi', checked: pool, setChecked: setPool },
              { label: 'Phòng gym', checked: gym, setChecked: setGym },
              { label: 'Không gian ngoài trời', checked: outdoorSpace, setChecked: setOutdoorSpace },
              { label: 'Kết nối Internet', checked: internetAccess, setChecked: setInternetAccess },
            ].map((fac) => (
              <TouchableOpacity
                key={fac.label}
                style={styles.facilityRow}
                activeOpacity={0.7}
                onPress={() => fac.setChecked(!fac.checked)}
              >
                <Text style={styles.facilityLabel}>{fac.label}</Text>
                <View style={[styles.checkbox, fac.checked && styles.checkboxActive]}>
                  {fac.checked && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={styles.clearAllText}>Xóa tất cả</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Xem kết quả</Text>
          </TouchableOpacity>
        </View>

          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? '#F3F4F6' : '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    alignSelf: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  phoneContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 10,
  },
  sliderTrackBackground: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    width: '100%',
  },
  sliderTrackActive: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#00BDD6',
    borderRadius: 2,
    left: '15%',
    right: '15%',
  },
  sliderHandle: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00BDD6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  priceBoxesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  priceBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  priceDivider: {
    marginHorizontal: 12,
    color: '#9CA3AF',
    fontSize: 18,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  checkboxInfo: {
    flex: 1,
    paddingRight: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: '#00BDD6',
    borderColor: '#00BDD6',
  },
  counterItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  counterItemLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  pillSelectorRow: {
    flexDirection: 'row',
  },
  countPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginLeft: 8,
  },
  countPillActive: {
    backgroundColor: '#00BDD6',
    borderColor: '#00BDD6',
  },
  countPillText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600',
  },
  countPillTextActive: {
    color: '#FFFFFF',
  },
  facilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  facilityLabel: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  ratingChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    marginBottom: 6,
  },
  ratingChipActive: {
    backgroundColor: '#00BDD6',
    borderColor: '#00BDD6',
  },
  ratingChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  ratingChipTextActive: {
    color: '#FFFFFF',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  clearAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
  applyButton: {
    backgroundColor: '#00BDD6',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
