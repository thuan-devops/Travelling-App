import React, { useState, useEffect } from 'react';
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
  const { formatPrice, currency } = useCurrency();
  const isVnd = currency === 'VND';

  // Normalize initial min/max prices (support VND & USD)
  const defaultMin = 0;
  const defaultMax = isVnd ? 20000000 : 800;

  const [minPrice, setMinPrice] = useState<number>(
    initialFilters?.minPrice !== undefined ? initialFilters.minPrice : defaultMin
  );
  const [maxPrice, setMaxPrice] = useState<number>(
    initialFilters?.maxPrice !== undefined ? initialFilters.maxPrice : defaultMax
  );

  // Type of place
  const [entirePlace, setEntirePlace] = useState<boolean>(true);
  const [privateRoom, setPrivateRoom] = useState<boolean>(true);
  const [dormitories, setDormitories] = useState<boolean>(false);

  // Rooms and beds (0 = Bất kỳ)
  const [bedrooms, setBedrooms] = useState<number>(initialFilters?.bedrooms || 0);
  const [beds, setBeds] = useState<number>(initialFilters?.beds || 0);
  const [bathrooms, setBathrooms] = useState<number>(initialFilters?.bathrooms || 0);

  // Facilities - default to false so they don't block all listings
  const [kitchen, setKitchen] = useState<boolean>(false);
  const [pool, setPool] = useState<boolean>(false);
  const [gym, setGym] = useState<boolean>(false);
  const [outdoorSpace, setOutdoorSpace] = useState<boolean>(false);
  const [internetAccess, setInternetAccess] = useState<boolean>(false);

  // Star Rating
  const [minRating, setMinRating] = useState<number>(initialFilters?.minRating || 0);

  // Sync when initialFilters changes
  useEffect(() => {
    if (initialFilters) {
      if (initialFilters.minPrice !== undefined) setMinPrice(initialFilters.minPrice);
      if (initialFilters.maxPrice !== undefined) setMaxPrice(initialFilters.maxPrice);
      if (initialFilters.minRating !== undefined) setMinRating(initialFilters.minRating);
      if (initialFilters.bedrooms !== undefined) setBedrooms(initialFilters.bedrooms);
      if (initialFilters.beds !== undefined) setBeds(initialFilters.beds);
      if (initialFilters.bathrooms !== undefined) setBathrooms(initialFilters.bathrooms);
      if (initialFilters.facilities) {
        setKitchen(initialFilters.facilities.some((f) => f.toLowerCase().includes('bếp') || f.toLowerCase().includes('kitchen')));
        setPool(initialFilters.facilities.some((f) => f.toLowerCase().includes('hồ bơi') || f.toLowerCase().includes('pool')));
        setGym(initialFilters.facilities.some((f) => f.toLowerCase().includes('gym')));
        setOutdoorSpace(initialFilters.facilities.some((f) => f.toLowerCase().includes('ngoài trời') || f.toLowerCase().includes('outdoor')));
        setInternetAccess(initialFilters.facilities.some((f) => f.toLowerCase().includes('wifi') || f.toLowerCase().includes('internet')));
      }
    }
  }, [initialFilters]);

  // Adjust price helper
  const stepAmount = isVnd ? 500000 : 20;

  const handleAdjustMin = (delta: number) => {
    setMinPrice((prev) => Math.max(0, Math.min(prev + delta, maxPrice - stepAmount)));
  };

  const handleAdjustMax = (delta: number) => {
    setMaxPrice((prev) => Math.max(minPrice + stepAmount, prev + delta));
  };

  const handleClearAll = () => {
    setMinPrice(0);
    setMaxPrice(defaultMax);
    setEntirePlace(true);
    setPrivateRoom(true);
    setDormitories(true);
    setBedrooms(0);
    setBeds(0);
    setBathrooms(0);
    setKitchen(false);
    setPool(false);
    setGym(false);
    setOutdoorSpace(false);
    setInternetAccess(false);
    setMinRating(0);
  };

  const handleApply = () => {
    const selectedFacilities: string[] = [];
    if (kitchen) selectedFacilities.push('Bếp');
    if (pool) selectedFacilities.push('Hồ bơi');
    if (gym) selectedFacilities.push('Gym');
    if (outdoorSpace) selectedFacilities.push('Không gian ngoài trời');
    if (internetAccess) selectedFacilities.push('Wifi');

    const selectedPlaceTypes: ('entire' | 'private' | 'dorm')[] = [];
    if (entirePlace) selectedPlaceTypes.push('entire');
    if (privateRoom) selectedPlaceTypes.push('private');
    if (dormitories) selectedPlaceTypes.push('dorm');

    onApply({
      minPrice,
      maxPrice,
      placeTypes: selectedPlaceTypes.length > 0 ? selectedPlaceTypes : ['entire', 'private'],
      bedrooms: bedrooms > 0 ? bedrooms : 0,
      beds: beds > 0 ? beds : 0,
      bathrooms: bathrooms > 0 ? bathrooms : 0,
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
              <Text style={styles.headerTitle}>Bộ lọc nâng cao</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {/* 1. PRICE RANGE */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Khoảng giá mỗi đêm</Text>

                {/* Quick Presets */}
                <View style={styles.presetsRow}>
                  {[
                    { label: 'Tất cả giá', min: 0, max: defaultMax },
                    { label: isVnd ? '< 1 triệu' : '< $40', min: 0, max: isVnd ? 1000000 : 40 },
                    { label: isVnd ? '1 - 2.5 triệu' : '$40 - $100', min: isVnd ? 1000000 : 40, max: isVnd ? 2500000 : 100 },
                    { label: isVnd ? '2.5 - 5 triệu' : '$100 - $200', min: isVnd ? 2500000 : 100, max: isVnd ? 5000000 : 200 },
                    { label: isVnd ? '> 5 triệu' : '> $200', min: isVnd ? 5000000 : 200, max: isVnd ? 25000000 : 1000 },
                  ].map((p, idx) => {
                    const isSel = minPrice === p.min && maxPrice === p.max;
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.presetChip, isSel && styles.presetChipActive]}
                        onPress={() => {
                          setMinPrice(p.min);
                          setMaxPrice(p.max);
                        }}
                      >
                        <Text style={[styles.presetChipText, isSel && styles.presetChipTextActive]}>
                          {p.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Interactive Stepper Boxes */}
                <View style={styles.priceBoxesRow}>
                  {/* Min Price Box */}
                  <View style={styles.priceBox}>
                    <Text style={styles.priceLabel}>Tối thiểu</Text>
                    <Text style={styles.priceValue}>{formatPrice(minPrice)}</Text>
                    <View style={styles.stepperRow}>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => handleAdjustMin(-stepAmount)}
                        disabled={minPrice <= 0}
                      >
                        <Ionicons name="remove" size={14} color={minPrice <= 0 ? '#CBD5E1' : '#00BDD6'} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => handleAdjustMin(stepAmount)}
                      >
                        <Ionicons name="add" size={14} color="#00BDD6" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.priceDivider}>➔</Text>

                  {/* Max Price Box */}
                  <View style={styles.priceBox}>
                    <Text style={styles.priceLabel}>Tối đa</Text>
                    <Text style={styles.priceValue}>{formatPrice(maxPrice)}</Text>
                    <View style={styles.stepperRow}>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => handleAdjustMax(-stepAmount)}
                        disabled={maxPrice <= minPrice + stepAmount}
                      >
                        <Ionicons name="remove" size={14} color={maxPrice <= minPrice + stepAmount ? '#CBD5E1' : '#00BDD6'} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => handleAdjustMax(stepAmount)}
                      >
                        <Ionicons name="add" size={14} color="#00BDD6" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>

              {/* 2. STAR RATING FILTER */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Đánh giá sao chất lượng</Text>
                <View style={styles.ratingChipsRow}>
                  {[
                    { value: 0, label: 'Tất cả' },
                    { value: 4.8, label: '4.8★+ (Xuất sắc)' },
                    { value: 4, label: '4★+ (Rất tốt)' },
                    { value: 3, label: '3★+ (Hài lòng)' },
                  ].map((rate) => {
                    const isSel = minRating === rate.value;
                    return (
                      <TouchableOpacity
                        key={rate.value}
                        style={[styles.ratingChip, isSel && styles.ratingChipActive]}
                        onPress={() => setMinRating(rate.value)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="star"
                          size={14}
                          color={isSel ? '#FFFFFF' : rate.value === 0 ? '#9CA3AF' : '#F59E0B'}
                          style={{ marginRight: 4 }}
                        />
                        <Text style={[styles.ratingChipText, isSel && styles.ratingChipTextActive]}>
                          {rate.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 3. TYPE OF PLACE */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Loại chỗ ở</Text>

                <TouchableOpacity
                  style={styles.checkboxRow}
                  activeOpacity={0.7}
                  onPress={() => setEntirePlace(!entirePlace)}
                >
                  <View style={styles.checkboxInfo}>
                    <Text style={styles.optionTitle}>Toàn bộ nhà</Text>
                    <Text style={styles.optionSubtitle}>Toàn bộ căn hộ, biệt thự villa, nhà riêng</Text>
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
                    <Text style={styles.optionSubtitle}>Phòng nghỉ cao cấp có phòng tắm riêng</Text>
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
                    <Text style={styles.optionTitle}>Phòng tập thể / Cắm trại</Text>
                    <Text style={styles.optionSubtitle}>Lều cắm trại glamping hoặc phòng chia sẻ</Text>
                  </View>
                  <View style={[styles.checkbox, dormitories && styles.checkboxActive]}>
                    {dormitories && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                  </View>
                </TouchableOpacity>
              </View>

              {/* 4. ROOMS AND BEDS */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Phòng ngủ và giường</Text>

                <View style={styles.counterItemRow}>
                  <Text style={styles.counterItemLabel}>Phòng ngủ</Text>
                  <View style={styles.pillSelectorRow}>
                    {[{ val: 0, lbl: 'Bất kỳ' }, { val: 1, lbl: '1+' }, { val: 2, lbl: '2+' }, { val: 3, lbl: '3+' }, { val: 4, lbl: '4+' }].map((item) => (
                      <TouchableOpacity
                        key={item.val}
                        style={[styles.countPill, bedrooms === item.val && styles.countPillActive]}
                        onPress={() => setBedrooms(item.val)}
                      >
                        <Text style={[styles.countPillText, bedrooms === item.val && styles.countPillTextActive]}>
                          {item.lbl}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.counterItemRow}>
                  <Text style={styles.counterItemLabel}>Giường</Text>
                  <View style={styles.pillSelectorRow}>
                    {[{ val: 0, lbl: 'Bất kỳ' }, { val: 1, lbl: '1+' }, { val: 2, lbl: '2+' }, { val: 3, lbl: '3+' }, { val: 4, lbl: '4+' }].map((item) => (
                      <TouchableOpacity
                        key={item.val}
                        style={[styles.countPill, beds === item.val && styles.countPillActive]}
                        onPress={() => setBeds(item.val)}
                      >
                        <Text style={[styles.countPillText, beds === item.val && styles.countPillTextActive]}>
                          {item.lbl}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.counterItemRow}>
                  <Text style={styles.counterItemLabel}>Phòng tắm</Text>
                  <View style={styles.pillSelectorRow}>
                    {[{ val: 0, lbl: 'Bất kỳ' }, { val: 1, lbl: '1+' }, { val: 2, lbl: '2+' }, { val: 3, lbl: '3+' }].map((item) => (
                      <TouchableOpacity
                        key={item.val}
                        style={[styles.countPill, bathrooms === item.val && styles.countPillActive]}
                        onPress={() => setBathrooms(item.val)}
                      >
                        <Text style={[styles.countPillText, bathrooms === item.val && styles.countPillTextActive]}>
                          {item.lbl}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* 5. FACILITIES */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tiện nghi yêu cầu</Text>

                {[
                  { label: 'Bếp nấu ăn', checked: kitchen, setChecked: setKitchen, icon: 'restaurant-outline' },
                  { label: 'Hồ bơi / Bể bơi', checked: pool, setChecked: setPool, icon: 'water-outline' },
                  { label: 'Phòng tập gym', checked: gym, setChecked: setGym, icon: 'barbell-outline' },
                  { label: 'Không gian ngoài trời / Sân vườn', checked: outdoorSpace, setChecked: setOutdoorSpace, icon: 'leaf-outline' },
                  { label: 'Kết nối Internet / Wifi', checked: internetAccess, setChecked: setInternetAccess, icon: 'wifi-outline' },
                ].map((fac) => (
                  <TouchableOpacity
                    key={fac.label}
                    style={styles.facilityRow}
                    activeOpacity={0.7}
                    onPress={() => fac.setChecked(!fac.checked)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name={fac.icon as any} size={18} color="#00BDD6" style={{ marginRight: 10 }} />
                      <Text style={styles.facilityLabel}>{fac.label}</Text>
                    </View>
                    <View style={[styles.checkbox, fac.checked && styles.checkboxActive]}>
                      {fac.checked && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
                <Text style={styles.clearAllText}>Xóa tất cả</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                <Ionicons name="search" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
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
    backgroundColor: Platform.OS === 'web' ? 'rgba(0,0,0,0.5)' : '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    alignSelf: 'center',
  },
  phoneContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  section: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  presetChip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  presetChipActive: {
    backgroundColor: '#E0F7FA',
    borderColor: '#00BDD6',
  },
  presetChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#4B5563',
  },
  presetChipTextActive: {
    color: '#008394',
    fontWeight: '700',
  },
  priceBoxesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
  },
  priceLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  stepperRow: {
    flexDirection: 'row',
    gap: 8,
  },
  stepperBtn: {
    width: 28,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceDivider: {
    fontSize: 16,
    color: '#9CA3AF',
    marginHorizontal: 10,
    fontWeight: '700',
  },
  ratingChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ratingChipActive: {
    backgroundColor: '#00BDD6',
    borderColor: '#00BDD6',
  },
  ratingChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  ratingChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  checkboxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkboxInfo: {
    flex: 1,
    paddingRight: 16,
  },
  optionTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12.5,
    color: '#6B7280',
    lineHeight: 17,
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
  checkboxActive: {
    backgroundColor: '#00BDD6',
    borderColor: '#00BDD6',
  },
  counterItemRow: {
    marginBottom: 14,
  },
  counterItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  pillSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  countPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countPillActive: {
    backgroundColor: '#00BDD6',
    borderColor: '#00BDD6',
  },
  countPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  countPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  facilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
  },
  facilityLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  clearBtn: {
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  clearAllText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#4B5563',
    textDecorationLine: 'underline',
  },
  applyButton: {
    backgroundColor: '#00BDD6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
    shadowColor: '#00BDD6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
