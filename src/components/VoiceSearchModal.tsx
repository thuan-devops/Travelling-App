import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useAudioRecorder,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import { File } from 'expo-file-system';
import { useTheme } from '../context/ThemeContext';
import { aiService } from '../services/aiService';

interface VoiceSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onResult: (text: string) => void;
  title?: string;
  placeholderPrompt?: string;
}

const RECORDING_OPTIONS = {
  ...RecordingPresets.HIGH_QUALITY,
  isMeteringEnabled: true,
};

// Tự động dừng khi người dùng ngừng nói 1.3 giây
const SILENCE_DURATION_MS = 1300;
// Thời gian thu tối thiểu trước khi cho phép tự ngắt theo khoảng lặng
const MIN_RECORDING_MS = 1000;
// Tự động chốt tối đa sau 6 giây nếu môi trường quá ồn không đo được khoảng lặng
const MAX_RECORDING_MS = 6000;
// Ngưỡng dB phát hiện giọng nói (dBFS: -160 là im lặng tuyệt đối, 0 là lớn nhất)
const SPEECH_START_DB = -30;
const SILENCE_FLOOR_DB = -33;

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({
  visible,
  onClose,
  onResult,
  title = 'AI Tìm kiếm bằng giọng nói',
}) => {
  const { isDarkMode, colors } = useTheme();
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [spokenText, setSpokenText] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>(
    'Đang chuẩn bị micro...'
  );

  // Hiệu ứng vòng tròn lan tỏa và 4 cột sóng âm
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(0.3)).current;
  const waveAnim2 = useRef(new Animated.Value(0.6)).current;
  const waveAnim3 = useRef(new Animated.Value(0.4)).current;
  const waveAnim4 = useRef(new Animated.Value(0.8)).current;

  const recognitionRef = useRef<any>(null);
  const autoSubmitTimeout = useRef<any>(null);
  const recordingTimeout = useRef<any>(null);
  const meteringInterval = useRef<any>(null);

  const isRecordingRef = useRef<boolean>(false);
  const hasSpokenRef = useRef<boolean>(false);
  const peakDbRef = useRef<number>(-160);
  const silenceStartRef = useRef<number | null>(null);
  const recordStartTimeRef = useRef<number>(0);
  const latestSpokenText = useRef<string>('');
  const isTriggeredRef = useRef<boolean>(false);

  // Bộ ghi âm thật của expo-audio có bật đo âm lượng (isMeteringEnabled)
  const audioRecorder = useAudioRecorder(RECORDING_OPTIONS);

  useEffect(() => {
    if (visible) {
      setSpokenText('');
      latestSpokenText.current = '';
      isTriggeredRef.current = false;
      setIsAnalyzing(false);
      setIsListening(false);
      startPulse();

      // Tự động bật thu âm ngay khi mở modal
      const startTimer = setTimeout(() => {
        if (Platform.OS === 'web') {
          startWebListening();
        } else {
          startMobileRecording();
        }
      }, 250);

      return () => {
        clearTimeout(startTimer);
        cleanupAudio();
      };
    } else {
      cleanupAudio();
    }
  }, [visible]);

  // Sóng âm mặc định khi đang nghe trên trình duyệt Web
  useEffect(() => {
    if (isListening && Platform.OS === 'web') {
      const animateWave = (anim: Animated.Value, toVal: number, duration: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: toVal, duration, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0.25, duration, useNativeDriver: true }),
          ])
        );

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
      };
    }
  }, [isListening]);

  const clearTimers = () => {
    if (autoSubmitTimeout.current) {
      clearTimeout(autoSubmitTimeout.current);
      autoSubmitTimeout.current = null;
    }
    if (recordingTimeout.current) {
      clearTimeout(recordingTimeout.current);
      recordingTimeout.current = null;
    }
    if (meteringInterval.current) {
      clearInterval(meteringInterval.current);
      meteringInterval.current = null;
    }
  };

  const cleanupAudio = () => {
    clearTimers();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    if (isRecordingRef.current) {
      isRecordingRef.current = false;
      audioRecorder.stop().catch(() => {});
    }

    pulseAnim.setValue(1);
    setIsListening(false);
  };

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.22,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 850,
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
    setStatusMessage('✨ Đang tìm kiếm kết quả phù hợp...');

    setTimeout(() => {
      onResult(clean);
      onClose();
      setIsAnalyzing(false);
      isTriggeredRef.current = false;
    }, 450);
  };

  /**
   * Web: dùng Web Speech API tự nhận diện khi ngừng nói
   */
  const startWebListening = () => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatusMessage('Trình duyệt chưa hỗ trợ nhận diện giọng nói.');
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
          setStatusMessage('🎙️ Đang nghe: "' + finalTranscript + '"');

          if (autoSubmitTimeout.current) clearTimeout(autoSubmitTimeout.current);
          autoSubmitTimeout.current = setTimeout(() => {
            triggerAutoSearch(finalTranscript);
          }, 1100);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setStatusMessage('Chưa nghe rõ. Chạm vào micro để nói lại nhé!');
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
      setStatusMessage('🔴 Đang lắng nghe... Hãy nói yêu cầu của bạn');
    } catch {
      setIsListening(false);
      setStatusMessage('Chạm vào micro để bắt đầu nói');
    }
  };

  /**
   * Điện thoại: Ghi âm thật + Tự động phát hiện khi người dùng ngừng nói (VAD)
   */
  const startMobileRecording = async () => {
    try {
      clearTimers();
      const perm = await requestRecordingPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Cần quyền Micro',
          'Hãy cấp quyền Micro cho ứng dụng để tìm kiếm bằng giọng nói.'
        );
        setStatusMessage('Chưa có quyền micro. Chạm vào micro để cấp quyền.');
        return;
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });

      await audioRecorder.prepareToRecordAsync(RECORDING_OPTIONS);
      audioRecorder.record();

      isRecordingRef.current = true;
      hasSpokenRef.current = false;
      peakDbRef.current = -160;
      silenceStartRef.current = null;
      recordStartTimeRef.current = Date.now();

      setSpokenText('');
      latestSpokenText.current = '';
      setIsListening(true);
      setStatusMessage('🔴 Đang lắng nghe... Hãy nói yêu cầu của bạn');

      // Theo dõi cường độ âm thanh (metering) mỗi 150ms để tự động dừng khi ngừng nói
      meteringInterval.current = setInterval(() => {
        if (!isRecordingRef.current) return;
        try {
          const status = audioRecorder.getStatus();
          const db = typeof status.metering === 'number' ? status.metering : -160;
          const elapsed = Date.now() - recordStartTimeRef.current;

          // Cập nhật độ cao sóng âm theo giọng nói thật
          const normalized = Math.max(0.25, Math.min(1.6, (db + 55) / 30));
          waveAnim1.setValue(normalized * 0.85);
          waveAnim2.setValue(normalized * 1.15);
          waveAnim3.setValue(normalized * 0.95);
          waveAnim4.setValue(normalized * 1.05);

          // Phát hiện người dùng bắt đầu nói
          if (db > SPEECH_START_DB) {
            if (!hasSpokenRef.current) {
              hasSpokenRef.current = true;
              setStatusMessage('🎙️ Đang nghe bạn nói... (Ngừng nói sẽ tự tìm)');
            }
            if (db > peakDbRef.current) {
              peakDbRef.current = db;
            }
            silenceStartRef.current = null;
          } else if (hasSpokenRef.current) {
            // Đã từng nói -> kiểm tra xem âm lượng đã hạ xuống mức im lặng chưa
            const isSilent = db < SILENCE_FLOOR_DB || db < peakDbRef.current - 14;
            if (isSilent) {
              if (silenceStartRef.current === null) {
                silenceStartRef.current = Date.now();
              } else if (
                Date.now() - silenceStartRef.current >= SILENCE_DURATION_MS &&
                elapsed >= MIN_RECORDING_MS
              ) {
                stopAndTranscribe();
              }
            } else {
              silenceStartRef.current = null;
            }
          }
        } catch {}
      }, 150);

      // Tự động chốt sau tối đa MAX_RECORDING_MS nếu người dùng nói liên tục hoặc ồn
      recordingTimeout.current = setTimeout(() => {
        stopAndTranscribe();
      }, MAX_RECORDING_MS);
    } catch (err) {
      console.warn('Lỗi bắt đầu ghi âm:', err);
      isRecordingRef.current = false;
      setIsListening(false);
      setStatusMessage('Chạm vào micro để bắt đầu nói');
    }
  };

  /**
   * Dừng ghi âm, chuyển giọng nói thành văn bản qua Gemini AI và tự động tìm kiếm
   */
  const stopAndTranscribe = async () => {
    clearTimers();
    if (!isRecordingRef.current) return;
    isRecordingRef.current = false;

    setIsListening(false);
    setIsAnalyzing(true);
    setStatusMessage('✨ AI đang nhận diện giọng nói...');

    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (!uri) {
        throw new Error('Không có file ghi âm');
      }

      const base64Audio = await new File(uri).base64();
      if (!base64Audio) {
        throw new Error('File ghi âm rỗng');
      }

      const text = await aiService.transcribeAudio(base64Audio, 'audio/mp4');

      if (text && text.trim()) {
        const clean = text.trim();
        setSpokenText(clean);
        latestSpokenText.current = clean;
        setStatusMessage('✨ Đã nhận diện, đang tự động tìm kiếm...');

        autoSubmitTimeout.current = setTimeout(() => {
          triggerAutoSearch(clean);
        }, 600);
      } else {
        setIsAnalyzing(false);
        setStatusMessage('Chưa nghe rõ câu nói. Chạm vào micro để nói lại nhé!');
      }
    } catch (err) {
      console.warn('Lỗi nhận diện giọng nói:', err);
      setIsAnalyzing(false);
      setStatusMessage('Không nhận diện được. Chạm vào micro để thử lại!');
    }
  };

  /**
   * Chạm vào nút micro: nếu đang nghỉ thì bắt đầu nghe lại, nếu đang nghe thì chốt luôn
   */
  const handleMicPress = () => {
    if (isAnalyzing) return;

    if (Platform.OS === 'web') {
      if (isListening) {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch {}
        }
        setIsListening(false);
      } else {
        startWebListening();
      }
      return;
    }

    if (isListening) {
      stopAndTranscribe();
    } else {
      startMobileRecording();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
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
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Ionicons name="sparkles" size={22} color="#00BDD6" style={{ marginRight: 8 }} />
              <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
                {title}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F3F4F6' }]}
            >
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Khu vực Micro trung tâm */}
          <View style={styles.micSection}>
            <Animated.View
              style={[
                styles.micPulseRing,
                {
                  transform: [{ scale: isListening ? pulseAnim : 1 }],
                  opacity: isListening ? 0.75 : 0.25,
                },
              ]}
            />

            <TouchableOpacity
              style={[
                styles.micButton,
                isListening && styles.micButtonActive,
                isAnalyzing && styles.micButtonAnalyzing,
              ]}
              onPress={handleMicPress}
              activeOpacity={0.8}
            >
              {isAnalyzing ? (
                <ActivityIndicator size="large" color="#FFFFFF" />
              ) : (
                <Ionicons
                  name={isListening ? 'mic' : 'mic-outline'}
                  size={40}
                  color="#FFFFFF"
                />
              )}
            </TouchableOpacity>

            {/* Sóng âm nhạy theo giọng nói */}
            {isListening && (
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

          {/* Khung hiển thị chữ nhận diện */}
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
                  <Text style={[styles.aiBadgeText, { color: '#16A34A' }]}>✨ ĐÃ NHẬN DIỆN</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.transcriptText, { color: colors.text }]}>
              {spokenText ? `"${spokenText}"` : 'Đang chờ bạn nói...'}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
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
    flexShrink: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginLeft: 8,
  },
  micSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    position: 'relative',
  },
  micPulseRing: {
    position: 'absolute',
    top: 4,
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#CCFBF1',
  },
  micButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
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
    backgroundColor: '#EF4444',
  },
  micButtonAnalyzing: {
    backgroundColor: '#0D9488',
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 26,
    gap: 6,
    marginTop: 14,
  },
  waveBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: '#00BDD6',
  },
  statusText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F766E',
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 12,
    lineHeight: 20,
  },
  transcriptBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 6,
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
    fontSize: 15.5,
    fontWeight: '600',
    color: '#0F172A',
    fontStyle: 'italic',
    lineHeight: 22,
  },
});
