import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  Platform,
  View,
  Text,
  StyleSheet,
TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { BottomTabType } from '../types';
import { BottomTabBar } from '../components/BottomTabBar';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';

interface ProfileScreenProps {
  onTabChange: (tab: BottomTabType) => void;
  onOpenAiSupport?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onTabChange, onOpenAiSupport }) => {
  const { user, logout, isLoading, changePassword, updateUserProfile } = useAuth();
  const { currency, toggleCurrency } = useCurrency();
  const { isDarkMode, toggleTheme, colors } = useTheme();

  const [displayName, setDisplayName] = useState<string>(user?.name || 'Nguyễn Văn Du Khách');
  const [phoneNumber, setPhoneNumber] = useState<string>(user?.phoneNumber || '+84 987 654 321');
  const [email, setEmail] = useState<string>(user?.email || 'traveler@gmail.com');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      if (user.name) setDisplayName(user.name);
      if (user.phoneNumber) setPhoneNumber(user.phoneNumber);
      if (user.email) setEmail(user.email);
    }
  }, [user]);

  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState<boolean>(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      Alert.alert('Lỗi', 'Họ và tên không được để trống.');
      return;
    }
    setIsSavingProfile(true);
    try {
      await updateUserProfile({
        name: displayName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
      });
      setIsEditModalOpen(false);
      Alert.alert('Thành công', 'Thông tin cá nhân của bạn đã được cập nhật.');
    } catch {
      Alert.alert('Lỗi', 'Không thể lưu thay đổi lúc này. Vui lòng thử lại!');
    } finally {
      setIsSavingProfile(false);
    }
  };

    const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }
    if (currentPassword === newPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới không được trùng với mật khẩu hiện tại.');
      return;
    }

    setIsSubmittingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setIsChangePasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmNewPassword(false);
      Alert.alert('Thành công', 'Mật khẩu của bạn đã được thay đổi thành công.');
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false);
    try {
      await logout();
    } catch {
      Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.statusBar} />

      {/* Header with Quick Logout */}
      <View style={{ width: '100%', backgroundColor: colors.card, borderBottomColor: colors.border, borderBottomWidth: 1 }}>
        <View style={[styles.header, { maxWidth: 760, alignSelf: 'center', width: '100%' }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Hồ sơ cá nhân</Text>
          <TouchableOpacity
            style={[styles.headerLogoutBtn, isDarkMode && { backgroundColor: '#450A0A', borderColor: '#7F1D1D' }]}
            onPress={() => setIsLogoutModalOpen(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={18} color="#EF4444" style={{ marginRight: 4 }} />
            <Text style={styles.headerLogoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { maxWidth: 760, alignSelf: 'center', width: '100%' }]} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={[styles.userCard, { backgroundColor: isDarkMode ? colors.card : '#F9FAFB', borderColor: colors.border }]}>
          <Image
            source={{
              uri:
                user?.avatarUrl ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
            }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>{displayName}</Text>
            <Text style={[styles.userSub, { color: colors.textSecondary }]}>{user?.email || phoneNumber}</Text>
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
        <View style={[styles.menuSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => setIsEditModalOpen(true)}
          >
            <Ionicons name="person-outline" size={20} color={colors.text} style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: colors.text }]}>Thông tin cá nhân</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => {
              if (user?.authProvider && user.authProvider !== 'credentials') {
                Alert.alert(
                  'Thông báo',
                  'Tài khoản đăng nhập bằng mạng xã hội hoặc số điện thoại không sử dụng mật khẩu ứng dụng.'
                );
              } else {
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
                setIsChangePasswordModalOpen(true);
              }
            }}
          >
            <Ionicons name="key-outline" size={20} color={colors.text} style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: colors.text }]}>Đổi mật khẩu</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={[styles.menuItem, { borderBottomColor: colors.border }]}>
            <Ionicons name="cash-outline" size={20} color={colors.text} style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: colors.text }]}>Đơn vị tiền tệ hiển thị</Text>
            <TouchableOpacity
              style={[styles.currencyToggle, { backgroundColor: isDarkMode ? colors.surface : '#F3F4F6' }]}
              onPress={toggleCurrency}
              activeOpacity={0.7}
            >
              <Text style={styles.currencyText}>
                {currency === 'USD' ? 'USD ($)' : 'VND (₫)'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.menuItem, { borderBottomColor: colors.border }]}>
            <Ionicons name="notifications-outline" size={20} color={colors.text} style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: colors.text }]}>Thông báo đẩy</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#D1D5DB', true: '#00BDD6' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Dark Mode Toggle */}
          <View style={[styles.menuItem, { borderBottomColor: colors.border }]}>
            <Ionicons
              name={isDarkMode ? 'moon' : 'moon-outline'}
              size={20}
              color={isDarkMode ? '#38BDF8' : colors.text}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: colors.text }]}>Chế độ nền tối (Dark Mode)</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#D1D5DB', true: '#0D9488' }}
              thumbColor={isDarkMode ? '#38BDF8' : '#FFFFFF'}
            />
          </View>

          {/* AI Support */}
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => {
              if (onOpenAiSupport) {
                onOpenAiSupport();
              } else {
                Alert.alert(
                  'Hỗ trợ 24/7',
                  'Đội ngũ chăm sóc khách hàng Travelling App sẵn sàng hỗ trợ bạn qua hotline 1900 8888 hoặc mục Hộp thư.'
                );
              }
            }}
          >
            <Ionicons name="sparkles-outline" size={20} color="#00BDD6" style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: '#00BDD6', fontWeight: '700' }]}>Trợ giúp & Hỗ trợ</Text>
            <View
              style={{
                backgroundColor: isDarkMode ? '#0369A1' : '#E0F2FE',
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 8,
                marginRight: 6,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '700', color: isDarkMode ? '#E0F2FE' : '#0284C7' }}>AI</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#00BDD6" />
          </TouchableOpacity>

          {/* Terms & Policies */}
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={() => setIsTermsModalOpen(true)}
          >
            <Ionicons name="document-text-outline" size={20} color={colors.text} style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: colors.text }]}>Điều khoản & Chính sách</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Primary Logout Button */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            isDarkMode && { backgroundColor: '#1E293B', borderColor: '#EF4444' },
          ]}
          onPress={() => setIsLogoutModalOpen(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Đăng xuất tài khoản</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: colors.textSecondary }]}>
          Travelling App v2.0 • Sẵn sàng cho mọi chuyến đi
        </Text>
      </ScrollView>

      {/* LOGOUT CONFIRMATION MODAL */}
      <Modal
        visible={isLogoutModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsLogoutModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.confirmModalBox, { backgroundColor: colors.card }]}>
            <View style={styles.logoutIconCircle}>
              <Ionicons name="log-out" size={32} color="#EF4444" />
            </View>

            <Text style={[styles.confirmModalTitle, { color: colors.text }]}>Đăng xuất tài khoản</Text>
            <Text style={[styles.confirmModalMessage, { color: colors.textSecondary }]}>
              Bạn có chắc chắn muốn đăng xuất không? Khi đăng nhập lại, bạn sẽ cần nhập lại tên đăng nhập và mật khẩu.
            </Text>

            <View style={styles.confirmModalBtnRow}>
              <TouchableOpacity
                style={[styles.confirmCancelBtn, { backgroundColor: colors.inputBackground }]}
                onPress={() => setIsLogoutModalOpen(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.confirmCancelText, { color: colors.textSecondary }]}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmLogoutBtn}
                onPress={handleConfirmLogout}
                activeOpacity={0.7}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmLogoutText}>Đăng xuất</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal visible={isEditModalOpen} transparent animationType="slide" onRequestClose={() => setIsEditModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Chỉnh sửa thông tin</Text>
              <TouchableOpacity onPress={() => setIsEditModalOpen(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Họ và tên</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Nhập họ và tên của bạn"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Số điện thoại</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Nhập số điện thoại"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Địa chỉ Email</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
                value={email}
                onChangeText={setEmail}
                placeholder="Nhập email"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
              />

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveProfile}
                disabled={isSavingProfile}
                activeOpacity={0.8}
              >
                {isSavingProfile ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      
      {/* CHANGE PASSWORD MODAL */}
      <Modal
        visible={isChangePasswordModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsChangePasswordModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.keyIconCircle}>
                  <Ionicons name="key" size={18} color="#0D9488" />
                </View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Đổi mật khẩu</Text>
              </View>
              <TouchableOpacity onPress={() => setIsChangePasswordModalOpen(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Field 1: Current Password */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>Mật khẩu hiện tại</Text>
              <View style={[styles.passwordInputWrap, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.passwordInput, { color: colors.text }]}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Nhập mật khẩu hiện tại"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showCurrentPassword}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  <Ionicons
                    name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Field 2: New Password */}
              <Text style={[styles.inputLabel, { color: colors.text, marginTop: 14 }]}>Mật khẩu mới</Text>
              <View style={[styles.passwordInputWrap, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.passwordInput, { color: colors.text }]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Ionicons
                    name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Field 3: Confirm New Password */}
              <Text style={[styles.inputLabel, { color: colors.text, marginTop: 14 }]}>Xác nhận mật khẩu mới</Text>
              <View style={[styles.passwordInputWrap, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.passwordInput, { color: colors.text }]}
                  value={confirmNewPassword}
                  onChangeText={setConfirmNewPassword}
                  placeholder="Nhập lại mật khẩu mới"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showConfirmNewPassword}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                >
                  <Ionicons
                    name={showConfirmNewPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Security Hint */}
              <View style={[styles.securityHintBox, { backgroundColor: isDarkMode ? '#0F172A' : '#F0FDFA', borderColor: isDarkMode ? '#334155' : '#CCFBF1' }]}>
                <Ionicons name="shield-checkmark-outline" size={16} color="#0D9488" style={{ marginRight: 6 }} />
                <Text style={[styles.securityHintText, { color: isDarkMode ? '#94A3B8' : '#0F766E' }]}>
                  Mật khẩu mới phải có tối thiểu 6 ký tự. Nên kết hợp chữ và số để tăng bảo mật.
                </Text>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.changePasswordSubmitBtn, isSubmittingPassword && { opacity: 0.7 }]}
                onPress={handleChangePassword}
                disabled={isSubmittingPassword}
                activeOpacity={0.8}
              >
                {isSubmittingPassword ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.changePasswordSubmitText}>Cập nhật mật khẩu</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* TERMS & POLICIES MODAL */}
      <Modal
        visible={isTermsModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        transparent={Platform.OS === 'web'}
        onRequestClose={() => setIsTermsModalOpen(false)}
      >
        <View style={styles.termsModalOverlay}>
          <SafeAreaView style={[styles.termsModalSafeArea, { backgroundColor: colors.background }]}>
          {/* Modal Header */}
          <View style={[styles.termsModalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <View style={{ width: 36 }} />
            <Text style={[styles.termsModalTitle, { color: colors.text }]}>Điều khoản & Chính sách</Text>
            <TouchableOpacity
              style={styles.termsCloseBtn}
              onPress={() => setIsTermsModalOpen(false)}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Modal Scroll Content */}
          <ScrollView
            style={styles.termsScrollView}
            contentContainerStyle={styles.termsScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Banner card */}
            <View
              style={[
                styles.termsHeroBanner,
                {
                  backgroundColor: isDarkMode ? '#1E293B' : '#E6FFFA',
                  borderColor: isDarkMode ? '#0D9488' : '#99F6E4',
                },
              ]}
            >
              <Ionicons name="shield-checkmark" size={32} color="#0D9488" style={{ marginBottom: 6 }} />
              <Text style={[styles.termsHeroTitle, { color: isDarkMode ? '#F8FAFC' : '#0F766E' }]}>
                Cam kết Chất lượng & Minh bạch
              </Text>
              <Text style={[styles.termsHeroSub, { color: isDarkMode ? '#94A3B8' : '#115E59' }]}>
                Travelling App cam kết mang lại trải nghiệm đặt phòng minh bạch 100%, bảo vệ quyền lợi tối đa cho khách hàng và đối tác lưu trú.
              </Text>
            </View>

            {/* Section 1 */}
            <View style={[styles.termsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.termsCardHeader}>
                <View style={[styles.termsCardIconWrap, { backgroundColor: '#E0F2FE' }]}>
                  <Ionicons name="card-outline" size={18} color="#0284C7" />
                </View>
                <Text style={[styles.termsCardTitle, { color: colors.text }]}>1. Đặt phòng & Minh bạch giá cả</Text>
              </View>
              <Text style={[styles.termsBulletItem, { color: colors.textSecondary }]}>
                • <Text style={{ fontWeight: '700', color: colors.text }}>Không phụ phí ẩn:</Text> Giá hiển thị trên ứng dụng là giá trọn gói niêm yết theo số đêm lưu trú thực tế. Không tự động cộng dồn các dịch vụ phát sinh ngoài yêu cầu (như phụ phí chèo thuyền, gửi xe khi không sử dụng).
              </Text>
              <Text style={[styles.termsBulletItem, { color: colors.textSecondary }]}>
                • <Text style={{ fontWeight: '700', color: colors.text }}>Tùy chọn thanh toán linh hoạt:</Text> Khách hàng có thể chọn Thanh toán toàn bộ 100% hoặc Trả trước 50% để giữ phòng, phần còn lại thanh toán thuận tiện khi nhận phòng.
              </Text>
              <Text style={[styles.termsBulletItem, { color: colors.textSecondary }]}>
                • <Text style={{ fontWeight: '700', color: colors.text }}>Hóa đơn điện tử:</Text> Biên nhận và thông tin chi tiết đơn đặt phòng được tạo tức thì và lưu trữ vĩnh viễn trong mục "Chuyến đi của tôi".
              </Text>
            </View>

            {/* Section 2 */}
            <View style={[styles.termsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.termsCardHeader}>
                <View style={[styles.termsCardIconWrap, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="refresh-circle-outline" size={18} color="#16A34A" />
                </View>
                <Text style={[styles.termsCardTitle, { color: colors.text }]}>2. Chính sách Hủy phòng & Hoàn tiền</Text>
              </View>
              <Text style={[styles.termsBulletItem, { color: colors.textSecondary }]}>
                • <Text style={{ fontWeight: '700', color: colors.text }}>Hủy miễn phí linh hoạt:</Text> Khách hàng có thể chủ động hủy chuyến trực tiếp ngay trong ứng dụng bất cứ lúc nào trước giờ nhận phòng mà không phải chịu phí phạt.
              </Text>
              <Text style={[styles.termsBulletItem, { color: colors.textSecondary }]}>
                • <Text style={{ fontWeight: '700', color: colors.text }}>Hoàn tiền 100%:</Text> Toàn bộ số tiền bạn đã thanh toán sẽ được hoàn trả đầy đủ 100% về đúng phương thức thanh toán ban đầu (thẻ ngân hàng, ví điện tử) trong vòng từ 3 - 5 ngày làm việc.
              </Text>
              <Text style={[styles.termsBulletItem, { color: colors.textSecondary }]}>
                • <Text style={{ fontWeight: '700', color: colors.text }}>Thao tác 1 chạm:</Text> Chỉ cần vào mục Chuyến đi ➔ Chọn chuyến cần hủy ➔ Bấm "Hủy chuyến đi" và chọn lý do. Hệ thống xử lý tự động ngay lập tức.
              </Text>
            </View>

            {/* Section 3 */}
            <View style={[styles.termsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.termsCardHeader}>
                <View style={[styles.termsCardIconWrap, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="lock-closed-outline" size={18} color="#D97706" />
                </View>
                <Text style={[styles.termsCardTitle, { color: colors.text }]}>3. Bảo mật Thông tin & Quyền riêng tư</Text>
              </View>
              <Text style={[styles.termsBulletItem, { color: colors.textSecondary }]}>
                • <Text style={{ fontWeight: '700', color: colors.text }}>Tiêu chuẩn PCI-DSS & SSL:</Text> Mọi giao dịch qua thẻ tín dụng/ghi nợ được mã hóa theo tiêu chuẩn an ninh quốc tế nghiêm ngặt nhất. Travelling App không lưu trữ trái phép mã bảo mật CVV/CVC.
              </Text>
              <Text style={[styles.termsBulletItem, { color: colors.textSecondary }]}>
                • <Text style={{ fontWeight: '700', color: colors.text }}>Bảo vệ thông tin cá nhân:</Text> Dữ liệu cá nhân (họ tên, số điện thoại, vị trí) chỉ được dùng cho mục đích đặt phòng và xác thực. Chúng tôi cam kết tuyệt đối không buôn bán hay chia sẻ cho bên thứ ba vì mục đích tiếp thị.
              </Text>
              <Text style={[styles.termsBulletItem, { color: colors.textSecondary }]}>
                • <Text style={{ fontWeight: '700', color: colors.text }}>Quyền kiểm soát dữ liệu:</Text> Bạn có toàn quyền xem, sửa đổi hoặc xóa tài khoản vĩnh viễn khỏi hệ thống bất cứ lúc nào.
              </Text>
            </View>

            {/* Section 4 */}
            <View style={[styles.termsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.termsCardHeader}>
                <View style={[styles.termsCardIconWrap, { backgroundColor: '#F3E8FF' }]}>
                  <Ionicons name="people-outline" size={18} color="#9333EA" />
                </View>
                <Text style={[styles.termsCardTitle, { color: colors.text }]}>4. Quyền & Trách nhiệm của các bên</Text>
              </View>
              <Text style={[styles.termsBulletItem, { color: colors.textSecondary }]}>
                • <Text style={{ fontWeight: '700', color: colors.text }}>Trách nhiệm của Chủ nhà:</Text> Cung cấp phòng nghỉ đúng mô tả, hình ảnh và vị trí đã đăng tải; chuẩn bị phòng sạch sẽ, tiện nghi và hỗ trợ chu đáo khi khách nhận phòng.
              </Text>
              <Text style={[styles.termsBulletItem, { color: colors.textSecondary }]}>
                • <Text style={{ fontWeight: '700', color: colors.text }}>Trách nhiệm của Khách hàng:</Text> Cung cấp thông tin nhận phòng chính xác; tuân thủ nội quy nơi lưu trú, giữ gìn vệ sinh và không gây ồn ào ảnh hưởng khu vực xung quanh.
              </Text>
            </View>

            {/* Section 5 */}
            <View style={[styles.termsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.termsCardHeader}>
                <View style={[styles.termsCardIconWrap, { backgroundColor: '#CCFBF1' }]}>
                  <Ionicons name="headset-outline" size={18} color="#0D9488" />
                </View>
                <Text style={[styles.termsCardTitle, { color: colors.text }]}>5. Trợ lý AI & Hỗ trợ Khách hàng 24/7</Text>
              </View>
              <Text style={[styles.termsBulletItem, { color: colors.textSecondary }]}>
                • <Text style={{ fontWeight: '700', color: colors.text }}>Trợ lý Du lịch AI:</Text> Tích hợp 24/7 ngay trong mục Hộp thư và Trợ giúp để giải đáp mọi thắc mắc về chính sách, địa điểm và lịch trình.
              </Text>
              <Text style={[styles.termsBulletItem, { color: colors.textSecondary }]}>
                • <Text style={{ fontWeight: '700', color: colors.text }}>Hotline tổng đài:</Text> 1900 8888 (Hoạt động từ 8:00 – 22:00 hàng ngày).
              </Text>
              <Text style={[styles.termsBulletItem, { color: colors.textSecondary }]}>
                • <Text style={{ fontWeight: '700', color: colors.text }}>Email hỗ trợ:</Text> support@travellingapp.vn
              </Text>
            </View>

            {/* Agree Button */}
            <TouchableOpacity
              style={styles.termsAgreeBtn}
              onPress={() => setIsTermsModalOpen(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.termsAgreeBtnText}>Tôi đã hiểu và đồng ý</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
          </SafeAreaView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  headerLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  headerLogoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
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
  confirmModalBox: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  logoutIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmModalMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
  },
  confirmModalBtnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  confirmLogoutBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmLogoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
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
  // Terms & Policies Modal Styles
  
  keyIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  passwordInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
  },
  eyeBtn: {
    padding: 6,
  },
  securityHintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    marginBottom: 6,
  },
  securityHintText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  changePasswordSubmitBtn: {
    backgroundColor: '#0D9488',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 18,
  },
  changePasswordSubmitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  termsModalOverlay: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? 'rgba(0, 0, 0, 0.5)' : undefined,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsModalSafeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  termsModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  termsModalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  termsCloseBtn: {
    padding: 6,
    borderRadius: 20,
  },
  termsScrollView: {
    flex: 1,
  },
  termsScrollContent: {
    padding: 16,
  },
  termsHeroBanner: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  termsHeroTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  termsHeroSub: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  termsCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  termsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  termsCardIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  termsCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  termsBulletItem: {
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: 8,
  },
  termsAgreeBtn: {
    backgroundColor: '#0D9488',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  termsAgreeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
