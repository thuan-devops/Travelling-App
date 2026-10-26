import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Accommodation } from '../types';

interface FacilitiesScreenProps {
  stay: Accommodation;
  onBack: () => void;
}

export const FacilitiesScreen: React.FC<FacilitiesScreenProps> = ({ stay, onBack }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Facilities & services</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* FACILITIES SECTION */}
        <Text style={styles.sectionTitle}>Facilities</Text>
        <Text style={styles.summaryText}>
          {stay.maxGuests || 2} Guests   {stay.bedrooms || 1} bedroom   {stay.beds || 1} bed   {stay.bathrooms || 1} bath
        </Text>

        <View style={styles.itemsList}>
          <View style={styles.facilityRow}>
            <Ionicons name="wifi-outline" size={22} color="#111827" style={styles.itemIcon} />
            <Text style={styles.itemText}>Wifi</Text>
          </View>
          <View style={styles.facilityRow}>
            <Ionicons name="restaurant-outline" size={22} color="#111827" style={styles.itemIcon} />
            <Text style={styles.itemText}>Kitchen</Text>
          </View>
          <View style={styles.facilityRow}>
            <Ionicons name="barbell-outline" size={22} color="#111827" style={styles.itemIcon} />
            <Text style={styles.itemText}>Exercise equipment</Text>
          </View>
          <View style={styles.facilityRow}>
            <Ionicons name="water-outline" size={22} color="#111827" style={styles.itemIcon} />
            <Text style={styles.itemText}>Pool</Text>
          </View>
          <View style={styles.facilityRow}>
            <Ionicons name="leaf-outline" size={22} color="#111827" style={styles.itemIcon} />
            <Text style={styles.itemText}>Garden</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* SERVICES SECTION */}
        <Text style={styles.sectionTitle}>Services</Text>
        <Text style={styles.subCategoryHeader}>Cleaning & laundry</Text>

        <View style={styles.itemsList}>
          <View style={styles.facilityRow}>
            <Ionicons name="apps-outline" size={22} color="#111827" style={styles.itemIcon} />
            <Text style={styles.itemText}>Washer</Text>
          </View>
          <View style={styles.facilityRow}>
            <Ionicons name="cube-outline" size={22} color="#111827" style={styles.itemIcon} />
            <Text style={styles.itemText}>Free dryer - In unit</Text>
          </View>
          <View style={styles.facilityRow}>
            <Ionicons name="shirt-outline" size={22} color="#111827" style={styles.itemIcon} />
            <Text style={styles.itemText}>Iron</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* BATHROOM SECTION */}
        <Text style={styles.subCategoryHeader}>Bathroom</Text>

        <View style={styles.itemsList}>
          <View style={styles.facilityRow}>
            <Ionicons name="bed-outline" size={22} color="#111827" style={styles.itemIcon} />
            <Text style={styles.itemText}>Bathtub</Text>
          </View>
          <View style={styles.facilityRow}>
            <Ionicons name="flash-outline" size={22} color="#111827" style={styles.itemIcon} />
            <Text style={styles.itemText}>Hair dryer</Text>
          </View>
        </View>
      </ScrollView>
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
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 20,
  },
  subCategoryHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 6,
    marginBottom: 16,
  },
  itemsList: {
    marginBottom: 10,
  },
  facilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  itemIcon: {
    marginRight: 16,
    width: 24,
  },
  itemText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 18,
  },
});
