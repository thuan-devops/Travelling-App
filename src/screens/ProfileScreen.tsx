import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { BottomTabType } from '../types';
import { BottomTabBar } from '../components/BottomTabBar';
import { useAuth } from '../context/AuthContext';

interface ProfileScreenProps {
  onTabChange: (tab: BottomTabType) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onTabChange }) => {
  const { user, logout } = useAuth();

  const [displayName, setDisplayName] = useState<string>(user?.name || 'Nguyễn Văn Du Khách');
  const [phoneNumber, setPhoneNumber] = useState<string>(user?.phoneNumber || '+84 987 654 321');
  const [email, setEmail] = useState<string>(user?.email || 'traveler@gmail.com');

  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [currency, setCurrency] = useState<'USD' | 'VND'>('USD');

  const handleSaveProfile = () => {
    setIsEditModalOpen(false);
    Alert.alert('Thành công', 'Thông tin cá nhân của bạn đã được cập nhật.');
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất không?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hồ sơ cá nhân</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <Image
            source={{
              uri:
                user?.avatarUrl ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
            }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userSub}>{phoneNumber}</Text>
            <TouchableOpacity
              style={styles.editBadge}
              onPress={() => setIsEditModalOpen(true)}
            >
              <Ionicons name="pencil" size={12} color="#00BDD6" style={{ marginRight: 4 }} />
              <Text style={styles.editBadgeText}>Chỉnh sửa hồ sơ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={() => setIsEditModalOpen(true)}>
            <Ionicons name="person-outline" size={20} color="#1F2937" style={styles.menuIcon} />
            <Text style={styles.menuText}>Thông tin cá nhân</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.menuItem}>
            <Ionicons name="cash-outline" size={20} color="#1F2937" style={styles.menuIcon} />
            <Text style={styles.menuText}>Đơn vị tiền tệ hiển thị</Text>
            <TouchableOpacity
              style={styles.currencyToggle}
              onPress={() => setCurrency((c) => (c === 'USD' ? 'VND' : 'USD'))}
            >
              <Text style={styles.currencyText}>{currency} ($)</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.menuItem}>
            <Ionicons name="notifications-outline" size={20} color="#1F2937" style={styles.menuIcon} />
            <Text style={styles.menuText}>Thông báo đẩy</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#D1D5DB', true: '#00BDD6' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('Hỗ trợ 24/7', 'Đội ngũ chăm sóc khách hàng Travelling App sẵn sàng hỗ trợ bạn qua hotline 1900 8888 hoặc mục Hộp thư.')}
          >
            <Ionicons name="help-circle-outline" size={20} color="#1F2937" style={styles.menuIcon} />
            <Text style={styles.menuText}>Trợ giúp & Hỗ trợ</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('Điều khoản', 'Ứng dụng tuân thủ tiêu chuẩn an toàn bảo mật và thanh toán quốc tế PCI-DSS.')}
          >
            <Ionicons name="document-text-outline" size={20} color="#1F2937" style={styles.menuIcon} />
            <Text style={styles.menuText}>Điều khoản & Chính sách</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Travelling App v2.0 • Sẵn sàng cho mọi chuyến đi</Text>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditModalOpen} transparent animationType="slide" onRequestClose={() => setIsEditModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh sửa thông tin</Text>
              <TouchableOpacity onPress={() => setIsEditModalOpen(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.inputLabel}>Họ và tên</Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Nhập họ và tên của bạn"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.inputLabel}>Số điện thoại</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Nhập số điện thoại"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>Địa chỉ Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Nhập email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
              />

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
                <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomTabBar activeTab="Profile" onTabChange={onTabChange} />
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  userSub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  editBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#E0F7FA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  editBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00BDD6',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  currencyToggle: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  currencyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00BDD6',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 20,
  },
  // Modal styles
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
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  saveBtn: {
    backgroundColor: '#00BDD6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
