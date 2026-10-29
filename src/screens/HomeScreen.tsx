import { Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type UserData = {
  name?: string;
  phone?: string;
};

type Booking = {
  id: string;
  title: string;
  date: string;
  status: string;
};

type Message = {
  id: string;
  title: string;
  body: string;
  time: string;
};

const normalizePhone = (value: string) => value.replace(/\s+/g, '');

export default function HomeScreen({
  navigation,
}: {
  navigation: any;
}) {
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const isDark = theme === 'dark';

  const colors = {
    background: isDark ? '#121212' : '#ffffff',
    card: isDark ? '#1e1e1e' : '#ffffff',
    panel: isDark ? '#242424' : '#f8fafc',
    text: isDark ? '#f5f5f5' : '#111827',
    secondary: isDark ? '#b0b0b0' : '#6b7280',
    border: isDark ? '#383838' : '#eef2f7',
    input: isDark ? '#2a2a2a' : '#ffffff',
    muted: isDark ? '#333333' : '#f3f4f6',
    iconBackground: isDark ? '#303030' : '#f3f4f6',
    buttonBackground: isDark ? '#2a2a2a' : '#ffffff',
    inactiveButton: isDark ? '#383838' : '#f3f4f6',
    placeholder: isDark ? '#999999' : '#9ca3af',
  };

  const t = (vi: string, en: string) =>
    language === 'vi' ? vi : en;

  const [activeCategory, setActiveCategory] = useState('Beach');
  const [activeTab, setActiveTab] = useState('Search');

  const [userData, setUserData] = useState<UserData>({});
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const showMessage = useCallback(
    (title: string, message: string) => {
      if (Platform.OS === 'web') {
        window.alert(`${title}\n\n${message}`);
      } else {
        Alert.alert(title, message);
      }
    },
    [],
  );

  const toggleTheme = async () => {
    const nextTheme = isDark ? 'light' : 'dark';

    setTheme(nextTheme);

    try {
      await AsyncStorage.setItem('app_theme', nextTheme);
    } catch (error) {
      console.log('Khong the luu giao dien:', error);
      showMessage(
        t('Lỗi', 'Error'),
        t(
          'Không thể lưu cài đặt giao diện.',
          'Could not save appearance settings.',
        ),
      );
    }
  };

  const changeLanguage = async (nextLanguage: 'vi' | 'en') => {
    setLanguage(nextLanguage);

    try {
      await AsyncStorage.setItem('app_language', nextLanguage);
    } catch (error) {
      console.log('Khong the luu ngon ngu:', error);
      showMessage(
        t('Lỗi', 'Error'),
        t(
          'Không thể lưu cài đặt ngôn ngữ.',
          'Could not save language settings.',
        ),
      );
    }
  };

  const loadUserProfile = useCallback(async () => {
    try {
      const loggedIn = await AsyncStorage.getItem('is_logged_in');
      const userStr = await AsyncStorage.getItem('current_user');

      if (loggedIn !== 'true' || !userStr) {
        setUserData({});
        navigation.replace('Auth');
        return;
      }

      const parsedUser = JSON.parse(userStr);

      if (!parsedUser || typeof parsedUser !== 'object') {
        await AsyncStorage.multiRemove([
          'current_user',
          'is_logged_in',
        ]);

        setUserData({});
        navigation.replace('Auth');
        return;
      }

      const name =
        typeof parsedUser.name === 'string'
          ? parsedUser.name
          : '';

      const phone =
        typeof parsedUser.phone === 'string'
          ? parsedUser.phone
          : '';

      setUserData({ name, phone });

      setAvatarUri(
        typeof parsedUser.avatarUri === 'string'
          ? parsedUser.avatarUri
          : null,
      );

      setEditName(name);
      setEditPhone(phone);
    } catch (error) {
      console.log('Khong the tai thong tin tai khoan:', error);

      showMessage(
        t('Lỗi', 'Error'),
        t(
          'Không thể tải thông tin tài khoản. Vui lòng đăng nhập lại.',
          'Could not load account information. Please log in again.',
        ),
      );

      navigation.replace('Auth');
    } finally {
      setIsLoadingProfile(false);
    }
  }, [navigation, showMessage, language]);

  const loadPreferences = useCallback(async () => {
    try {
      const savedNotifications = await AsyncStorage.getItem(
        'notifications_enabled',
      );

      if (savedNotifications !== null) {
        setNotificationsEnabled(savedNotifications === 'true');
      }
    } catch (error) {
      console.log('Khong the tai cai dat thong bao:', error);
    }
  }, []);

  const loadFeatureData = useCallback(async () => {
    try {
      const savedFavorites = await AsyncStorage.getItem('favorite_ids');

      if (savedFavorites) {
        const parsedFavorites = JSON.parse(savedFavorites);

        if (Array.isArray(parsedFavorites)) {
          setFavoriteIds(parsedFavorites);
        }
      }

      const savedBookings = await AsyncStorage.getItem('demo_bookings');

      if (savedBookings) {
        const parsedBookings = JSON.parse(savedBookings);

        if (Array.isArray(parsedBookings)) {
          setBookings(parsedBookings);
        }
      }

      const savedMessages = await AsyncStorage.getItem('demo_messages');

      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);

        if (Array.isArray(parsedMessages)) {
          setMessages(parsedMessages);
        }
      }
    } catch (error) {
      console.log('Khong the tai du lieu tinh nang:', error);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      try {
        const [savedLanguage, savedTheme] = await Promise.all([
          AsyncStorage.getItem('app_language'),
          AsyncStorage.getItem('app_theme'),
        ]);

        if (!mounted) return;

        if (savedLanguage === 'vi' || savedLanguage === 'en') {
          setLanguage(savedLanguage);
        }

        if (savedTheme === 'light' || savedTheme === 'dark') {
          setTheme(savedTheme);
        }
      } catch (error) {
        console.log('Khong the tai cai dat ung dung:', error);
      }
    };

    void loadSettings();
    void loadUserProfile();
    void loadPreferences();
    void loadFeatureData();

    return () => {
      mounted = false;
    };
  }, [loadUserProfile, loadPreferences, loadFeatureData]);

  const changeAvatar = async () => {
    try {
      if (Platform.OS !== 'web') {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          showMessage(
            t('Cần quyền truy cập', 'Permission required'),
            t(
              'Vui lòng cho phép ứng dụng truy cập thư viện ảnh.',
              'Please allow the app to access your photo library.',
            ),
          );

          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]?.uri) {
        return;
      }

      setSavingAvatar(true);

      const uri = result.assets[0].uri;

      const currentUserString =
        await AsyncStorage.getItem('current_user');

      if (!currentUserString) {
        throw new Error('Không tìm thấy tài khoản đang đăng nhập.');
      }

      const currentUser = JSON.parse(currentUserString);

      const updatedUser = {
        ...currentUser,
        avatarUri: uri,
      };

      const phone =
        typeof currentUser.phone === 'string'
          ? currentUser.phone
          : '';

      await AsyncStorage.setItem(
        'current_user',
        JSON.stringify(updatedUser),
      );

      if (phone) {
        await AsyncStorage.setItem(
          `user_${phone}`,
          JSON.stringify(updatedUser),
        );
      }

      setAvatarUri(uri);

      showMessage(
        t('Thành công', 'Success'),
        t(
          'Ảnh đại diện đã được cập nhật.',
          'Your profile photo has been updated.',
        ),
      );
    } catch (error) {
      console.log('Loi thay doi anh dai dien:', error);

      const message =
        error instanceof Error
          ? error.message
          : 'Không thể cập nhật ảnh đại diện.';

      showMessage(t('Lỗi', 'Error'), message);
    } finally {
      setSavingAvatar(false);
    }
  };

  const removeAvatar = async () => {
    try {
      const currentUserString =
        await AsyncStorage.getItem('current_user');

      if (!currentUserString) {
        throw new Error('Không tìm thấy tài khoản đang đăng nhập.');
      }

      const currentUser = JSON.parse(currentUserString);

      const updatedUser = { ...currentUser };

      delete updatedUser.avatarUri;

      const phone =
        typeof currentUser.phone === 'string'
          ? currentUser.phone
          : '';

      await AsyncStorage.setItem(
        'current_user',
        JSON.stringify(updatedUser),
      );

      if (phone) {
        await AsyncStorage.setItem(
          `user_${phone}`,
          JSON.stringify(updatedUser),
        );
      }

      setAvatarUri(null);

      showMessage(
        t('Thành công', 'Success'),
        t(
          'Đã xóa ảnh đại diện.',
          'Your profile photo has been removed.',
        ),
      );
    } catch (error) {
      console.log('Loi xoa anh dai dien:', error);

      showMessage(
        t('Lỗi', 'Error'),
        t(
          'Không thể xóa ảnh đại diện. Vui lòng thử lại.',
          'Could not remove the profile photo. Please try again.',
        ),
      );
    }
  };

  const showAvatarOptions = () => {
    if (Platform.OS === 'web') {
      void changeAvatar();
      return;
    }

    Alert.alert(
      t('Ảnh đại diện', 'Profile photo'),
      t(
        'Chọn thao tác bạn muốn thực hiện.',
        'Choose an action.',
      ),
      [
        {
          text: t('Chọn ảnh mới', 'Choose a new photo'),
          onPress: () => {
            void changeAvatar();
          },
        },
        ...(avatarUri
          ? [
              {
                text: t('Xóa ảnh', 'Remove photo'),
                style: 'destructive' as const,
                onPress: () => {
                  void removeAvatar();
                },
              },
            ]
          : []),
        {
          text: t('Hủy', 'Cancel'),
          style: 'cancel' as const,
        },
      ],
    );
  };

  const saveProfile = async () => {
    const name = editName.trim();

    const phone = normalizePhone(editPhone).replace(/[()\-]/g, '');

    if (!name) {
      showMessage(
        t('Thiếu thông tin', 'Missing information'),
        t(
          'Vui lòng nhập họ và tên.',
          'Please enter your full name.',
        ),
      );

      return;
    }

    if (!phone || !/^\+?\d{8,15}$/.test(phone)) {
      showMessage(
        t('Số điện thoại không hợp lệ', 'Invalid phone number'),
        t(
          'Vui lòng nhập số điện thoại gồm 8–15 chữ số, có thể có dấu + ở đầu.',
          'Enter a phone number containing 8–15 digits, optionally starting with +.',
        ),
      );

      return;
    }

    setSavingProfile(true);

    try {
      const currentUserString =
        await AsyncStorage.getItem('current_user');

      if (!currentUserString) {
        showMessage(
          t('Phiên đăng nhập hết hạn', 'Session expired'),
          t(
            'Vui lòng đăng nhập lại.',
            'Please log in again.',
          ),
        );

        setEditingProfile(false);
        navigation.replace('Auth');
        return;
      }

      const currentUser = JSON.parse(currentUserString);

      const oldPhone =
        typeof currentUser.phone === 'string'
          ? currentUser.phone
          : '';

      const updatedUser = {
        ...currentUser,
        name,
        phone,
      };

      const oldKey = oldPhone ? `user_${oldPhone}` : '';
      const newKey = `user_${phone}`;

      if (oldPhone !== phone) {
        const existingAccount = await AsyncStorage.getItem(newKey);

        if (existingAccount && newKey !== oldKey) {
          showMessage(
            t('Số điện thoại đã tồn tại', 'Phone number already exists'),
            t(
              'Số điện thoại này đã được dùng cho tài khoản khác.',
              'This phone number is already used by another account.',
            ),
          );

          return;
        }
      }

      // Lưu tài khoản mới trước khi xóa khóa tài khoản cũ.
      await AsyncStorage.setItem(
        newKey,
        JSON.stringify(updatedUser),
      );

      await AsyncStorage.setItem(
        'current_user',
        JSON.stringify(updatedUser),
      );

      if (oldKey && oldKey !== newKey) {
        await AsyncStorage.removeItem(oldKey);
      }

      setUserData({ name, phone });
      setEditName(name);
      setEditPhone(phone);
      setEditingProfile(false);

      showMessage(
        t('Thành công', 'Success'),
        t(
          'Thông tin hồ sơ đã được cập nhật.',
          'Your profile has been updated.',
        ),
      );
    } catch (error) {
      console.log('Loi luu ho so:', error);

      showMessage(
        t('Lỗi', 'Error'),
        t(
          'Không thể lưu thông tin. Vui lòng thử lại.',
          'Could not save your information. Please try again.',
        ),
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      showMessage(
        t('Thiếu thông tin', 'Missing information'),
        t(
          'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.',
          'Please enter your current password and new password.',
        ),
      );

      return;
    }

    if (newPassword.length < 6) {
      showMessage(
        t('Mật khẩu chưa hợp lệ', 'Invalid password'),
        t(
          'Mật khẩu mới phải có ít nhất 6 ký tự.',
          'The new password must contain at least 6 characters.',
        ),
      );

      return;
    }

    if (newPassword !== confirmNewPassword) {
      showMessage(
        t('Không khớp', 'Passwords do not match'),
        t(
          'Mật khẩu mới và xác nhận mật khẩu không khớp.',
          'The new password and confirmation do not match.',
        ),
      );

      return;
    }

    if (newPassword === currentPassword) {
      showMessage(
        t('Mật khẩu chưa hợp lệ', 'Invalid password'),
        t(
          'Mật khẩu mới phải khác mật khẩu hiện tại.',
          'The new password must be different from the current password.',
        ),
      );

      return;
    }

    setSavingPassword(true);

    try {
      const currentUserString =
        await AsyncStorage.getItem('current_user');

      if (!currentUserString) {
        throw new Error('Không tìm thấy phiên đăng nhập.');
      }

      const currentUser = JSON.parse(currentUserString);

      if (currentUser.password !== currentPassword) {
        showMessage(
          t('Sai mật khẩu', 'Incorrect password'),
          t(
            'Mật khẩu hiện tại không chính xác.',
            'The current password is incorrect.',
          ),
        );

        return;
      }

      const phone =
        typeof currentUser.phone === 'string'
          ? currentUser.phone
          : '';

      if (!phone) {
        throw new Error(
          'Không tìm thấy số điện thoại của tài khoản.',
        );
      }

      const updatedUser = {
        ...currentUser,
        password: newPassword,
      };

      await AsyncStorage.setItem(
        `user_${phone}`,
        JSON.stringify(updatedUser),
      );

      await AsyncStorage.setItem(
        'current_user',
        JSON.stringify(updatedUser),
      );

      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordModalVisible(false);

      showMessage(
        t('Thành công', 'Success'),
        t(
          'Mật khẩu đã được thay đổi thành công.',
          'Your password has been changed successfully.',
        ),
      );
    } catch (error) {
      console.log('Loi doi mat khau:', error);

      const message =
        error instanceof Error
          ? error.message
          : 'Không thể đổi mật khẩu. Vui lòng thử lại.';

      showMessage(t('Lỗi', 'Error'), message);
    } finally {
      setSavingPassword(false);
    }
  };

  const toggleNotifications = async () => {
    const previousValue = notificationsEnabled;
    const nextValue = !previousValue;

    setNotificationsEnabled(nextValue);

    try {
      await AsyncStorage.setItem(
        'notifications_enabled',
        String(nextValue),
      );
    } catch (error) {
      setNotificationsEnabled(previousValue);

      showMessage(
        t('Lỗi', 'Error'),
        t(
          'Không thể lưu cài đặt thông báo.',
          'Could not save notification settings.',
        ),
      );
    }
  };

  const toggleFavorite = async (id: string) => {
    const previous = favoriteIds;

    const next = previous.includes(id)
      ? previous.filter((item) => item !== id)
      : [...previous, id];

    setFavoriteIds(next);

    try {
      await AsyncStorage.setItem(
        'favorite_ids',
        JSON.stringify(next),
      );
    } catch (error) {
      setFavoriteIds(previous);

      showMessage(
        t('Lỗi', 'Error'),
        t(
          'Không thể lưu danh sách yêu thích.',
          'Could not save favorites.',
        ),
      );
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        t(
          'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này không?',
          'Are you sure you want to log out?',
        ),
      );

      if (confirmed) {
        void (async () => {
          try {
            await AsyncStorage.multiRemove([
              'current_user',
              'is_logged_in',
            ]);

            setUserData({});
            navigation.replace('Auth');
          } catch (error) {
            showMessage(
              t('Lỗi', 'Error'),
              t(
                'Không thể đăng xuất. Vui lòng thử lại.',
                'Could not log out. Please try again.',
              ),
            );
          }
        })();
      }

      return;
    }

    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này không?',
      [
        {
          text: 'Ở lại',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'current_user',
                'is_logged_in',
              ]);

              setUserData({});
              navigation.replace('Auth');
            } catch (error) {
              Alert.alert(
                'Lỗi',
                'Không thể đăng xuất. Vui lòng thử lại.',
              );
            }
          },
        },
      ],
    );
  };

  const renderProfile = () => {
    if (isLoadingProfile) {
      return (
        <View
          style={[
            styles.loadingContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <ActivityIndicator size="large" color="#00bcd4" />

          <Text
            style={[
              styles.loadingText,
              { color: colors.secondary },
            ]}
          >
            {t(
              'Đang tải thông tin tài khoản...',
              'Loading account information...',
            )}
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.profileContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.screenTitle,
            { color: colors.text },
          ]}
        >
          {t('Hồ sơ cá nhân', 'Personal Profile')}
        </Text>

        <View
          style={[
            styles.profileHeader,
            { backgroundColor: colors.panel },
          ]}
        >
          <TouchableOpacity
            style={styles.avatarTouchable}
            onPress={showAvatarOptions}
            disabled={savingAvatar}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.avatarBox,
                {
                  backgroundColor: isDark
                    ? '#303030'
                    : '#e0f7fa',
                },
              ]}
            >
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.avatarImage}
                />
              ) : (
                <Feather
                  name="user"
                  size={40}
                  color="#00bcd4"
                />
              )}
            </View>

            <View
              style={[
                styles.avatarCameraBadge,
                {
                  borderColor: colors.panel,
                },
              ]}
            >
              {savingAvatar ? (
                <ActivityIndicator
                  size="small"
                  color="#ffffff"
                />
              ) : (
                <Feather
                  name="camera"
                  size={14}
                  color="#ffffff"
                />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.changeAvatarButton}
            onPress={showAvatarOptions}
            disabled={savingAvatar}
          >
            <Text style={styles.changeAvatarText}>
              {savingAvatar
                ? t('Đang lưu ảnh...', 'Saving photo...')
                : t(
                    'Thay đổi ảnh đại diện',
                    'Change profile photo',
                  )}
            </Text>
          </TouchableOpacity>

          {avatarUri && (
            <TouchableOpacity
              style={styles.removeAvatarButton}
              onPress={removeAvatar}
            >
              <Text style={styles.removeAvatarText}>
                {t('Xóa ảnh', 'Remove photo')}
              </Text>
            </TouchableOpacity>
          )}

          <Text
            style={[
              styles.profileName,
              { color: colors.text },
            ]}
          >
            {userData.name?.trim() || 'Người dùng'}
          </Text>

          <Text
            style={[
              styles.profilePhone,
              { color: colors.secondary },
            ]}
          >
            {userData.phone || 'Chưa có số điện thoại'}
          </Text>

          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />

            <Text style={styles.statusText}>
              {t('Đã đăng nhập', 'Logged in')}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.outlineButton,
              {
                backgroundColor: colors.buttonBackground,
                borderColor: isDark ? '#24545a' : '#a5f3fc',
              },
            ]}
            onPress={() => {
              setEditName(userData.name || '');
              setEditPhone(userData.phone || '');
              setEditingProfile(true);
            }}
          >
            <Feather
              name="edit-2"
              size={15}
              color="#00a5b9"
            />

            <Text style={styles.outlineButtonText}>
              {t('Chỉnh sửa hồ sơ', 'Edit profile')}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text },
            ]}
          >
            {t('Thông tin tài khoản', 'Account information')}
          </Text>

          <View
            style={[
              styles.infoRow,
              { borderBottomColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.infoIcon,
                {
                  backgroundColor: isDark
                    ? '#17383c'
                    : '#ecfeff',
                },
              ]}
            >
              <Feather
                name="user"
                size={18}
                color="#00bcd4"
              />
            </View>

            <View style={styles.infoContent}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: colors.secondary },
                ]}
              >
                {t('Họ và tên', 'Full name')}
              </Text>

              <Text
                style={[
                  styles.infoValue,
                  { color: colors.text },
                ]}
              >
                {userData.name?.trim() || 'Chưa cập nhật'}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.infoRow,
              styles.lastInfoRow,
              { borderBottomColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.infoIcon,
                {
                  backgroundColor: isDark
                    ? '#17383c'
                    : '#ecfeff',
                },
              ]}
            >
              <Feather
                name="phone"
                size={18}
                color="#00bcd4"
              />
            </View>

            <View style={styles.infoContent}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: colors.secondary },
                ]}
              >
                {t('Số điện thoại', 'Phone number')}
              </Text>

              <Text
                style={[
                  styles.infoValue,
                  { color: colors.text },
                ]}
              >
                {userData.phone || 'Chưa cập nhật'}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text },
            ]}
          >
            {t('Cài đặt', 'Settings')}
          </Text>

          <TouchableOpacity
            style={[
              styles.menuItem,
              { borderTopColor: colors.border },
            ]}
            onPress={() => setSettingsVisible(true)}
          >
            <View
              style={[
                styles.menuIconBox,
                { backgroundColor: colors.iconBackground },
              ]}
            >
              <Feather
                name="settings"
                size={20}
                color={colors.text}
              />
            </View>

            <View style={styles.menuItemContent}>
              <Text
                style={[
                  styles.menuText,
                  { color: colors.text },
                ]}
              >
                {t('Cài đặt tài khoản', 'Account settings')}
              </Text>

              <Text
                style={[
                  styles.menuSubText,
                  { color: colors.secondary },
                ]}
              >
                {t(
                  'Chỉnh sửa thông tin cá nhân',
                  'Edit personal information',
                )}
              </Text>
            </View>

            <Feather
              name="chevron-right"
              size={20}
              color={colors.secondary}
            />
          </TouchableOpacity>

          <View
            style={[
              styles.menuItem,
              { borderTopColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.menuIconBox,
                { backgroundColor: colors.iconBackground },
              ]}
            >
              <Feather
                name="globe"
                size={20}
                color={colors.text}
              />
            </View>

            <View style={styles.menuItemContent}>
              <Text
                style={[
                  styles.menuText,
                  { color: colors.text },
                ]}
              >
                {t('Ngôn ngữ', 'Language')}
              </Text>

              <Text
                style={[
                  styles.menuSubText,
                  { color: colors.secondary },
                ]}
              >
                {t(
                  'Chọn ngôn ngữ ứng dụng',
                  'Choose app language',
                )}
              </Text>
            </View>

            <View style={styles.languageButtons}>
              <TouchableOpacity
                onPress={() => changeLanguage('vi')}
                style={[
                  styles.languageButton,
                  {
                    backgroundColor:
                      language === 'vi'
                        ? '#00bcd4'
                        : colors.inactiveButton,
                  },
                ]}
              >
                <Text
                  style={{
                    color:
                      language === 'vi'
                        ? '#ffffff'
                        : colors.text,
                    fontWeight: '700',
                  }}
                >
                  VI
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => changeLanguage('en')}
                style={[
                  styles.languageButton,
                  {
                    backgroundColor:
                      language === 'en'
                        ? '#00bcd4'
                        : colors.inactiveButton,
                  },
                ]}
              >
                <Text
                  style={{
                    color:
                      language === 'en'
                        ? '#ffffff'
                        : colors.text,
                    fontWeight: '700',
                  }}
                >
                  EN
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.menuItem,
              { borderTopColor: colors.border },
            ]}
            onPress={toggleTheme}
          >
            <View
              style={[
                styles.menuIconBox,
                { backgroundColor: colors.muted },
              ]}
            >
              <Feather
                name={isDark ? 'moon' : 'sun'}
                size={20}
                color="#00bcd4"
              />
            </View>

            <View style={styles.menuItemContent}>
              <Text
                style={[
                  styles.menuText,
                  { color: colors.text },
                ]}
              >
                {t('Giao diện', 'Appearance')}
              </Text>

              <Text
                style={[
                  styles.menuSubText,
                  { color: colors.secondary },
                ]}
              >
                {isDark
                  ? t(
                      'Đang sử dụng chế độ tối',
                      'Dark mode is enabled',
                    )
                  : t(
                      'Đang sử dụng chế độ sáng',
                      'Light mode is enabled',
                    )}
              </Text>
            </View>

            <View
              style={[
                styles.themePill,
                {
                  backgroundColor: isDark
                    ? '#383838'
                    : '#e5e7eb',
                },
              ]}
            >
              <Feather
                name={isDark ? 'moon' : 'sun'}
                size={14}
                color="#00bcd4"
              />

              <Text
                style={[
                  styles.themePillText,
                  { color: colors.text },
                ]}
              >
                {isDark ? t('Tối', 'Dark') : t('Sáng', 'Light')}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.menuItem,
              { borderTopColor: colors.border },
            ]}
            onPress={() => setNotificationsVisible(true)}
          >
            <View
              style={[
                styles.menuIconBox,
                { backgroundColor: colors.iconBackground },
              ]}
            >
              <Feather
                name="bell"
                size={20}
                color={colors.text}
              />
            </View>

            <View style={styles.menuItemContent}>
              <Text
                style={[
                  styles.menuText,
                  { color: colors.text },
                ]}
              >
                {t('Thông báo', 'Notifications')}
              </Text>

              <Text
                style={[
                  styles.menuSubText,
                  { color: colors.secondary },
                ]}
              >
                {t(
                  'Bật hoặc tắt thông báo ứng dụng',
                  'Turn app notifications on or off',
                )}
              </Text>
            </View>

            <Feather
              name="chevron-right"
              size={20}
              color={colors.secondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.menuItem,
              styles.logoutItem,
              { borderTopColor: colors.border },
            ]}
            onPress={handleLogout}
          >
            <View
              style={[
                styles.menuIconBox,
                styles.logoutIconBox,
              ]}
            >
              <Feather
                name="log-out"
                size={20}
                color="#ef4444"
              />
            </View>

            <View style={styles.menuItemContent}>
              <Text
                style={[
                  styles.menuText,
                  styles.logoutText,
                ]}
              >
                {t('Đăng xuất', 'Log out')}
              </Text>

              <Text
                style={[
                  styles.menuSubText,
                  { color: colors.secondary },
                ]}
              >
                {t(
                  'Thoát khỏi tài khoản hiện tại',
                  'Sign out of the current account',
                )}
              </Text>
            </View>

            <Feather
              name="chevron-right"
              size={20}
              color="#ef4444"
            />
          </TouchableOpacity>
        </View>

        <Text
          style={[
            styles.versionText,
            { color: colors.secondary },
          ]}
        >
          {t(
            'Ứng dụng đặt chỗ · Phiên bản 1.0.0',
            'Booking app · Version 1.0.0',
          )}
        </Text>
      </ScrollView>
    );
  };

  const renderSearch = () => {
    const listing = {
      id: `${activeCategory}-sample`,
      title:
        activeCategory === 'Beach'
          ? 'Căn hộ nghỉ dưỡng ven biển'
          : activeCategory === 'Mountain'
            ? 'Nhà nghỉ giữa núi'
            : 'Khu cắm trại thiên nhiên',
      category:
        activeCategory === 'Beach'
          ? 'Biển'
          : activeCategory === 'Mountain'
            ? 'Núi'
            : 'Cắm trại',
      image:
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800',
      price: '500.000đ',
    };

    const query = searchText.trim().toLocaleLowerCase('vi');

    const matchesSearch =
      !query ||
      listing.title.toLocaleLowerCase('vi').includes(query) ||
      listing.category.toLocaleLowerCase('vi').includes(query);

    return (
      <>
        <View
          style={[
            styles.searchHeader,
            { backgroundColor: colors.background },
          ]}
        >
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: colors.input,
                borderColor: colors.border,
              },
            ]}
          >
            <Feather
              name="search"
              size={18}
              color={colors.secondary}
              style={styles.searchIcon}
            />

            <TextInput
              style={[
                styles.searchInput,
                { color: colors.text },
              ]}
              placeholder={t(
                'Bạn muốn nghỉ dưỡng ở đâu?',
                'Where would you like to stay?',
              )}
              placeholderTextColor={colors.placeholder}
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
            />

            {!!searchText && (
              <TouchableOpacity
                onPress={() => setSearchText('')}
              >
                <Feather
                  name="x-circle"
                  size={18}
                  color={colors.secondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View
          style={[
            styles.categoryContainer,
            {
              backgroundColor: colors.background,
              borderBottomColor: colors.border,
            },
          ]}
        >
          {[
            {
              key: 'Beach',
              label: t('Biển', 'Beach'),
              icon: 'sun',
            },
            {
              key: 'Mountain',
              label: t('Núi', 'Mountain'),
              icon: 'triangle',
            },
            {
              key: 'Camping',
              label: t('Cắm trại', 'Camping'),
              icon: 'compass',
            },
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.categoryItem}
              onPress={() => setActiveCategory(item.key)}
            >
              <Feather
                name={item.icon as any}
                size={20}
                color={
                  activeCategory === item.key
                    ? '#00bcd4'
                    : colors.secondary
                }
              />

              <Text
                style={[
                  styles.categoryText,
                  {
                    color:
                      activeCategory === item.key
                        ? '#00bcd4'
                        : colors.secondary,
                  },
                  activeCategory === item.key &&
                    styles.activeText,
                ]}
              >
                {item.label}
              </Text>

              {activeCategory === item.key && (
                <View style={styles.activeIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          style={{ backgroundColor: colors.background }}
          contentContainerStyle={styles.feedContainer}
          showsVerticalScrollIndicator={false}
        >
          {matchesSearch ? (
            <View
              style={[
                styles.card,
                { backgroundColor: colors.card },
              ]}
            >
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: listing.image }}
                  style={styles.cardImage}
                />

                <TouchableOpacity
                  style={styles.heartButton}
                  onPress={() => toggleFavorite(listing.id)}
                  accessibilityLabel="Thêm hoặc xóa yêu thích"
                >
                  <Ionicons
                    name={
                      favoriteIds.includes(listing.id)
                        ? 'heart'
                        : 'heart-outline'
                    }
                    size={20}
                    color={
                      favoriteIds.includes(listing.id)
                        ? '#ef4444'
                        : '#374151'
                    }
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.cardInfoRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text
                    style={[
                      styles.cardTitle,
                      { color: colors.text },
                    ]}
                  >
                    {listing.title}
                  </Text>

                  <Text
                    style={[
                      styles.cardCategory,
                      { color: colors.secondary },
                    ]}
                  >
                    {listing.category}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.priceText,
                    { color: colors.secondary },
                  ]}
                >
                  <Text
                    style={[
                      styles.priceBold,
                      { color: colors.text },
                    ]}
                  >
                    {listing.price}
                  </Text>

                  {t('/đêm', '/night')}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => {
                  const nextBooking: Booking = {
                    id: `${Date.now()}`,
                    title: listing.title,
                    date: new Date().toLocaleDateString('vi-VN'),
                    status: 'Chờ xác nhận',
                  };

                  const nextBookings = [
                    nextBooking,
                    ...bookings,
                  ];

                  setBookings(nextBookings);

                  AsyncStorage.setItem(
                    'demo_bookings',
                    JSON.stringify(nextBookings),
                  )
                    .then(() =>
                      showMessage(
                        t('Đã tạo yêu cầu', 'Request created'),
                        t(
                          'Yêu cầu đặt chỗ mẫu đã được lưu trên thiết bị.',
                          'The sample booking request has been saved on this device.',
                        ),
                      ),
                    )
                    .catch(() =>
                      showMessage(
                        t('Lỗi', 'Error'),
                        t(
                          'Không thể lưu yêu cầu đặt chỗ.',
                          'Could not save the booking request.',
                        ),
                      ),
                    );
                }}
              >
                <Text style={styles.bookButtonText}>
                  {t('Yêu cầu đặt chỗ', 'Request booking')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={[
                styles.emptyState,
                { backgroundColor: colors.panel },
              ]}
            >
              <Feather
                name="search"
                size={30}
                color={colors.secondary}
              />

              <Text
                style={[
                  styles.emptyTitle,
                  { color: colors.text },
                ]}
              >
                {t('Không tìm thấy kết quả', 'No results found')}
              </Text>

              <Text
                style={[
                  styles.emptyText,
                  { color: colors.secondary },
                ]}
              >
                {t(
                  'Thử từ khóa khác hoặc chọn danh mục khác.',
                  'Try another keyword or choose a different category.',
                )}
              </Text>
            </View>
          )}
        </ScrollView>
      </>
    );
  };

  const renderFavorites = () => (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.otherTabContainer}
    >
      <Text
        style={[
          styles.screenTitle,
          { color: colors.text },
        ]}
      >
        {t('Danh sách yêu thích', 'Favorites')}
      </Text>

      {favoriteIds.length === 0 ? (
        <View
          style={[
            styles.emptyState,
            { backgroundColor: colors.panel },
          ]}
        >
          <Ionicons
            name="heart-outline"
            size={34}
            color={colors.secondary}
          />

          <Text
            style={[
              styles.emptyTitle,
              { color: colors.text },
            ]}
          >
            {t('Chưa có mục yêu thích', 'No favorites yet')}
          </Text>

          <Text
            style={[
              styles.emptyText,
              { color: colors.secondary },
            ]}
          >
            {t(
              'Nhấn biểu tượng trái tim trên nơi lưu trú để thêm vào danh sách.',
              'Tap the heart on a stay to add it to your favorites.',
            )}
          </Text>
        </View>
      ) : (
        favoriteIds.map((id) => (
          <View
            key={id}
            style={[
              styles.simpleListItem,
              {
                borderBottomColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
          >
            <View
              style={[
                styles.menuIconBox,
                { backgroundColor: colors.iconBackground },
              ]}
            >
              <Ionicons
                name="heart"
                size={18}
                color="#ef4444"
              />
            </View>

            <View style={styles.menuItemContent}>
              <Text
                style={[
                  styles.menuText,
                  { color: colors.text },
                ]}
              >
                {id.split('-')[0] === 'Beach'
                  ? 'Căn hộ nghỉ dưỡng ven biển'
                  : id.split('-')[0] === 'Mountain'
                    ? 'Nhà nghỉ giữa núi'
                    : 'Khu cắm trại thiên nhiên'}
              </Text>

              <Text
                style={[
                  styles.menuSubText,
                  { color: colors.secondary },
                ]}
              >
                {t(
                  'Đã lưu vào yêu thích trên thiết bị',
                  'Saved to favorites on this device',
                )}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => toggleFavorite(id)}
            >
              <Feather
                name="trash-2"
                size={18}
                color="#ef4444"
              />
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderBookings = () => (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.otherTabContainer}
    >
      <Text
        style={[
          styles.screenTitle,
          { color: colors.text },
        ]}
      >
        {t('Đặt chỗ của tôi', 'My bookings')}
      </Text>

      {bookings.length === 0 ? (
        <View
          style={[
            styles.emptyState,
            { backgroundColor: colors.panel },
          ]}
        >
          <Feather
            name="calendar"
            size={34}
            color={colors.secondary}
          />

          <Text
            style={[
              styles.emptyTitle,
              { color: colors.text },
            ]}
          >
            {t(
              'Chưa có yêu cầu đặt chỗ',
              'No booking requests yet',
            )}
          </Text>

          <Text
            style={[
              styles.emptyText,
              { color: colors.secondary },
            ]}
          >
            {t(
              'Bạn có thể tạo yêu cầu từ thẻ nơi lưu trú ở mục Tìm kiếm.',
              'You can make a request from a stay card in Search.',
            )}
          </Text>
        </View>
      ) : (
        bookings.map((booking) => (
          <View
            key={booking.id}
            style={[
              styles.simpleListItem,
              {
                borderBottomColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
          >
            <View
              style={[
                styles.menuIconBox,
                { backgroundColor: colors.iconBackground },
              ]}
            >
              <Feather
                name="calendar"
                size={18}
                color="#00a5b9"
              />
            </View>

            <View style={styles.menuItemContent}>
              <Text
                style={[
                  styles.menuText,
                  { color: colors.text },
                ]}
              >
                {booking.title}
              </Text>

              <Text
                style={[
                  styles.menuSubText,
                  { color: colors.secondary },
                ]}
              >
                {t('Ngày tạo:', 'Created:')} {booking.date} ·{' '}
                {booking.status}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() =>
                showMessage(
                  t('Yêu cầu đặt chỗ', 'Booking request'),
                  t(
                    'Đây là dữ liệu mẫu được lưu cục bộ.',
                    'This is sample data saved locally.',
                  ),
                )
              }
            >
              <Feather
                name="info"
                size={18}
                color={colors.secondary}
              />
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderInbox = () => (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.otherTabContainer}
    >
      <Text
        style={[
          styles.screenTitle,
          { color: colors.text },
        ]}
      >
        {t('Tin nhắn', 'Messages')}
      </Text>

      {messages.length === 0 ? (
        <View
          style={[
            styles.emptyState,
            { backgroundColor: colors.panel },
          ]}
        >
          <Ionicons
            name="chatbubble-outline"
            size={34}
            color={colors.secondary}
          />

          <Text
            style={[
              styles.emptyTitle,
              { color: colors.text },
            ]}
          >
            {t('Chưa có tin nhắn', 'No messages yet')}
          </Text>

          <Text
            style={[
              styles.emptyText,
              { color: colors.secondary },
            ]}
          >
            {t(
              'Tin nhắn sẽ xuất hiện ở đây khi ứng dụng được kết nối với dịch vụ nhắn tin.',
              'Messages will appear here when the app is connected to a messaging service.',
            )}
          </Text>
        </View>
      ) : (
        messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.simpleListItem,
              {
                borderBottomColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
          >
            <View
              style={[
                styles.menuIconBox,
                { backgroundColor: colors.iconBackground },
              ]}
            >
              <Ionicons
                name="chatbubble-outline"
                size={18}
                color="#00a5b9"
              />
            </View>

            <View style={styles.menuItemContent}>
              <Text
                style={[
                  styles.menuText,
                  { color: colors.text },
                ]}
              >
                {message.title}
              </Text>

              <Text
                style={[
                  styles.menuSubText,
                  { color: colors.secondary },
                ]}
              >
                {message.body} · {message.time}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <View
        style={[
          styles.mainContent,
          { backgroundColor: colors.background },
        ]}
      >
        {activeTab === 'Profile'
          ? renderProfile()
          : activeTab === 'Search'
            ? renderSearch()
            : activeTab === 'Favorites'
              ? renderFavorites()
              : activeTab === 'Bookings'
                ? renderBookings()
                : renderInbox()}
      </View>

      <View
        style={[
          styles.bottomTabNav,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
        ]}
      >
        {[
          {
            key: 'Search',
            label: t('Tìm kiếm', 'Search'),
            icon: 'search',
          },
          {
            key: 'Favorites',
            label: t('Yêu thích', 'Favorites'),
            icon: 'heart',
          },
          {
            key: 'Bookings',
            label: t('Đặt chỗ', 'Bookings'),
            icon: 'grid',
          },
          {
            key: 'Inbox',
            label: t('Tin nhắn', 'Messages'),
            icon: 'message-circle',
          },
          {
            key: 'Profile',
            label: t('Hồ sơ', 'Profile'),
            icon: 'user',
          },
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.tabItem}
            onPress={() => setActiveTab(item.key)}
          >
            {item.key === 'Favorites' ? (
              <Ionicons
                name="heart-outline"
                size={21}
                color={
                  activeTab === item.key
                    ? '#00bcd4'
                    : colors.secondary
                }
              />
            ) : item.key === 'Inbox' ? (
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color={
                  activeTab === item.key
                    ? '#00bcd4'
                    : colors.secondary
                }
              />
            ) : (
              <Feather
                name={item.icon as any}
                size={20}
                color={
                  activeTab === item.key
                    ? '#00bcd4'
                    : colors.secondary
                }
              />
            )}

            <Text
              style={[
                styles.tabLabel,
                {
                  color:
                    activeTab === item.key
                      ? '#00bcd4'
                      : colors.secondary,
                },
                activeTab === item.key &&
                  styles.activeTabLabel,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chỉnh sửa hồ sơ */}
      <Modal
        visible={editingProfile}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingProfile(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.card },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  { color: colors.text },
                ]}
              >
                {t('Chỉnh sửa hồ sơ', 'Edit profile')}
              </Text>

              <TouchableOpacity
                onPress={() => setEditingProfile(false)}
              >
                <Feather
                  name="x"
                  size={22}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            <Text
              style={[
                styles.inputLabel,
                { color: colors.text },
              ]}
            >
              {t('Họ và tên', 'Full name')}
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.input,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={editName}
              onChangeText={setEditName}
              placeholder={t(
                'Nhập họ và tên',
                'Enter your full name',
              )}
              placeholderTextColor={colors.placeholder}
              maxLength={80}
            />

            <Text
              style={[
                styles.inputLabel,
                { color: colors.text },
              ]}
            >
              {t('Số điện thoại', 'Phone number')}
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.input,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder={t(
                'Ví dụ: +84901234567',
                'Example: +84901234567',
              )}
              placeholderTextColor={colors.placeholder}
              keyboardType="phone-pad"
              maxLength={16}
            />

            <TouchableOpacity
              style={[
                styles.primaryButton,
                savingProfile && { opacity: 0.6 },
              ]}
              onPress={saveProfile}
              disabled={savingProfile}
            >
              {savingProfile ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {t('Lưu thay đổi', 'Save changes')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Cài đặt tài khoản */}
      <Modal
        visible={settingsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.card },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  { color: colors.text },
                ]}
              >
                {t('Cài đặt tài khoản', 'Account settings')}
              </Text>

              <TouchableOpacity
                onPress={() => setSettingsVisible(false)}
              >
                <Feather
                  name="x"
                  size={22}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.menuItem,
                { borderTopColor: colors.border },
              ]}
              onPress={() => {
                setSettingsVisible(false);
                setEditName(userData.name || '');
                setEditPhone(userData.phone || '');
                setEditingProfile(true);
              }}
            >
              <View
                style={[
                  styles.menuIconBox,
                  { backgroundColor: colors.iconBackground },
                ]}
              >
                <Feather
                  name="edit-2"
                  size={19}
                  color="#00a5b9"
                />
              </View>

              <View style={styles.menuItemContent}>
                <Text
                  style={[
                    styles.menuText,
                    { color: colors.text },
                  ]}
                >
                  {t('Chỉnh sửa hồ sơ', 'Edit profile')}
                </Text>

                <Text
                  style={[
                    styles.menuSubText,
                    { color: colors.secondary },
                  ]}
                >
                  {t(
                    'Cập nhật tên và số điện thoại',
                    'Update name and phone number',
                  )}
                </Text>
              </View>

              <Feather
                name="chevron-right"
                size={20}
                color={colors.secondary}
              />
            </TouchableOpacity>

            <View
              style={[
                styles.menuItem,
                { borderTopColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.menuIconBox,
                  { backgroundColor: colors.iconBackground },
                ]}
              >
                <Feather
                  name="globe"
                  size={19}
                  color={colors.text}
                />
              </View>

              <View style={styles.menuItemContent}>
                <Text
                  style={[
                    styles.menuText,
                    { color: colors.text },
                  ]}
                >
                  {t('Ngôn ngữ', 'Language')}
                </Text>

                <Text
                  style={[
                    styles.menuSubText,
                    { color: colors.secondary },
                  ]}
                >
                  {t(
                    'Chọn ngôn ngữ ứng dụng',
                    'Choose app language',
                  )}
                </Text>
              </View>

              <View style={styles.languageButtons}>
                <TouchableOpacity
                  onPress={() => changeLanguage('vi')}
                  style={[
                    styles.languageButton,
                    {
                      backgroundColor:
                        language === 'vi'
                          ? '#00bcd4'
                          : colors.inactiveButton,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        language === 'vi'
                          ? '#ffffff'
                          : colors.text,
                      fontWeight: '700',
                    }}
                  >
                    VI
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => changeLanguage('en')}
                  style={[
                    styles.languageButton,
                    {
                      backgroundColor:
                        language === 'en'
                          ? '#00bcd4'
                          : colors.inactiveButton,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        language === 'en'
                          ? '#ffffff'
                          : colors.text,
                      fontWeight: '700',
                    }}
                  >
                    EN
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.menuItem,
                { borderTopColor: colors.border },
              ]}
              onPress={() => {
                setSettingsVisible(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
                setPasswordModalVisible(true);
              }}
            >
              <View
                style={[
                  styles.menuIconBox,
                  { backgroundColor: colors.iconBackground },
                ]}
              >
                <Feather
                  name="lock"
                  size={19}
                  color={colors.text}
                />
              </View>

              <View style={styles.menuItemContent}>
                <Text
                  style={[
                    styles.menuText,
                    { color: colors.text },
                  ]}
                >
                  {t(
                    'Mật khẩu và bảo mật',
                    'Password and security',
                  )}
                </Text>

                <Text
                  style={[
                    styles.menuSubText,
                    { color: colors.secondary },
                  ]}
                >
                  {t(
                    'Thay đổi mật khẩu tài khoản',
                    'Change your account password',
                  )}
                </Text>
              </View>

              <Feather
                name="chevron-right"
                size={20}
                color={colors.secondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                { marginTop: 18 },
              ]}
              onPress={() => setSettingsVisible(false)}
            >
              <Text style={styles.primaryButtonText}>
                {t('Đóng', 'Close')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Đổi mật khẩu */}
      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.card },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  { color: colors.text },
                ]}
              >
                {t('Đổi mật khẩu', 'Change password')}
              </Text>

              <TouchableOpacity
                onPress={() => setPasswordModalVisible(false)}
              >
                <Feather
                  name="x"
                  size={22}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            <Text
              style={[
                styles.inputLabel,
                { color: colors.text },
              ]}
            >
              {t('Mật khẩu hiện tại', 'Current password')}
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.input,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder={t(
                'Nhập mật khẩu hiện tại',
                'Enter current password',
              )}
              placeholderTextColor={colors.placeholder}
              secureTextEntry
              autoCapitalize="none"
            />

            <Text
              style={[
                styles.inputLabel,
                { color: colors.text },
              ]}
            >
              {t(
                'Mật khẩu mới (ít nhất 6 ký tự)',
                'New password (at least 6 characters)',
              )}
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.input,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder={t(
                'Nhập mật khẩu mới',
                'Enter new password',
              )}
              placeholderTextColor={colors.placeholder}
              secureTextEntry
              autoCapitalize="none"
            />

            <Text
              style={[
                styles.inputLabel,
                { color: colors.text },
              ]}
            >
              {t(
                'Xác nhận mật khẩu mới',
                'Confirm new password',
              )}
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.input,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              placeholder={t(
                'Nhập lại mật khẩu mới',
                'Re-enter new password',
              )}
              placeholderTextColor={colors.placeholder}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[
                styles.primaryButton,
                { marginTop: 18 },
                savingPassword && { opacity: 0.6 },
              ]}
              onPress={changePassword}
              disabled={savingPassword}
            >
              {savingPassword ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {t(
                    'Lưu mật khẩu mới',
                    'Save new password',
                  )}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Cài đặt thông báo */}
      <Modal
        visible={notificationsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNotificationsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.card },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  { color: colors.text },
                ]}
              >
                {t(
                  'Cài đặt thông báo',
                  'Notification settings',
                )}
              </Text>

              <TouchableOpacity
                onPress={() => setNotificationsVisible(false)}
              >
                <Feather
                  name="x"
                  size={22}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.menuItem,
                { borderTopColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.menuIconBox,
                  { backgroundColor: colors.muted },
                ]}
              >
                <Feather
                  name="bell"
                  size={20}
                  color={colors.text}
                />
              </View>

              <View style={styles.menuItemContent}>
                <Text
                  style={[
                    styles.menuText,
                    { color: colors.text },
                  ]}
                >
                  {t(
                    'Thông báo trong ứng dụng',
                    'In-app notifications',
                  )}
                </Text>

                <Text
                  style={[
                    styles.menuSubText,
                    { color: colors.secondary },
                  ]}
                >
                  {t(
                    'Lưu lựa chọn trên thiết bị này',
                    'Save preference on this device',
                  )}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.toggle,
                  notificationsEnabled && styles.toggleOn,
                ]}
                onPress={toggleNotifications}
                accessibilityRole="switch"
                accessibilityState={{
                  checked: notificationsEnabled,
                }}
              >
                <View
                  style={[
                    styles.toggleKnob,
                    notificationsEnabled &&
                      styles.toggleKnobOn,
                  ]}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                { marginTop: 18 },
              ]}
              onPress={() => setNotificationsVisible(false)}
            >
              <Text style={styles.primaryButtonText}>
                {t('Hoàn tất', 'Done')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  mainContent: {
    flex: 1,
  },

  searchHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 16,
    height: 48,
  },

  searchIcon: {
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
  },

  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    paddingBottom: 8,
    paddingTop: 6,
  },

  categoryItem: {
    alignItems: 'center',
    paddingVertical: 4,
    width: 90,
    position: 'relative',
  },

  categoryText: {
    fontSize: 12,
    marginTop: 4,
  },

  activeText: {
    color: '#00bcd4',
    fontWeight: 'bold',
  },

  activeIndicator: {
    position: 'absolute',
    bottom: -9,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#00bcd4',
  },

  feedContainer: {
    padding: 20,
  },

  card: {
    marginBottom: 24,
    borderRadius: 16,
  },

  imageContainer: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
  },

  cardImage: {
    width: '100%',
    height: '100%',
  },

  heartButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  cardCategory: {
    fontSize: 14,
    marginTop: 3,
  },

  priceText: {
    fontSize: 13,
  },

  priceBold: {
    fontWeight: 'bold',
  },

  bookButton: {
    marginTop: 14,
    backgroundColor: '#00bcd4',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },

  bookButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },

  bottomTabNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingVertical: 10,
  },

  tabItem: {
    alignItems: 'center',
    flex: 1,
  },

  tabLabel: {
    fontSize: 10,
    marginTop: 3,
  },

  activeTabLabel: {
    color: '#00bcd4',
    fontWeight: 'bold',
  },

  profileContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },

  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  profileHeader: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
    padding: 22,
    borderRadius: 18,
  },

  avatarBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  avatarTouchable: {
    width: 80,
    height: 80,
    position: 'relative',
    marginBottom: 10,
  },

  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },

  avatarCameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#00bcd4',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  changeAvatarButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#ecfeff',
    marginBottom: 4,
  },

  changeAvatarText: {
    color: '#0891b2',
    fontSize: 12,
    fontWeight: '700',
  },

  removeAvatarButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 4,
  },

  removeAvatarText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },

  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  profilePhone: {
    fontSize: 14,
    marginTop: 5,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 12,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#16a34a',
    marginRight: 6,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803d',
  },

  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginTop: 16,
  },

  outlineButtonText: {
    color: '#00a5b9',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 7,
  },

  sectionCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    paddingTop: 16,
    paddingBottom: 6,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },

  lastInfoRow: {
    borderBottomWidth: 0,
  },

  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 15,
    fontWeight: '500',
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
  },

  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  menuItemContent: {
    flex: 1,
  },

  languageButtons: {
    flexDirection: 'row',
    gap: 6,
  },

  languageButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },

  themePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 5,
  },

  themePillText: {
    fontSize: 12,
    fontWeight: '700',
  },

  menuText: {
    fontSize: 15,
    fontWeight: '600',
  },

  menuSubText: {
    fontSize: 12,
    marginTop: 3,
  },

  logoutItem: {
    marginTop: 2,
  },

  logoutIconBox: {
    backgroundColor: '#fef2f2',
  },

  logoutText: {
    color: '#ef4444',
  },

  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 6,
    marginBottom: 8,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },

  otherTabContainer: {
    padding: 20,
    flexGrow: 1,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 42,
    marginTop: 20,
    borderRadius: 16,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 19,
  },

  simpleListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(15,23,42,0.55)',
  },

  modalCard: {
    borderRadius: 18,
    padding: 20,
    maxHeight: '90%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 19,
    fontWeight: '700',
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 7,
    marginTop: 8,
  },

  modalInput: {
    height: 46,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
  },

  primaryButton: {
    height: 46,
    borderRadius: 10,
    backgroundColor: '#00bcd4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },

  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    padding: 3,
  },

  toggleOn: {
    backgroundColor: '#00bcd4',
    alignItems: 'flex-end',
  },

  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffffff',
  },

  toggleKnobOn: {
    alignSelf: 'flex-end',
  },
});