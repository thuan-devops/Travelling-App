import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CategoryItem, StayCategory } from '../types';
import { useTheme } from '../context/ThemeContext';

interface CategorySelectorProps {
  categories: CategoryItem[];
  selectedCategory: StayCategory | 'All';
  onSelectCategory: (category: StayCategory | 'All') => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const { isDarkMode, colors } = useTheme();

  // Ánh xạ icon chuẩn du lịch chuyên nghiệp, trực quan
  const getIconName = (categoryId: StayCategory | 'All'): keyof typeof MaterialCommunityIcons.glyphMap => {
    switch (categoryId) {
      case 'All':
        return 'apps';
      case 'Beach':
        return 'beach'; // Bãi biển & cây dừa
      case 'Mountain':
        return 'image-filter-hdr'; // Dãy núi non tuyết hùng vĩ
      case 'Camping':
        return 'tent'; // Lều cắm trại ngoài trời
      case 'City':
        return 'city-variant-outline'; // Các tòa cao ốc đô thị
      case 'Villa':
        return 'home-modern'; // Biệt thự nghỉ dưỡng sang trọng
      default:
        return 'compass-outline';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryItem, isActive && styles.activeItem]}
              activeOpacity={0.7}
              onPress={() => onSelectCategory(cat.id)}
            >
              <MaterialCommunityIcons
                name={getIconName(cat.id)}
                size={23}
                color={isActive ? '#00BDD6' : (isDarkMode ? '#94A3B8' : '#6B7280')}
              />
              <Text style={[styles.categoryLabel, { color: isDarkMode ? '#94A3B8' : '#6B7280' }, isActive && styles.activeLabel]}>
                {cat.name}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EDF9FA', // Continues the light cyan tint from header
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  scrollContent: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    minWidth: '100%',
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    position: 'relative',
  },
  activeItem: {},
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 4,
  },
  activeLabel: {
    color: '#00BDD6',
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    height: 2.5,
    backgroundColor: '#00BDD6',
    borderRadius: 2,
  },
});
