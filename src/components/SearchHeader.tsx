import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface SearchHeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onClear: () => void;
  onPress?: () => void;
  onVoicePress?: () => void;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onClear,
  onPress,
  onVoicePress,
}) => {
  const { isDarkMode, colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? colors.background : '#EDF9FA' }]}>
      <TouchableOpacity
        style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}
        activeOpacity={0.8}
        onPress={onPress}
      >
        <Ionicons name="search-outline" size={20} color={isDarkMode ? colors.text : "#374151"} style={styles.searchIcon} />
        {onPress ? (
          <Text style={[styles.searchInput, { color: searchQuery ? (isDarkMode ? '#FFFFFF' : colors.text) : (isDarkMode ? '#94A3B8' : colors.textSecondary), fontWeight: '600' }]}>
            {searchQuery || 'Bạn muốn nghỉ ngơi ở đâu?'}
          </Text>
        ) : (
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Bạn muốn nghỉ ngơi ở đâu?"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={onSearchChange}
            returnKeyType="search"
            clearButtonMode="never"
          />
        )}

        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={onClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ marginRight: 6 }}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}

        {onVoicePress && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onVoicePress();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[styles.micBtn, { backgroundColor: isDarkMode ? 'rgba(0, 189, 214, 0.18)' : '#F0FDFA' }]}
          >
            <Ionicons name="mic" size={19} color="#00BDD6" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#EDF9FA', // Light cyan tint as seen in screenshot
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  micBtn: {
    padding: 6,
    borderRadius: 14,
    backgroundColor: '#F0FDFA',
    marginLeft: 6,
  },
});
