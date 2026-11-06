import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchFilterState } from '../types';
import { CalendarPicker, DateRange } from './CalendarPicker';
import { VoiceSearchModal } from './VoiceSearchModal';
import { aiService } from '../services/aiService';
import { useTheme } from '../context/ThemeContext';

const PRICE_PRESETS = [
  { id: 'all', label: 'Tất cả giá', min: 0, max: 10000000 },
  { id: 'under1m', label: '< 1.000.000₫', min: 0, max: 1000000 },
  { id: '1m_2m5', label: '1 - 2.5 triệu', min: 1000000, max: 2500000 },
  { id: '2m5_5m', label: '2.5 - 5 triệu', min: 2500000, max: 5000000 },
  { id: 'over5m', label: '> 5.000.000₫', min: 5000000, max: 20000000 },
];

const RATING_OPTIONS = [
  { value: 0, label: 'Tất cả sao', sub: 'Mọi đánh giá' },
  { value: 3, label: '3★ trở lên', sub: 'Hài lòng (3.0+)' },
  { value: 4, label: '4★ trở lên', sub: 'Rất tốt (4.0+)' },
  { value: 4.8, label: '4.8★ trở lên', sub: 'Xuất sắc (Top đầu)' },
];

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (filters: SearchFilterState) => void;
  initialFilters?: Partial<SearchFilterState>;
}

const VN_DESTINATIONS = [
  {
    id: 'Anywhere',
    name: 'Bất kỳ đâu',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=500&q=80',
    query: '',
  },
  {
    id: 'Hạ Long',
    name: 'Hạ Long',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=500&q=80',
    query: 'Hạ Long',
  },
  {
    id: 'Đà Lạt',
    name: 'Đà Lạt',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=500&q=80',
    query: 'Đà Lạt',
  },
  {
    id: 'Đà Nẵng',
    name: 'Đà Nẵng',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=500&q=80',
    query: 'Đà Nẵng',
  },
  {
    id: 'Phú Quốc',
    name: 'Phú Quốc',
    image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=500&q=80',
    query: 'Phú Quốc',
  },
  {
    id: 'Sapa',
    name: 'Sapa',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=500&q=80',
    query: 'Sapa',
  },
  {
    id: 'Vũng Tàu',
    name: 'Vũng Tàu',
    image: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=500&q=80',
    query: 'Vũng Tàu',
  },
  {
    id: 'Nha Trang',
    name: 'Nha Trang',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80',
    query: 'Nha Trang',
  },
  {
    id: 'Hội An',
    name: 'Hội An',
    image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=500&q=80',
    query: 'Hội An',
  },
];

