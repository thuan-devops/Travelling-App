import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Accommodation } from '../types';

interface RoomDetailScreenProps {
  stay: Accommodation;
  onBack: () => void;
  onToggleFavorite: (id: string) => void;
  onOpenFacilities: () => void;
  onOpenReviews: () => void;
  onOpenDescription: () => void;
  onBookNow: () => void;
}

const { width } = Dimensions.get('window');

export const RoomDetailScreen: React.FC<RoomDetailScreenProps> = ({
  stay,
  onBack,
  onToggleFavorite,
  onOpenFacilities,
  onOpenReviews,
  onOpenDescription,
  onBookNow,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const images = stay.images?.length > 0
    ? stay.images
    : ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80'];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* HERO IMAGE SLIDER (Page 10) */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const slide = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveImageIndex(slide);
            }}
            scrollEventThrottle={16}
          >
            {images.map((img, index) => (
              <Image key={index} source={{ uri: img }} style={styles.heroImage} />
            ))}
          </ScrollView>

          {/* Floating Top Controls */}
          <SafeAreaView style={styles.floatingHeader}>
            <TouchableOpacity style={styles.circleButton} onPress={onBack}>
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => onToggleFavorite(stay.id)}
            >
              <Ionicons
                name={stay.isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={stay.isFavorite ? '#EF4444' : '#FFFFFF'}
              />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Photos Counter Badge */}
          <View style={styles.photoCountBadge}>
            <Ionicons name="images-outline" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.photoCountText}>24</Text>
          </View>
        </View>

        {/* DETAILS BODY */}
        <View style={styles.body}>
          {/* TITLE & LOCATION */}
          <Text style={styles.title}>{stay.title}</Text>

          <View style={styles.locationRow}>
            <View style={styles.locationLeft}>
              <Ionicons name="location-sharp" size={16} color="#00BDD6" style={{ marginRight: 4 }} />
              <Text style={styles.locationText}>{stay.location}</Text>
            </View>
            <TouchableOpacity onPress={onOpenDescription}>
              <Text style={styles.viewMapText}>Xem bản đồ</Text>
            </TouchableOpacity>
          </View>

          {/* RATING & REVIEWS */}
          <TouchableOpacity style={styles.ratingRow} activeOpacity={0.7} onPress={onOpenReviews}>
            <View style={styles.ratingLeft}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.ratingNumber}> {stay.rating || 4.5}/5</Text>
            </View>
            <View style={styles.reviewsRight}>
              <Text style={styles.reviewCountText}>{stay.reviewCount || 262} đánh giá</Text>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* FACILITIES & SERVICES */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tiện ích & dịch vụ</Text>

            <Text style={styles.facilitiesSub}>
              {stay.maxGuests || 2} Khách   {stay.bedrooms || 1} phòng ngủ   {stay.beds || 1} giường   {stay.bathrooms || 1} phòng tắm
            </Text>

            <View style={styles.facilitiesGrid}>
              <View style={styles.facilityItem}>
                <Ionicons name="wifi-outline" size={20} color="#374151" />
                <Text style={styles.facilityName}>Wifi</Text>
              </View>
              <View style={styles.facilityItem}>
                <Ionicons name="restaurant-outline" size={20} color="#374151" />
                <Text style={styles.facilityName}>Bếp</Text>
              </View>
              <View style={styles.facilityItem}>
                <Ionicons name="water-outline" size={20} color="#374151" />
                <Text style={styles.facilityName}>Hồ bơi</Text>
              </View>
              <View style={styles.facilityItem}>
                <Ionicons name="leaf-outline" size={20} color="#374151" />
                <Text style={styles.facilityName}>Sân vườn</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.outlineButton} onPress={onOpenFacilities}>
              <Text style={styles.outlineButtonText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* REVIEWS PREVIEW */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Đánh giá</Text>
              <TouchableOpacity onPress={onOpenReviews}>
                <Text style={styles.seeAllText}>Xem tất cả &gt;</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.bigScore}>4.5<Text style={styles.scoreDenominator}>/5</Text></Text>

            {/* Review card item */}
            <View style={styles.reviewCard}>
              <View style={styles.reviewAuthorRow}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80' }}
                  style={styles.authorAvatar}
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.authorName}>Jinny Oslin</Text>
                  <Text style={styles.reviewDate}>1 ngày trước</Text>
                </View>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Ionicons key={s} name="star" size={14} color="#F59E0B" />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewComment} numberOfLines={2}>
                Vị trí tuyệt vời, nhà rộng rãi sạch sẽ, tiện nghi xuất sắc. Chúng tôi rất thích!
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* POLICIES */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chính sách</Text>
            <Text style={styles.policySubHeader}>Quy định chỗ ở</Text>

            <View style={styles.ruleItem}>
              <Ionicons name="time-outline" size={18} color="#6B7280" />
              <Text style={styles.ruleText}>Giờ nhận phòng sớm nhất: 14:00</Text>
            </View>
            <View style={styles.ruleItem}>
              <Ionicons name="time-outline" size={18} color="#6B7280" />
              <Text style={styles.ruleText}>Giờ trả phòng muộn nhất: 12:00</Text>
            </View>

            <Text style={[styles.policySubHeader, { marginTop: 14 }]}>Chính sách nhận phòng</Text>
            <Text style={styles.policyDesc} numberOfLines={2}>
              Nên xác nhận trực tiếp chính sách nhận phòng với chủ nhà/quản lý trước khi đến để sắp xếp di chuyển thuận lợi...
            </Text>

            <TouchableOpacity style={styles.outlineButton} onPress={onOpenDescription}>
              <Text style={styles.outlineButtonText}>Xem thêm &gt;</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* DESCRIPTION PREVIEW */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả</Text>

            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80' }}
              style={styles.descThumbnail}
            />

            <Text style={styles.descParagraph} numberOfLines={3}>
              Bạn đang tìm kiếm một nơi hoàn hảo để thư giãn và nghỉ ngơi? Biệt thự nghỉ dưỡng Bali tuyệt đẹp này là điểm đến nhiệt đới lý tưởng...
            </Text>

            <TouchableOpacity style={styles.outlineButton} onPress={onOpenDescription}>
              <Text style={styles.outlineButtonText}>Xem thêm &gt;</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* FIXED BOTTOM BAR */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.fromPriceLabel}>
            Chỉ từ: <Text style={styles.bottomPrice}>${stay.pricePerNight}</Text>/đêm
          </Text>
        </View>
        <TouchableOpacity style={styles.bookNowButton} activeOpacity={0.8} onPress={onBookNow}>
          <Text style={styles.bookNowText}>Đặt phòng ngay</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    width: '100%',
    height: 320,
    position: 'relative',
  },
  heroImage: {
    width,
    height: 320,
    resizeMode: 'cover',
  },
  floatingHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 24,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  circleButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  viewMapText: {
    fontSize: 14,
    color: '#00BDD6',
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  ratingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  reviewsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewCountText: {
    fontSize: 14,
    color: '#4B5563',
    marginRight: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 18,
  },
  section: {
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  seeAllText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
  },
  facilitiesSub: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 14,
  },
  facilitiesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  facilityName: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 6,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  outlineButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  bigScore: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  scoreDenominator: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  reviewCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 14,
    marginTop: 6,
  },
  reviewAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  starsRow: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  policySubHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ruleText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  policyDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  descThumbnail: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginVertical: 10,
  },
  descParagraph: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  bottomBar: {
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  fromPriceLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  bottomPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  bookNowButton: {
    backgroundColor: '#00BDD6',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },
  bookNowText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
