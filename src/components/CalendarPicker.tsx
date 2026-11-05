import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
  nights: number;
}

interface CalendarPickerProps {
  initialStartDate?: Date | null;
  initialEndDate?: Date | null;
  onSelectRange: (range: DateRange) => void;
  minDate?: Date;
}

const MONTH_NAMES = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
];

const WEEK_DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  initialStartDate,
  initialEndDate,
  onSelectRange,
}) => {
  const { isDarkMode, colors } = useTheme();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentYear, setCurrentYear] = useState<number>(
    initialStartDate ? initialStartDate.getFullYear() : today.getFullYear()
  );
  const [currentMonth, setCurrentMonth] = useState<number>(
    initialStartDate ? initialStartDate.getMonth() : today.getMonth()
  );

  const [startDate, setStartDate] = useState<Date | null>(
    initialStartDate || null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    initialEndDate || null
  );

  useEffect(() => {
    if (initialStartDate) {
      setStartDate(initialStartDate);
      setCurrentMonth(initialStartDate.getMonth());
      setCurrentYear(initialStartDate.getFullYear());
    }
    if (initialEndDate) {
      setEndDate(initialEndDate);
    }
  }, [initialStartDate, initialEndDate]);

  // Chuẩn hóa tính số đêm chính xác tuyệt đối (không bị lệch giờ / múi giờ)
  const calculateNights = (start: Date | null, end: Date | null): number => {
    if (!start || !end) return 1;
    const d1 = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const d2 = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const isSameDay = (d1: Date | null, d2: Date | null): boolean => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isBetween = (date: Date, start: Date | null, end: Date | null): boolean => {
    if (!start || !end) return false;
    const t = date.getTime();
    return t > start.getTime() && t < end.getTime();
  };

  const handleDayPress = (day: number) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    clickedDate.setHours(0, 0, 0, 0);

    // If no start date or both start & end exist, start fresh
    if (!startDate || (startDate && endDate)) {
      setStartDate(clickedDate);
      setEndDate(null);
      onSelectRange({
        startDate: clickedDate,
        endDate: null,
        nights: 1,
      });
    } else if (startDate && !endDate) {
      if (clickedDate.getTime() > startDate.getTime()) {
        setEndDate(clickedDate);
        const nights = calculateNights(startDate, clickedDate);
        onSelectRange({
          startDate,
          endDate: clickedDate,
          nights,
        });
      } else {
        // Clicked date is earlier than startDate, reset start date
        setStartDate(clickedDate);
        setEndDate(null);
        onSelectRange({
          startDate: clickedDate,
          endDate: null,
          nights: 1,
        });
      }
    }
  };

  const applyQuickPreset = (nightsCount: number) => {
    const base = startDate || new Date();
    const newStart = new Date(base.getFullYear(), base.getMonth(), base.getDate());
    newStart.setHours(0, 0, 0, 0);
    const newEnd = new Date(newStart.getFullYear(), newStart.getMonth(), newStart.getDate() + nightsCount);
    newEnd.setHours(0, 0, 0, 0);
    setStartDate(newStart);
    setEndDate(newEnd);
    onSelectRange({
      startDate: newStart,
      endDate: newEnd,
      nights: nightsCount,
    });
  };

  // Generate calendar cells
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarCells = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  const nights = calculateNights(startDate, endDate);

  const formatDate = (date: Date | null): string => {
    if (!date) return '---';
    return `${date.getDate()} Thg ${date.getMonth() + 1}, ${date.getFullYear()}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Month & Year Bar */}
      <View style={styles.monthHeader}>
        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F3F4F6' }]}
          onPress={handlePrevMonth}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.monthText, { color: colors.text }]}>
          {MONTH_NAMES[currentMonth]} {currentYear}
        </Text>
        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F3F4F6' }]}
          onPress={handleNextMonth}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Week Day Labels */}
      <View style={styles.weekRow}>
        {WEEK_DAYS.map((wd, i) => (
          <Text
            key={i}
            style={[
              styles.weekDayText,
              { color: i === 0 ? '#EF4444' : colors.textSecondary },
            ]}
          >
            {wd}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.grid}>
        {calendarCells.map((day, index) => {
          if (day === null) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }

          const cellDate = new Date(currentYear, currentMonth, day);
          cellDate.setHours(0, 0, 0, 0);

          const isPast = cellDate.getTime() < today.getTime();
          const isStart = isSameDay(cellDate, startDate);
          const isEnd = isSameDay(cellDate, endDate);
          const inRange = isBetween(cellDate, startDate, endDate);

          return (
            <TouchableOpacity
              key={`day-${day}`}
              style={[
                styles.dayCell,
                inRange && { backgroundColor: isDarkMode ? 'rgba(0, 189, 214, 0.2)' : '#E0F7FA', borderRadius: 0 },
                isStart && { backgroundColor: isDarkMode ? 'rgba(0, 189, 214, 0.2)' : '#E0F7FA', borderTopLeftRadius: 21, borderBottomLeftRadius: 21 },
                isEnd && { backgroundColor: isDarkMode ? 'rgba(0, 189, 214, 0.2)' : '#E0F7FA', borderTopRightRadius: 21, borderBottomRightRadius: 21 },
              ]}
              disabled={isPast}
              onPress={() => handleDayPress(day)}
            >
              <View
                style={[
                  styles.dayInnerCircle,
                  (isStart || isEnd) && styles.dayInnerCircleActive,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    { color: colors.text },
                    isPast && { color: isDarkMode ? '#475569' : '#D1D5DB' },
                    (isStart || isEnd) && { color: '#FFFFFF', fontWeight: '700' },
                    inRange && { color: isDarkMode ? '#67E8F9' : '#0891B2', fontWeight: '600' },
                  ]}
                >
                  {day}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick presets */}
      <View style={[styles.presetsRow, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.presetChip, { backgroundColor: isDarkMode ? '#1E293B' : '#F3F4F6', borderColor: colors.border }]}
          onPress={() => applyQuickPreset(2)}
        >
          <Text style={[styles.presetText, { color: colors.text }]}>Cuối tuần (2 đêm)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.presetChip, { backgroundColor: isDarkMode ? '#1E293B' : '#F3F4F6', borderColor: colors.border }]}
          onPress={() => applyQuickPreset(5)}
        >
          <Text style={[styles.presetText, { color: colors.text }]}>5 đêm</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.presetChip, { backgroundColor: isDarkMode ? '#1E293B' : '#F3F4F6', borderColor: colors.border }]}
          onPress={() => applyQuickPreset(7)}
        >
          <Text style={[styles.presetText, { color: colors.text }]}>1 tuần (7 đêm)</Text>
        </TouchableOpacity>
      </View>

      {/* Selected Range Summary Box */}
      <View style={[styles.summaryBox, { backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC', borderColor: colors.border }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Nhận phòng</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>{formatDate(startDate)}</Text>
        </View>
        <View style={styles.arrowIconWrap}>
          <Ionicons name="arrow-forward" size={16} color="#00BDD6" />
          <Text style={styles.nightsBadge}>{nights} đêm</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Trả phòng</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>{formatDate(endDate)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '700',
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  weekDayText: {
    width: 38,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayCell: {
    width: '14.28%',
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  dayInnerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayInnerCircleActive: {
    backgroundColor: '#00BDD6',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  presetChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
  },
  summaryBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  arrowIconWrap: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  nightsBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00BDD6',
    marginTop: 2,
  },
});
