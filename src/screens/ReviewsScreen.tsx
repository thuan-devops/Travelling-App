import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
FlatList,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Accommodation, ReviewItem } from '../types';
import { mockApi } from '../api/mockApi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface ReviewsScreenProps {
  stay: Accommodation;
  onBack: () => void;
  onReviewAdded?: (updatedStay: Accommodation) => void;
}

export const ReviewsScreen: React.FC<ReviewsScreenProps> = ({
  stay,
  onBack,
  onReviewAdded,
}) => {
  const { user } = useAuth();
  const { isDarkMode, colors } = useTheme();
  const [reviews, setReviews] = useState<ReviewItem[]>(stay.reviewsList || []);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newRating, setNewRating] = useState<number>(5);
  const [commentText, setCommentText] = useState<string>('');

  // Lọc đánh giá theo số sao (null = Tất cả, 5, 4, 3, 2, 1)
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | null>(null);

  // Chỉnh sửa đánh giá
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);
  const [editRating, setEditRating] = useState<number>(5);
  const [editComment, setEditComment] = useState<string>('');
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Load persistent reviews from AsyncStorage on mount
  useEffect(() => {
    let isMounted = true;
    mockApi.getReviews(stay.id).then((stored) => {
      if (isMounted && stored) {
        setReviews(stored);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [stay.id]);

  const totalCount = reviews.length;
  const avgScore =
    totalCount > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1)
      : '0.0';

  const starCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((r) => {
    const rounded = Math.min(5, Math.max(1, Math.round(r.rating)));
    starCounts[rounded] = (starCounts[rounded] || 0) + 1;
  });

  const ratingBars = [5, 4, 3, 2, 1].map((star) => {
    const count = starCounts[star] || 0;
    const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
    return { star, fill: `${pct}%`, count };
  });

  // Danh sách đánh giá đã lọc
  const filteredReviews =
    selectedStarFilter === null
      ? reviews
      : reviews.filter((r) => Math.round(r.rating) === selectedStarFilter);

  const handleSubmitReview = async () => {
    if (!commentText.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung đánh giá của bạn.');
      return;
    }

    try {
      const { newReview, updatedStay } = await mockApi.addReview(stay.id, {
        author: user?.name || 'Khách trải nghiệm',
        avatar:
          user?.avatarUrl ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        rating: newRating,
        comment: commentText.trim(),
      });

      setReviews((prev) => [newReview, ...prev]);
      setCommentText('');
      setIsModalOpen(false);

      if (onReviewAdded) {
        onReviewAdded(updatedStay);
      }

      Alert.alert('Cảm ơn bạn!', 'Đánh giá của bạn đã được lưu thành công vào hệ thống.');
    } catch {
      Alert.alert('Lỗi', 'Không thể lưu đánh giá. Vui lòng thử lại.');
    }
  };

  const handleOpenEditModal = (review: ReviewItem) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedReview = async () => {
    if (!editComment.trim()) {
      Alert.alert('Thông báo', 'Nội dung nhận xét không được để trống.');
      return;
    }
    if (!editingReview) return;

    try {
      const { updatedReview, updatedStay } = await mockApi.updateReview(
        stay.id,
        editingReview.id,
        {
          rating: editRating,
          comment: editComment.trim(),
        }
      );

      setReviews((prev) =>
        prev.map((r) => (r.id === updatedReview.id ? updatedReview : r))
      );

      if (onReviewAdded) {
        onReviewAdded(updatedStay);
      }

      setIsEditModalOpen(false);
      setEditingReview(null);
      Alert.alert('Thành công', 'Đã cập nhật đánh giá của bạn!');
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật đánh giá lúc này.');
    }
  };

  const renderReviewItem = ({ item }: { item: ReviewItem }) => (
    <View style={styles.reviewCard}>
      <View style={styles.authorRow}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{item.author}</Text>
          <Text style={styles.reviewDate}>{item.date}</Text>
        </View>

        {/* Cột hiển thị số sao + ICON SỬA ĐÁNH GIÁ */}
        <View style={styles.reviewRightCol}>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Ionicons
                key={s}
                name={s <= item.rating ? 'star' : 'star-outline'}
                size={16}
                color="#F59E0B"
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.editReviewActionBtn}
            onPress={() => handleOpenEditModal(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={14} color="#00BDD6" />
            <Text style={styles.editReviewActionText}>Sửa</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.commentText}>{item.comment}</Text>
    </View>
  );

  return (
    <View style={[styles.outerWrapper, { backgroundColor: colors.background }]}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <StatusBar style={isDarkMode ? "light" : "dark"} />

        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Đánh giá ({selectedStarFilter !== null ? filteredReviews.length : totalCount})
            </Text>
            <TouchableOpacity onPress={() => setIsModalOpen(true)} style={styles.writeButton}>
              <Ionicons name="create-outline" size={22} color="#00BDD6" />
            </TouchableOpacity>
          </View>

        <FlatList
          data={filteredReviews}
          keyExtractor={(item) => item.id}
          renderItem={renderReviewItem}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <View style={styles.summaryContainer}>
              {totalCount > 0 ? (
                <>
                  <View style={styles.statsHeaderRow}>
                    <Text style={styles.totalReviewsHeader}>{totalCount} đánh giá từ du khách</Text>
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
                      <Text style={styles.mainScore}>
                        {avgScore}
                        <Text style={styles.scoreOutOf}>/5</Text>
                      </Text>
                      <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Ionicons
                            key={s}
                            name={s <= Math.round(Number(avgScore)) ? 'star' : 'star-outline'}
                            size={16}
                            color="#F59E0B"
                          />
                        ))}
                      </View>
                    </View>

                    {/* Right Bars - Bấm vào thanh để lọc theo số sao tương ứng */}
                    <View style={styles.barsBlock}>
                      {ratingBars.map((item) => {
                        const isBarActive = selectedStarFilter === item.star;
                        return (
                          <TouchableOpacity
                            key={item.star}
                            style={[
                              styles.barRow,
                              isBarActive && styles.barRowActive,
                            ]}
                            onPress={() =>
                              setSelectedStarFilter((prev) =>
                                prev === item.star ? null : item.star
                              )
                            }
                            activeOpacity={0.7}
                          >
                            <View style={styles.barTrack}>
                              <View
                                style={[
                                  styles.barFill,
                                  { width: item.fill as any },
                                  isBarActive && { backgroundColor: '#00838F' },
                                ]}
                              />
                            </View>
                            <Text
                              style={[
                                styles.starNumberText,
                                isBarActive && styles.starNumberTextActive,
                              ]}
                            >
                              {item.star}★
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* BỘ LỌC ĐÁNH GIÁ THEO SỐ SAO (1★ ĐẾN 5★) */}
                  <View style={styles.filterSection}>
                    <View style={styles.filterSectionHeader}>
                      <Ionicons name="filter" size={16} color="#00BDD6" style={{ marginRight: 6 }} />
                      <Text style={styles.filterSectionTitle}>Lọc theo số sao:</Text>
                      {selectedStarFilter !== null && (
                        <TouchableOpacity
                          onPress={() => setSelectedStarFilter(null)}
                          style={styles.clearFilterBtn}
                        >
                          <Text style={styles.clearFilterBtnText}>Bỏ lọc</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.starChipsContainer}
                    >
                      {/* Nút Tất cả */}
                      <TouchableOpacity
                        style={[
                          styles.filterChip,
                          selectedStarFilter === null && styles.filterChipActive,
                        ]}
                        onPress={() => setSelectedStarFilter(null)}
                        activeOpacity={0.75}
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            selectedStarFilter === null && styles.filterChipTextActive,
                          ]}
                        >
                          Tất cả ({totalCount})
                        </Text>
                      </TouchableOpacity>

                      {/* Các nút từ 5★ đến 1★ */}
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = starCounts[star] || 0;
                        const isActive = selectedStarFilter === star;
                        return (
                          <TouchableOpacity
                            key={star}
                            style={[
                              styles.filterChip,
                              isActive && styles.filterChipActive,
                            ]}
                            onPress={() =>
                              setSelectedStarFilter((prev) => (prev === star ? null : star))
                            }
                            activeOpacity={0.75}
                          >
                            <Ionicons
                              name="star"
                              size={13}
                              color={isActive ? '#FFFFFF' : '#F59E0B'}
                              style={{ marginRight: 4 }}
                            />
                            <Text
                              style={[
                                styles.filterChipText,
                                isActive && styles.filterChipTextActive,
                              ]}
                            >
                              {star} sao ({count})
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                </>
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="chatbubbles-outline" size={44} color="#00BDD6" />
                  <Text style={styles.emptyTitle}>Chưa có đánh giá nào</Text>
                  <Text style={styles.emptySubtitle}>
                    Chỗ ở này chưa có nhận xét nào từ khách hàng. Hãy trải nghiệm và là người đầu tiên chia sẻ cảm nhận!
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyWriteBtn}
                    onPress={() => setIsModalOpen(true)}
                  >
                    <Ionicons name="star" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.emptyWriteBtnText}>Viết đánh giá đầu tiên</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={() => {
            if (totalCount === 0) return null;
            return (
              <View style={styles.noFilterBox}>
                <Ionicons name="search-outline" size={40} color="#9CA3AF" />
                <Text style={styles.noFilterTitle}>
                  Không có đánh giá {selectedStarFilter} sao nào
                </Text>
                <Text style={styles.noFilterSub}>
                  Chưa có nhận xét {selectedStarFilter} sao từ khách hàng cho chỗ ở này.
                </Text>
                <TouchableOpacity
                  style={styles.resetFilterActionBtn}
                  onPress={() => setSelectedStarFilter(null)}
                >
                  <Text style={styles.resetFilterActionBtnText}>
                    Xem tất cả ({totalCount}) đánh giá
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />

        {/* Modal Viết đánh giá mới */}
        <Modal
          visible={isModalOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setIsModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Viết đánh giá</Text>
                <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                  <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalContent}>
                <Text style={styles.ratingLabel}>Bạn cảm thấy trải nghiệm thế nào?</Text>
                <View style={styles.starPickerRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setNewRating(s)}
                      style={{ padding: 6 }}
                    >
                      <Ionicons
                        name={s <= newRating ? 'star' : 'star-outline'}
                        size={34}
                        color="#F59E0B"
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Nội dung nhận xét</Text>
                <TextInput
                  style={styles.reviewInput}
                  placeholder="Chia sẻ trải nghiệm của bạn về phòng, vị trí, tiện nghi và sự tiếp đón..."
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

        {/* Modal Chỉnh sửa đánh giá */}
        <Modal
          visible={isEditModalOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setIsEditModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chỉnh sửa đánh giá</Text>
                <TouchableOpacity onPress={() => setIsEditModalOpen(false)}>
                  <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalContent}>
                <Text style={styles.ratingLabel}>Đánh giá số sao:</Text>
                <View style={styles.starPickerRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setEditRating(s)}
                      style={{ padding: 6 }}
                    >
                      <Ionicons
                        name={s <= editRating ? 'star' : 'star-outline'}
                        size={34}
                        color="#F59E0B"
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Nội dung nhận xét</Text>
                <TextInput
                  style={styles.reviewInput}
                  placeholder="Nhập nội dung nhận xét của bạn..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  value={editComment}
                  onChangeText={setEditComment}
                />

                <View style={styles.modalBtnRow}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setIsEditModalOpen(false)}
                  >
                    <Text style={styles.cancelBtnText}>Hủy</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.submitReviewBtn}
                    onPress={handleSaveEditedReview}
                  >
                    <Text style={styles.submitReviewBtnText}>Lưu cập nhật</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
        </View>
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
    alignItems: 'center',
  },
  container: {
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
  writeButton: {
    padding: 6,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  summaryContainer: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 16,
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
    marginBottom: 16,
  },
  scoreBlock: {
    marginRight: 28,
    alignItems: 'center',
  },
  mainScore: {
    fontSize: 34,
    fontWeight: '800',
    color: '#111827',
  },
  scoreOutOf: {
    fontSize: 15,
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
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  barRowActive: {
    backgroundColor: '#E0F7FA',
  },
  barTrack: {
    flex: 1,
    height: 7,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#00BDD6',
    borderRadius: 4,
  },
  starNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    width: 24,
    textAlign: 'right',
  },
  starNumberTextActive: {
    color: '#00838F',
    fontWeight: '800',
  },
  // Lọc theo số sao
  filterSection: {
    marginTop: 6,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  filterSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    flex: 1,
  },
  clearFilterBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  clearFilterBtnText: {
    fontSize: 13,
    color: '#00BDD6',
    fontWeight: '700',
  },
  starChipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#00BDD6',
    borderColor: '#00BDD6',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyWriteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00BDD6',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyWriteBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  noFilterBox: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 10,
  },
  noFilterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 10,
  },
  noFilterSub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    marginBottom: 16,
  },
  resetFilterActionBtn: {
    backgroundColor: '#E0F7FA',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resetFilterActionBtnText: {
    color: '#00838F',
    fontSize: 13,
    fontWeight: '700',
  },
  reviewCard: {
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
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
  reviewRightCol: {
    alignItems: 'flex-end',
  },
  editReviewActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  editReviewActionText: {
    fontSize: 12,
    color: '#00838F',
    fontWeight: '700',
    marginLeft: 3,
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
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
    marginBottom: 18,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelBtnText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  submitReviewBtn: {
    backgroundColor: '#00BDD6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  submitReviewBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
