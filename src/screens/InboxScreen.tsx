import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { AppNotification, BottomTabType } from '../types';
import { BottomTabBar } from '../components/BottomTabBar';
import { notificationService } from '../services/notificationService';
import { aiService } from '../services/aiService';
import { useTheme } from '../context/ThemeContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'other';
  text: string;
  time: string;
}

interface Conversation {
  id: string;
  sender: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  messages: ChatMessage[];
  isAiSupport?: boolean;
}

interface InboxScreenProps {
  onTabChange: (tab: BottomTabType) => void;
  onOpenAiSupport?: () => void;
  onViewBooking?: (bookingId?: string) => void;
  onSelectNotification?: (notif: AppNotification) => void;
}

export const InboxScreen: React.FC<InboxScreenProps> = ({
  onTabChange,
  onOpenAiSupport,
  onViewBooking,
  onSelectNotification,
}) => {
  const { isDarkMode, colors } = useTheme();
  const [inboxTab, setInboxTab] = useState<'messages' | 'notifications'>('messages');
  const [notifFilter, setNotifFilter] = useState<'all' | 'trips' | 'other'>('all');

  // Conversations state - Empty by default, no fake/mock host chats
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isAiReplying, setIsAiReplying] = useState<boolean>(false);

  // Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const loadNotifications = async () => {
    const list = await notificationService.getNotifications();
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadMessagesCount = conversations.filter((c) => c.unread).length;
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const handleOpenChat = (conv: Conversation) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unread: false } : c))
    );
    setActiveChat({ ...conv, unread: false });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !activeChat) return;

    const userText = inputMessage.trim();
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...activeChat.messages, userMsg];
    const updatedChat = {
      ...activeChat,
      messages: updatedMessages,
      lastMessage: userMsg.text,
      time: userMsg.time,
    };

    setActiveChat(updatedChat);
    setConversations((prev) =>
      prev.map((c) => (c.id === activeChat.id ? updatedChat : c))
    );
    setInputMessage('');

    // If chat with AI CSKH, call aiService
    if (activeChat.isAiSupport) {
      setIsAiReplying(true);
      try {
        const history = updatedMessages.slice(-4).map((m) => ({
          role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
          text: m.text,
        }));
        const aiRes = await aiService.sendMessage(userText, history);
        const replyMsg: ChatMessage = {
          id: `reply-${Date.now()}`,
          sender: 'other',
          text: aiRes.reply,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };

        setActiveChat((current) => {
          if (!current) return null;
          return {
            ...current,
            messages: [...current.messages, replyMsg],
            lastMessage: replyMsg.text,
            time: replyMsg.time,
          };
        });

        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeChat.id
              ? {
                  ...c,
                  messages: [...c.messages, replyMsg],
                  lastMessage: replyMsg.text,
                  time: replyMsg.time,
                }
              : c
          )
        );
      } catch {
        // Fallback
      } finally {
        setIsAiReplying(false);
      }
    } else {
      // Simulate host reply
      setTimeout(() => {
        const replyMsg: ChatMessage = {
          id: `reply-${Date.now()}`,
          sender: 'other',
          text: 'Cảm ơn bạn! Tôi đã nhận được thông tin và sẽ chuẩn bị chu đáo để đón bạn đúng giờ nhé! 😊',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };

        setActiveChat((current) => {
          if (!current) return null;
          return {
            ...current,
            messages: [...current.messages, replyMsg],
            lastMessage: replyMsg.text,
            time: replyMsg.time,
          };
        });

        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeChat.id
              ? {
                  ...c,
                  messages: [...c.messages, replyMsg],
                  lastMessage: replyMsg.text,
                  time: replyMsg.time,
                }
              : c
          )
        );
      }, 1200);
    }
  };

  const handleNotificationPress = async (notif: AppNotification) => {
    if (!notif.read) {
      const updated = await notificationService.markAsRead(notif.id);
      setNotifications(updated);
    }

    if (onSelectNotification) {
      onSelectNotification(notif);
      return;
    }

    if (notif.bookingId) {
      if (onViewBooking) {
        onViewBooking(notif.bookingId);
      } else {
        onTabChange('Bookings');
      }
    }
  };

  const handleMarkAllRead = async () => {
    const updated = await notificationService.markAllAsRead();
    setNotifications(updated);
  };

  const handleDeleteNotif = async (id: string) => {
    const updated = await notificationService.deleteNotification(id);
    setNotifications(updated);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (notifFilter === 'trips') {
      return n.type === 'booking_success' || n.type === 'booking_cancelled' || n.type === 'trip_reminder';
    }
    if (notifFilter === 'other') {
      return n.type === 'system_promo' || n.type === 'payment_refund';
    }
    return true;
  });

  const getNotifIconInfo = (type: AppNotification['type']) => {
    switch (type) {
      case 'booking_success':
        return { name: 'checkmark-circle', color: '#10B981', bgColor: '#ECFDF5' };
      case 'booking_cancelled':
        return { name: 'close-circle', color: '#EF4444', bgColor: '#FEF2F2' };
      case 'payment_refund':
        return { name: 'cash-outline', color: '#00BDD6', bgColor: '#F0FDFA' };
      case 'trip_reminder':
        return { name: 'airplane-outline', color: '#3B82F6', bgColor: '#EFF6FF' };
      case 'system_promo':
      default:
        return { name: 'gift-outline', color: '#8B5CF6', bgColor: '#F5F3FF' };
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.statusBar} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Hộp thư</Text>
      </View>

      {/* Top Segmented Tabs: Tin nhắn & Thông báo */}
      <View style={[styles.tabBarContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.segmentBtn, inboxTab === 'messages' && styles.segmentBtnActive]}
          onPress={() => setInboxTab('messages')}
          activeOpacity={0.7}
        >
          <Text style={[styles.segmentBtnText, inboxTab === 'messages' && styles.segmentBtnTextActive]}>
            Tin nhắn
          </Text>
          {unreadMessagesCount > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{unreadMessagesCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, inboxTab === 'notifications' && styles.segmentBtnActive]}
          onPress={() => setInboxTab('notifications')}
          activeOpacity={0.7}
        >
          <Text style={[styles.segmentBtnText, inboxTab === 'notifications' && styles.segmentBtnTextActive]}>
            Thông báo
          </Text>
          {unreadNotifsCount > 0 && (
            <View style={[styles.tabBadge, { backgroundColor: '#EF4444' }]}>
              <Text style={styles.tabBadgeText}>{unreadNotifsCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* TAB 1: TIN NHẮN (MESSAGES) */}
      {inboxTab === 'messages' && (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* AI Travel Assistant Hero Card (Liên kết trực tiếp với Trợ lý Du lịch AI) */}
          <TouchableOpacity
            style={[
              styles.aiHeroCard,
              {
                backgroundColor: isDarkMode ? '#1E293B' : '#F0FDFA',
                borderColor: isDarkMode ? '#0D9488' : '#99F6E4',
              },
            ]}
            activeOpacity={0.85}
            onPress={() => {
              if (onOpenAiSupport) {
                onOpenAiSupport();
              }
            }}
          >
            <View style={styles.aiHeroHeader}>
              <View style={[styles.aiIconBadge, { backgroundColor: isDarkMode ? '#0F766E' : '#CCFBF1' }]}>
                <Ionicons name="sparkles" size={20} color="#0D9488" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={styles.aiOnlineRow}>
                  <View style={styles.aiOnlineDot} />
                  <Text style={styles.aiOnlineText}>TRỢ LÝ AI TRỰC TUYẾN 24/7</Text>
                </View>
                <Text style={[styles.aiHeroTitle, { color: colors.text }]}>Trợ lý Du lịch AI</Text>
              </View>
              <View style={styles.aiBadgeTag}>
                <Text style={styles.aiBadgeTagText}>Trợ giúp AI</Text>
              </View>
            </View>

            <Text style={[styles.aiHeroDesc, { color: colors.textSecondary }]}>
              Hỏi đáp ngôn ngữ tự nhiên: Tìm chỗ nghỉ theo ngân sách và tiện ích, tư vấn điểm đến, hỗ trợ chính sách hủy chuyến & hoàn tiền tức thì.
            </Text>

            <View style={styles.aiActionRow}>
              <View style={styles.aiActionBtn}>
                <Text style={styles.aiActionBtnText}>Trò chuyện với AI ngay</Text>
                <Ionicons name="arrow-forward" size={15} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Section Divider */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeaderText, { color: colors.textSecondary }]}>TIN NHẮN VỚI CHỦ NHÀ</Text>
          </View>

          {/* User Conversations or Empty State */}
          {conversations.length === 0 ? (
            <View style={[styles.emptyMessagesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.emptyIconCircle, { backgroundColor: isDarkMode ? '#334155' : '#F3F4F6' }]}>
                <Ionicons name="chatbubbles-outline" size={38} color={isDarkMode ? '#94A3B8' : '#9CA3AF'} />
              </View>
              <Text style={[styles.emptyMessagesTitle, { color: colors.text }]}>Chưa có cuộc trò chuyện nào</Text>
              <Text style={[styles.emptyMessagesSub, { color: colors.textSecondary }]}>
                Khi bạn gửi tin nhắn cho chủ chỗ nghỉ hoặc nhận phản hồi riêng, danh sách liên hệ sẽ hiển thị tại đây.
              </Text>
              <TouchableOpacity
                style={styles.connectAiOutlineBtn}
                onPress={() => onOpenAiSupport && onOpenAiSupport()}
                activeOpacity={0.7}
              >
                <Ionicons name="sparkles-outline" size={16} color="#0D9488" style={{ marginRight: 6 }} />
                <Text style={styles.connectAiOutlineText}>Hỏi Trợ lý AI du lịch</Text>
              </TouchableOpacity>
            </View>
          ) : (
            conversations.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.messageRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
                activeOpacity={0.7}
                onPress={() => handleOpenChat(item)}
              >
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                <View style={styles.messageBody}>
                  <View style={styles.topRow}>
                    <Text style={[styles.senderName, { color: colors.text }]} numberOfLines={1}>
                      {item.sender}
                    </Text>
                    <Text style={[styles.timeText, { color: colors.textSecondary }]}>{item.time}</Text>
                  </View>
                  <Text
                    style={[styles.messageSnippet, { color: colors.textSecondary }, item.unread && styles.messageSnippetUnread]}
                    numberOfLines={2}
                  >
                    {item.lastMessage}
                  </Text>
                </View>
                {item.unread && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* TAB 2: THÔNG BÁO (NOTIFICATIONS) */}
      {inboxTab === 'notifications' && (
        <View style={{ flex: 1 }}>
          {/* Notification Filter Chips & Mark All Read */}
          <View style={[styles.notifToolbar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <View style={styles.filterChipsRow}>
              <TouchableOpacity
                style={[styles.chip, { backgroundColor: isDarkMode ? colors.card : '#FFFFFF', borderColor: colors.border }, notifFilter === 'all' && styles.chipActive]}
                onPress={() => setNotifFilter('all')}
              >
                <Text style={[styles.chipText, { color: isDarkMode && notifFilter !== 'all' ? colors.textSecondary : undefined }, notifFilter === 'all' && styles.chipTextActive]}>Tất cả</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, { backgroundColor: isDarkMode ? colors.card : '#FFFFFF', borderColor: colors.border }, notifFilter === 'trips' && styles.chipActive]}
                onPress={() => setNotifFilter('trips')}
              >
                <Text style={[styles.chipText, { color: isDarkMode && notifFilter !== 'trips' ? colors.textSecondary : undefined }, notifFilter === 'trips' && styles.chipTextActive]}>Chuyến đi & Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, { backgroundColor: isDarkMode ? colors.card : '#FFFFFF', borderColor: colors.border }, notifFilter === 'other' && styles.chipActive]}
                onPress={() => setNotifFilter('other')}
              >
                <Text style={[styles.chipText, { color: isDarkMode && notifFilter !== 'other' ? colors.textSecondary : undefined }, notifFilter === 'other' && styles.chipTextActive]}>Ưu đãi</Text>
              </TouchableOpacity>
            </View>

            {unreadNotifsCount > 0 && (
              <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
                <Text style={styles.markAllBtnText}>Đã đọc tất cả</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Notifications List */}
          <ScrollView contentContainerStyle={styles.notifListContent} showsVerticalScrollIndicator={false}>
            {filteredNotifications.length === 0 ? (
              <View style={styles.emptyNotifContainer}>
                <Ionicons name="notifications-off-outline" size={54} color={isDarkMode ? '#475569' : '#D1D5DB'} />
                <Text style={[styles.emptyNotifTitle, { color: colors.text }]}>Không có thông báo nào</Text>
                <Text style={[styles.emptyNotifSub, { color: colors.textSecondary }]}>
                  Các thông báo về đặt chuyến, xác nhận hủy chuyến và ưu đãi sẽ xuất hiện tại đây.
                </Text>
              </View>
            ) : (
              filteredNotifications.map((notif) => {
                const iconInfo = getNotifIconInfo(notif.type);
                return (
                  <TouchableOpacity
                    key={notif.id}
                    style={[
                      styles.notifCard,
                      { backgroundColor: colors.card, borderColor: colors.border },
                      !notif.read && (isDarkMode ? { backgroundColor: '#1E293B', borderColor: '#0D9488' } : styles.notifCardUnread),
                    ]}
                    onPress={() => handleNotificationPress(notif)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.notifIconWrap, { backgroundColor: isDarkMode ? '#334155' : iconInfo.bgColor }]}>
                      <Ionicons name={iconInfo.name as any} size={22} color={iconInfo.color} />
                    </View>

                    <View style={styles.notifBody}>
                      <View style={styles.notifTopRow}>
                        <Text style={[styles.notifTitle, { color: colors.text }, !notif.read && styles.notifTitleUnread]}>
                          {notif.title}
                        </Text>
                        <Text style={[styles.notifTime, { color: colors.textSecondary }]}>{notif.time}</Text>
                      </View>

                      <Text style={[styles.notifMessage, { color: colors.textSecondary }]}>{notif.message}</Text>

                      {notif.actionText && (
                        <View style={styles.notifActionRow}>
                          <View style={styles.notifActionBtn}>
                            <Text style={styles.notifActionText}>{notif.actionText}</Text>
                            <Ionicons name="arrow-forward" size={12} color="#00BDD6" style={{ marginLeft: 4 }} />
                          </View>

                          <TouchableOpacity
                            onPress={(e: any) => {
                              e?.stopPropagation?.();
                              handleDeleteNotif(notif.id);
                            }}
                            style={styles.notifDeleteBtn}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Ionicons name="trash-outline" size={14} color="#9CA3AF" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>

                    {!notif.read && <View style={styles.notifUnreadBadge} />}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      )}

      {/* CHAT MODAL */}
      <Modal
        visible={!!activeChat}
        animationType="slide"
        transparent={Platform.OS === 'web'}
        onRequestClose={() => setActiveChat(null)}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.chatSafeArea}>
            <View style={styles.phoneContainer}>
              <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
              >
                {/* Chat Header */}
                <View style={styles.chatHeader}>
                  <TouchableOpacity onPress={() => setActiveChat(null)} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#111827" />
                  </TouchableOpacity>
                  {activeChat && (
                    <View style={styles.chatHeaderInfo}>
                      <Image source={{ uri: activeChat.avatar }} style={styles.chatAvatar} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.chatHeaderName} numberOfLines={1}>
                          {activeChat.sender}
                        </Text>
                        <Text style={styles.onlineStatus}>
                          {activeChat.isAiSupport ? 'Trợ lý AI 24/7' : 'Đang trực tuyến'}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Chat Messages */}
                <ScrollView contentContainerStyle={styles.chatScroll} showsVerticalScrollIndicator={false}>
                  {activeChat?.messages.map((m) => (
                    <View
                      key={m.id}
                      style={[
                        styles.bubbleWrap,
                        m.sender === 'user' ? styles.bubbleUserWrap : styles.bubbleOtherWrap,
                      ]}
                    >
                      <View
                        style={[
                          styles.bubble,
                          m.sender === 'user' ? styles.bubbleUser : styles.bubbleOther,
                        ]}
                      >
                        <Text
                          style={[
                            styles.bubbleText,
                            m.sender === 'user' ? styles.bubbleUserText : styles.bubbleOtherText,
                          ]}
                        >
                          {m.text}
                        </Text>
                        <Text
                          style={[
                            styles.bubbleTime,
                            m.sender === 'user' ? styles.bubbleUserTime : styles.bubbleOtherTime,
                          ]}
                        >
                          {m.time}
                        </Text>
                      </View>
                    </View>
                  ))}

                  {isAiReplying && (
                    <View style={styles.aiTypingRow}>
                      <Ionicons name="sparkles" size={14} color="#00BDD6" style={{ marginRight: 6 }} />
                      <Text style={styles.aiTypingText}>AI đang soạn câu trả lời...</Text>
                    </View>
                  )}
                </ScrollView>

                {/* Chat Input */}
                <View style={styles.inputBar}>
                  <TextInput
                    style={styles.chatInput}
                    placeholder="Nhập tin nhắn..."
                    placeholderTextColor="#9CA3AF"
                    value={inputMessage}
                    onChangeText={setInputMessage}
                    returnKeyType="send"
                    blurOnSubmit={true}
                    onSubmitEditing={() => {
                      if (inputMessage.trim()) handleSendMessage();
                    }}
                  />
                  <TouchableOpacity
                    style={[styles.sendBtn, !inputMessage.trim() && styles.sendBtnDisabled]}
                    onPress={handleSendMessage}
                    disabled={!inputMessage.trim()}
                  >
                    <Ionicons
                      name="send"
                      size={18}
                      color={inputMessage.trim() ? '#FFFFFF' : '#9CA3AF'}
                    />
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      <BottomTabBar activeTab="Inbox" onTabChange={onTabChange} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  tabBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  segmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
    paddingHorizontal: 8,
  },
  segmentBtnActive: {
    borderBottomColor: '#00BDD6',
  },
  segmentBtnText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#6B7280',
  },
  segmentBtnTextActive: {
    color: '#00BDD6',
    fontWeight: '700',
  },
  tabBadge: {
    backgroundColor: '#00BDD6',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    marginLeft: 6,
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 80,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
    backgroundColor: '#E5E7EB',
  },
  messageBody: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  messageSnippet: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  messageSnippetUnread: {
    color: '#111827',
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00BDD6',
    marginLeft: 8,
  },
  // AI Hero Card
  aiHeroCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 16,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  aiHeroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiOnlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  aiOnlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 5,
  },
  aiOnlineText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0D9488',
    letterSpacing: 0.5,
  },
  aiHeroTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  aiBadgeTag: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  aiBadgeTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  aiHeroDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  aiActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  aiActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D9488',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  aiActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  // Section Header
  sectionHeaderRow: {
    marginBottom: 10,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  // Empty Messages Card
  emptyMessagesCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyMessagesTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyMessagesSub: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  connectAiOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#0D9488',
    backgroundColor: 'transparent',
  },
  connectAiOutlineText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D9488',
  },
  // Notifications Toolbar
  notifToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#00BDD6',
    borderColor: '#00BDD6',
  },
  chipText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  markAllBtn: {
    paddingVertical: 4,
  },
  markAllBtnText: {
    fontSize: 11.5,
    color: '#00BDD6',
    fontWeight: '600',
  },
  notifListContent: {
    padding: 16,
    paddingBottom: 90,
    gap: 12,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  notifCardUnread: {
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
  },
  notifIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notifBody: {
    flex: 1,
  },
  notifTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  notifTitleUnread: {
    fontWeight: '700',
    color: '#0F172A',
  },
  notifTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  notifMessage: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 8,
  },
  notifActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  notifActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notifActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00BDD6',
  },
  notifDeleteBtn: {
    padding: 4,
  },
  notifUnreadBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#00BDD6',
  },
  emptyNotifContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyNotifTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 14,
    marginBottom: 6,
  },
  emptyNotifSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  // Chat Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? '#F3F4F6' : '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatSafeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 840,
    backgroundColor: '#FFFFFF',
    alignSelf: 'center',
  },
  phoneContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    padding: 6,
    marginRight: 6,
  },
  chatHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chatAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  chatHeaderName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  onlineStatus: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  chatScroll: {
    padding: 16,
    paddingBottom: 20,
  },
  bubbleWrap: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  bubbleUserWrap: {
    justifyContent: 'flex-end',
  },
  bubbleOtherWrap: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleUser: {
    backgroundColor: '#00BDD6',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleUserText: {
    color: '#FFFFFF',
  },
  bubbleOtherText: {
    color: '#1F2937',
  },
  bubbleTime: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  bubbleUserTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  bubbleOtherTime: {
    color: '#9CA3AF',
  },
  aiTypingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 4,
  },
  aiTypingText: {
    fontSize: 12,
    color: '#00BDD6',
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00BDD6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },
});
