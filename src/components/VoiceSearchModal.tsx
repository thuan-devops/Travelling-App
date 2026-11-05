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
  'Tìm homestay view đồi ở Đà Lạt',
  'Resort có hồ bơi tại Phú Quốc',
  'Lập lịch trình 3 ngày 2 đêm ở Vũng Tàu',
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
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [spokenText, setSpokenText] = useState<string>('');
  const [hasSpeechSupport, setHasSpeechSupport] = useState<boolean>(true);

  // Pulse animation for mic
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recognitionRef = useRef<any>(null);
  const autoSubmitTimeout = useRef<any>(null);
  const latestSpokenText = useRef<string>('');
  const isTriggeredRef = useRef<boolean>(false);

  useEffect(() => {
    if (visible) {
      setSpokenText('');
      latestSpokenText.current = '';
      isTriggeredRef.current = false;
      setIsAnalyzing(false);
      startPulse();
      initAndStartListening();
    } else {
      stopListening();
      if (autoSubmitTimeout.current) clearTimeout(autoSubmitTimeout.current);
      pulseAnim.setValue(1);
    }

    return () => {
      stopListening();
      if (autoSubmitTimeout.current) clearTimeout(autoSubmitTimeout.current);
    };
  }, [visible]);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
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
    setIsAnalyzing(true);

    // Tự động đóng và tìm kiếm ngay lập tức sau 500ms để người dùng thấy phản hồi AI
    setTimeout(() => {
      onResult(clean);
      onClose();
      setIsAnalyzing(false);
      isTriggeredRef.current = false;
    }, 500);
  };

  const initAndStartListening = () => {
    setIsListening(true);
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

              // Tự động kích hoạt tìm kiếm khi người dùng ngừng nói sau 1.2s
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
          setHasSpeechSupport(true);
          return;
        } catch (err) {
          console.warn('Could not start web speech:', err);
        }
      }
    }

    // Fallback if browser/platform doesn't support Web Speech API
    setHasSpeechSupport(false);
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

  const handleSelectPrompt = (prompt: string) => {
    setSpokenText(prompt);
    latestSpokenText.current = prompt;
    triggerAutoSearch(prompt);
  };

  const handleConfirmResult = () => {
    if (spokenText.trim()) {
      triggerAutoSearch(spokenText);
    }
  };

  const handleRetry = () => {
    if (autoSubmitTimeout.current) clearTimeout(autoSubmitTimeout.current);
    isTriggeredRef.current = false;
    setSpokenText('');
    latestSpokenText.current = '';
    setIsAnalyzing(false);
    initAndStartListening();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalBox, { backgroundColor: colors.card, borderColor: isDarkMode ? colors.border : 'transparent', borderWidth: isDarkMode ? 1 : 0 }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="sparkles" size={24} color="#00BDD6" style={{ marginRight: 8 }} />
              <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Animated Mic Section */}
            <View style={styles.micSection}>
              <Animated.View
                style={[
                  styles.micPulseRing,
                  {
                    transform: [{ scale: isListening ? pulseAnim : 1 }],
                    opacity: isListening ? 0.75 : 0.3,
                  },
                ]}
              />

              <TouchableOpacity
                style={[
                  styles.micButton,
                  isListening && styles.micButtonActive,
                  isAnalyzing && styles.micButtonAnalyzing,
                ]}
                onPress={isListening ? stopListening : initAndStartListening}
                activeOpacity={0.8}
              >
                {isAnalyzing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons
                    name={isListening ? 'mic' : 'mic-outline'}
                    size={36}
                    color="#FFFFFF"
                  />
                )}
              </TouchableOpacity>

              <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                {isAnalyzing
                  ? '✨ AI đang phân tích & tự động tìm kiếm...'
                  : isListening
                  ? 'Đang lắng nghe...'
                  : spokenText
                  ? 'Đã nhận diện giọng nói'
                  : 'Chạm micro để nói'}
              </Text>
            </View>

            {/* Recognized Text Display */}
            <View style={[styles.transcriptBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.transcriptTopRow}>
                <Text style={[styles.transcriptLabel, { color: colors.textSecondary }]}>Nội dung nhận diện:</Text>
                {isAnalyzing && (
                  <View style={styles.aiBadge}>
                    <Text style={styles.aiBadgeText}>AI ĐANG XỬ LÝ</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.transcriptText, { color: colors.text }]}>
                {spokenText ? `"${spokenText}"` : 'Đang chờ bạn nói...'}
              </Text>
            </View>

            {/* Smart Auto Search Notice */}
            <View style={styles.autoSearchTip}>
              <Ionicons name="flash" size={14} color="#0D9488" style={{ marginRight: 6 }} />
              <Text style={styles.autoSearchTipText}>
                Hệ thống AI sẽ tự động tìm kiếm ngay khi bạn nói xong mà không cần bấm nút!
              </Text>
            </View>

            {/* Quick Prompts */}
            <Text style={[styles.promptsSectionTitle, { color: colors.text }]}>
              Hoặc chạm vào câu lệnh gợi ý:
            </Text>

            <View style={styles.promptsList}>
              {VOICE_PROMPTS.map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.promptChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
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
              <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={handleRetry} activeOpacity={0.7}>
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
      </View>
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
    maxHeight: '85%',
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
    marginBottom: 16,
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
    paddingVertical: 14,
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
    backgroundColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00BDD6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  micButtonActive: {
    backgroundColor: '#00BDD6',
  },
  micButtonAnalyzing: {
    backgroundColor: '#0D9488',
  },
  statusText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F766E',
    marginTop: 12,
  },
  transcriptBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  transcriptTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
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
