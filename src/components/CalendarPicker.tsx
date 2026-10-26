import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  minDate = new Date(),
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentYear, setCurrentYear] = useState<number>(
    initialStartDate ? initialStartDate.getFullYear() : today.getFullYear()
  );
  const [currentMonth, setCurrentMonth] = useState<number>(
    initialStartDate ? initialStartDate.getMonth() : today.getMonth()
  );

  const [startDate, setStartDate] = useState<Date | null>(
    initialStartDate || new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  );
  const [endDate, setEndDate] = useState<Date | null>(
    initialEndDate || new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4)
  );

  const calculateNights = (start: Date | null, end: Date | null): number => {
    if (!start || !end) return 1;
    const diffTime = end.getTime() - start.getTime();
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
    return date.getTime() > start.getTime() && date.getTime() < end.getTime();
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
    const newEnd = new Date(base.getFullYear(), base.getMonth(), base.getDate() + nightsCount);
    setStartDate(base);
    setEndDate(newEnd);
    onSelectRange({
      startDate: base,
      endDate: newEnd,
      nights: nightsCount,
    });
  };

  // Generate calendar cells
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarCells = [];
  // Empty padding cells for preceding month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  // Days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  const nights = calculateNights(startDate, endDate);

  const formatDate = (date: Date | null): string => {
    if (!date) return '---';
    return `${date.getDate()} Thg ${date.getMonth() + 1}, ${date.getFullYear()}`;
  };

  return (
    <View style={styles.container}>
      {/* Month & Year Bar */}
      <View style={styles.monthHeader}>
        <TouchableOpacity style={styles.navBtn} onPress={handlePrevMonth}>
          <Ionicons name="chevron-back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {MONTH_NAMES[currentMonth]} {currentYear}
        </Text>
        <TouchableOpacity style={styles.navBtn} onPress={handleNextMonth}>
          <Ionicons name="chevron-forward" size={20} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Week Day Labels */}
      <View style={styles.weekRow}>
        {WEEK_DAYS.map((wd, i) => (
          <Text key={i} style={[styles.weekDayText, i === 0 && { color: '#EF4444' }]}>
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
                inRange && styles.dayCellInRange,
                isStart && styles.dayCellStart,
                isEnd && styles.dayCellEnd,
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
                    isPast && styles.dayTextDisabled,
                    (isStart || isEnd) && styles.dayTextActive,
                    inRange && styles.dayTextInRange,
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
      <View style={styles.presetsRow}>
        <TouchableOpacity
          style={styles.presetChip}
          onPress={() => applyQuickPreset(2)}
        >
          <Text style={styles.presetText}>Cuối tuần (2 đêm)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.presetChip}
          onPress={() => applyQuickPreset(5)}
        >
          <Text style={styles.presetText}>5 đêm</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.presetChip}
          onPress={() => applyQuickPreset(7)}
        >
          <Text style={styles.presetText}>1 tuần (7 đêm)</Text>
        </TouchableOpacity>
      </View>

      {/* Selected Range Summary Box */}
      <View style={styles.summaryBox}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Nhận phòng</Text>
          <Text style={styles.summaryValue}>{formatDate(startDate)}</Text>
        </View>
        <View style={styles.arrowIconWrap}>
          <Ionicons name="arrow-forward" size={16} color="#00BDD6" />
          <Text style={styles.nightsBadge}>{nights} đêm</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Trả phòng</Text>
          <Text style={styles.summaryValue}>{formatDate(endDate)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    color: '#111827',
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
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
    color: '#6B7280',
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
  dayCellInRange: {
    backgroundColor: '#E0F7FA',
    borderRadius: 0,
  },
  dayCellStart: {
    backgroundColor: '#E0F7FA',
    borderTopLeftRadius: 21,
    borderBottomLeftRadius: 21,
  },
  dayCellEnd: {
    backgroundColor: '#E0F7FA',
    borderTopRightRadius: 21,
    borderBottomRightRadius: 21,
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
    color: '#1F2937',
    fontWeight: '500',
  },
  dayTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dayTextInRange: {
    color: '#0891B2',
    fontWeight: '600',
  },
  dayTextDisabled: {
    color: '#D1D5DB',
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  presetChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  summaryBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
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
