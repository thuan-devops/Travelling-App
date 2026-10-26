import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { BottomTabType } from '../types';
import { BottomTabBar } from '../components/BottomTabBar';

interface InboxScreenProps {
  onTabChange: (tab: BottomTabType) => void;
}

export const InboxScreen: React.FC<InboxScreenProps> = ({ onTabChange }) => {
  const messages = [
    {
      id: 'msg-1',
      sender: 'Ketut Astawa (Chủ nhà - Balian treehouse)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      lastMessage: 'Xin chào! Rất mong được chào đón bạn đến Balian treehouse. Hãy nhắn cho tôi nếu bạn cần hỗ trợ đón tại sân bay nhé!',
      time: '10:30',
      unread: true,
    },
    {
      id: 'msg-2',
      sender: 'Hỗ trợ Travelling App',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      lastMessage: 'Thanh toán của bạn đã thành công! Chúc bạn có một chuyến đi thật tuyệt vời.',
      time: '05:41',
      unread: false,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hộp thư</Text>
      </View>


      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {messages.map((item) => (
          <TouchableOpacity key={item.id} style={styles.messageRow} activeOpacity={0.7}>
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
  messageBody: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
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
  },
  timeText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  messageSnippet: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  messageSnippetUnread: {
    color: '#1F2937',
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00BDD6',
  },
});
