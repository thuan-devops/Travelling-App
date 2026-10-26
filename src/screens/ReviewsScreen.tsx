import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Accommodation, ReviewItem } from '../types';
import { SAMPLE_REVIEWS, mockApi } from '../api/mockApi';
import { useAuth } from '../context/AuthContext';

interface ReviewsScreenProps {
  stay: Accommodation;
  onBack: () => void;
}

export const ReviewsScreen: React.FC<ReviewsScreenProps> = ({ stay, onBack }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewItem[]>(stay.reviewsList || SAMPLE_REVIEWS);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newRating, setNewRating] = useState<number>(5);
  const [commentText, setCommentText] = useState<string>('');

  const ratingBars = [
    { star: 5, fill: '80%' },
    { star: 4, fill: '55%' },
    { star: 3, fill: '25%' },
    { star: 2, fill: '15%' },
    { star: 1, fill: '5%' },
  ];

  const handleSubmitReview = async () => {
    if (!commentText.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung đánh giá của bạn.');
      return;
    }

    const newRev = await mockApi.addReview(stay.id, {
      author: user?.name || 'Khách trải nghiệm',
      avatar: user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      rating: newRating,
      comment: commentText.trim(),
    });

    setReviews([newRev, ...reviews]);
    setCommentText('');
    setIsModalOpen(false);
    Alert.alert('Cảm ơn bạn!', 'Đánh giá của bạn đã được đăng thành công.');
  };

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
        <Text style={styles.headerTitle}>Đánh giá ({reviews.length})</Text>
        <TouchableOpacity onPress={() => setIsModalOpen(true)} style={styles.writeButton}>
          <Ionicons name="create-outline" size={20} color="#00BDD6" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={renderReviewItem}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={styles.summaryContainer}>
            <View style={styles.statsHeaderRow}>
              <Text style={styles.totalReviewsHeader}>{reviews.length} đánh giá từ du khách</Text>
              <TouchableOpacity
                style={styles.addReviewBtn}
                onPress={() => setIsModalOpen(true)}
              >
                <Ionicons name="star" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.addReviewBtnText}>Viết đánh giá</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.ratingStatsRow}>
              {/* Left Score */}
              <View style={styles.scoreBlock}>
                <Text style={styles.mainScore}>4.8<Text style={styles.scoreOutOf}>/5</Text></Text>
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
          </View>
        )}
      />

      {/* Review Modal */}
      <Modal visible={isModalOpen} transparent animationType="slide" onRequestClose={() => setIsModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Viết đánh giá của bạn</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.ratingLabel}>Bạn cảm thấy trải nghiệm thế nào?</Text>
              <View style={styles.starPickerRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <TouchableOpacity key={s} onPress={() => setNewRating(s)} style={{ padding: 4 }}>
                    <Ionicons
                      name={s <= newRating ? 'star' : 'star-outline'}
                      size={32}
                      color="#F59E0B"
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Nội dung nhận xét</Text>
              <TextInput
                style={styles.reviewInput}
                placeholder="Chia sẻ trải nghiệm của bạn về phòng, vị trí, tiện nghi và chủ nhà..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                value={commentText}
                onChangeText={setCommentText}
              />

              <TouchableOpacity style={styles.submitReviewBtn} onPress={handleSubmitReview}>
                <Text style={styles.submitReviewBtnText}>Đăng đánh giá</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  writeButton: {
    padding: 6,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  summaryContainer: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 20,
  },
  statsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalReviewsHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  addReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00BDD6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addReviewBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ratingStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreBlock: {
    marginRight: 32,
    alignItems: 'center',
  },
  mainScore: {
    fontSize: 36,
    fontWeight: '800',
    color: '#111827',
  },
  scoreOutOf: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  barsBlock: {
    flex: 1,
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
    overflow: 'hidden',
    marginRight: 8,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#00BDD6',
    borderRadius: 3,
  },
  starNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    width: 12,
  },
  reviewCard: {
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
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
  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  modalContent: {
    padding: 20,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  starPickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitReviewBtn: {
    backgroundColor: '#00BDD6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitReviewBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
