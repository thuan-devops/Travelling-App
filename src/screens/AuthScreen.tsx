import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { StatusBar } from 'expo-status-bar';

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'VN', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
];

export const AuthScreen: React.FC = () => {
  const { loginWithPhone, loginWithSocial, skipToGuest, isLoading } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [isCountryModalVisible, setIsCountryModalVisible] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const validatePhone = (phone: string): string | null => {
    if (!phone.trim()) {
      return 'Vui lòng nhập số điện thoại (Please enter phone number)';
    }
    const cleanNumber = phone.replace(/[\s\-\(\)]/g, '');
    if (!/^\d+$/.test(cleanNumber)) {
      return 'Số điện thoại chỉ được chứa chữ số (Digits only)';
    }
    if (cleanNumber.length < 8 || cleanNumber.length > 12) {
      return 'Số điện thoại hợp lệ gồm 8 - 12 chữ số';
    }
    return null;
  };

  const handleContinue = async () => {
    setErrorMessage('');
    const error = validatePhone(phoneNumber);
    if (error) {
      setErrorMessage(error);
      return;
    }

    try {
      await loginWithPhone(phoneNumber, selectedCountry.dialCode);
    } catch {
      Alert.alert('Lỗi', 'Không thể đăng nhập. Vui lòng thử lại!');
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      await loginWithSocial(provider);
    } catch {
      Alert.alert('Lỗi', `Đăng nhập với ${provider} thất bại.`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>
              {isLoginMode ? 'Chào mừng trở lại' : 'Tạo tài khoản'}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Nhập số điện thoại của bạn:</Text>

            <View style={styles.phoneInputRow}>
              {/* Country Picker Button */}
              <TouchableOpacity
                style={styles.countryPickerButton}
                activeOpacity={0.7}
                onPress={() => setIsCountryModalVisible(true)}
              >
                <Text style={styles.flagText}>{selectedCountry.flag}</Text>
                <Ionicons name="chevron-down" size={16} color="#4B5563" />
              </TouchableOpacity>

              {/* Number Input */}
              <View style={[styles.inputBox, errorMessage ? styles.inputBoxError : null]}>
                <TextInput
                  style={styles.textInput}
                  placeholder={`${selectedCountry.dialCode} Số điện thoại`}
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={(text) => {
                    setPhoneNumber(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  autoFocus={false}
                />
              </View>
            </View>

            {/* Error Message Display */}
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Continue Button */}
            <TouchableOpacity
              style={[styles.continueButton, isLoading && styles.buttonDisabled]}
              activeOpacity={0.8}
              onPress={handleContinue}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.continueButtonText}>Tiếp tục</Text>
              )}
            </TouchableOpacity>

            {/* "or" divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>hoặc</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Logins */}
            <TouchableOpacity
              style={styles.appleButton}
              activeOpacity={0.7}
              onPress={() => handleSocialLogin('apple')}
              disabled={isLoading}
            >
              <Ionicons name="logo-apple" size={20} color="#111827" style={styles.socialIcon} />
              <Text style={styles.appleButtonText}>Tiếp tục với Apple</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.facebookButton}
              activeOpacity={0.7}
              onPress={() => handleSocialLogin('facebook')}
              disabled={isLoading}
            >
              <Ionicons name="logo-facebook" size={20} color="#1877F2" style={styles.socialIcon} />
              <Text style={styles.facebookButtonText}>Tiếp tục với Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.googleButton}
              activeOpacity={0.7}
              onPress={() => handleSocialLogin('google')}
              disabled={isLoading}
            >
              <Ionicons name="logo-google" size={18} color="#EA4335" style={styles.socialIcon} />
              <Text style={styles.googleButtonText}>Tiếp tục với Google</Text>
            </TouchableOpacity>

            {/* Terms and Privacy */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                Bằng việc tiếp tục, bạn đồng ý với{' '}
                <Text style={styles.termsLink}>Điều khoản dịch vụ</Text> và{' '}
                <Text style={styles.termsLink}>Chính sách quyền riêng tư</Text> của chúng tôi.
              </Text>
            </View>

            {/* Quick Guest Access */}
            <TouchableOpacity
              style={styles.guestButton}
              onPress={skipToGuest}
              activeOpacity={0.6}
            >
              <Text style={styles.guestButtonText}>🚀 Khám phá nhanh (Dùng thử ngay)</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Switch Login/Register */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              {isLoginMode ? 'Chưa có tài khoản? ' : 'Bạn đã có tài khoản? '}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setIsLoginMode(!isLoginMode);
                setErrorMessage('');
              }}
            >
              <Text style={styles.footerLink}>
                {isLoginMode ? 'Đăng ký' : 'Đăng nhập'}
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Selection Modal */}
      <Modal
        visible={isCountryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCountryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country / Region</Text>
              <TouchableOpacity onPress={() => setIsCountryModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.countryItem,
                    selectedCountry.code === item.code && styles.countryItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedCountry(item);
                    setIsCountryModalVisible(false);
                  }}
                >
                  <Text style={styles.countryFlag}>{item.flag}</Text>
                  <Text style={styles.countryName}>{item.name}</Text>
                  <Text style={styles.countryDialCode}>{item.dialCode}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  headerContainer: {
    marginBottom: 36,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  formContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 10,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  countryPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    height: 52,
    paddingHorizontal: 12,
    marginRight: 10,
    gap: 6,
  },
  flagText: {
    fontSize: 22,
  },
  inputBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  inputBoxError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  textInput: {
    fontSize: 16,
    color: '#111827',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
    gap: 6,
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
  },
  continueButton: {
    backgroundColor: '#00BDD6', // Exact Cyan/Teal from Screenshot 2
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 14,
    color: '#6B7280',
    fontSize: 14,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  appleButtonText: {
    color: '#1F2937',
    fontSize: 15,
    fontWeight: '600',
  },
  facebookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#1877F2',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  facebookButtonText: {
    color: '#1877F2',
    fontSize: 15,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#EA4335',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  googleButtonText: {
    color: '#EA4335',
    fontSize: 15,
    fontWeight: '600',
  },
  socialIcon: {
    marginRight: 10,
  },
  termsContainer: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  termsText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    textDecorationLine: 'underline',
    color: '#4B5563',
  },
  guestButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginTop: 6,
  },
  guestButtonText: {
    color: '#0D9488',
    fontSize: 14,
    fontWeight: '600',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 15,
    color: '#4B5563',
  },
  footerLink: {
    fontSize: 15,
    color: '#00BDD6',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  countryItemSelected: {
    backgroundColor: '#F0FDFA',
  },
  countryFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  countryDialCode: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
});
