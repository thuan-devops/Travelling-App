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
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchFilterState } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';

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
  const { isDarkMode, colors } = useTheme();
  const isVnd = currency === 'VND';

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

  // Facilities
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

  // Quick price tiers
  const PRICE_TIERS = [
    { id: 'all', label: 'Tất cả mức giá', sub: 'Mọi phân khúc', min: 0, max: defaultMax },
    { id: 'budget', label: isVnd ? '< 1.000.000₫' : '< $40', sub: 'Tiết kiệm', min: 0, max: isVnd ? 1000000 : 40 },
    { id: 'popular', label: isVnd ? '1 - 2.5 triệu' : '$40 - $100', sub: 'Phổ biến', min: isVnd ? 1000000 : 40, max: isVnd ? 2500000 : 100 },
    { id: 'premium', label: isVnd ? '2.5 - 5 triệu' : '$100 - $200', sub: 'Cao cấp', min: isVnd ? 2500000 : 100, max: isVnd ? 5000000 : 200 },
    { id: 'luxury', label: isVnd ? '> 5.000.000₫' : '> $200', sub: 'Sang trọng', min: isVnd ? 5000000 : 200, max: isVnd ? 25000000 : 1000 },
  ];

  const stepAmount = isVnd ? 500000 : 20;

  const handleAdjustMin = (delta: number) => {
    setMinPrice((prev) => Math.max(0, Math.min(prev + delta, maxPrice - stepAmount)));
  };

  const handleAdjustMax = (delta: number) => {
    setMaxPrice((prev) => Math.max(minPrice + stepAmount, Math.min(prev + delta, defaultMax * 1.5)));
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

  // Tính số bộ lọc đang áp dụng
  let activeFilterCount = 0;
  if (minPrice > 0 || maxPrice < defaultMax) activeFilterCount++;
  if (minRating > 0) activeFilterCount++;
  if (!entirePlace || !privateRoom || dormitories) activeFilterCount++;
  if (bedrooms > 0 || beds > 0 || bathrooms > 0) activeFilterCount++;
  if (kitchen || pool || gym || outdoorSpace || internetAccess) activeFilterCount++;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={Platform.OS === 'web'}
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.modalOverlay,
          {
            backgroundColor: Platform.OS === 'web'
              ? (isDarkMode ? 'rgba(0, 0, 0, 0.75)' : 'rgba(0, 0, 0, 0.5)')
              : (isDarkMode ? colors.background : '#FFFFFF'),
          },
        ]}
      >
        <SafeAreaView
          style={[
            styles.safeArea,
            {
              backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
              borderColor: isDarkMode ? '#334155' : 'transparent',
              borderWidth: Platform.OS === 'web' && isDarkMode ? 1 : 0,
            },
          ]}
        >
          <View style={[styles.phoneContainer, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
            {/* Header */}
            <View
              style={[
                styles.header,
                {
                  borderBottomColor: isDarkMode ? '#334155' : '#F3F4F6',
                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                },
              ]}
            >
              <View style={{ width: 32 }} />
              <View style={{ alignItems: 'center' }}>
                <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#111827' }]}>
                  Bộ lọc nâng cao
                </Text>
                <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#6B7280', marginTop: 1 }}>
                  Tối ưu tìm kiếm theo nhu cầu của bạn
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.closeBtn, { backgroundColor: isDarkMode ? '#334155' : '#F3F4F6' }]}
              >
                <Ionicons name="close" size={20} color={isDarkMode ? '#CBD5E1' : '#374151'} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {/* 1. PRICE RANGE */}
              <View style={[styles.section, { borderBottomColor: isDarkMode ? '#334155' : '#F3F4F6' }]}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#111827' }]}>
                    Khoảng giá mỗi đêm
                  </Text>
                  <Text style={[styles.sectionHeaderBadge, { color: '#00BDD6' }]}>
                    {formatPrice(minPrice)} – {maxPrice >= defaultMax ? `${formatPrice(maxPrice)}+` : formatPrice(maxPrice)}
                  </Text>
                </View>

                {/* Quick Presets Cards */}
                <Text style={[styles.subLabel, { color: isDarkMode ? '#94A3B8' : '#6B7280' }]}>
                  Chọn nhanh phân khúc giá:
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.presetsScroll}
                >
                  {PRICE_TIERS.map((tier) => {
                    const isSelected = minPrice === tier.min && maxPrice === tier.max;
                    return (
                      <TouchableOpacity
                        key={tier.id}
                        style={[
                          styles.tierCard,
                          {
                            backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                            borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                          },
                          isSelected && {
                            backgroundColor: isDarkMode ? '#042F2E' : '#ECFEFF',
                            borderColor: '#00BDD6',
                            borderWidth: 1.5,
                          },
                        ]}
                        onPress={() => {
                          setMinPrice(tier.min);
                          setMaxPrice(tier.max);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                          <Text
                            style={[
                              styles.tierLabel,
                              { color: isDarkMode ? '#E2E8F0' : '#1E293B' },
                              isSelected && { color: '#00BDD6', fontWeight: '800' },
                            ]}
                          >
                            {tier.label}
                          </Text>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={15} color="#00BDD6" style={{ marginLeft: 4 }} />
                          )}
                        </View>
                        <Text
                          style={[
                            styles.tierSub,
                            { color: isDarkMode ? '#94A3B8' : '#64748B' },
                            isSelected && { color: '#0D9488' },
                          ]}
                        >
                          {tier.sub}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Interactive Price Input & Stepper Boxes */}
                <View style={styles.priceBoxesRow}>
                  {/* Min Price Box */}
                  <View
                    style={[
                      styles.priceBox,
                      {
                        backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                        borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                      },
                    ]}
                  >
                    <Text style={[styles.priceLabel, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>
                      Tối thiểu
                    </Text>
                    <Text style={[styles.priceValue, { color: isDarkMode ? '#FFFFFF' : '#0F172A' }]}>
                      {formatPrice(minPrice)}
                    </Text>
                    <View style={styles.stepperRow}>
                      <TouchableOpacity
                        style={[
                          styles.stepperBtn,
                          {
                            backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                            borderColor: isDarkMode ? '#475569' : '#CBD5E1',
                          },
                        ]}
                        onPress={() => handleAdjustMin(-stepAmount)}
                        disabled={minPrice <= 0}
                      >
                        <Ionicons name="remove" size={16} color={minPrice <= 0 ? '#64748B' : '#00BDD6'} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.stepperBtn,
                          {
                            backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                            borderColor: isDarkMode ? '#475569' : '#CBD5E1',
                          },
                        ]}
                        onPress={() => handleAdjustMin(stepAmount)}
                        disabled={minPrice >= maxPrice - stepAmount}
                      >
                        <Ionicons name="add" size={16} color={minPrice >= maxPrice - stepAmount ? '#64748B' : '#00BDD6'} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.priceDividerBox}>
                    <Ionicons name="arrow-forward" size={18} color={isDarkMode ? '#00BDD6' : '#94A3B8'} />
                  </View>

                  {/* Max Price Box */}
                  <View
                    style={[
                      styles.priceBox,
                      {
                        backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                        borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                      },
                    ]}
                  >
                    <Text style={[styles.priceLabel, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>
                      Tối đa
                    </Text>
                    <Text style={[styles.priceValue, { color: isDarkMode ? '#FFFFFF' : '#0F172A' }]}>
                      {maxPrice >= defaultMax ? `${formatPrice(maxPrice)}+` : formatPrice(maxPrice)}
                    </Text>
                    <View style={styles.stepperRow}>
                      <TouchableOpacity
                        style={[
                          styles.stepperBtn,
                          {
                            backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                            borderColor: isDarkMode ? '#475569' : '#CBD5E1',
                          },
                        ]}
                        onPress={() => handleAdjustMax(-stepAmount)}
                        disabled={maxPrice <= minPrice + stepAmount}
                      >
                        <Ionicons name="remove" size={16} color={maxPrice <= minPrice + stepAmount ? '#64748B' : '#00BDD6'} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.stepperBtn,
                          {
                            backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                            borderColor: isDarkMode ? '#475569' : '#CBD5E1',
                          },
                        ]}
                        onPress={() => handleAdjustMax(stepAmount)}
                      >
                        <Ionicons name="add" size={16} color="#00BDD6" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>

              {/* 2. STAR RATING FILTER */}
              <View style={[styles.section, { borderBottomColor: isDarkMode ? '#334155' : '#F3F4F6' }]}>
                <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#111827' }]}>
                  Đánh giá sao chất lượng
                </Text>
                <View style={styles.ratingGrid}>
                  {[
                    { value: 0, label: 'Tất cả sao', sub: 'Mọi đánh giá' },
                    { value: 4.8, label: '4.8★ trở lên', sub: 'Xuất sắc (Top đầu)' },
                    { value: 4, label: '4.0★ trở lên', sub: 'Rất tốt (Khuyên dùng)' },
                    { value: 3, label: '3.0★ trở lên', sub: 'Hài lòng (Tiêu chuẩn)' },
                  ].map((rate) => {
                    const isSel = minRating === rate.value;
                    return (
                      <TouchableOpacity
                        key={rate.value}
                        style={[
                          styles.ratingCard,
                          {
                            backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                            borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                          },
                          isSel && {
                            backgroundColor: isDarkMode ? '#042F2E' : '#ECFEFF',
                            borderColor: '#00BDD6',
                            borderWidth: 1.5,
                          },
                        ]}
                        onPress={() => setMinRating(rate.value)}
                        activeOpacity={0.7}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons
                            name="star"
                            size={16}
                            color={rate.value === 0 ? (isSel ? '#00BDD6' : '#94A3B8') : '#F59E0B'}
                            style={{ marginRight: 6 }}
                          />
                          <Text
                            style={[
                              styles.ratingCardTitle,
                              { color: isDarkMode ? '#FFFFFF' : '#1E293B' },
                              isSel && { color: '#00BDD6', fontWeight: '800' },
                            ]}
                          >
                            {rate.label}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.ratingCardSub,
                            { color: isDarkMode ? '#94A3B8' : '#64748B' },
                            isSel && { color: '#0D9488' },
                          ]}
                        >
                          {rate.sub}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 3. TYPE OF PLACE */}
              <View style={[styles.section, { borderBottomColor: isDarkMode ? '#334155' : '#F3F4F6' }]}>
                <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#111827' }]}>
                  Loại chỗ ở
                </Text>

                {[
                  {
                    id: 'entire',
                    title: 'Toàn bộ nhà',
                    subtitle: 'Căn hộ, biệt thự villa, nhà riêng biệt lập',
                    icon: 'home-outline',
                    checked: entirePlace,
                    toggle: () => setEntirePlace(!entirePlace),
                  },
                  {
                    id: 'private',
                    title: 'Phòng riêng',
                    subtitle: 'Phòng cao cấp khép kín, có phòng tắm riêng',
                    icon: 'bed-outline',
                    checked: privateRoom,
                    toggle: () => setPrivateRoom(!privateRoom),
                  },
                  {
                    id: 'dorm',
                    title: 'Phòng tập thể / Cắm trại',
                    subtitle: 'Lều glamping, homestay chia sẻ không gian',
                    icon: 'bonfire-outline',
                    checked: dormitories,
                    toggle: () => setDormitories(!dormitories),
                  },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.placeTypeCard,
                      {
                        backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                        borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                      },
                      item.checked && {
                        borderColor: '#00BDD6',
                        backgroundColor: isDarkMode ? '#042F2E' : '#F0FDFA',
                      },
                    ]}
                    activeOpacity={0.7}
                    onPress={item.toggle}
                  >
                    <View style={styles.placeTypeIconBox}>
                      <Ionicons
                        name={item.icon as any}
                        size={22}
                        color={item.checked ? '#00BDD6' : (isDarkMode ? '#94A3B8' : '#64748B')}
                      />
                    </View>
                    <View style={styles.placeTypeInfo}>
                      <Text
                        style={[
                          styles.optionTitle,
                          { color: isDarkMode ? '#FFFFFF' : '#1E293B' },
                          item.checked && { color: isDarkMode ? '#FFFFFF' : '#0F172A', fontWeight: '700' },
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text style={[styles.optionSubtitle, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>
                        {item.subtitle}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: isDarkMode ? '#475569' : '#CBD5E1',
                          backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                        },
                        item.checked && styles.checkboxActive,
                      ]}
                    >
                      {item.checked && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 4. ROOMS AND BEDS */}
              <View style={[styles.section, { borderBottomColor: isDarkMode ? '#334155' : '#F3F4F6' }]}>
                <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#111827' }]}>
                  Phòng ngủ và giường
                </Text>

                {[
                  { label: 'Phòng ngủ', val: bedrooms, setVal: setBedrooms, options: [0, 1, 2, 3, 4] },
                  { label: 'Giường', val: beds, setVal: setBeds, options: [0, 1, 2, 3, 4] },
                  { label: 'Phòng tắm', val: bathrooms, setVal: setBathrooms, options: [0, 1, 2, 3] },
                ].map((row) => (
                  <View
                    key={row.label}
                    style={[
                      styles.counterItemRow,
                      { borderBottomColor: isDarkMode ? '#334155' : '#F8FAFC' },
                    ]}
                  >
                    <Text style={[styles.counterItemLabel, { color: isDarkMode ? '#E2E8F0' : '#334155' }]}>
                      {row.label}
                    </Text>
                    <View style={styles.pillSelectorRow}>
                      {row.options.map((opt) => {
                        const isSel = row.val === opt;
                        const labelText = opt === 0 ? 'Bất kỳ' : `${opt}+`;
                        return (
                          <TouchableOpacity
                            key={opt}
                            style={[
                              styles.countPill,
                              {
                                backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                                borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                              },
                              isSel && styles.countPillActive,
                            ]}
                            onPress={() => row.setVal(opt)}
                          >
                            <Text
                              style={[
                                styles.countPillText,
                                { color: isDarkMode ? '#94A3B8' : '#475569' },
                                isSel && styles.countPillTextActive,
                              ]}
                            >
                              {labelText}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>

              {/* 5. FACILITIES */}
              <View style={[styles.section, { borderBottomColor: 'transparent' }]}>
                <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#111827' }]}>
                  Tiện nghi yêu cầu
                </Text>

                <View style={styles.facilitiesGrid}>
                  {[
                    { label: 'Bếp nấu ăn', checked: kitchen, setChecked: setKitchen, icon: 'restaurant-outline' },
                    { label: 'Hồ bơi / Bể bơi', checked: pool, setChecked: setPool, icon: 'water-outline' },
                    { label: 'Phòng tập gym', checked: gym, setChecked: setGym, icon: 'barbell-outline' },
                    { label: 'Sân vườn ngoài trời', checked: outdoorSpace, setChecked: setOutdoorSpace, icon: 'leaf-outline' },
                    { label: 'Wifi tốc độ cao', checked: internetAccess, setChecked: setInternetAccess, icon: 'wifi-outline' },
                  ].map((fac) => (
                    <TouchableOpacity
                      key={fac.label}
                      style={[
                        styles.facilityCard,
                        {
                          backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                          borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                        },
                        fac.checked && {
                          borderColor: '#00BDD6',
                          backgroundColor: isDarkMode ? '#042F2E' : '#ECFEFF',
                        },
                      ]}
                      activeOpacity={0.7}
                      onPress={() => fac.setChecked(!fac.checked)}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <Ionicons
                          name={fac.icon as any}
                          size={18}
                          color={fac.checked ? '#00BDD6' : (isDarkMode ? '#94A3B8' : '#64748B')}
                          style={{ marginRight: 8 }}
                        />
                        <Text
                          style={[
                            styles.facilityLabel,
                            { color: isDarkMode ? '#E2E8F0' : '#334155' },
                            fac.checked && { color: '#00BDD6', fontWeight: '700' },
                          ]}
                        >
                          {fac.label}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.checkboxSmall,
                          {
                            borderColor: isDarkMode ? '#475569' : '#CBD5E1',
                            backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                          },
                          fac.checked && styles.checkboxActive,
                        ]}
                      >
                        {fac.checked && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Footer */}
            <View
              style={[
                styles.footer,
                {
                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                  borderTopColor: isDarkMode ? '#334155' : '#F1F5F9',
                },
              ]}
            >
              <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
                <Ionicons name="trash-outline" size={15} color={isDarkMode ? '#94A3B8' : '#64748B'} style={{ marginRight: 4 }} />
                <Text style={[styles.clearAllText, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>
                  Xóa tất cả
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={handleApply} activeOpacity={0.85}>
                <Ionicons name="search" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.applyButtonText}>
                  {activeFilterCount > 0 ? `Xem kết quả (${activeFilterCount})` : 'Xem kết quả'}
                </Text>
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
    maxWidth: Platform.OS === 'web' ? 620 : '100%',
    maxHeight: Platform.OS === 'web' ? '92%' : '100%',
    borderRadius: Platform.OS === 'web' ? 24 : 0,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    alignSelf: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
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
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 95,
  },
  section: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  sectionHeaderBadge: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  subLabel: {
    fontSize: 12,
    marginBottom: 10,
  },
  presetsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 14,
  },
  tierCard: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 120,
  },
  tierLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  tierSub: {
    fontSize: 11,
    marginTop: 2,
  },
  priceBoxesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 4,
  },
  priceBox: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  priceDividerBox: {
    paddingHorizontal: 2,
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  stepperRow: {
    flexDirection: 'row',
    gap: 6,
  },
  stepperBtn: {
    flex: 1,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  ratingCard: {
    width: '48.5%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  ratingCardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  ratingCardSub: {
    fontSize: 11,
    marginTop: 4,
  },
  placeTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  placeTypeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  placeTypeInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  checkboxSmall: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
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
    borderBottomWidth: 1,
  },
  counterItemLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  pillSelectorRow: {
    flexDirection: 'row',
    gap: 6,
  },
  countPill: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countPillActive: {
    backgroundColor: '#00BDD6',
    borderColor: '#00BDD6',
  },
  countPillText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  countPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  facilitiesGrid: {
    gap: 8,
    marginTop: 4,
  },
  facilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  facilityLabel: {
    fontSize: 13.5,
    fontWeight: '600',
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
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearAllText: {
    fontSize: 13.5,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00BDD6',
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
    fontSize: 14.5,
    fontWeight: '700',
  },
});
