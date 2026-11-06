import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Platform,
  ScrollView,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useTheme } from '../context/ThemeContext';
import { aiService } from '../services/aiService';

interface VoiceSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onResult: (text: string) => void;
  title?: string;
  placeholderPrompt?: string;
}

const VOICE_PROMPTS = [
  'Tìm khách sạn view vịnh Hạ Long',
  'Tìm homestay view đồi ở Đà Lạt',
  'Resort có hồ bơi tại Phú Quốc',
  'Lập lịch trình 3 ngày 2 đêm ở Đà Lạt',
  'Villa sát biển cho gia đình 4 người',
  'Khách sạn giá rẻ gần trung tâm',
  'Chỗ nghỉ cắm trại lều bên bờ suối',
];

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({
  visible,
  onClose,
  onResult,
  title = 'AI Tìm kiếm bằng giọng nói',
  placeholderPrompt = 'Hoặc chọn câu gợi ý bên dưới:',
}) => {
  const { isDarkMode, colors } = useTheme();
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [spokenText, setSpokenText] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>(
    'Chạm micro để nói hoặc dùng bàn phím bên dưới'
  );
  const [hasSpeechSupport, setHasSpeechSupport] = useState<boolean>(true);

  // Pulse animation for mic
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Soundwave animation bars
  const waveAnim1 = useRef(new Animated.Value(0.3)).current;
  const waveAnim2 = useRef(new Animated.Value(0.7)).current;
  const waveAnim3 = useRef(new Animated.Value(0.4)).current;
  const waveAnim4 = useRef(new Animated.Value(0.9)).current;

  const recognitionRef = useRef<any>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const recordingTimeout = useRef<any>(null);
  const autoSubmitTimeout = useRef<any>(null);
  const latestSpokenText = useRef<string>('');
  const isTriggeredRef = useRef<boolean>(false);

  useEffect(() => {
    if (visible) {
      setSpokenText('');
      latestSpokenText.current = '';
      isTriggeredRef.current = false;
      setIsAnalyzing(false);
      setIsListening(false);
      setIsRecording(false);
      setStatusMessage('Chạm micro để nói hoặc dùng bàn phím bên dưới');
      startPulse();

      // Check speech support
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const SpeechRec =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        setHasSpeechSupport(!!SpeechRec);
      } else {
        setHasSpeechSupport(true);
      }
    } else {
      cleanupAudio();
    }

    return () => {
      cleanupAudio();
    };
  }, [visible]);

  // Handle sound wave animation when listening or recording
  useEffect(() => {
    if (isListening || isRecording) {
      const animateWave = (anim: Animated.Value, toVal: number, duration: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: toVal,
              duration,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.25,
              duration,
              useNativeDriver: true,
            }),
          ])
        );
      };

      const w1 = animateWave(waveAnim1, 1.3, 350);
      const w2 = animateWave(waveAnim2, 1.6, 420);
      const w3 = animateWave(waveAnim3, 1.2, 380);
      const w4 = animateWave(waveAnim4, 1.5, 460);

      w1.start();
      w2.start();
      w3.start();
      w4.start();

      return () => {
        w1.stop();
        w2.stop();
        w3.stop();
        w4.stop();
        waveAnim1.setValue(0.3);
        waveAnim2.setValue(0.7);
        waveAnim3.setValue(0.4);
        waveAnim4.setValue(0.9);
      };
    } else {
      waveAnim1.setValue(0.3);
      waveAnim2.setValue(0.7);
      waveAnim3.setValue(0.4);
      waveAnim4.setValue(0.9);
    }
  }, [isListening, isRecording]);

  const cleanupAudio = async () => {
    if (autoSubmitTimeout.current) clearTimeout(autoSubmitTimeout.current);
    if (recordingTimeout.current) clearTimeout(recordingTimeout.current);

    // Stop web speech
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    // Stop mobile recording
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch {}
      recordingRef.current = null;
    }

    pulseAnim.setValue(1);
    setIsListening(false);
    setIsRecording(false);
  };

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const triggerAutoSearch = (textToSubmit: string) => {
    const clean = textToSubmit.trim();
    if (!clean || isTriggeredRef.current) return;
    isTriggeredRef.current = true;
    cleanupAudio();
    setIsAnalyzing(true);
    setStatusMessage('✨ AI đang xử lý yêu cầu tìm kiếm...');

    setTimeout(() => {
      onResult(clean);
      onClose();
      setIsAnalyzing(false);
      isTriggeredRef.current = false;
    }, 500);
  };

  /**
   * Start Web Speech Recognition in browser
   */
  const startWebListening = () => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setHasSpeechSupport(false);
      setStatusMessage('Trình duyệt chưa hỗ trợ Web Speech API.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          finalTranscript += event.results[i][0].transcript;
        }
        if (finalTranscript) {
          setSpokenText(finalTranscript);
          latestSpokenText.current = finalTranscript;
          setStatusMessage('🎙️ Đã nghe: "' + finalTranscript + '"');

          if (autoSubmitTimeout.current) clearTimeout(autoSubmitTimeout.current);
          autoSubmitTimeout.current = setTimeout(() => {
            triggerAutoSearch(finalTranscript);
          }, 1200);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsListening(false);
        setStatusMessage('Chưa nghe rõ câu nói. Hãy chạm micro để nói lại!');
      };

      recognition.onend = () => {
        setIsListening(false);
        if (latestSpokenText.current.trim() && !isTriggeredRef.current) {
          if (autoSubmitTimeout.current) clearTimeout(autoSubmitTimeout.current);
          triggerAutoSearch(latestSpokenText.current);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
      setStatusMessage('🎙️ Đang lắng nghe bạn nói... (Hãy nói vào micro)');
    } catch (err) {
      console.warn('Could not start web speech:', err);
      setIsListening(false);
    }
  };

  /**
   * Start mobile audio recording with expo-av
   */
  const startMobileRecording = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert(
          'Quyền truy cập Micro',
          'Ứng dụng cần quyền Micro để nhận diện giọng nói. Bạn có thể cấp quyền trong Cài đặt hoặc dùng micro trên bàn phím nhé!'
        );
        setStatusMessage('Chưa có quyền micro. Bạn hãy dùng micro bàn phím bên dưới!');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;

      setSpokenText('');
      latestSpokenText.current = '';
      setIsListening(true);
      setIsRecording(true);
      setStatusMessage('🎙️ Đang thu âm... Hãy nói câu bạn muốn tìm (Chạm lại vào mic khi nói xong)');

      // Tự động dừng sau tối đa 8 giây nếu người dùng không chạm dừng
      if (recordingTimeout.current) clearTimeout(recordingTimeout.current);
      recordingTimeout.current = setTimeout(() => {
        stopAndTranscribeMobileRecording();
      }, 8000);
    } catch (err) {
      console.warn('Lỗi ghi âm:', err);
      setStatusMessage('💡 Hãy chạm ô bên dưới và nhấn biểu tượng 🎙️ trên bàn phím để nói!');
      setIsListening(false);
      setIsRecording(false);
    }
  };

  /**
   * Stop mobile recording and transcribe via Gemini AI
   */
  const stopAndTranscribeMobileRecording = async () => {
    if (recordingTimeout.current) clearTimeout(recordingTimeout.current);
    if (!recordingRef.current) {
      setIsListening(false);
      setIsRecording(false);
      return;
    }

    const rec = recordingRef.current;
    recordingRef.current = null;
    setIsListening(false);
    setIsRecording(false);
    setIsAnalyzing(true);
    setStatusMessage('✨ AI đang giải mã giọng nói của bạn...');

    try {
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();

      if (!uri) {
        setIsAnalyzing(false);
        setStatusMessage('Không có file ghi âm. Hãy chạm micro và thử lại!');
        return;
      }

      // Đọc base64 qua fetch + FileReader
      const response = await fetch(uri);
      const blob = await response.blob();
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          resolve(res.split(',')[1] || res);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      if (!base64Audio) {
        setIsAnalyzing(false);
        setStatusMessage('Không đọc được dữ liệu ghi âm. Hãy thử lại!');
        return;
      }

      const mimeType = Platform.OS === 'ios' ? 'audio/m4a' : 'audio/mp4';
      const transcribed = await aiService.transcribeAudio(base64Audio, mimeType);

      if (transcribed && transcribed.trim()) {
        const clean = transcribed.trim();
        setSpokenText(clean);
        latestSpokenText.current = clean;
        setIsAnalyzing(false);
        setStatusMessage('✨ AI đã nhận diện thành công!');

        // Tự động kích hoạt tìm kiếm sau 700ms
        setTimeout(() => {
          triggerAutoSearch(clean);
        }, 700);
      } else {
        setIsAnalyzing(false);
        setStatusMessage('Chưa nghe rõ câu nói. Hãy nói to hơn hoặc dùng micro bàn phím!');
      }
    } catch (err) {
      console.warn('Lỗi xử lý file âm thanh:', err);
      setIsAnalyzing(false);
      setStatusMessage('Không thể giải mã âm thanh. Bạn hãy dùng micro bàn phím bên dưới!');
    }
  };

  /**
   * Handle user pressing the big microphone button
   */
  const handleMicPress = () => {
    if (isAnalyzing) return;

    // Nếu đang lắng nghe hoặc đang ghi âm: dừng và xử lý
    if (isListening || isRecording) {
      if (Platform.OS === 'web') {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch {}
        }
        setIsListening(false);
      } else {
        stopAndTranscribeMobileRecording();
      }
      return;
    }

    // Nếu chưa lắng nghe: bắt đầu lắng nghe
    if (Platform.OS === 'web') {
      startWebListening();
    } else {
      startMobileRecording();
    }
  };

  /**
   * When user explicitly taps a suggestion chip
   */
  const handleSelectPrompt = (prompt: string) => {
    if (isAnalyzing) return;
    cleanupAudio();
    setSpokenText(prompt);
    latestSpokenText.current = prompt;
    setStatusMessage('✨ Đã chọn câu gợi ý, đang tìm kiếm...');
    triggerAutoSearch(prompt);
  };

  const handleConfirmResult = () => {
    if (spokenText.trim()) {
      triggerAutoSearch(spokenText);
    }
  };

  const handleRetry = () => {
    cleanupAudio();
    isTriggeredRef.current = false;
    setSpokenText('');
    latestSpokenText.current = '';
    setIsAnalyzing(false);
    setStatusMessage('Chạm micro để nói hoặc dùng bàn phím bên dưới');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View
          style={[
            styles.modalBox,
            {
              backgroundColor: colors.card,
              borderColor: isDarkMode ? colors.border : 'transparent',
              borderWidth: isDarkMode ? 1 : 0,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="sparkles" size={24} color="#00BDD6" style={{ marginRight: 8 }} />
              <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F3F4F6' }]}
            >
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Animated Mic Section */}
            <View style={styles.micSection}>
              <Animated.View
                style={[
                  styles.micPulseRing,
                  {
                    transform: [{ scale: isListening || isRecording ? pulseAnim : 1 }],
                    opacity: isListening || isRecording ? 0.75 : 0.25,
                  },
                ]}
              />

              <TouchableOpacity
                style={[
                  styles.micButton,
                  (isListening || isRecording) && styles.micButtonActive,
                  isAnalyzing && styles.micButtonAnalyzing,
                ]}
                onPress={handleMicPress}
                activeOpacity={0.8}
              >
                {isAnalyzing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons
                    name={isListening || isRecording ? 'mic' : 'mic-outline'}
                    size={36}
                    color="#FFFFFF"
                  />
                )}
              </TouchableOpacity>

              {/* Animated Waveform Bars when recording/listening */}
              {(isListening || isRecording) && (
                <View style={styles.waveformRow}>
                  {[waveAnim1, waveAnim2, waveAnim3, waveAnim4].map((anim, idx) => (
                    <Animated.View
                      key={idx}
                      style={[
                        styles.waveBar,
                        {
                          transform: [{ scaleY: anim }],
                          backgroundColor: '#00BDD6',
                        },
                      ]}
                    />
                  ))}
                </View>
              )}

              <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                {statusMessage}
              </Text>
            </View>

            {/* Recognized Text Display */}
            <View
              style={[
                styles.transcriptBox,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.transcriptTopRow}>
                <Text style={[styles.transcriptLabel, { color: colors.textSecondary }]}>
                  Nội dung nhận diện:
                </Text>
                {isAnalyzing ? (
                  <View style={styles.aiBadge}>
                    <Text style={styles.aiBadgeText}>AI ĐANG XỬ LÝ</Text>
                  </View>
                ) : spokenText ? (
                  <View style={[styles.aiBadge, { backgroundColor: '#DCFCE7' }]}>
                    <Text style={[styles.aiBadgeText, { color: '#16A34A' }]}>✨ AI ĐÃ NHẬN DIỆN</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.transcriptText, { color: colors.text }]}>
                {spokenText ? `"${spokenText}"` : 'Đang chờ bạn nói...'}
              </Text>
            </View>

            {/* Mobile Native Voice Typing / Direct Input Bar */}
            <View
              style={[
                styles.mobileInputSection,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.mobileInputHeader}>
                <Ionicons name="mic-circle" size={18} color="#00BDD6" style={{ marginRight: 6 }} />
                <Text style={[styles.mobileInputTitle, { color: colors.text }]}>
                  Nói qua micro bàn phím điện thoại:
                </Text>
              </View>
              <View
                style={[
                  styles.inputRow,
                  {
                    backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9',
                    borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                  },
                ]}
              >
                <Ionicons
                  name="search-outline"
                  size={18}
                  color={colors.textSecondary}
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder="Chạm vào đây và bấm 🎙️ trên bàn phím..."
                  placeholderTextColor={colors.textSecondary}
                  value={spokenText}
                  onChangeText={(text) => {
                    setSpokenText(text);
                    latestSpokenText.current = text;
                  }}
                  onSubmitEditing={() => {
                    if (spokenText.trim()) triggerAutoSearch(spokenText);
                  }}
                  returnKeyType="search"
                />
                {spokenText.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setSpokenText('');
                      latestSpokenText.current = '';
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={[styles.mobileHintText, { color: colors.textSecondary }]}>
                💡 Chạm vào ô trên, sau đó chạm biểu tượng 🎙️ trên bàn phím ảo (Gboard / iOS) để nói tiếng Việt trực tiếp!
              </Text>
            </View>

            {/* Quick Prompts */}
            <Text style={[styles.promptsSectionTitle, { color: colors.text }]}>
              {placeholderPrompt}
            </Text>

            <View style={styles.promptsList}>
              {VOICE_PROMPTS.map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.promptChip,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                  onPress={() => handleSelectPrompt(prompt)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="sparkles-outline" size={14} color="#00BDD6" style={{ marginRight: 6 }} />
                  <Text style={[styles.promptChipText, { color: colors.text }]}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[
                  styles.retryBtn,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
                onPress={handleRetry}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh-outline" size={18} color={colors.text} style={{ marginRight: 4 }} />
                <Text style={[styles.retryBtnText, { color: colors.text }]}>Nói lại</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmBtn, !spokenText && styles.confirmBtnDisabled]}
                onPress={handleConfirmResult}
                disabled={!spokenText || isAnalyzing}
                activeOpacity={0.8}
              >
                {isAnalyzing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />
                ) : (
                  <Ionicons name="search" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                )}
                <Text style={styles.confirmBtnText}>
                  {isAnalyzing ? 'Đang tìm kiếm...' : 'Tìm kiếm ngay'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: Platform.OS === 'web' ? 'center' : 'flex-end',
    alignItems: 'center',
    padding: Platform.OS === 'web' ? 20 : 0,
  },
  modalBox: {
    width: '100%',
    maxWidth: 540,
    backgroundColor: '#FFFFFF',
    borderRadius: Platform.OS === 'web' ? 24 : 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 14,
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  micSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  micPulseRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#CCFBF1',
  },
  micButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#00BDD6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00BDD6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  micButtonActive: {
    backgroundColor: '#DC2626', // Màu đỏ khi đang ghi âm/lắng nghe
  },
  micButtonAnalyzing: {
    backgroundColor: '#0D9488',
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
    gap: 6,
    marginTop: 10,
  },
  waveBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: '#00BDD6',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F766E',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  transcriptBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  transcriptTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  transcriptLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  aiBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
  },
  transcriptText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  mobileInputSection: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  mobileInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mobileInputTitle: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  mobileHintText: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
  },
  promptsSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 10,
  },
  promptsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  promptChipText: {
    fontSize: 12.5,
    color: '#008394',
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  confirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00BDD6',
    borderRadius: 12,
    paddingVertical: 12,
    marginLeft: 12,
  },
  confirmBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
