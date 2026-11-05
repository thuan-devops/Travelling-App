import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Accommodation } from '../types';
import { getAmenityIcon } from '../api/mockApi';
import { useTheme } from '../context/ThemeContext';

interface FacilitiesScreenProps {
  stay: Accommodation;
  onBack: () => void;
}

export const FacilitiesScreen: React.FC<FacilitiesScreenProps> = ({ stay, onBack }) => {
  const { isDarkMode, colors } = useTheme();
  const facilities =
    stay.facilitiesBreakdown?.facilities && stay.facilitiesBreakdown.facilities.length > 0
      ? stay.facilitiesBreakdown.facilities
      : stay.amenities || [];

  const services =
    stay.facilitiesBreakdown?.services && stay.facilitiesBreakdown.services.length > 0
      ? stay.facilitiesBreakdown.services
      : ['Dọn phòng định kỳ', 'Hỗ trợ khách hàng 24/7'];

  const bathroom =
    stay.facilitiesBreakdown?.bathroom && stay.facilitiesBreakdown.bathroom.length > 0
      ? stay.facilitiesBreakdown.bathroom
      : ['Phòng tắm riêng biệt', 'Khăn tắm cao cấp', 'Máy sấy tóc'];

  return (
    <View style={[styles.outerWrapper, { backgroundColor: colors.background }]}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <StatusBar style={isDarkMode ? "light" : "dark"} />

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Tiện ích & dịch vụ</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* FACILITIES SECTION */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tiện ích</Text>
          <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
            {stay.maxGuests || 2} Khách   {stay.bedrooms || 1} phòng ngủ   {stay.beds || 1} giường   {stay.bathrooms || 1} phòng tắm
          </Text>

          <View style={styles.itemsList}>
            {facilities.map((fac, idx) => (
              <View key={`fac-${idx}`} style={[styles.facilityRow, { borderBottomColor: colors.border }]}>
                <Ionicons name={getAmenityIcon(fac)} size={22} color="#00BDD6" style={styles.itemIcon} />
                <Text style={[styles.itemText, { color: colors.text }]}>{fac}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* SERVICES SECTION */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Dịch vụ</Text>
          <Text style={[styles.subCategoryHeader, { color: colors.text }]}>Dịch vụ & tiện nghi bổ sung</Text>

          <View style={styles.itemsList}>
            {services.map((srv, idx) => (
              <View key={`srv-${idx}`} style={[styles.facilityRow, { borderBottomColor: colors.border }]}>
                <Ionicons name={getAmenityIcon(srv)} size={22} color="#00BDD6" style={styles.itemIcon} />
                <Text style={[styles.itemText, { color: colors.text }]}>{srv}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* BATHROOM SECTION */}
          <Text style={[styles.subCategoryHeader, { color: colors.text }]}>Phòng tắm & vệ sinh cá nhân</Text>

          <View style={styles.itemsList}>
            {bathroom.map((bath, idx) => (
              <View key={`bath-${idx}`} style={[styles.facilityRow, { borderBottomColor: colors.border }]}>
                <Ionicons name={getAmenityIcon(bath)} size={22} color="#00BDD6" style={styles.itemIcon} />
                <Text style={[styles.itemText, { color: colors.text }]}>{bath}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 840,
    alignSelf: 'center',
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
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 18,
    lineHeight: 22,
  },
  subCategoryHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 14,
    marginTop: 8,
  },
  itemsList: {
    marginBottom: 8,
  },
  facilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  itemIcon: {
    marginRight: 14,
    width: 26,
  },
  itemText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 18,
  },
});
