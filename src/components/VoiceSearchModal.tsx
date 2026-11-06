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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

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
  placeholderPrompt = 'Nói điều bạn muốn tìm hoặc chọn câu mẫu bên dưới:',
}) => {
  const { isDarkMode, colors } = useTheme();
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [spokenText, setSpokenText] = useState<string>('');
  const [hasSpeechSupport, setHasSpeechSupport] = useState<boolean>(true);

  // Pulse animation for mic
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Soundwave animation bars
  const waveAnim1 = useRef(new Animated.Value(0.3)).current;
  const waveAnim2 = useRef(new Animated.Value(0.7)).current;
  const waveAnim3 = useRef(new Animated.Value(0.4)).current;
  const waveAnim4 = useRef(new Animated.Value(0.9)).current;

  const recognitionRef = useRef<any>(null);
  const autoSubmitTimeout = useRef<any>(null);
  const typingIntervalRef = useRef<any>(null);
  const promptIndexRef = useRef<number>(0);
  const latestSpokenText = useRef<string>('');
  const isTriggeredRef = useRef<boolean>(false);

  useEffect(() => {
    if (visible) {
      setSpokenText('');
      latestSpokenText.current = '';
      isTriggeredRef.current = false;
      setIsAnalyzing(false);
      setIsSimulating(false);
      startPulse();
      initAndStartListening();
    } else {
      cleanupAudio();
    }

    return () => {
      cleanupAudio();
    };
  }, [visible]);

  // Handle sound wave animation when listening or simulating
  useEffect(() => {
    if (isListening || isSimulating) {
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
  }, [isListening, isSimulating]);

  const cleanupAudio = () => {
    stopListening();
    if (autoSubmitTimeout.current) clearTimeout(autoSubmitTimeout.current);
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    pulseAnim.setValue(1);
    setIsSimulating(false);
    setIsListening(false);
  };

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.22,
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
    stopListening();
    setIsSimulating(false);
    setIsAnalyzing(true);

    // Tự động đóng và tìm kiếm ngay lập tức sau 500ms để người dùng thấy phản hồi AI
    setTimeout(() => {
      onResult(clean);
      onClose();
      setIsAnalyzing(false);
      isTriggeredRef.current = false;
    }, 550);
  };

  const simulateVoiceRecognition = (targetText: string) => {
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    if (autoSubmitTimeout.current) clearTimeout(autoSubmitTimeout.current);

    setIsListening(true);
    setIsSimulating(true);
    setSpokenText('');
    latestSpokenText.current = '';

    let currentIndex = 0;
    const chars = Array.from(targetText);
    const intervalMs = Math.max(20, Math.min(45, Math.floor(750 / chars.length)));

    typingIntervalRef.current = setInterval(() => {
      currentIndex += 1;
      if (currentIndex <= chars.length) {
        const currentSub = chars.slice(0, currentIndex).join('');
        setSpokenText(currentSub);
        latestSpokenText.current = currentSub;
      } else {
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        setIsSimulating(false);
        setIsListening(false);

        autoSubmitTimeout.current = setTimeout(() => {
          triggerAutoSearch(targetText);
        }, 650);
      }
    }, intervalMs);
  };

  const initAndStartListening = () => {
    isTriggeredRef.current = false;

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
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

              if (autoSubmitTimeout.current) clearTimeout(autoSubmitTimeout.current);
              autoSubmitTimeout.current = setTimeout(() => {
                triggerAutoSearch(finalTranscript);
              }, 1200);
            }
          };

          recognition.onerror = (e: any) => {
            console.warn('Speech recognition error:', e);
            setIsListening(false);
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
          setHasSpeechSupport(true);
          return;
        } catch (err) {
          console.warn('Could not start web speech:', err);
        }
      }
    }

    // Trên Mobile hoặc trình duyệt không hỗ trợ Web Speech API trực tiếp
    setHasSpeechSupport(false);
    setIsListening(false);
  };

  const stopListening = () => {
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
  };

  const handleMicPress = () => {
    if (isAnalyzing) return;

    if (hasSpeechSupport && Platform.OS === 'web') {
      if (isListening) {
        stopListening();
      } else {
        initAndStartListening();
      }
    } else {
      // Trên điện thoại hoặc trình duyệt không có Web Speech API:
      if (spokenText.trim()) {
        triggerAutoSearch(spokenText);
      } else {
        // Kích hoạt mô phỏng nhận diện câu lệnh du lịch
        const prompt = VOICE_PROMPTS[promptIndexRef.current % VOICE_PROMPTS.length];
        promptIndexRef.current += 1;
        simulateVoiceRecognition(prompt);
      }
    }
  };

  const handleSelectPrompt = (prompt: string) => {
    if (isAnalyzing) return;
    simulateVoiceRecognition(prompt);
  };

  const handleConfirmResult = () => {
    if (spokenText.trim()) {
      triggerAutoSearch(spokenText);
    }
  };

  const handleRetry = () => {
    if (autoSubmitTimeout.current) clearTimeout(autoSubmitTimeout.current);
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    isTriggeredRef.current = false;
    setSpokenText('');
    latestSpokenText.current = '';
    setIsAnalyzing(false);
    setIsSimulating(false);
    initAndStartListening();
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
                    transform: [{ scale: isListening || isSimulating ? pulseAnim : 1 }],
                    opacity: isListening || isSimulating ? 0.75 : 0.25,
                  },
                ]}
              />

              <TouchableOpacity
                style={[
                  styles.micButton,
                  (isListening || isSimulating) && styles.micButtonActive,
                  isAnalyzing && styles.micButtonAnalyzing,
                ]}
                onPress={handleMicPress}
                activeOpacity={0.8}
              >
                {isAnalyzing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons
                    name={isListening || isSimulating ? 'mic' : 'mic-outline'}
                    size={36}
                    color="#FFFFFF"
                  />
                )}
              </TouchableOpacity>

              {/* Animated Waveform Bars */}
              {(isListening || isSimulating) && (
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
                {isAnalyzing
                  ? '✨ AI đang phân tích & tự động tìm kiếm...'
                  : isSimulating
                  ? '🎙️ Đang nghe giọng nói của bạn...'
                  : isListening
                  ? 'Đang lắng nghe...'
                  : spokenText
                  ? 'Đã nhận diện giọng nói'
                  : 'Chạm micro hoặc nói qua bàn phím bên dưới'}
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

            {/* Smart Auto Search Notice */}
            <View style={styles.autoSearchTip}>
              <Ionicons name="flash" size={14} color="#0D9488" style={{ marginRight: 6 }} />
              <Text style={styles.autoSearchTipText}>
                Hệ thống AI sẽ tự động phân tích & tìm kiếm ngay khi nhận diện xong!
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
    backgroundColor: '#0891B2',
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
  autoSearchTip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  autoSearchTipText: {
    fontSize: 12,
    color: '#0F766E',
    fontWeight: '500',
    flex: 1,
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
