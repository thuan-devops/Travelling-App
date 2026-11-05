import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Accommodation } from '../types';
import { useTheme } from '../context/ThemeContext';

interface DescriptionScreenProps {
  stay: Accommodation;
  onBack: () => void;
}

export const DescriptionScreen: React.FC<DescriptionScreenProps> = ({ stay, onBack }) => {
  const { isDarkMode, colors } = useTheme();
  const heroImage = stay.images?.[1] || stay.images?.[0];
  const descriptionText = stay.fullDescription || stay.description;

  const handleOpenGoogleMaps = () => {
    const query = encodeURIComponent(`${stay.title}, ${stay.location}`);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(googleMapsUrl).catch(() => {
      Alert.alert('Thông báo', 'Không thể mở liên kết Google Maps.');
    });
  };

  const highlights = [
    'Không gian riêng tư, phong cảnh thiên nhiên thoáng đãng và trong lành',
    'Được trang bị đầy đủ các tiện nghi hiện đại cho kỳ nghỉ trọn vẹn',
    'Vị trí thuận lợi để khám phá các địa điểm du lịch và ẩm thực nổi tiếng',
    'Chủ nhà thân thiện, hỗ trợ tận tình suốt thời gian lưu trú',
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Mô tả chi tiết</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Full Image */}
        <Image source={{ uri: heroImage }} style={styles.heroImage} />

        {/* Title */}
        <Text style={[styles.stayTitle, { color: colors.text }]}>{stay.title}</Text>

        {/* Description Text */}
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>{descriptionText}</Text>

        {/* Location & Open Map Link */}
        <View style={[styles.locationRow, { borderColor: colors.border }]}>
          <View style={styles.locationLeft}>
            <Ionicons name="location-sharp" size={20} color="#00BDD6" style={{ marginRight: 6 }} />
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>{stay.location}</Text>
          </View>
          <TouchableOpacity onPress={handleOpenGoogleMaps} style={styles.openMapButton}>
            <Ionicons name="map-outline" size={16} color="#00838F" style={{ marginRight: 4 }} />
            <Text style={styles.openMapText}>Mở Google Maps</Text>
          </TouchableOpacity>
        </View>

        {/* Feature Bullets with Checkmarks */}
        <Text style={[styles.highlightsHeader, { color: colors.text }]}>Điểm nổi bật của chỗ ở</Text>
        <View style={styles.bulletsList}>
          {highlights.map((bullet, idx) => (
            <View key={idx} style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={22} color="#00BDD6" style={styles.checkIcon} />
              <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{bullet}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  heroImage: {
    width: '100%',
    height: 230,
    borderRadius: 14,
    marginBottom: 18,
    backgroundColor: '#F3F4F6',
  },
  stayTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    lineHeight: 32,
  },
  paragraph: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 26,
    marginBottom: 20,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 22,
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  locationText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  openMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  openMapText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00838F',
  },
  highlightsHeader: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 14,
  },
  bulletsList: {
    marginTop: 4,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  checkIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  bulletText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
    lineHeight: 22,
  },
});
