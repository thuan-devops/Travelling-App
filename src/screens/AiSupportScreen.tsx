import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Accommodation, BottomTabType } from '../types';
import { BottomTabBar } from '../components/BottomTabBar';
import { aiService, AiChatMessage, AiFilterCriteria } from '../services/aiService';
import { useCurrency } from '../context/CurrencyContext';

interface AiSupportScreenProps {
  onBack: () => void;
  onSelectStay: (stay: Accommodation) => void;
  onApplyFiltersToSearch?: (filters: AiFilterCriteria) => void;
  onTabChange?: (tab: BottomTabType) => void;
}

const DEFAULT_WELCOME_MSG: AiChatMessage = {
  id: 'welcome-msg',
  sender: 'ai',
  text:
    'Xin chào! 👋 Mình là Trợ lý Du lịch AI của Travelling App (được hỗ trợ bởi Google Gemini).\n\n' +
    'Mình có thể tư vấn lịch trình, tìm kiếm chỗ nghỉ thông minh bằng ngôn ngữ tự nhiên, hoặc giải đáp mọi câu hỏi về đặt chỗ & hủy chuyến hoàn tiền.\n\n' +
    'Bạn đang muốn đi đâu hoặc cần hỗ trợ điều gì hôm nay?',
  time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
};

const QUICK_PROMPTS = [
  { label: '🌴 Chỗ nghỉ Bali có hồ bơi dưới $60', query: 'Tìm chỗ nghỉ ở Bali có hồ bơi dưới 60 USD' },
  { label: '⛰️ Phòng view núi ở Đà Lạt', query: 'Gợi ý phòng view núi đẹp và lãng mạn ở Đà Lạt' },
  { label: '🔄 Chính sách hủy chuyến & hoàn tiền', query: 'Chính sách hủy chuyến và hoàn trả tiền của app như thế nào?' },
  { label: '🏕️ Chỗ cắm trại thiên nhiên', query: 'Gợi ý cho mình các địa điểm cắm trại hòa mình với thiên nhiên' },
];

