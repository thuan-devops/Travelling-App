import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { BottomTabType } from '../types';
import { BottomTabBar } from '../components/BottomTabBar';

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
}

interface InboxScreenProps {
  onTabChange: (tab: BottomTabType) => void;
}

export const InboxScreen: React.FC<InboxScreenProps> = ({ onTabChange }) => {
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
          text: 'Xin chào! Cảm ơn bạn đã quan tâm và đặt phòng tại Balian Treehouse.',
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
      sender: 'Hỗ trợ khách hàng Travelling App',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      lastMessage: 'Thanh toán của bạn đã thành công! Chúc bạn có một chuyến đi thật tuyệt vời.',
      time: '05:41',
      unread: false,
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
          text: 'Thanh toán đặt phòng của bạn đã thành công! Biên lai đã được cập nhật. Bạn cần hỗ trợ gì thêm không?',
          time: '05:41',
        },
      ],
    },
  ]);

  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [inputMessage, setInputMessage] = useState<string>('');

  const handleOpenChat = (conv: Conversation) => {
    // Mark as read
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unread: false } : c))
    );
    setActiveChat({ ...conv, unread: false });
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !activeChat) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: inputMessage.trim(),
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

    // Simulate friendly auto-reply after 1.2s
    setTimeout(() => {
      const autoReplyText =
        activeChat.id === 'msg-1'
          ? 'Cảm ơn bạn! Tôi đã nhận được thông tin và sẽ chuẩn bị chu đáo để đón bạn đúng giờ nhé! 😊'
          : 'Cảm ơn quý khách đã gửi tin nhắn! Nhân viên hỗ trợ sẽ liên hệ giải đáp ngay.';

      const replyMsg: ChatMessage = {
        id: `reply-${Date.now()}`,
        sender: 'other',
        text: autoReplyText,
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
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hộp thư</Text>
      </View>

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

      {/* CHAT MODAL */}
      <Modal visible={!!activeChat} animationType="slide" onRequestClose={() => setActiveChat(null)}>
        <SafeAreaView style={styles.chatSafeArea}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
                    <Text style={styles.onlineStatus}>Đang trực tuyến</Text>
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
            </ScrollView>

            {/* Input Bar */}
            <View style={styles.inputBar}>
              <TextInput
                style={styles.chatInput}
                placeholder="Nhập tin nhắn..."
                placeholderTextColor="#9CA3AF"
                value={inputMessage}
                onChangeText={setInputMessage}
                onSubmitEditing={handleSendMessage}
              />
              <TouchableOpacity
                style={[styles.sendBtn, !inputMessage.trim() && styles.sendBtnDisabled]}
                disabled={!inputMessage.trim()}
                onPress={handleSendMessage}
              >
                <Ionicons name="send" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 14,
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
  // Chat Modal Styles
  chatSafeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
