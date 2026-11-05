import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabType } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';

interface BottomTabBarProps {
  activeTab: BottomTabType;
  onTabChange: (tab: BottomTabType) => void;
  favoritesCount?: number;
}

interface TabItem {
  key: BottomTabType;
  label: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
}

const TABS: TabItem[] = [
  { key: 'Search', label: 'Khám phá', activeIcon: 'compass', inactiveIcon: 'compass-outline' },
  { key: 'Favorites', label: 'Yêu thích', activeIcon: 'heart', inactiveIcon: 'heart-outline' },
  { key: 'Bookings', label: 'Chuyến đi', activeIcon: 'briefcase', inactiveIcon: 'briefcase-outline' },
  { key: 'Inbox', label: 'Hộp thư', activeIcon: 'chatbubble-ellipses', inactiveIcon: 'chatbubble-ellipses-outline' },
  { key: 'Profile', label: 'Hồ sơ', activeIcon: 'person-circle', inactiveIcon: 'person-circle-outline' },
];


export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
  favoritesCount = 0,
}) => {
  const { isDarkMode, colors } = useTheme();
  const { isMobile } = useResponsive();

  // Trên Web / Desktop / Tablet (màn hình rộng), thanh điều hướng đã được chuyển sang Sidebar bên trái
  if (!isMobile) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
      <View style={styles.innerContent}>
        {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const iconColor = isActive ? '#00BDD6' : (isDarkMode ? '#94A3B8' : '#6B7280');

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            activeOpacity={0.7}
            onPress={() => onTabChange(tab.key)}
          >
            <View style={styles.iconWrapper}>
              <Ionicons
                name={isActive ? tab.activeIcon : tab.inactiveIcon}
                size={24}
                color={iconColor}
              />
              {tab.key === 'Favorites' && favoritesCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {favoritesCount > 9 ? '9+' : favoritesCount}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.tabLabel, { color: isDarkMode ? '#94A3B8' : '#6B7280' }, isActive && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: Platform.OS === 'ios' ? 78 : 64,
    paddingBottom: Platform.OS === 'ios' ? 18 : 6,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  innerContent: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconWrapper: {
    position: 'relative',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 3,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#00BDD6',
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});
