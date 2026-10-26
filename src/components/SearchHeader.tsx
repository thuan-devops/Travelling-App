import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchHeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onClear: () => void;
  onPress?: () => void;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onClear,
  onPress,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.searchBar}
        activeOpacity={0.8}
        onPress={onPress}
      >
        <Ionicons name="search-outline" size={20} color="#374151" style={styles.searchIcon} />
        {onPress ? (
          <Text style={[styles.searchInput, { color: searchQuery ? '#1F2937' : '#9CA3AF' }]}>
            {searchQuery || 'Bạn muốn nghỉ ngơi ở đâu?'}
          </Text>
        ) : (
          <TextInput
            style={styles.searchInput}
            placeholder="Bạn muốn nghỉ ngơi ở đâu?"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={onSearchChange}
            returnKeyType="search"
            clearButtonMode="never"
          />
        )}

        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={onClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
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
});
