import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppNotification } from '../types';

const NOTIFICATIONS_STORAGE_KEY = '@travelling_app_notifications_v1';

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'booking_success',
    title: 'Đặt chuyến thành công 🎉',
    message: 'Chuyến đi đến Balian treehouse đã được xác nhận. Mã đặt chỗ: #0072697027. Hãy sẵn sàng cho hành trình tuyệt vời!',
    time: '05:40 Hôm nay',
    read: false,
    bookingId: '00000072697027',
    actionText: 'Xem chi tiết chuyến đi',
  },
  {
    id: 'notif-2',
    type: 'trip_reminder',
    title: 'Nhắc nhở hành trình du lịch ✈️',
    message: 'Chuyến đi sắp tới của bạn bắt đầu vào ngày 09-05-2023. Hãy kiểm tra các đồ dùng cá nhân và giấy tờ cần thiết nhé.',
    time: 'Hôm qua',
    read: false,
  },
  {
    id: 'notif-3',
    type: 'system_promo',
    title: 'Ưu đãi thành viên mới 🎁',
    message: 'Chào mừng bạn đến với Travelling App! Nhận ngay voucher giảm 10% cho lần đặt chỗ và tour tiếp theo.',
    time: '2 ngày trước',
    read: true,
  },
];

class NotificationService {
  private currentUserId: string | null = null;

  setCurrentUserId(userId: string | null) {
    this.currentUserId = userId ? String(userId) : null;
  }

  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  private async getStorageKey(): Promise<string> {
    if (this.currentUserId) {
      return `@travelling_app_notifications_${this.currentUserId}`;
    }
    try {
      const stored = await AsyncStorage.getItem('@travelling_app_user_session');
      if (stored) {
        const u = JSON.parse(stored);
        if (u?.id || u?.email) {
          this.currentUserId = String(u.id || u.email);
          return `@travelling_app_notifications_${this.currentUserId}`;
        }
      }
    } catch {}
    return '@travelling_app_notifications_guest';
  }

  async getNotifications(): Promise<AppNotification[]> {
    try {
      const key = await this.getStorageKey();
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        return JSON.parse(raw);
      }
      const initial: AppNotification[] = [
        {
          id: `notif-${Date.now()}-welcome`,
          type: 'system_promo',
          title: 'Chào mừng bạn đến với Travelling App 🎁',
          message: 'Chào mừng bạn! Nhận ngay voucher ưu đãi và dịch vụ hỗ trợ chu đáo cho các chuyến đi sắp tới.',
          time: 'Hôm nay',
          read: false,
        },
      ];
      await AsyncStorage.setItem(key, JSON.stringify(initial));
      return initial;
    } catch {
      return [];
    }
  }

  async addNotification(
    data: Omit<AppNotification, 'id' | 'time' | 'read'>
  ): Promise<AppNotification[]> {
    try {
      const key = await this.getStorageKey();
      const existing = await this.getNotifications();
      const newNotif: AppNotification = {
        ...data,
        id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' Hôm nay',
        read: false,
      };
      const updated = [newNotif, ...existing];
      await AsyncStorage.setItem(key, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  }

  async markAsRead(id: string): Promise<AppNotification[]> {
    try {
      const key = await this.getStorageKey();
      const existing = await this.getNotifications();
      const updated = existing.map((n) => (n.id === id ? { ...n, read: true } : n));
      await AsyncStorage.setItem(key, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  }

  async markAllAsRead(): Promise<AppNotification[]> {
    try {
      const key = await this.getStorageKey();
      const existing = await this.getNotifications();
      const updated = existing.map((n) => ({ ...n, read: true }));
      await AsyncStorage.setItem(key, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  }

  async deleteNotification(id: string): Promise<AppNotification[]> {
    try {
      const key = await this.getStorageKey();
      const existing = await this.getNotifications();
      const updated = existing.filter((n) => n.id !== id);
      await AsyncStorage.setItem(key, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  }
}

export const notificationService = new NotificationService();