export const AiSupportScreen: React.FC<AiSupportScreenProps> = ({
  onBack,
  onSelectStay,
  onApplyFiltersToSearch,
  onTabChange,
}) => {
  const { formatPrice } = useCurrency();
  const flatListRef = useRef<FlatList>(null);

  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<AiChatMessage[]>([DEFAULT_WELCOME_MSG]);

  // Load chat history from AsyncStorage on startup
  useEffect(() => {
    aiService.getStoredChatHistory().then((history) => {
      if (history && history.length > 0) {
        setMessages(history);
      }
    });
  }, []);

  // Save chat history whenever messages change
  const saveHistoryTimeout = useRef<any>(null);
  useEffect(() => {
    if (messages.length > 1) {
      if (saveHistoryTimeout.current) clearTimeout(saveHistoryTimeout.current);
      saveHistoryTimeout.current = setTimeout(() => {
        aiService.saveChatHistory(messages);
      }, 500);
    }
  }, [messages]);

  useEffect(() => {
    // Scroll to bottom when message arrives
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isLoading]);

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || isLoading) return;

    const userMsg: AiChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build lightweight chat history
      const history = messages.slice(-4).map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
        text: m.text,
      }));

      const response = await aiService.sendMessage(textToSend, history);

      const aiMsg: AiChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.reply,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        recommendedStays: response.recommendedStays,
        intent: response.intent,
        criteria: response.criteria,
        followUps: response.followUps,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: AiChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: 'Xin lỗi bạn, kết nối tới máy chủ AI đang gián đoạn một chút. Bạn vui lòng thử lại nhé!',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    Alert.alert(
      'Xóa lịch sử trò chuyện',
      'Bạn có chắc chắn muốn làm mới và xóa toàn bộ lịch sử tư vấn AI?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Làm mới',
          style: 'destructive',
          onPress: async () => {
            await aiService.clearChatHistory();
            setMessages([
              {
                id: `welcome-reset-${Date.now()}`,
                sender: 'ai',
                text: 'Cuộc trò chuyện đã được làm mới. Hãy cho mình biết bạn muốn tìm chỗ nghỉ hoặc cần hỗ trợ gì nhé!',
                time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          },
        },
      ]
    );
  };

  const renderRecommendedStayCard = (stay: Accommodation) => {
    return (
      <TouchableOpacity
        key={stay.id}
        style={styles.stayCard}
        onPress={() => onSelectStay(stay)}
        activeOpacity={0.88}
      >
        <Image
          source={{
            uri:
              stay.images?.[0] ||
              'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
          }}
          style={styles.stayImage}
        />
        <View style={styles.stayContent}>
          <View style={styles.stayHeaderRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{stay.category}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#F59E0B" style={{ marginRight: 3 }} />
              <Text style={styles.ratingText}>{stay.rating.toFixed(1)}</Text>
            </View>
          </View>

          <Text style={styles.stayTitle} numberOfLines={1}>
            {stay.title}
          </Text>
          <Text style={styles.stayLocation} numberOfLines={1}>
            <Ionicons name="location-outline" size={12} color="#6B7280" /> {stay.location}
          </Text>

          <View style={styles.stayFooter}>
            <View>
              <Text style={styles.priceLabel}>Chỉ từ</Text>
              <Text style={styles.priceValue}>
                {formatPrice(stay.pricePerNight)}
                <Text style={styles.priceUnit}> /đêm</Text>
              </Text>
            </View>

            <View style={styles.viewStayBtn}>
              <Text style={styles.viewStayBtnText}>Xem chi tiết</Text>
              <Ionicons name="arrow-forward" size={13} color="#00BDD6" style={{ marginLeft: 3 }} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMessageItem = ({ item, index }: { item: AiChatMessage; index: number }) => {
    const isUser = item.sender === 'user';
    const isLatest = index === messages.length - 1;

    return (
      <View style={[styles.messageRow, isUser ? styles.userMessageRow : styles.aiMessageRow]}>
        {!isUser && (
          <View style={styles.aiAvatarContainer}>
            <Ionicons name="sparkles" size={16} color="#FFFFFF" />
          </View>
        )}

        <View style={[styles.bubbleContainer, isUser ? styles.userBubble : styles.aiBubble]}>
          {!isUser && (
            <View style={styles.aiSenderHeader}>
              <Text style={styles.aiSenderName}>Trợ lý AI Travelling</Text>
              <View style={styles.geminiBadge}>
                <Text style={styles.geminiBadgeText}>Gemini</Text>
              </View>
            </View>
          )}

          <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.aiMessageText]}>
            {item.text}
          </Text>

          {/* If AI recommended stays */}
          {item.recommendedStays && item.recommendedStays.length > 0 && (
            <View style={styles.recommendationsSection}>
              <Text style={styles.recommendationsTitle}>
                <Ionicons name="bed-outline" size={14} color="#00BDD6" /> Gợi ý chỗ nghỉ dành cho bạn:
              </Text>
              <View style={styles.staysListContainer}>
                {item.recommendedStays.map((stay) => renderRecommendedStayCard(stay))}
              </View>
            </View>
          )}

          {/* Action button to apply criteria to Search Results Screen */}
          {!isUser && item.criteria && onApplyFiltersToSearch && (
            <TouchableOpacity
              style={styles.applyFilterButton}
              onPress={() => onApplyFiltersToSearch(item.criteria!)}
              activeOpacity={0.8}
            >
              <Ionicons name="search" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.applyFilterButtonText}>
                Xem tất cả trên trang Tìm kiếm ({item.criteria.destination || 'Bộ lọc AI'})
              </Text>
              <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          <Text style={[styles.timeText, isUser ? styles.userTimeText : styles.aiTimeText]}>
            {item.time}
          </Text>

          {/* Follow-up question chips on the latest AI message */}
          {!isUser && isLatest && item.followUps && item.followUps.length > 0 && !isLoading && (
            <View style={styles.followUpsContainer}>
              <Text style={styles.followUpsTitle}>Gợi ý câu hỏi tiếp theo:</Text>
              <View style={styles.followUpsWrap}>
                {item.followUps.map((prompt, pIdx) => (
                  <TouchableOpacity
                    key={pIdx}
                    style={styles.followUpChip}
                    onPress={() => handleSend(prompt)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="chatbubble-ellipses-outline" size={12} color="#00BDD6" style={{ marginRight: 4 }} />
                    <Text style={styles.followUpText}>{prompt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>Trợ lý Du lịch AI</Text>
            <View style={styles.activeDot} />
          </View>
          <Text style={styles.headerSubtitle}>Trợ giúp & Hỗ trợ thông minh 24/7</Text>
        </View>

        <TouchableOpacity style={styles.clearButton} onPress={handleClearChat} activeOpacity={0.7}>
          <Ionicons name="refresh-outline" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Quick Prompts Carousel */}
      <View style={styles.quickPromptsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickPromptsContainer}
        >
          {QUICK_PROMPTS.map((prompt, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.quickPromptChip}
              onPress={() => handleSend(prompt.query)}
              disabled={isLoading}
              activeOpacity={0.75}
            >
              <Text style={styles.quickPromptText}>{prompt.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Chat Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
        style={styles.keyboardContainer}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() =>
            isLoading ? (
              <View style={styles.loadingContainer}>
                <View style={styles.aiAvatarContainer}>
                  <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                </View>
                <View style={styles.loadingBubble}>
                  <ActivityIndicator size="small" color="#00BDD6" />
                  <Text style={styles.loadingText}>AI đang phân tích và tìm chỗ nghỉ phù hợp...</Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Hỏi AI tìm phòng, tư vấn du lịch, hủy chuyến..."
            placeholderTextColor="#9CA3AF"
            value={inputMessage}
            onChangeText={setInputMessage}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputMessage.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={() => handleSend()}
            disabled={!inputMessage.trim() || isLoading}
            activeOpacity={0.8}
          >
            <Ionicons
              name="send"
              size={18}
              color={inputMessage.trim() && !isLoading ? '#FFFFFF' : '#9CA3AF'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Optional Bottom Tab Bar */}
      {onTabChange && <BottomTabBar activeTab="Profile" onTabChange={onTabChange} />}
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
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 6,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginLeft: 6,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  clearButton: {
    padding: 6,
  },
  quickPromptsWrapper: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
  },
  quickPromptsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickPromptChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickPromptText: {
    fontSize: 12.5,
    color: '#334155',
    fontWeight: '500',
  },
  keyboardContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  aiMessageRow: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  aiAvatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00BDD6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  bubbleContainer: {
    maxWidth: '85%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: '#00BDD6',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  aiSenderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  aiSenderName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  geminiBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  geminiBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 21,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: '#1F2937',
  },
  timeText: {
    fontSize: 10,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  userTimeText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  aiTimeText: {
    color: '#9CA3AF',
  },
  recommendationsSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  recommendationsTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  staysListContainer: {
    gap: 10,
  },
  stayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  stayImage: {
    width: '100%',
    height: 110,
    backgroundColor: '#E2E8F0',
  },
  stayContent: {
    padding: 10,
  },
  stayHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2563EB',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  stayTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  stayLocation: {
    fontSize: 11.5,
    color: '#64748B',
    marginBottom: 8,
  },
  stayFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceLabel: {
    fontSize: 10,
    color: '#94A3B8',
  },
  priceValue: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#00BDD6',
  },
  priceUnit: {
    fontSize: 11,
    fontWeight: '400',
    color: '#64748B',
  },
  viewStayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  viewStayBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00BDD6',
  },
  applyFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00BDD6',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  applyFilterButtonText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
    flex: 1,
  },
  followUpsContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  followUpsTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  followUpsWrap: {
    gap: 6,
  },
  followUpChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignSelf: 'flex-start',
  },
  followUpText: {
    fontSize: 12,
    color: '#0F766E',
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  loadingText: {
    fontSize: 12.5,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00BDD6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
});
