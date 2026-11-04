import React, { useState } from 'react';
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
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=400&q=80',
    query: '',
  },
  {
    id: 'Đà Lạt',
    name: 'Đà Lạt',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80',
    query: 'Đà Lạt',
  },
  {
    id: 'Đà Nẵng',
    name: 'Đà Nẵng',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=400&q=80',
    query: 'Đà Nẵng',
  },
  {
    id: 'Phú Quốc',
    name: 'Phú Quốc',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80',
    query: 'Phú Quốc',
  },
  {
    id: 'Sapa',
    name: 'Sapa',
    image: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=400&q=80',
    query: 'Sapa',
  },
  {
    id: 'Vũng Tàu',
    name: 'Vũng Tàu',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80',
    query: 'Vũng Tàu',
  },
  {
    id: 'Nha Trang',
    name: 'Nha Trang',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
    query: 'Nha Trang',
  },
];

export const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onClose,
  onSearch,
  initialFilters,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

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
  const [adults, setAdults] = useState<number>(initialFilters?.adults || 2);
  const [children, setChildren] = useState<number>(initialFilters?.children || 0);

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
    setAdults(2);
    setChildren(0);
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

    const finalState: SearchFilterState = {
      destination: destination || 'Anywhere',
      startDate: startStr,
      endDate: endStr,
      daysCount: nights,
      adults,
      children,
      minPrice: 0,
      maxPrice: 10000000,
      placeTypes: ['entire'],
      bedrooms: 0,
      beds: 0,
      bathrooms: 0,
      facilities: [],
      presentTotalPrice: true,
    };
    onSearch(finalState);
    onClose();
  };

  const dateSummaryText =
    whenMode === 'choose' && dateRange.startDate && dateRange.endDate
      ? `${dateRange.startDate.getDate()} Thg ${dateRange.startDate.getMonth() + 1} - ${dateRange.endDate.getDate()} Thg ${dateRange.endDate.getMonth() + 1} (${dateRange.nights} đêm)`
      : 'Bất kỳ lúc nào';

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
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
              {/* STEP 1: WHERE TO? */}
              {currentStep === 1 && (
                <View style={styles.stepContainer}>
                  <Text style={styles.title}>Bạn muốn đi đâu?</Text>

                  <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={20} color="#374151" style={{ marginRight: 8 }} />
                    <TextInput
                      style={styles.input}
                      placeholder="Tìm kiếm điểm đến tại Việt Nam (Đà Lạt, Phú Quốc...)"
                      placeholderTextColor="#9CA3AF"
                      value={searchQuery}
                      onChangeText={(text) => {
                        setSearchQuery(text);
                        if (text.trim()) setDestination(text.trim());
                        else setDestination('Anywhere');
                      }}
                    />
                  </View>

                  <Text style={styles.sectionSubHeader}>Điểm đến phổ biến tại Việt Nam</Text>
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
                          style={[styles.destCard, isSelected && styles.destCardSelected]}
                          onPress={() => {
                            setDestination(dest.id);
                            setSearchQuery(dest.query);
                          }}
                        >
                          <Image source={{ uri: dest.image }} style={styles.destImage} />
                          <Text style={[styles.destLabel, isSelected && styles.destLabelSelected]}>
                            {dest.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {/* Collapsible Rows */}
                  <TouchableOpacity style={styles.summaryRow} onPress={() => setCurrentStep(2)}>
                    <Text style={styles.summaryLabel}>Thời gian</Text>
                    <Text style={styles.summaryValueAction}>{dateSummaryText}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.summaryRow} onPress={() => setCurrentStep(3)}>
                    <Text style={styles.summaryLabel}>Khách</Text>
                    <Text style={styles.summaryValueAction}>{adults + children} khách</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* STEP 2: WHEN STAYING */}
              {currentStep === 2 && (
                <View style={styles.stepContainer}>
                  <TouchableOpacity style={styles.summaryRow} onPress={() => setCurrentStep(1)}>
                    <Text style={styles.summaryLabel}>Địa điểm</Text>
                    <Text style={styles.summaryValueBold}>{destination === 'Anywhere' ? 'Bất kỳ đâu' : destination}</Text>
                  </TouchableOpacity>

                  <Text style={styles.title}>Thời gian lưu trú</Text>

                  {/* Segmented Buttons */}
                  <View style={styles.segmentedContainer}>
                    <TouchableOpacity
                      style={[styles.segmentButton, whenMode === 'anytime' && styles.segmentButtonActive]}
                      onPress={() => setWhenMode('anytime')}
                    >
                      <Text style={[styles.segmentText, whenMode === 'anytime' && styles.segmentTextActive]}>
                        Bất kỳ lúc nào
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.segmentButton, whenMode === 'choose' && styles.segmentButtonActive]}
                      onPress={() => setWhenMode('choose')}
                    >
                      <Text style={[styles.segmentText, whenMode === 'choose' && styles.segmentTextActive]}>
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
                    <View style={styles.anytimeCard}>
                      <Ionicons name="infinite-outline" size={32} color="#00BDD6" />
                      <Text style={styles.anytimeTitle}>Linh hoạt thời gian</Text>
                      <Text style={styles.anytimeDesc}>
                        Khám phá tất cả các chuyến đi phù hợp mà không bị giới hạn bởi ngày cụ thể. Giá sẽ được hiển thị theo từng đêm.
                      </Text>
                    </View>
                  )}

                  {/* Actions */}
                  <View style={styles.stepActionsRow}>
                    <TouchableOpacity onPress={() => setCurrentStep(3)}>
                      <Text style={styles.skipText}>Bỏ qua</Text>
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

              {/* STEP 3: HOW MANY GUESTS? */}
              {currentStep === 3 && (
                <View style={styles.stepContainer}>
                  <TouchableOpacity style={styles.summaryRow} onPress={() => setCurrentStep(1)}>
                    <Text style={styles.summaryLabel}>Địa điểm</Text>
                    <Text style={styles.summaryValueBold}>{destination === 'Anywhere' ? 'Bất kỳ đâu' : destination}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.summaryRow} onPress={() => setCurrentStep(2)}>
                    <Text style={styles.summaryLabel}>Thời gian</Text>
                    <Text style={styles.summaryValueBold}>{dateSummaryText}</Text>
                  </TouchableOpacity>

                  {/* Guests Card */}
                  <View style={styles.guestsCard}>
                    <Text style={styles.title}>Có bao nhiêu khách?</Text>

                    <View style={styles.guestRow}>
                      <View>
                        <Text style={styles.guestType}>Người lớn</Text>
                        <Text style={styles.guestSubtitle}>Từ 13 tuổi trở lên</Text>
                      </View>
                      <View style={styles.counterRow}>
                        <TouchableOpacity
                          style={styles.counterCircle}
                          onPress={() => setAdults((prev) => Math.max(1, prev - 1))}
                        >
                          <Ionicons name="remove" size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                        <Text style={styles.counterValue}>{adults}</Text>
                        <TouchableOpacity
                          style={styles.counterCircle}
                          onPress={() => setAdults((prev) => prev + 1)}
                        >
                          <Ionicons name="add" size={18} color="#1F2937" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={[styles.guestRow, { borderBottomWidth: 0 }]}>
                      <View>
                        <Text style={styles.guestType}>Trẻ em</Text>
                        <Text style={styles.guestSubtitle}>Dưới 13 tuổi</Text>
                      </View>
                      <View style={styles.counterRow}>
                        <TouchableOpacity
                          style={styles.counterCircle}
                          onPress={() => setChildren((prev) => Math.max(0, prev - 1))}
                        >
                          <Ionicons name="remove" size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                        <Text style={styles.counterValue}>{children}</Text>
                        <TouchableOpacity
                          style={styles.counterCircle}
                          onPress={() => setChildren((prev) => prev + 1)}
                        >
                          <Ionicons name="add" size={18} color="#1F2937" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* FOOTER BAR */}
            <View style={styles.footerBar}>
              <TouchableOpacity onPress={resetFilters}>
                <Text style={styles.clearAllText}>Xóa tất cả</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.searchButton} onPress={handleExecuteSearch}>
                <Ionicons name="search" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.searchButtonText}>Tìm kiếm</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
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
});
