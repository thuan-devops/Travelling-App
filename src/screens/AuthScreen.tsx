import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { AppLogo } from '../components/AppLogo';

export const AuthScreen: React.FC = () => {
  const { loginWithCredentials, register, isLoading } = useAuth();
  const { isDarkMode } = useTheme();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form Fields
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Password Visibility Toggles
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Status & Feedback
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

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

  const isFormBusy = isLoading;

  return (
    <View style={styles.rootContainer}>
      <StatusBar style="light" />

      {/* BACKGROUND IMAGE VỚI HIỆU ỨNG BLUR MỜ MỜ NGHỆ THUẬT */}
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
        }}
        style={styles.backgroundImage}
        blurRadius={Platform.OS === 'web' ? 10 : 16}
        resizeMode="cover"
      >
        {/* LỚP PHỦ GRADIENT & TINT TẠO ĐỘ SÂU ĐẸP MẮT */}
        <View
          style={[
            styles.backdropOverlay,
            {
              backgroundColor: isDarkMode
                ? 'rgba(11, 19, 43, 0.78)'
                : 'rgba(15, 23, 42, 0.52)',
            },
          ]}
        >
          {/* VẦNG SÁNG AMBIENT GLOW TRANG TRÍ */}
          <View style={[styles.ambientOrb, styles.ambientOrbTop]} />
          <View style={[styles.ambientOrb, styles.ambientOrbBottom]} />

          <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.keyboardView}
            >
              <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* KHUNG ĐĂNG NHẬP / ĐĂNG KÝ GLASSMORPHISM HIỆN ĐẠI */}
                <View
                  style={[
                    styles.glassCard,
                    {
                      backgroundColor: isDarkMode
                        ? 'rgba(15, 23, 42, 0.84)'
                        : 'rgba(255, 255, 255, 0.90)',
                      borderColor: isDarkMode
                        ? 'rgba(255, 255, 255, 0.12)'
                        : 'rgba(255, 255, 255, 0.65)',
                    },
                  ]}
                >
                  {/* LOGO & BRAND HEADER */}
                  <View style={styles.brandHeader}>
                    <View
                      style={[
                        styles.logoEmblem,
                        {
                          backgroundColor: isDarkMode
                            ? 'rgba(0, 189, 214, 0.15)'
                            : '#FFFFFF',
                          borderColor: isDarkMode
                            ? 'rgba(0, 189, 214, 0.4)'
                            : '#E0F7FA',
                        },
                      ]}
                    >
                      <AppLogo size={48} />
                    </View>

                    <Text
                      style={[
                        styles.brandTitle,
                        { color: isDarkMode ? '#F8FAFC' : '#0F172A' },
                      ]}
                    >
                      Travelling App
                    </Text>

                    <Text
                      style={[
                        styles.brandSubtitle,
                        { color: isDarkMode ? '#94A3B8' : '#64748B' },
                      ]}
                    >
                      {mode === 'login'
                        ? 'Đăng nhập để tiếp tục hành trình khám phá'
                        : 'Tạo tài khoản mới để trải nghiệm dịch vụ'}
                    </Text>
                  </View>

                  {/* TAB SWITCHER: ĐĂNG NHẬP / ĐĂNG KÝ */}
                  <View
                    style={[
                      styles.tabContainer,
                      {
                        backgroundColor: isDarkMode
                          ? 'rgba(30, 41, 59, 0.85)'
                          : 'rgba(241, 245, 249, 0.95)',
                        borderColor: isDarkMode
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(203, 213, 225, 0.5)',
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.tabButton,
                        mode === 'login' && styles.tabButtonActive,
                      ]}
                      activeOpacity={0.8}
                      onPress={() => resetForm('login')}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          {
                            color:
                              mode === 'login'
                                ? '#FFFFFF'
                                : isDarkMode
                                ? '#94A3B8'
                                : '#64748B',
                          },
                          mode === 'login' && styles.tabTextActive,
                        ]}
                      >
                        Đăng nhập
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.tabButton,
                        mode === 'register' && styles.tabButtonActive,
                      ]}
                      activeOpacity={0.8}
                      onPress={() => resetForm('register')}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          {
                            color:
                              mode === 'register'
                                ? '#FFFFFF'
                                : isDarkMode
                                ? '#94A3B8'
                                : '#64748B',
                          },
                          mode === 'register' && styles.tabTextActive,
                        ]}
                      >
                        Đăng ký
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* FORM FIELDS */}
                  <View style={styles.formFields}>
                    {/* Tên đăng nhập */}
                    <View style={styles.inputGroup}>
                      <Text
                        style={[
                          styles.inputLabel,
                          { color: isDarkMode ? '#E2E8F0' : '#334155' },
                        ]}
                      >
                        Tên đăng nhập
                      </Text>
                      <View
                        style={[
                          styles.inputBox,
                          {
                            backgroundColor: isDarkMode
                              ? 'rgba(30, 41, 59, 0.7)'
                              : 'rgba(248, 250, 252, 0.95)',
                            borderColor: isDarkMode
                              ? 'rgba(255, 255, 255, 0.1)'
                              : '#E2E8F0',
                          },
                          errorMessage ? styles.inputBoxError : null,
                        ]}
                      >
                        <Ionicons
                          name="person-outline"
                          size={19}
                          color="#00BDD6"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={[
                            styles.textInput,
                            { color: isDarkMode ? '#F8FAFC' : '#0F172A' },
                          ]}
                          placeholder="Nhập tên đăng nhập hoặc email"
                          placeholderTextColor={
                            isDarkMode ? '#64748B' : '#9CA3AF'
                          }
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

                    {/* Mật khẩu */}
                    <View style={styles.inputGroup}>
                      <Text
                        style={[
                          styles.inputLabel,
                          { color: isDarkMode ? '#E2E8F0' : '#334155' },
                        ]}
                      >
                        Mật khẩu
                      </Text>
                      <View
                        style={[
                          styles.inputBox,
                          {
                            backgroundColor: isDarkMode
                              ? 'rgba(30, 41, 59, 0.7)'
                              : 'rgba(248, 250, 252, 0.95)',
                            borderColor: isDarkMode
                              ? 'rgba(255, 255, 255, 0.1)'
                              : '#E2E8F0',
                          },
                          errorMessage ? styles.inputBoxError : null,
                        ]}
                      >
                        <Ionicons
                          name="lock-closed-outline"
                          size={19}
                          color="#00BDD6"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={[
                            styles.textInput,
                            { color: isDarkMode ? '#F8FAFC' : '#0F172A' },
                          ]}
                          placeholder="Nhập mật khẩu"
                          placeholderTextColor={
                            isDarkMode ? '#64748B' : '#9CA3AF'
                          }
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
                            color={isDarkMode ? '#94A3B8' : '#64748B'}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Xác nhận mật khẩu (Chỉ khi Đăng ký) */}
                    {mode === 'register' && (
                      <View style={styles.inputGroup}>
                        <Text
                          style={[
                            styles.inputLabel,
                            { color: isDarkMode ? '#E2E8F0' : '#334155' },
                          ]}
                        >
                          Xác nhận mật khẩu
                        </Text>
                        <View
                          style={[
                            styles.inputBox,
                            {
                              backgroundColor: isDarkMode
                                ? 'rgba(30, 41, 59, 0.7)'
                                : 'rgba(248, 250, 252, 0.95)',
                              borderColor: isDarkMode
                                ? 'rgba(255, 255, 255, 0.1)'
                                : '#E2E8F0',
                            },
                            errorMessage ? styles.inputBoxError : null,
                          ]}
                        >
                          <Ionicons
                            name="shield-checkmark-outline"
                            size={19}
                            color="#00BDD6"
                            style={styles.inputIcon}
                          />
                          <TextInput
                            style={[
                              styles.textInput,
                              { color: isDarkMode ? '#F8FAFC' : '#0F172A' },
                            ]}
                            placeholder="Nhập lại mật khẩu"
                            placeholderTextColor={
                              isDarkMode ? '#64748B' : '#9CA3AF'
                            }
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
                            onPress={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            activeOpacity={0.7}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <Ionicons
                              name={
                                showConfirmPassword
                                  ? 'eye-off-outline'
                                  : 'eye-outline'
                              }
                              size={20}
                              color={isDarkMode ? '#94A3B8' : '#64748B'}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {/* Thông báo thành công */}
                    {successMessage ? (
                      <View style={styles.successContainer}>
                        <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                        <Text style={styles.successText}>{successMessage}</Text>
                      </View>
                    ) : null}

                    {/* Thông báo lỗi */}
                    {errorMessage ? (
                      <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={18} color="#EF4444" />
                        <Text style={styles.errorText}>{errorMessage}</Text>
                      </View>
                    ) : null}

                    {/* NÚT HÀNH ĐỘNG CHÍNH */}
                    <TouchableOpacity
                      style={[
                        styles.primaryButton,
                        isFormBusy && styles.buttonDisabled,
                      ]}
                      activeOpacity={0.88}
                      onPress={mode === 'login' ? handleLogin : handleRegister}
                      disabled={isFormBusy}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <View style={styles.primaryButtonInner}>
                          <Ionicons
                            name={
                              mode === 'login'
                                ? 'log-in-outline'
                                : 'person-add-outline'
                            }
                            size={20}
                            color="#FFFFFF"
                            style={{ marginRight: 8 }}
                          />
                          <Text style={styles.primaryButtonText}>
                            {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* FOOTER SWITCH */}
                  <View style={styles.footerContainer}>
                    <Text
                      style={[
                        styles.footerText,
                        { color: isDarkMode ? '#94A3B8' : '#64748B' },
                      ]}
                    >
                      {mode === 'login'
                        ? 'Chưa có tài khoản?'
                        : 'Đã có tài khoản?'}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        resetForm(mode === 'login' ? 'register' : 'login')
                      }
                      disabled={isFormBusy}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.footerLink}>
                        {mode === 'login' ? ' Đăng ký ngay' : ' Đăng nhập ngay'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#0B132B',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backdropOverlay: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  // Vầng sáng màu Ambient Glow tạo chiều sâu nghệ thuật
  ambientOrb: {
    position: 'absolute',
    borderRadius: 999,
  },
  ambientOrbTop: {
    width: 320,
    height: 320,
    backgroundColor: '#00BDD6',
    top: -80,
    left: -80,
    opacity: 0.22,
  },
  ambientOrbBottom: {
    width: 360,
    height: 360,
    backgroundColor: '#3B82F6',
    bottom: -100,
    right: -100,
    opacity: 0.18,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 36,
  },

  // KHUNG ĐĂNG NHẬP / ĐĂNG KÝ GLASSMORPHISM
  glassCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 24,
    paddingHorizontal: 26,
    paddingVertical: 30,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 10,
  },

  brandHeader: {
    alignItems: 'center',
    marginBottom: 22,
  },
  logoEmblem: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: 12,
    shadowColor: '#00BDD6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 5,
    paddingHorizontal: 12,
    lineHeight: 18,
  },

  // TAB SWITCHER
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 22,
    borderWidth: 1,
  },
  tabButton: {
    flex: 1,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: '#00BDD6',
    shadowColor: '#00BDD6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    fontWeight: '700',
  },

  formFields: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 7,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 14,
    borderWidth: 1.2,
  },
  inputBoxError: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(254, 242, 242, 0.9)',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14.5,
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 6,
  },

  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  successText: {
    flex: 1,
    fontSize: 12.5,
    color: '#10B981',
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12.5,
    color: '#EF4444',
    fontWeight: '600',
  },

  primaryButton: {
    backgroundColor: '#00BDD6',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#00BDD6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  footerText: {
    fontSize: 13.5,
  },
  footerLink: {
    fontSize: 13.5,
    color: '#00BDD6',
    fontWeight: '700',
  },
});
