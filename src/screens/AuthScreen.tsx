import React, { useState, useRef } from 'react';
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
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import { AppLogo } from '../components/AppLogo';

export const AuthScreen: React.FC = () => {
  const {
    loginWithCredentials,
    register,
    isLoading,
  } = useAuth();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Input Refs for smooth keyboard traversal and Enter key submission
  const usernameRef = useRef<any>(null);
  const passwordRef = useRef<any>(null);
  const confirmPasswordRef = useRef<any>(null);
  const isSubmittingRef = useRef<boolean>(false);

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
    if (isFormBusy || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setTimeout(() => {
      isSubmittingRef.current = false;
    }, 400);

    setErrorMessage('');
    setSuccessMessage('');
    const cleanUsername = username.trim();

    if (!cleanUsername) {
      setErrorMessage('Vui lòng nhập tên đăng nhập.');
      usernameRef.current?.focus();
      return;
    }
    if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu.');
      passwordRef.current?.focus();
      return;
    }

    try {
      await loginWithCredentials(cleanUsername, password);
    } catch (err: any) {
      setErrorMessage(err.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
    }
  };

  const handleRegister = async () => {
    if (isFormBusy || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setTimeout(() => {
      isSubmittingRef.current = false;
    }, 400);

    setErrorMessage('');
    setSuccessMessage('');
    const cleanUsername = username.trim();

    if (!cleanUsername) {
      setErrorMessage('Vui lòng nhập tên đăng nhập.');
      usernameRef.current?.focus();
      return;
    }
    if (cleanUsername.length < 3) {
      setErrorMessage('Tên đăng nhập phải có ít nhất 3 ký tự.');
      usernameRef.current?.focus();
      return;
    }
    if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu.');
      passwordRef.current?.focus();
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Mật khẩu phải có độ dài từ 6 ký tự trở lên.');
      passwordRef.current?.focus();
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu và xác nhận mật khẩu không trùng khớp.');
      confirmPasswordRef.current?.focus();
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
    <View style={styles.container}>
      <StatusBar style="light" />
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80',
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
        blurRadius={Platform.OS === 'web' ? 6 : 3}
      >
        <View style={styles.overlay}>
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
                <View style={styles.authWrapper}>
                  <View style={styles.card}>
                    {/* LOGO & BRANDING */}
                    <View style={styles.brandHeader}>
                      <View style={styles.logoWrapper}>
                        <AppLogo size={58} />
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

                    {/* FORM INPUTS */}
                    {/* Field: Username */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Tên đăng nhập</Text>
                      <View style={[styles.inputBox, errorMessage ? styles.inputBoxError : null]}>
                        <Ionicons
                          name="person-outline"
                          size={19}
                          color="#64748B"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          ref={usernameRef}
                          style={styles.textInput}
                          placeholder="Nhập tên đăng nhập hoặc email"
                          placeholderTextColor="#94A3B8"
                          autoCapitalize="none"
                          autoCorrect={false}
                          value={username}
                          onChangeText={(text) => {
                            setUsername(text);
                            if (errorMessage) setErrorMessage('');
                            if (successMessage) setSuccessMessage('');
                          }}
                          editable={!isFormBusy}
                          returnKeyType="next"
                          blurOnSubmit={false}
                          onSubmitEditing={() => {
                            if (mode === 'login' && password) {
                              handleLogin();
                            } else {
                              passwordRef.current?.focus();
                            }
                          }}
                          onKeyPress={(e: any) => {
                            if (Platform.OS === 'web' && e.nativeEvent?.key === 'Enter') {
                              if (mode === 'login' && password) {
                                handleLogin();
                              } else {
                                passwordRef.current?.focus();
                              }
                            }
                          }}
                        />
                      </View>
                    </View>

                    {/* Field: Password */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Mật khẩu</Text>
                      <View style={[styles.inputBox, errorMessage ? styles.inputBoxError : null]}>
                        <Ionicons
                          name="lock-closed-outline"
                          size={19}
                          color="#64748B"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          ref={passwordRef}
                          style={styles.textInput}
                          placeholder="Nhập mật khẩu"
                          placeholderTextColor="#94A3B8"
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
                          returnKeyType={mode === 'login' ? 'go' : 'next'}
                          blurOnSubmit={mode === 'login'}
                          onSubmitEditing={() => {
                            if (mode === 'login') {
                              handleLogin();
                            } else {
                              confirmPasswordRef.current?.focus();
                            }
                          }}
                          onKeyPress={(e: any) => {
                            if (Platform.OS === 'web' && e.nativeEvent?.key === 'Enter') {
                              if (mode === 'login') {
                                handleLogin();
                              } else {
                                confirmPasswordRef.current?.focus();
                              }
                            }
                          }}
                        />
                        <TouchableOpacity
                          style={styles.eyeButton}
                          onPress={() => setShowPassword(!showPassword)}
                          activeOpacity={0.7}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={19}
                            color="#64748B"
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
                            size={19}
                            color="#64748B"
                            style={styles.inputIcon}
                          />
                          <TextInput
                            ref={confirmPasswordRef}
                            style={styles.textInput}
                            placeholder="Nhập lại mật khẩu"
                            placeholderTextColor="#94A3B8"
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
                            returnKeyType="go"
                            onSubmitEditing={handleRegister}
                            onKeyPress={(e: any) => {
                              if (Platform.OS === 'web' && e.nativeEvent?.key === 'Enter') {
                                handleRegister();
                              }
                            }}
                          />
                          <TouchableOpacity
                            style={styles.eyeButton}
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            activeOpacity={0.7}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <Ionicons
                              name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                              size={19}
                              color="#64748B"
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
                      {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.primaryButtonText}>
                          {mode === 'login' ? 'Đăng nhập' : 'Đăng ký tài khoản'}
                        </Text>
                      )}
                    </TouchableOpacity>

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
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 36,
  },
  authWrapper: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 24,
    paddingHorizontal: 26,
    paddingTop: 28,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 10,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoWrapper: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#00BDD6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  brandTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 10,
    lineHeight: 18,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
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
    height: 48,
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
    fontSize: 14,
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
    paddingVertical: 8,
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
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#00BDD6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    paddingBottom: 4,
  },
  footerText: {
    fontSize: 13.5,
    color: '#64748B',
  },
  footerLink: {
    fontSize: 13.5,
    color: '#00BDD6',
    fontWeight: '700',
  },
});
