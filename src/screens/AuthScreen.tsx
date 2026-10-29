import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
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

const COUNTRIES = [
  {
    name: { vi: 'Việt Nam', en: 'Vietnam' },
    code: '+84',
    flagUrl: 'https://flagcdn.com/w40/vn.png',
  },
  {
    name: { vi: 'Hoa Kỳ', en: 'United States' },
    code: '+1',
    flagUrl: 'https://flagcdn.com/w40/us.png',
  },
  {
    name: { vi: 'Vương quốc Anh', en: 'United Kingdom' },
    code: '+44',
    flagUrl: 'https://flagcdn.com/w40/gb.png',
  },
  {
    name: { vi: 'Canada', en: 'Canada' },
    code: '+1',
    flagUrl: 'https://flagcdn.com/w40/ca.png',
  },
  {
    name: { vi: 'Úc', en: 'Australia' },
    code: '+61',
    flagUrl: 'https://flagcdn.com/w40/au.png',
  },
];

type Language = 'vi' | 'en';

export default function AuthScreen({
  navigation,
}: {
  navigation: any;
}) {
  const [language, setLanguage] = useState<Language>('vi');
  const [languageLoaded, setLanguageLoaded] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Ngon ngu hien tai
  const t = {
    language: language === 'vi' ? 'Ngôn ngữ' : 'Language',

    welcome: language === 'vi'
      ? 'Chào mừng bạn trở lại'
      : 'Welcome Back',

    createAccount: language === 'vi'
      ? 'Tạo tài khoản mới'
      : 'Create New Account',

    loginSubtitle: language === 'vi'
      ? 'Đăng nhập để tiếp tục sử dụng tài khoản của bạn.'
      : 'Sign in to continue using your account.',

    registerSubtitle: language === 'vi'
      ? 'Đăng ký để bắt đầu trải nghiệm ứng dụng.'
      : 'Create an account to start using the app.',

    fullName: language === 'vi' ? 'Họ và tên' : 'Full Name',

    fullNamePlaceholder: language === 'vi'
      ? 'Nhập họ và tên của bạn'
      : 'Enter your full name',

    phone: language === 'vi' ? 'Số điện thoại' : 'Phone Number',

    phonePlaceholder: language === 'vi'
      ? 'Nhập số điện thoại'
      : 'Enter your phone number',

    password: language === 'vi' ? 'Mật khẩu' : 'Password',

    passwordPlaceholder: language === 'vi'
      ? 'Nhập mật khẩu'
      : 'Enter your password',

    createPassword: language === 'vi'
      ? 'Tạo mật khẩu (ít nhất 6 ký tự)'
      : 'Create password (at least 6 characters)',

    login: language === 'vi' ? 'Đăng nhập' : 'Sign In',

    register: language === 'vi' ? 'Đăng ký' : 'Register',

    noAccount: language === 'vi'
      ? 'Bạn chưa có tài khoản? '
      : "Don't have an account? ",

    haveAccount: language === 'vi'
      ? 'Bạn đã có tài khoản? '
      : 'Already have an account? ',

    chooseCountry: language === 'vi'
      ? 'Chọn quốc gia'
      : 'Select Country',

    missingInfo: language === 'vi'
      ? 'Thiếu thông tin'
      : 'Missing Information',

    enterPhonePassword: language === 'vi'
      ? 'Vui lòng nhập số điện thoại và mật khẩu.'
      : 'Please enter your phone number and password.',

    enterName: language === 'vi'
      ? 'Vui lòng nhập họ và tên.'
      : 'Please enter your full name.',

    invalidPhone: language === 'vi'
      ? 'Số điện thoại không hợp lệ'
      : 'Invalid Phone Number',

    invalidPhoneMessage: language === 'vi'
      ? 'Vui lòng nhập từ 7 đến 11 chữ số, không bao gồm mã quốc gia.'
      : 'Enter 7 to 11 digits, excluding the country code.',

    invalidPassword: language === 'vi'
      ? 'Mật khẩu chưa hợp lệ'
      : 'Invalid Password',

    invalidPasswordMessage: language === 'vi'
      ? 'Mật khẩu đăng ký phải có ít nhất 6 ký tự.'
      : 'The password must contain at least 6 characters.',

    accountNotFound: language === 'vi'
      ? 'Không tìm thấy tài khoản'
      : 'Account Not Found',

    accountNotFoundMessage: language === 'vi'
      ? 'Số điện thoại này chưa được đăng ký. Vui lòng chọn Đăng ký để tạo tài khoản.'
      : 'This phone number is not registered. Please register first.',

    wrongPassword: language === 'vi'
      ? 'Sai mật khẩu'
      : 'Incorrect Password',

    wrongPasswordMessage: language === 'vi'
      ? 'Mật khẩu không chính xác. Vui lòng thử lại.'
      : 'The password is incorrect. Please try again.',

    accountExists: language === 'vi'
      ? 'Tài khoản đã tồn tại'
      : 'Account Already Exists',

    accountExistsMessage: language === 'vi'
      ? 'Số điện thoại này đã được đăng ký. Vui lòng chọn Đăng nhập.'
      : 'This phone number is already registered. Please sign in.',

    error: language === 'vi'
      ? 'Đã xảy ra lỗi'
      : 'An Error Occurred',

    errorMessage: language === 'vi'
      ? 'Không thể xử lý thông tin lúc này. Vui lòng thử lại.'
      : 'Unable to process your request. Please try again.',
  };

  // Tai ngon ngu da luu
  useEffect(() => {
    let isMounted = true;

    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('app_language');

        if (
          isMounted &&
          (savedLanguage === 'vi' || savedLanguage === 'en')
        ) {
          setLanguage(savedLanguage);
        }
      } catch (error) {
        console.log('Cannot load language:', error);
      } finally {
        if (isMounted) {
          setLanguageLoaded(true);
        }
      }
    };

    loadLanguage();

    return () => {
      isMounted = false;
    };
  }, []);

  // Doi va luu ngon ngu
  const changeLanguage = async (newLanguage: Language) => {
    setLanguage(newLanguage);

    try {
      await AsyncStorage.setItem('app_language', newLanguage);
    } catch (error) {
      console.log('Cannot save language:', error);
    }
  };

  // Hien thi thong bao tren web va dien thoai
  const showMessage = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // Dang nhap va dang ky
  const handleAuth = async () => {
    if (isLoading) return;

    const trimmedPhone = phoneNumber.trim();
    const fullPhone = selectedCountry.code + trimmedPhone;

    if (!trimmedPhone || !password) {
      showMessage(t.missingInfo, t.enterPhonePassword);
      return;
    }

    if (!isLoginMode && !fullName.trim()) {
      showMessage(t.missingInfo, t.enterName);
      return;
    }

    if (!/^\d{7,11}$/.test(trimmedPhone)) {
      showMessage(t.invalidPhone, t.invalidPhoneMessage);
      return;
    }

    if (!isLoginMode && password.length < 6) {
      showMessage(t.invalidPassword, t.invalidPasswordMessage);
      return;
    }

    setIsLoading(true);

    try {
      if (isLoginMode) {
        // Dang nhap
        const savedUserStr = await AsyncStorage.getItem(
          `user_${fullPhone}`
        );

        if (!savedUserStr) {
          showMessage(t.accountNotFound, t.accountNotFoundMessage);
          return;
        }

        const savedUser = JSON.parse(savedUserStr);

        if (savedUser.password !== password) {
          showMessage(t.wrongPassword, t.wrongPasswordMessage);
          return;
        }

        await AsyncStorage.setItem(
          'current_user',
          JSON.stringify(savedUser)
        );

        await AsyncStorage.setItem('is_logged_in', 'true');

        navigation.replace('Home');
      } else {
        // Dang ky
        const existingUser = await AsyncStorage.getItem(
          `user_${fullPhone}`
        );

        if (existingUser) {
          showMessage(t.accountExists, t.accountExistsMessage);
          return;
        }

        const newUser = {
          name: fullName.trim(),
          phone: fullPhone,
          password: password,
        };

        await AsyncStorage.setItem(
          `user_${fullPhone}`,
          JSON.stringify(newUser)
        );

        await AsyncStorage.setItem(
          'current_user',
          JSON.stringify(newUser)
        );

        await AsyncStorage.setItem('is_logged_in', 'true');

        navigation.replace('Home');
      }
    } catch (error) {
      showMessage(t.error, t.errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Trong khi doc ngon ngu, khong hien giao dien sai ngon ngu
  if (!languageLoaded) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00bcd4" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* LUA CHON NGON NGU */}
        <View style={styles.languageRow}>
          <Text style={styles.languageLabel}>{t.language}:</Text>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Tiếng Việt"
            style={[
              styles.languageButton,
              language === 'vi' && styles.languageButtonActive,
            ]}
            onPress={() => changeLanguage('vi')}
          >
            <Text
              style={[
                styles.languageButtonText,
                language === 'vi' && styles.languageButtonTextActive,
              ]}
            >
              🇻🇳 VI
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="English"
            style={[
              styles.languageButton,
              language === 'en' && styles.languageButtonActive,
            ]}
            onPress={() => changeLanguage('en')}
          >
            <Text
              style={[
                styles.languageButtonText,
                language === 'en' && styles.languageButtonTextActive,
              ]}
            >
              🇬🇧 EN
            </Text>
          </TouchableOpacity>
        </View>

        {/* LOGO */}
        <View style={styles.logoWrapper}>
          <View style={styles.logoLeftBar} />

          <View style={styles.logoRightDots}>
            <View style={styles.dotPurple} />
            <View style={styles.dotBlue} />
          </View>
        </View>

        {/* TIEU DE */}
        <Text style={styles.title}>
          {isLoginMode ? t.welcome : t.createAccount}
        </Text>

        <Text style={styles.subtitle}>
          {isLoginMode ? t.loginSubtitle : t.registerSubtitle}
        </Text>

        {/* HO TEN - CHI HIEN KHI DANG KY */}
        {!isLoginMode && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.fullName}</Text>

            <TextInput
              style={styles.textInputBox}
              placeholder={t.fullNamePlaceholder}
              placeholderTextColor="#9ca3af"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>
        )}

        {/* SO DIEN THOAI */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t.phone}</Text>

          <View style={styles.phoneSection}>
            <TouchableOpacity
              style={styles.flagPickerBox}
              onPress={() => setModalVisible(true)}
            >
              <Image
                source={{ uri: selectedCountry.flagUrl }}
                style={styles.flagImage}
                resizeMode="contain"
              />

              <Text style={styles.codeText}>
                {selectedCountry.code}
              </Text>

              <Ionicons
                name="chevron-down"
                size={12}
                color="#4b5563"
              />
            </TouchableOpacity>

            <TextInput
              style={styles.phoneInputBox}
              placeholder={t.phonePlaceholder}
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={(text) =>
                setPhoneNumber(text.replace(/\D/g, ''))
              }
              maxLength={11}
              returnKeyType="next"
            />
          </View>
        </View>

        {/* MAT KHAU */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t.password}</Text>

          <TextInput
            style={styles.textInputBox}
            placeholder={
              isLoginMode
                ? t.passwordPlaceholder
                : t.createPassword
            }
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={handleAuth}
          />
        </View>

        {/* NUT DANG NHAP / DANG KY */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            isLoading && styles.disabledButton,
          ]}
          onPress={handleAuth}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.continueButtonText}>
              {isLoginMode ? t.login : t.register}
            </Text>
          )}
        </TouchableOpacity>

        {/* CHUYEN DOI DANG NHAP / DANG KY */}
        <View style={styles.loginFooterRow}>
          <Text style={styles.footerLabelText}>
            {isLoginMode ? t.noAccount : t.haveAccount}
          </Text>

          <TouchableOpacity
            onPress={() => setIsLoginMode(!isLoginMode)}
          >
            <Text style={styles.loginActionLink}>
              {isLoginMode ? t.register : t.login}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL CHON QUOC GIA */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t.chooseCountry}
              </Text>

              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel={
                  language === 'vi' ? 'Đóng' : 'Close'
                }
              >
                <Ionicons
                  name="close"
                  size={24}
                  color="#374151"
                />
              </TouchableOpacity>
            </View>

            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item.name.en + item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => {
                    setSelectedCountry(item);
                    setModalVisible(false);
                  }}
                >
                  <Image
                    source={{ uri: item.flagUrl }}
                    style={styles.modalFlagImage}
                    resizeMode="contain"
                  />

                  <Text style={styles.countryItemName}>
                    {item.name[language]}
                  </Text>

                  <Text style={styles.countryItemCode}>
                    {item.code}
                  </Text>
                </TouchableOpacity>
              )}
            />
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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },

  languageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 24,
  },

  languageLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginRight: 6,
  },

  languageButton: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginLeft: 6,
    backgroundColor: '#ffffff',
  },

  languageButtonActive: {
    backgroundColor: '#e0f7fa',
    borderColor: '#00bcd4',
  },

  languageButtonText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },

  languageButtonTextActive: {
    color: '#008c9e',
    fontWeight: '700',
  },

  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    height: 38,
  },

  logoLeftBar: {
    width: 14,
    height: 36,
    backgroundColor: '#00bcd4',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    marginRight: 6,
  },

  logoRightDots: {
    justifyContent: 'space-between',
    height: 34,
  },

  dotPurple: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#8b5cf6',
  },

  dotBlue: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#3b82f6',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#6b7280',
    marginBottom: 22,
  },

  inputGroup: {
    marginBottom: 14,
  },

  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
    fontWeight: '500',
  },

  textInputBox: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#ffffff',
  },

  phoneSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  flagPickerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 48,
    marginRight: 10,
  },

  flagImage: {
    width: 24,
    height: 16,
    marginRight: 6,
    borderRadius: 2,
  },

  codeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginRight: 4,
  },

  phoneInputBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 15,
    color: '#111827',
  },

  continueButton: {
    backgroundColor: '#00bcd4',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },

  disabledButton: {
    opacity: 0.7,
  },

  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  loginFooterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 20,
  },

  footerLabelText: {
    fontSize: 14,
    color: '#6b7280',
  },

  loginActionLink: {
    fontSize: 14,
    color: '#00bcd4',
    fontWeight: 'bold',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 10,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },

  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },

  modalFlagImage: {
    width: 28,
    height: 18,
    marginRight: 12,
    borderRadius: 2,
  },

  countryItemName: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },

  countryItemCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
});