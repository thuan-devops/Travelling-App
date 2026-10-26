import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Accommodation } from '../types';

interface DescriptionScreenProps {
  stay: Accommodation;
  onBack: () => void;
}

export const DescriptionScreen: React.FC<DescriptionScreenProps> = ({ stay, onBack }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mô tả</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Full Image */}
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80' }}
          style={styles.heroImage}
        />

        {/* Description Text */}
        <Text style={styles.paragraph}>
          {stay.fullDescription || stay.description || 'Bạn đang tìm kiếm một nơi hoàn hảo để thư giãn và nghỉ dưỡng? Biệt thự nghỉ dưỡng Bali tuyệt đẹp này là điểm đến nhiệt đới lý tưởng. Tọa lạc trên con phố yên tĩnh chỉ cách bãi biển vài phút, ngôi nhà xinh đẹp này có mọi thứ bạn cần cho một kỳ nghỉ sang trọng và thoải mái.'}
        </Text>

        {/* Location & Open Map Link */}
        <View style={styles.locationRow}>
          <View style={styles.locationLeft}>
            <Ionicons name="location-sharp" size={18} color="#00BDD6" style={{ marginRight: 6 }} />
            <Text style={styles.locationText}>{stay.location}</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.openMapText}>Mở bản đồ</Text>
          </TouchableOpacity>
        </View>

        {/* Feature Bullets with Checkmarks */}
        <View style={styles.bulletsList}>
          <View style={styles.bulletItem}>
            <Ionicons name="checkmark" size={18} color="#00BDD6" style={styles.checkIcon} />
            <Text style={styles.bulletText}>Không gian thiết kế nhiệt đới thoáng mát, gần gũi thiên nhiên</Text>
          </View>
          <View style={styles.bulletItem}>
            <Ionicons name="checkmark" size={18} color="#00BDD6" style={styles.checkIcon} />
            <Text style={styles.bulletText}>Bể bơi riêng thư giãn và khu vực tắm nắng ngoài trời</Text>
          </View>
          <View style={styles.bulletItem}>
            <Ionicons name="checkmark" size={18} color="#00BDD6" style={styles.checkIcon} />
            <Text style={styles.bulletText}>Chỉ mất 5 phút đi bộ đến bãi biển và các nhà hàng địa phương</Text>
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
    paddingTop: 16,
    paddingBottom: 40,
  },
  heroImage: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
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
    marginBottom: 20,
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  openMapText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#00BDD6',
  },
  bulletsList: {
    marginTop: 4,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkIcon: {
    marginRight: 10,
  },
  bulletText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
});
