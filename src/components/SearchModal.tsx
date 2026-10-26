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

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (filters: SearchFilterState) => void;
  initialFilters?: Partial<SearchFilterState>;
}

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
  const [whenMode, setWhenMode] = useState<'choose' | 'anytime'>('choose');
  const [selectedMonth, setSelectedMonth] = useState<string>('February 2022');
  const [selectedDayStart, setSelectedDayStart] = useState<number>(23);
  const [selectedDayEnd, setSelectedDayEnd] = useState<number>(31);
  const [daysCount, setDaysCount] = useState<number>(1);
  const [adults, setAdults] = useState<number>(initialFilters?.adults || 2);
  const [children, setChildren] = useState<number>(initialFilters?.children || 0);

  const resetFilters = () => {
    setDestination('Anywhere');
    setSearchQuery('');
    setSelectedDayStart(23);
    setSelectedDayEnd(31);
    setDaysCount(1);
    setAdults(0);
    setChildren(0);
    setCurrentStep(1);
  };

  const handleExecuteSearch = () => {
    const finalState: SearchFilterState = {
      destination: destination || 'Anywhere',
      startDate: `${selectedDayStart} May`,
      endDate: `${selectedDayEnd} May`,
      daysCount,
      adults,
      children,
      minPrice: 10,
      maxPrice: 250,
      placeTypes: ['entire'],
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      facilities: [],
      presentTotalPrice: true,
    };
    onSearch(finalState);
    onClose();
  };

  // Days grid mock for February
  const days = [
    { num: 29, isCurrentMonth: false },
    { num: 30, isCurrentMonth: false },
    { num: 31, isCurrentMonth: false },
    { num: 1, isCurrentMonth: true },
    { num: 2, isCurrentMonth: true },
    { num: 3, isCurrentMonth: true },
    { num: 4, isCurrentMonth: true },
    { num: 5, isCurrentMonth: true },
    { num: 6, isCurrentMonth: true },
    { num: 7, isCurrentMonth: true },
    { num: 8, isCurrentMonth: true },
    { num: 9, isCurrentMonth: true },
    { num: 10, isCurrentMonth: true },
    { num: 11, isCurrentMonth: true },
    { num: 12, isCurrentMonth: true },
    { num: 13, isCurrentMonth: true },
    { num: 14, isCurrentMonth: true },
    { num: 15, isCurrentMonth: true },
    { num: 16, isCurrentMonth: true },
    { num: 17, isCurrentMonth: true },
    { num: 18, isCurrentMonth: true },
    { num: 19, isCurrentMonth: true },
    { num: 20, isCurrentMonth: true },
    { num: 21, isCurrentMonth: true },
    { num: 22, isCurrentMonth: true },
    { num: 23, isCurrentMonth: true },
    { num: 24, isCurrentMonth: true },
    { num: 25, isCurrentMonth: true },
    { num: 26, isCurrentMonth: true },
    { num: 27, isCurrentMonth: true },
    { num: 28, isCurrentMonth: true },
    { num: 1, isCurrentMonth: false },
    { num: 2, isCurrentMonth: false },
    { num: 3, isCurrentMonth: false },
    { num: 4, isCurrentMonth: false },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
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
                  placeholder="Tìm kiếm điểm đến hoặc thành phố"
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    if (text.trim()) setDestination(text.trim());
                  }}
                />
              </View>

              <View style={styles.destinationsRow}>
                <TouchableOpacity
                  style={[styles.destCard, destination === 'Bất kỳ đâu' && styles.destCardSelected]}
                  onPress={() => setDestination('Bất kỳ đâu')}
                >
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80' }}
                    style={styles.destImage}
                  />
                  <Text style={styles.destLabel}>Bất kỳ đâu</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.destCard, destination === 'Châu Âu' && styles.destCardSelected]}
                  onPress={() => setDestination('Châu Âu')}
                >
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80' }}
                    style={styles.destImage}
                  />
                  <Text style={styles.destLabel}>Châu Âu</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.destCard, destination === 'Châu Á' && styles.destCardSelected]}
                  onPress={() => setDestination('Châu Á')}
                >
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80' }}
                    style={styles.destImage}
                  />
                  <Text style={styles.destLabel}>Châu Á</Text>
                </TouchableOpacity>
              </View>

              {/* Collapsible Rows */}
              <TouchableOpacity style={styles.summaryRow} onPress={() => setCurrentStep(2)}>
                <Text style={styles.summaryLabel}>Thời gian</Text>
                <Text style={styles.summaryValueAction}>Thêm ngày</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.summaryRow} onPress={() => setCurrentStep(3)}>
                <Text style={styles.summaryLabel}>Khách</Text>
                <Text style={styles.summaryValueAction}>Thêm khách</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: WHEN STAYING */}
          {currentStep === 2 && (
            <View style={styles.stepContainer}>
              <TouchableOpacity style={styles.summaryRow} onPress={() => setCurrentStep(1)}>
                <Text style={styles.summaryLabel}>Địa điểm</Text>
                <Text style={styles.summaryValueBold}>{destination}</Text>
              </TouchableOpacity>

              <Text style={styles.title}>Thời gian lưu trú</Text>

              {/* Segmented Buttons */}
              <View style={styles.segmentedContainer}>
                <TouchableOpacity
                  style={[styles.segmentButton, whenMode === 'choose' && styles.segmentButtonActive]}
                  onPress={() => setWhenMode('choose')}
                >
                  <Text style={[styles.segmentText, whenMode === 'choose' && styles.segmentTextActive]}>
                    Chọn ngày
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segmentButton, whenMode === 'anytime' && styles.segmentButtonActive]}
                  onPress={() => setWhenMode('anytime')}
                >
                  <Text style={[styles.segmentText, whenMode === 'anytime' && styles.segmentTextActive]}>
                    Bất kỳ lúc nào
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Month Navigation */}
              <View style={styles.monthHeader}>
                <Text style={styles.monthTitle}>Tháng 2 năm 2022</Text>
                <View style={styles.arrowsRow}>
                  <TouchableOpacity style={styles.arrowButton}>
                    <Ionicons name="chevron-back" size={18} color="#374151" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.arrowButton}>
                    <Ionicons name="chevron-forward" size={18} color="#374151" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Weekdays */}
              <View style={styles.weekdaysRow}>
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
                  <Text key={day} style={styles.weekdayText}>
                    {day}
                  </Text>
                ))}
              </View>

              {/* Days Grid */}
              <View style={styles.calendarGrid}>
                {days.map((item, index) => {
                  const isSelected = item.isCurrentMonth && item.num >= 23 && item.num <= 28;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.calendarDay,
                        isSelected && styles.calendarDaySelected,
                      ]}
                      onPress={() => {
                        if (item.isCurrentMonth) {
                          setSelectedDayStart(item.num);
                          setSelectedDayEnd(Math.min(31, item.num + daysCount));
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.calendarDayText,
                          !item.isCurrentMonth && styles.calendarDayDimmed,
                          isSelected && styles.calendarDayTextSelected,
                        ]}
                      >
                        {item.num}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Counter */}
              <View style={styles.durationRow}>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setDaysCount((prev) => Math.max(1, prev - 1))}
                >
                  <Ionicons name="remove" size={18} color="#6B7280" />
                </TouchableOpacity>
                <Text style={styles.durationText}>{daysCount} ngày</Text>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setDaysCount((prev) => prev + 1)}
                >
                  <Ionicons name="add" size={18} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Skip / Next */}
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
                <Text style={styles.summaryValueBold}>{destination}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.summaryRow} onPress={() => setCurrentStep(2)}>
                <Text style={styles.summaryLabel}>Thời gian</Text>
                <Text style={styles.summaryValueBold}>23 - 31 Thg 5</Text>
              </TouchableOpacity>

              {/* Guests Card */}
              <View style={styles.guestsCard}>
                <Text style={styles.title}>Có bao nhiêu khách?</Text>

                <View style={styles.guestRow}>
                  <Text style={styles.guestType}>Người lớn</Text>
                  <View style={styles.counterRow}>
                    <TouchableOpacity
                      style={styles.counterCircle}
                      onPress={() => setAdults((prev) => Math.max(0, prev - 1))}
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
                  <Text style={styles.guestType}>Trẻ em</Text>
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

      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 24,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  destinationsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  destCard: {
    width: '31%',
    alignItems: 'center',
    borderRadius: 14,
    padding: 4,
  },
  destCardSelected: {
    borderWidth: 2,
    borderColor: '#00BDD6',
  },
  destImage: {
    width: '100%',
    height: 90,
    borderRadius: 12,
    marginBottom: 8,
  },
  destLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
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
    color: '#111827',
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
    marginBottom: 24,
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
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  arrowsRow: {
    flexDirection: 'row',
  },
  arrowButton: {
    padding: 6,
    marginLeft: 8,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  weekdayText: {
    width: 40,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: '#00BDD6',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  calendarDay: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginVertical: 4,
  },
  calendarDaySelected: {
    backgroundColor: '#00BDD6',
  },
  calendarDayText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  calendarDayDimmed: {
    color: '#D1D5DB',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationText: {
    paddingHorizontal: 20,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
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
    marginTop: 20,
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
});
