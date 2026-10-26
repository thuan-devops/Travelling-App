import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Accommodation, ReviewItem } from '../types';
import { SAMPLE_REVIEWS } from '../api/mockApi';

interface ReviewsScreenProps {
  stay: Accommodation;
  onBack: () => void;
}

export const ReviewsScreen: React.FC<ReviewsScreenProps> = ({ stay, onBack }) => {
  const reviews: ReviewItem[] = stay.reviewsList || SAMPLE_REVIEWS;

  const ratingBars = [
    { star: 5, fill: '80%' },
    { star: 4, fill: '55%' },
    { star: 3, fill: '25%' },
    { star: 2, fill: '15%' },
    { star: 1, fill: '5%' },
  ];

  const renderReviewItem = ({ item }: { item: ReviewItem }) => (
    <View style={styles.reviewCard}>
      <View style={styles.authorRow}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{item.author}</Text>
          <Text style={styles.reviewDate}>{item.date}</Text>
        </View>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Ionicons
              key={s}
              name={s <= item.rating ? 'star' : 'star-outline'}
              size={15}
              color="#F59E0B"
            />
          ))}
        </View>
      </View>
      <Text style={styles.commentText}>{item.comment}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reviews</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={renderReviewItem}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={styles.summaryContainer}>
            <Text style={styles.totalReviewsHeader}>{stay.reviewCount || 262} reviews</Text>

            <View style={styles.ratingStatsRow}>
              {/* Left Score */}
              <View style={styles.scoreBlock}>
                <Text style={styles.mainScore}>4.5<Text style={styles.scoreOutOf}>/5</Text></Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Ionicons key={s} name="star" size={16} color="#F59E0B" />
                  ))}
                </View>
              </View>

              {/* Right Bars */}
              <View style={styles.barsBlock}>
                {ratingBars.map((item) => (
                  <View key={item.star} style={styles.barRow}>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: item.fill as any }]} />
                    </View>
                    <Text style={styles.starNumberText}>{item.star}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.divider} />
          </View>
        )}
      />
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
  summaryContainer: {
    marginBottom: 8,
  },
  totalReviewsHeader: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  ratingStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  scoreBlock: {
    width: '40%',
  },
  mainScore: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  scoreOutOf: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  barsBlock: {
    width: '56%',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginRight: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },
  starNumberText: {
    fontSize: 12,
    color: '#6B7280',
    width: 14,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
  },
  reviewCard: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  authorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  starsRow: {
    flexDirection: 'row',
  },
  commentText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
});
