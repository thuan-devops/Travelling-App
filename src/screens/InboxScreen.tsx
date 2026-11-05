import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
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
  onViewBooking?: (bookingId?: string) => void;
}

export const InboxScreen: React.FC<InboxScreenProps> = ({
  onTabChange,
  onViewBooking,
}) => {
  const [inboxTab, setInboxTab] = useState<'messages' | 'notifications'>('messages');
  const [notifFilter, setNotifFilter] = useState<'all' | 'trips' | 'other'>('all');

  // Conversations state
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'msg-1',
      sender: 'Ketut Astawa (Chủ nhà - Balian treehouse)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      lastMessage: 'Xin chào! Rất mong được chào đón bạn đến Balian treehouse. Hãy nhắn cho tôi nếu bạn cần hỗ trợ đón tại sân bay nhé!',
      time: '10:30',
      unread: true,
      messages: [
        {
          id: '1',
          sender: 'other',
          text: 'Xin chào! Cảm ơn bạn đã quan tâm và đặt chỗ tại Balian Treehouse.',
          time: '10:28',
        },
        {
          id: '2',
          sender: 'other',
          text: 'Rất mong được chào đón bạn đến Bali. Hãy nhắn cho tôi nếu bạn cần hỗ trợ đón tại sân bay nhé!',
          time: '10:30',
        },
      ],
    },
    {
      id: 'msg-2',
      sender: 'Hỗ trợ khách hàng Travelling App (AI)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      lastMessage: 'Thanh toán của bạn đã thành công! Chúc bạn có một chuyến đi thật tuyệt vời.',
      time: '05:41',
      unread: false,
      isAiSupport: true,
      messages: [
        {
          id: '1',
          sender: 'other',
          text: 'Xin chào! Chúng tôi là bộ phận hỗ trợ du lịch 24/7 của Travelling App.',
          time: '05:40',
        },
        {
          id: '2',
          sender: 'other',
          text: 'Thanh toán đặt chỗ của bạn đã thành công! Biên lai đã được cập nhật. Bạn cần hỗ trợ gì về chuyến đi hoặc hủy/hoàn tiền không?',
          time: '05:41',
        },
      ],
    },
  ]);

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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hộp thư</Text>
      </View>

      {/* Top Segmented Tabs: Tin nhắn & Thông báo */}
      <View style={styles.tabBarContainer}>
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
          {conversations.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.messageRow}
              activeOpacity={0.7}
              onPress={() => handleOpenChat(item)}
            >
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              <View style={styles.messageBody}>
                <View style={styles.topRow}>
                  <Text style={styles.senderName} numberOfLines={1}>
                    {item.sender}
                  </Text>
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
                <Text
                  style={[styles.messageSnippet, item.unread && styles.messageSnippetUnread]}
                  numberOfLines={2}
                >
                  {item.lastMessage}
                </Text>
              </View>
              {item.unread && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* TAB 2: THÔNG BÁO (NOTIFICATIONS) */}
      {inboxTab === 'notifications' && (
        <View style={{ flex: 1 }}>
          {/* Notification Filter Chips & Mark All Read */}
          <View style={styles.notifToolbar}>
            <View style={styles.filterChipsRow}>
              <TouchableOpacity
                style={[styles.chip, notifFilter === 'all' && styles.chipActive]}
                onPress={() => setNotifFilter('all')}
              >
                <Text style={[styles.chipText, notifFilter === 'all' && styles.chipTextActive]}>Tất cả</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, notifFilter === 'trips' && styles.chipActive]}
                onPress={() => setNotifFilter('trips')}
              >
                <Text style={[styles.chipText, notifFilter === 'trips' && styles.chipTextActive]}>Chuyến đi & Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, notifFilter === 'other' && styles.chipActive]}
                onPress={() => setNotifFilter('other')}
              >
                <Text style={[styles.chipText, notifFilter === 'other' && styles.chipTextActive]}>Ưu đãi</Text>
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
                <Ionicons name="notifications-off-outline" size={54} color="#D1D5DB" />
                <Text style={styles.emptyNotifTitle}>Không có thông báo nào</Text>
                <Text style={styles.emptyNotifSub}>
                  Các thông báo về đặt chuyến, xác nhận hủy chuyến và ưu đãi sẽ xuất hiện tại đây.
                </Text>
              </View>
            ) : (
              filteredNotifications.map((notif) => {
                const iconInfo = getNotifIconInfo(notif.type);
                return (
                  <TouchableOpacity
                    key={notif.id}
                    style={[styles.notifCard, !notif.read && styles.notifCardUnread]}
                    onPress={() => handleNotificationPress(notif)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.notifIconWrap, { backgroundColor: iconInfo.bgColor }]}>
                      <Ionicons name={iconInfo.name as any} size={22} color={iconInfo.color} />
                    </View>

                    <View style={styles.notifBody}>
                      <View style={styles.notifTopRow}>
                        <Text style={[styles.notifTitle, !notif.read && styles.notifTitleUnread]}>
                          {notif.title}
                        </Text>
                        <Text style={styles.notifTime}>{notif.time}</Text>
                      </View>

                      <Text style={styles.notifMessage}>{notif.message}</Text>

                      {notif.actionText && (
                        <View style={styles.notifActionRow}>
                          <View style={styles.notifActionBtn}>
                            <Text style={styles.notifActionText}>{notif.actionText}</Text>
                            <Ionicons name="arrow-forward" size={12} color="#00BDD6" style={{ marginLeft: 4 }} />
                          </View>

                          <TouchableOpacity
                            onPress={() => handleDeleteNotif(notif.id)}
                            style={styles.notifDeleteBtn}
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
                          {activeChat.isAiSupport ? 'Trợ lý AI Gemini 24/7' : 'Đang trực tuyến'}
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
                    multiline
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
    maxWidth: 480,
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
