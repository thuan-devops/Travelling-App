import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchFilterState } from '../types';

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

  const handleClearAll = () => {
    setMinPrice(10);
    setMaxPrice(250);
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
      facilities: selectedFacilities,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ width: 24 }} />
          <Text style={styles.headerTitle}>Filters</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* PRICE RANGE */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price range</Text>

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
                <Text style={styles.priceLabel}>Minimum</Text>
                <Text style={styles.priceValue}>US${minPrice}</Text>
              </View>
              <Text style={styles.priceDivider}>—</Text>
              <View style={styles.priceBox}>
                <Text style={styles.priceLabel}>Maximum</Text>
                <Text style={styles.priceValue}>US${maxPrice}</Text>
              </View>
            </View>
          </View>

          {/* TYPE OF PLACE */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Type of place</Text>

            <TouchableOpacity
              style={styles.checkboxRow}
              activeOpacity={0.7}
              onPress={() => setEntirePlace(!entirePlace)}
            >
              <View style={styles.checkboxInfo}>
                <Text style={styles.optionTitle}>Entire place</Text>
                <Text style={styles.optionSubtitle}>Entire apartments, condos, houses</Text>
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
                <Text style={styles.optionTitle}>Private room</Text>
                <Text style={styles.optionSubtitle}>
                  Typically come with a private bathroom unless otherwise stated
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
                <Text style={styles.optionTitle}>Dormitories</Text>
                <Text style={styles.optionSubtitle}>
                  Large rooms with multiple beds that are shared with others
                </Text>
              </View>
              <View style={[styles.checkbox, dormitories && styles.checkboxActive]}>
                {dormitories && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
              </View>
            </TouchableOpacity>
          </View>

          {/* ROOMS AND BEDS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rooms and beds</Text>

            <View style={styles.counterItemRow}>
              <Text style={styles.counterItemLabel}>Bedrooms</Text>
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
              <Text style={styles.counterItemLabel}>Beds</Text>
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
              <Text style={styles.counterItemLabel}>Bathrooms</Text>
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

          {/* FACILITIES */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Facilities</Text>

            {[
              { label: 'Kitchen', checked: kitchen, setChecked: setKitchen },
              { label: 'Pool', checked: pool, setChecked: setPool },
              { label: 'Gym', checked: gym, setChecked: setGym },
              { label: 'Outdoor space', checked: outdoorSpace, setChecked: setOutdoorSpace },
              { label: 'Internet access', checked: internetAccess, setChecked: setInternetAccess },
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
            <Text style={styles.clearAllText}>Clear all</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>View Results</Text>
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