export const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onClose,
  onSearch,
  initialFilters,
}) => {
  const { isDarkMode, colors } = useTheme();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);

  // Search State
  const [destination, setDestination] = useState<string>(initialFilters?.destination || 'Anywhere');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [whenMode, setWhenMode] = useState<'choose' | 'anytime'>('anytime');

  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
    nights: 1,
  });

  const [daysCount, setDaysCount] = useState<number>(initialFilters?.daysCount || 1);
  const [adults, setAdults] = useState<number>(initialFilters?.adults || 0);
  const [children, setChildren] = useState<number>(initialFilters?.children || 0);

  // Price & Rating filter state
  const [selectedPricePreset, setSelectedPricePreset] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<number>(initialFilters?.minPrice || 0);
  const [maxPrice, setMaxPrice] = useState<number>(initialFilters?.maxPrice || 10000000);
  const [selectedRating, setSelectedRating] = useState<number>(initialFilters?.minRating || 0);

  const resetFilters = () => {
    setDestination('Anywhere');
    setSearchQuery('');
    setWhenMode('anytime');
    setDateRange({
      startDate: null,
      endDate: null,
      nights: 1,
    });
    setDaysCount(1);
    setAdults(0);
    setChildren(0);
    setSelectedPricePreset('all');
    setMinPrice(0);
    setMaxPrice(10000000);
    setSelectedRating(0);
    setCurrentStep(1);
  };

  const handleExecuteSearch = () => {
    let startStr = '';
    let endStr = '';
    let nights = 1;

    // Chỉ áp dụng ngày cụ thể nếu người dùng chủ động chọn chế độ 'choose' và có cả ngày đến và ngày về
    if (whenMode === 'choose' && dateRange.startDate && dateRange.endDate) {
      const sDate = dateRange.startDate;
      const eDate = dateRange.endDate;
      startStr = `${sDate.getDate()} Thg ${sDate.getMonth() + 1}`;
      endStr = `${eDate.getDate()} Thg ${eDate.getMonth() + 1}`;
      nights = dateRange.nights || 1;
    }

    const finalDestination = searchQuery.trim() || destination || 'Anywhere';

    const finalState: SearchFilterState = {
      destination: finalDestination,
      startDate: startStr,
      endDate: endStr,
      daysCount: nights,
      adults: 0,
      children: 0,
      minPrice: minPrice > 0 ? minPrice : 0,
      maxPrice: maxPrice < 10000000 ? maxPrice : 20000000,
      placeTypes: [],
      bedrooms: 0,
      beds: 0,
      bathrooms: 0,
      facilities: [],
      presentTotalPrice: true,
      minRating: selectedRating > 0 ? selectedRating : undefined,
    };
    onSearch(finalState);
    onClose();
  };

  // Hỗ trợ nhấn phím Enter trên máy tính để tìm kiếm ngay ở bất kỳ bước nào trong Modal
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || !visible || isVoiceModalOpen) {
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleExecuteSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    visible,
    isVoiceModalOpen,
    searchQuery,
    destination,
    whenMode,
    dateRange,
    minPrice,
    maxPrice,
    selectedRating,
  ]);

  const dateSummaryText =
    whenMode === 'choose' && dateRange.startDate && dateRange.endDate
      ? `${dateRange.startDate.getDate()} Thg ${dateRange.startDate.getMonth() + 1} - ${dateRange.endDate.getDate()} Thg ${dateRange.endDate.getMonth() + 1} (${dateRange.nights} đêm)`
      : 'Bất kỳ lúc nào';

  const priceSummaryText =
    selectedPricePreset === 'all'
      ? 'Bất kỳ mức giá nào'
      : PRICE_PRESETS.find((p) => p.id === selectedPricePreset)?.label || 'Theo khoảng giá';

  const ratingSummaryText =
    selectedRating === 0
      ? 'Tất cả đánh giá'
      : `${selectedRating}★ trở lên`;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={Platform.OS === 'web'}
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: Platform.OS === 'web' ? (isDarkMode ? 'rgba(0, 0, 0, 0.75)' : 'rgba(0, 0, 0, 0.45)') : (isDarkMode ? colors.background : '#FFFFFF') }]}>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? colors.card : '#FFFFFF', borderColor: isDarkMode ? colors.border : 'transparent', borderWidth: Platform.OS === 'web' && isDarkMode ? 1 : 0 }]}>
          <View style={[styles.phoneContainer, { backgroundColor: isDarkMode ? colors.card : '#FFFFFF' }]}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={isDarkMode ? colors.text : '#374151'} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* STEP 1: WHERE TO? */}
              {currentStep === 1 && (
                <View style={styles.stepContainer}>
                  <Text style={[styles.title, { color: isDarkMode ? colors.text : '#111827' }]}>Bạn muốn đi đâu?</Text>

                  <View style={[styles.searchBar, { backgroundColor: isDarkMode ? '#0F172A' : '#FAFAFA', borderColor: isDarkMode ? '#00BDD6' : '#E5E7EB', borderWidth: 1.5 }]}>
                    <Ionicons name="search-outline" size={20} color={isDarkMode ? '#00BDD6' : '#374151'} style={{ marginRight: 8 }} />
                    <TextInput
                      style={[styles.input, { color: isDarkMode ? '#FFFFFF' : '#111827', fontSize: 16, fontWeight: '600' }]}
                      placeholder="Tìm kiếm điểm đến (Đà Lạt, Phú Quốc...)"
                      placeholderTextColor={isDarkMode ? '#94A3B8' : '#9CA3AF'}
                      value={searchQuery}
                      onChangeText={(text) => {
                        setSearchQuery(text);
                        if (text.trim()) setDestination(text.trim());
                        else setDestination('Anywhere');
                      }}
                      returnKeyType="search"
                      blurOnSubmit={true}
                      onSubmitEditing={handleExecuteSearch}
                    />
                    <TouchableOpacity
                      onPress={() => setIsVoiceModalOpen(true)}
                      style={styles.voiceMicBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="mic" size={19} color="#00BDD6" />
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.sectionSubHeader, { color: isDarkMode ? colors.textSecondary : '#6B7280' }]}>Điểm đến phổ biến tại Việt Nam</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.destinationsScroll}
                  >
                    {VN_DESTINATIONS.map((dest) => {
                      const isSelected = destination === dest.id;
                      return (
                        <TouchableOpacity
                          key={dest.id}
                          style={[styles.destCard, { backgroundColor: isDarkMode ? colors.surface : '#FFFFFF', borderColor: isDarkMode ? colors.border : '#E5E7EB' }, isSelected && { borderColor: '#00BDD6', backgroundColor: isDarkMode ? '#134E5E' : '#F0FDFA' }]}
                          onPress={() => {
                            setDestination(dest.id);
                            setSearchQuery(dest.query);
                          }}
                        >
                          <Image source={{ uri: dest.image }} style={styles.destImage} />
                          <Text style={[styles.destLabel, { color: isDarkMode ? '#F8FAFC' : '#374151', fontWeight: '600' }, isSelected && { color: '#00BDD6', fontWeight: '800' }]}>
                            {dest.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}

            </ScrollView>

                  {/* Collapsible Rows */}
                  <TouchableOpacity style={[styles.summaryRow, { borderBottomColor: isDarkMode ? colors.border : '#F3F4F6' }]} onPress={() => setCurrentStep(2)}>
                    <Text style={[styles.summaryLabel, { color: isDarkMode ? '#E2E8F0' : '#4B5563', fontWeight: '600' }]}>Thời gian</Text>
                    <Text style={[styles.summaryValueAction, { color: '#00BDD6', fontWeight: '700' }]}>{dateSummaryText}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.summaryRow, { borderBottomColor: isDarkMode ? colors.border : '#F3F4F6' }]} onPress={() => setCurrentStep(3)}>
                    <Text style={[styles.summaryLabel, { color: isDarkMode ? '#E2E8F0' : '#4B5563', fontWeight: '600' }]}>Khoảng giá</Text>
                    <Text style={[styles.summaryValueAction, { color: '#00BDD6', fontWeight: '700' }]}>{priceSummaryText}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.summaryRow, { borderBottomColor: isDarkMode ? colors.border : '#F3F4F6' }]} onPress={() => setCurrentStep(3)}>
                    <Text style={[styles.summaryLabel, { color: isDarkMode ? '#E2E8F0' : '#4B5563', fontWeight: '600' }]}>Đánh giá sao</Text>
                    <Text style={[styles.summaryValueAction, { color: '#00BDD6', fontWeight: '700' }]}>{ratingSummaryText}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* STEP 2: WHEN STAYING */}
              {currentStep === 2 && (
                <View style={styles.stepContainer}>
                  <TouchableOpacity style={[styles.summaryRow, { borderBottomColor: isDarkMode ? colors.border : '#F3F4F6' }]} onPress={() => setCurrentStep(1)}>
                    <Text style={[styles.summaryLabel, { color: isDarkMode ? '#E2E8F0' : '#4B5563', fontWeight: '600' }]}>Địa điểm</Text>
                    <Text style={[styles.summaryValueBold, { color: isDarkMode ? colors.text : '#111827' }]}>{destination === 'Anywhere' ? 'Bất kỳ đâu' : destination}</Text>
                  </TouchableOpacity>

                  <Text style={[styles.title, { color: isDarkMode ? colors.text : '#111827' }]}>Thời gian lưu trú</Text>

                  {/* Segmented Buttons */}
                  <View style={[styles.segmentedContainer, { backgroundColor: isDarkMode ? colors.surface : '#F3F4F6' }]}>
                    <TouchableOpacity
                      style={[styles.segmentButton, whenMode === 'anytime' && styles.segmentButtonActive]}
                      onPress={() => setWhenMode('anytime')}
                    >
                      <Text style={[styles.segmentText, { color: isDarkMode ? colors.textSecondary : '#4B5563' }, whenMode === 'anytime' && styles.segmentTextActive]}>
                        Bất kỳ lúc nào
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.segmentButton, whenMode === 'choose' && styles.segmentButtonActive]}
                      onPress={() => setWhenMode('choose')}
                    >
                      <Text style={[styles.segmentText, { color: isDarkMode ? colors.textSecondary : '#4B5563' }, whenMode === 'choose' && styles.segmentTextActive]}>
                        Chọn ngày
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {whenMode === 'choose' ? (
                    <View style={{ marginVertical: 12 }}>
                      <CalendarPicker
                        initialStartDate={dateRange.startDate}
                        initialEndDate={dateRange.endDate}
                        onSelectRange={(range) => {
                          setDateRange(range);
                          setDaysCount(range.nights);
                        }}
                      />
                    </View>
                  ) : (
                    <View style={[styles.anytimeCard, { backgroundColor: isDarkMode ? colors.surface : '#F0FDFA', borderColor: isDarkMode ? colors.border : '#CCFBF1' }]}>
                      <Ionicons name="infinite-outline" size={32} color="#00BDD6" />
                      <Text style={[styles.anytimeTitle, { color: isDarkMode ? '#2DD4BF' : '#0F766E' }]}>Linh hoạt thời gian</Text>
                      <Text style={[styles.anytimeDesc, { color: isDarkMode ? colors.textSecondary : '#475569' }]}>
                        Khám phá tất cả các chuyến đi phù hợp mà không bị giới hạn bởi ngày cụ thể. Giá sẽ được hiển thị theo từng đêm.
                      </Text>
                    </View>
                  )}

                  {/* Actions */}
                  <View style={styles.stepActionsRow}>
                    <TouchableOpacity onPress={() => setCurrentStep(3)}>
                      <Text style={[styles.skipText, { color: isDarkMode ? colors.textSecondary : '#4B5563' }]}>Bỏ qua</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.nextButton}
                      onPress={() => setCurrentStep(3)}
                    >
                      <Text style={styles.nextButtonText}>Tiếp tục</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* STEP 3: PRICE & RATING FILTER */}
              {currentStep === 3 && (
                <View style={styles.stepContainer}>
                  <TouchableOpacity style={[styles.summaryRow, { borderBottomColor: isDarkMode ? colors.border : '#F3F4F6' }]} onPress={() => setCurrentStep(1)}>
                    <Text style={[styles.summaryLabel, { color: isDarkMode ? '#E2E8F0' : '#4B5563', fontWeight: '600' }]}>Địa điểm</Text>
                    <Text style={[styles.summaryValueBold, { color: isDarkMode ? colors.text : '#111827' }]}>{destination === 'Anywhere' ? 'Bất kỳ đâu' : destination}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.summaryRow, { borderBottomColor: isDarkMode ? colors.border : '#F3F4F6' }]} onPress={() => setCurrentStep(2)}>
                    <Text style={[styles.summaryLabel, { color: isDarkMode ? '#E2E8F0' : '#4B5563', fontWeight: '600' }]}>Thời gian</Text>
                    <Text style={[styles.summaryValueBold, { color: isDarkMode ? colors.text : '#111827' }]}>{dateSummaryText}</Text>
                  </TouchableOpacity>

                  <View style={[styles.filterCard, { backgroundColor: isDarkMode ? colors.surface : '#FFFFFF', borderColor: isDarkMode ? colors.border : '#E5E7EB' }]}>
                    <Text style={[styles.title, { color: isDarkMode ? colors.text : '#111827' }]}>Giá tiền & Đánh giá</Text>

                    {/* 1. KHOẢNG GIÁ */}
                    <Text style={[styles.filterSectionTitle, { color: isDarkMode ? colors.text : '#1F2937' }]}>Khoảng giá mỗi đêm</Text>
                    <View style={styles.presetsGrid}>
                      {PRICE_PRESETS.map((p) => {
                        const isSel = selectedPricePreset === p.id;
                        return (
                          <TouchableOpacity
                            key={p.id}
                            style={[styles.presetChip, { backgroundColor: isDarkMode ? colors.card : '#F3F4F6', borderColor: isDarkMode ? colors.border : '#E5E7EB' }, isSel && { backgroundColor: isDarkMode ? '#134E5E' : '#E0F7FA', borderColor: '#00BDD6' }]}
                            onPress={() => {
                              setSelectedPricePreset(p.id);
                              setMinPrice(p.min);
                              setMaxPrice(p.max);
                            }}
                            activeOpacity={0.7}
                          >
                            <Text style={[styles.presetChipText, { color: isDarkMode ? colors.textSecondary : '#4B5563' }, isSel && { color: '#00BDD6', fontWeight: '700' }]}>
                              {p.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <View style={[styles.priceDisplayBox, { backgroundColor: isDarkMode ? colors.card : '#F0FDFA', borderColor: isDarkMode ? colors.border : '#CCFBF1' }]}>
                      <Ionicons name="pricetag" size={17} color="#00BDD6" style={{ marginRight: 8 }} />
                      <Text style={[styles.priceDisplayText, { color: isDarkMode ? colors.text : '#0F766E' }]}>
                        {selectedPricePreset === 'all'
                          ? 'Tất cả các mức giá (0đ - 10.000.000đ+)'
                          : `${minPrice.toLocaleString('vi-VN')}₫  ➔  ${maxPrice >= 20000000 ? 'Không giới hạn' : `${maxPrice.toLocaleString('vi-VN')}₫`}`}
                      </Text>
                    </View>

                    <View style={[styles.filterDivider, { backgroundColor: isDarkMode ? colors.border : '#F3F4F6' }]} />

                    {/* 2. ĐÁNH GIÁ SAO */}
                    <Text style={[styles.filterSectionTitle, { color: isDarkMode ? colors.text : '#1F2937' }]}>Tiêu chuẩn đánh giá sao</Text>
                    <View style={styles.ratingGrid}>
                      {RATING_OPTIONS.map((r) => {
                        const isSel = selectedRating === r.value;
                        return (
                          <TouchableOpacity
                            key={r.value}
                            style={[styles.ratingCard, { backgroundColor: isDarkMode ? colors.card : '#FAFAFA', borderColor: isDarkMode ? colors.border : '#E5E7EB' }, isSel && { borderColor: '#00BDD6', backgroundColor: isDarkMode ? '#134E5E' : '#F0FDFA' }]}
                            onPress={() => setSelectedRating(r.value)}
                            activeOpacity={0.7}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                              <Ionicons
                                name="star"
                                size={15}
                                color={r.value === 0 ? '#9CA3AF' : '#F59E0B'}
                                style={{ marginRight: 4 }}
                              />
                              <Text style={[styles.ratingCardLabel, { color: isDarkMode ? colors.text : '#374151' }, isSel && { color: '#00BDD6' }]}>
                                {r.label}
                              </Text>
                            </View>
                            <Text style={[styles.ratingCardSub, { color: isDarkMode ? colors.textSecondary : '#6B7280' }, isSel && { color: isDarkMode ? '#A5F3FC' : '#0D9488' }]}>
                              {r.sub}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Back to overview link */}
                    <View style={{ marginTop: 14, alignItems: 'center' }}>
                      <TouchableOpacity onPress={() => setCurrentStep(1)} style={{ paddingVertical: 6 }}>
                        <Text style={[styles.skipText, { color: isDarkMode ? colors.textSecondary : '#4B5563' }]}>➔ Xem lại tổng quan các bước</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* FOOTER BAR */}
            <View style={[styles.footerBar, { backgroundColor: isDarkMode ? colors.card : '#FFFFFF', borderTopColor: isDarkMode ? colors.border : '#F3F4F6' }]}>
              <TouchableOpacity onPress={resetFilters}>
                <Text style={[styles.clearAllText, { color: isDarkMode ? colors.textSecondary : '#6B7280' }]}>Xóa tất cả</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.searchButton} onPress={handleExecuteSearch}>
                <Ionicons name="search" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.searchButtonText}>Tìm kiếm</Text>
              </TouchableOpacity>
            </View>

          </View>
        </SafeAreaView>

        <VoiceSearchModal
          visible={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          onResult={async (text) => {
            try {
              const res = await aiService.processVoiceQuery(text);
              if (res.destination) {
                setDestination(res.destination);
                setSearchQuery(res.destination);
              } else {
                setSearchQuery(text);
                setDestination(text.trim());
              }
              // Tự động kích hoạt tìm kiếm ngay
              setTimeout(() => {
                handleExecuteSearch();
              }, 150);
            } catch {
              setSearchQuery(text);
              setDestination(text.trim());
            }
          }}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? 'rgba(0, 0, 0, 0.45)' : '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 680 : '100%',
    maxHeight: Platform.OS === 'web' ? '92%' : '100%',
    borderRadius: Platform.OS === 'web' ? 20 : 0,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    alignSelf: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  phoneContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  closeButton: {
    padding: 6,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  stepContainer: {
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  sectionSubHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 20,
    backgroundColor: '#FAFAFA',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  voiceMicBtn: {
    padding: 6,
    borderRadius: 14,
    backgroundColor: '#F0FDFA',
    marginLeft: 6,
  },
  destinationsScroll: {
    paddingRight: 10,
    marginBottom: 24,
  },
  destCard: {
    width: 108,
    marginRight: 12,
    alignItems: 'center',
    borderRadius: 14,
    padding: 6,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  destCardSelected: {
    borderColor: '#00BDD6',
    backgroundColor: '#F0FDFA',
  },
  destImage: {
    width: 92,
    height: 80,
    borderRadius: 10,
    marginBottom: 8,
  },
  destLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  destLabelSelected: {
    color: '#008394',
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  summaryLabel: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryValueAction: {
    fontSize: 15,
    color: '#00BDD6',
    fontWeight: '600',
  },
  summaryValueBold: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '700',
  },
  // Step 2 styles
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    padding: 4,
    marginBottom: 20,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
  },
  segmentButtonActive: {
    backgroundColor: '#00BDD6',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  stepActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B5563',
  },
  nextButton: {
    backgroundColor: '#00BDD6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  // Step 3 Guests styles
  guestsCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 18,
    marginTop: 10,
  },
  guestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  guestType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  guestSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  // Footer
  footerBar: {
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
    paddingVertical: 16,
  },
  clearAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00BDD6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  anytimeCard: {
    padding: 24,
    backgroundColor: '#F0FDFA',
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  anytimeTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F766E',
    marginTop: 10,
    marginBottom: 6,
  },
  anytimeDesc: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 19,
  },
  filterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 18,
    marginTop: 6,
  },
  filterSectionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 10,
    marginTop: 4,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  presetChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  presetChipActive: {
    backgroundColor: '#E0F7FA',
    borderColor: '#00BDD6',
  },
  presetChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  presetChipTextActive: {
    color: '#008394',
    fontWeight: '700',
  },
  priceDisplayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginBottom: 12,
  },
  priceDisplayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F766E',
  },
  filterDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  ratingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  ratingCard: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
  },
  ratingCardActive: {
    borderColor: '#00BDD6',
    backgroundColor: '#F0FDFA',
  },
  ratingCardLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#374151',
  },
  ratingCardLabelActive: {
    color: '#008394',
  },
  ratingCardSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  ratingCardSubActive: {
    color: '#0D9488',
    fontWeight: '600',
  },
});
