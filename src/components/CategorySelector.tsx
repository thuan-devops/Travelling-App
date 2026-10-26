import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CategoryItem, StayCategory } from '../types';

interface CategorySelectorProps {
  categories: CategoryItem[];
  selectedCategory: StayCategory | 'All';
  onSelectCategory: (category: StayCategory) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  // Map category to accurate icon matching screenshot 3
  const getIconName = (category: StayCategory): keyof typeof Ionicons.glyphMap => {
    switch (category) {
      case 'Beach':
        return 'umbrella-outline';
      case 'Mountain':
        return 'triangle-outline';
      case 'Camping':
        return 'bonfire-outline';
      case 'City':
        return 'business-outline';
      case 'Villa':
        return 'home-outline';
      default:
        return 'compass-outline';
    }
  };

  return (
    <View style={styles.container}>
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
              <Ionicons
                name={getIconName(cat.id)}
                size={22}
                color={isActive ? '#00BDD6' : '#6B7280'}
              />
              <Text style={[styles.categoryLabel, isActive && styles.activeLabel]}>
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
