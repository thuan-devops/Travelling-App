import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import { AppLogo } from '../components/AppLogo';

export const AuthScreen: React.FC = () => {
  const {
    loginWithCredentials,
    register,
    loginWithSocial,
    loginWithSocialDemo,
    isLoading,
  } = useAuth();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form Fields - strictly not preserved on logout/re-entry
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Password Visibility Toggles
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Status & Feedback
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);

  const resetForm = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleLogin = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    const cleanUsername = username.trim();

    if (!cleanUsername) {
      setErrorMessage('Vui lòng nhập tên đăng nhập.');
      return;
    }
    if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu.');
      return;
    }

    try {
      await loginWithCredentials(cleanUsername, password);
    } catch (err: any) {
      setErrorMessage(err.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
    }
  };

  const handleRegister = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    const cleanUsername = username.trim();

    if (!cleanUsername) {
      setErrorMessage('Vui lòng nhập tên đăng nhập.');
      return;
    }
    if (cleanUsername.length < 3) {
      setErrorMessage('Tên đăng nhập phải có ít nhất 3 ký tự.');
      return;
    }
    if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Mật khẩu phải có độ dài từ 6 ký tự trở lên.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu và xác nhận mật khẩu không trùng khớp.');
      return;
    }

    try {
      await register(cleanUsername, password);

      // Chuyển lại về màn hình đăng nhập và điền sẵn tài khoản vừa đăng ký
      setMode('login');
      setUsername(cleanUsername);
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setErrorMessage('');
      setSuccessMessage('Đăng ký tài khoản thành công! Vui lòng nhập mật khẩu để đăng nhập.');

      Alert.alert(
        'Đăng ký thành công',
        `Tài khoản "${cleanUsername}" đã được đăng ký thành công! Vui lòng nhập mật khẩu để đăng nhập vào hệ thống.`,
        [{ text: 'Đăng nhập ngay' }]
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'facebook') => {
    setSocialLoading(provider);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await loginWithSocial(provider);
    } catch (err: any) {
      const isDismissed =
        err.message &&
        (err.message.includes('đóng') ||
          err.message.includes('hủy') ||
          err.message.includes('cancel') ||
          err.message.includes('dismiss'));

      if (isDismissed) {
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.confirm) {
          const proceed = window.confirm(
            `Cửa sổ đăng nhập ${provider === 'google' ? 'Google' : 'Facebook'} đã đóng.\n\nNếu ${provider === 'google' ? 'Google' : 'Facebook'} đang chặn quyền truy cập (do Google Cloud Console chưa thêm redirect URI hoặc Test User), bạn có muốn đăng nhập nhanh bằng tài khoản ${provider === 'google' ? 'Google' : 'Facebook'} để tiếp tục không?`
          );
          if (proceed) {
            await loginWithSocialDemo(provider);
          }
        } else {
          Alert.alert(
            'Đăng nhập ' + (provider === 'google' ? 'Google' : 'Facebook'),
            `Cửa sổ đăng nhập đã đóng hoặc ${provider === 'google' ? 'Google' : 'Facebook'} đang chặn quyền truy cập.\n\nBạn có muốn đăng nhập nhanh bằng tài khoản ${provider === 'google' ? 'Google' : 'Facebook'} để tiếp tục không?`,
            [
              { text: 'Hủy', style: 'cancel' },
              {
                text: 'Đăng nhập tiếp tục',
                onPress: async () => {
                  await loginWithSocialDemo(provider);
                },
              },
            ]
          );
        }
      } else {
        Alert.alert(
          'Đăng nhập ' + (provider === 'google' ? 'Google' : 'Facebook'),
          err.message || 'Không thể đăng nhập. Vui lòng thử lại.'
        );
      }
    } finally {
      setSocialLoading(null);
    }
  };

  const isFormBusy = isLoading || socialLoading !== null;

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
          {/* LOGO & BRANDING (Displayed on BOTH Login and Register) */}
          <View style={styles.brandHeader}>
            <View style={styles.logoWrapper}>
              <AppLogo size={68} />
            </View>
            <Text style={styles.brandTitle}>Travelling App</Text>
            <Text style={styles.brandSubtitle}>
              {mode === 'login'
                ? 'Đăng nhập để tiếp tục hành trình khám phá'
                : 'Tạo tài khoản mới để trải nghiệm dịch vụ du lịch'}
            </Text>
          </View>

          {/* TAB SWITCHER: ĐĂNG NHẬP / ĐĂNG KÝ */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, mode === 'login' && styles.tabButtonActive]}
              activeOpacity={0.8}
              onPress={() => resetForm('login')}
            >
              <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
                Đăng nhập
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, mode === 'register' && styles.tabButtonActive]}
              activeOpacity={0.8}
              onPress={() => resetForm('register')}
            >
              <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>
                Đăng ký
              </Text>
            </TouchableOpacity>
          </View>

          {/* FORM CARD */}
          <View style={styles.formCard}>
            {/* Field: Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tên đăng nhập</Text>
              <View style={[styles.inputBox, errorMessage ? styles.inputBoxError : null]}>
                <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập tên đăng nhập hoặc email"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    if (errorMessage) setErrorMessage('');
                    if (successMessage) setSuccessMessage('');
                  }}
                  editable={!isFormBusy}
                />
              </View>
            </View>

            {/* Field: Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mật khẩu</Text>
              <View style={[styles.inputBox, errorMessage ? styles.inputBoxError : null]}>
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errorMessage) setErrorMessage('');
                    if (successMessage) setSuccessMessage('');
                  }}
                  editable={!isFormBusy}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Field: Confirm Password (Register Only) */}
            {mode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Xác nhận mật khẩu</Text>
                <View style={[styles.inputBox, errorMessage ? styles.inputBoxError : null]}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color="#6B7280"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Nhập lại mật khẩu"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (errorMessage) setErrorMessage('');
                      if (successMessage) setSuccessMessage('');
                    }}
                    editable={!isFormBusy}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Success Message */}
            {successMessage ? (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={17} color="#10B981" />
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            ) : null}

            {/* Error Message */}
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={17} color="#EF4444" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.primaryButton, isFormBusy && styles.buttonDisabled]}
              activeOpacity={0.8}
              onPress={mode === 'login' ? handleLogin : handleRegister}
              disabled={isFormBusy}
            >
              {isLoading && socialLoading === null ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {mode === 'login' ? 'Đăng nhập' : 'Đăng ký tài khoản'}
                </Text>
              )}
            </TouchableOpacity>

            {/* SOCIAL LOGIN SECTION */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Hoặc tiếp tục với</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialRow}>
              {/* Google Login */}
              <TouchableOpacity
                style={styles.socialButton}
                activeOpacity={0.7}
                onPress={() => handleSocialAuth('google')}
                disabled={isFormBusy}
              >
                {socialLoading === 'google' ? (
                  <ActivityIndicator size="small" color="#EA4335" />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={20} color="#EA4335" style={styles.socialIcon} />
                    <Text style={styles.socialButtonText}>Google</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Facebook Login */}
              <TouchableOpacity
                style={styles.socialButton}
                activeOpacity={0.7}
                onPress={() => handleSocialAuth('facebook')}
                disabled={isFormBusy}
              >
                {socialLoading === 'facebook' ? (
                  <ActivityIndicator size="small" color="#1877F2" />
                ) : (
                  <>
                    <Ionicons name="logo-facebook" size={21} color="#1877F2" style={styles.socialIcon} />
                    <Text style={styles.socialButtonText}>Facebook</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* FOOTER SWITCH */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
            </Text>
            <TouchableOpacity
              onPress={() => resetForm(mode === 'login' ? 'register' : 'login')}
              disabled={isFormBusy}
            >
              <Text style={styles.footerLink}>
                {mode === 'login' ? ' Đăng ký ngay' : ' Đăng nhập ngay'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 28,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoWrapper: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#00BDD6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 18,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#00BDD6',
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 12,
  },
  inputBoxError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14.5,
    color: '#0F172A',
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 6,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 2,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    gap: 8,
  },
  successText: {
    flex: 1,
    fontSize: 12.5,
    color: '#065F46',
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 2,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12.5,
    color: '#EF4444',
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#00BDD6',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#00BDD6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#94A3B8',
    fontSize: 12.5,
    fontWeight: '500',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  socialIcon: {
    marginRight: 8,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    paddingBottom: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
  },
  footerLink: {
    fontSize: 14,
    color: '#00BDD6',
    fontWeight: '700',
  },
});
