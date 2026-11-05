import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabType } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useResponsive } from '../hooks/useResponsive';

interface SidebarNavProps {
  activeTab: BottomTabType | string;
  onTabChange: (tab: BottomTabType) => void;
  favoritesCount?: number;
  onOpenSearch?: () => void;
  onOpenAiSupport?: () => void;
}

interface NavItem {
  key: BottomTabType;
  label: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'Search', label: 'Khám phá', activeIcon: 'compass', inactiveIcon: 'compass-outline' },
  { key: 'Favorites', label: 'Yêu thích', activeIcon: 'heart', inactiveIcon: 'heart-outline' },
  { key: 'Bookings', label: 'Chuyến đi', activeIcon: 'grid', inactiveIcon: 'grid-outline' },
  { key: 'Inbox', label: 'Hộp thư', activeIcon: 'chatbubble-ellipses', inactiveIcon: 'chatbubble-ellipses-outline' },
  { key: 'Profile', label: 'Hồ sơ', activeIcon: 'person-circle', inactiveIcon: 'person-circle-outline' },
];

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onTabChange,
  favoritesCount = 0,
  onOpenSearch,
  onOpenAiSupport,
}) => {
  const { isDarkMode, colors } = useTheme();
  const { user } = useAuth();
  const { isTablet } = useResponsive();

  // If tablet portrait or narrow tablet, use compact Rail mode (width: 80px)
  const isCompact = isTablet;

  return (
    <View
      style={[
        styles.container,
        {
          width: isCompact ? 84 : 240,
          backgroundColor: colors.card,
          borderRightColor: colors.border,
        },
      ]}
    >
      {/* 1. TOP BRAND HEADER */}
      <View style={[styles.header, isCompact && styles.headerCompact]}>
        <View style={styles.brandIconCircle}>
          <Ionicons name="airplane" size={20} color="#FFFFFF" />
        </View>
        {!isCompact && (
          <View style={styles.brandTextCol}>
            <Text style={[styles.brandTitle, { color: colors.text }]}>Travelling</Text>
            <Text style={styles.brandSub}>Vi vu Việt Nam</Text>
          </View>
        )}
      </View>

      {/* 2. NAVIGATION MENU */}
      <View style={styles.navMenu}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.key;
          const iconColor = isActive ? '#00BDD6' : isDarkMode ? '#94A3B8' : '#4B5563';

          return (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.navItemBtn,
                isCompact && styles.navItemBtnCompact,
                isActive && [
                  styles.navItemBtnActive,
                  { backgroundColor: isDarkMode ? 'rgba(0, 189, 214, 0.14)' : '#EDF9FA' },
                ],
              ]}
              activeOpacity={0.7}
              onPress={() => onTabChange(item.key)}
            >
              {isActive && !isCompact && <View style={styles.activeBarIndicator} />}

              <View style={styles.iconContainer}>
                <Ionicons
                  name={isActive ? item.activeIcon : item.inactiveIcon}
                  size={22}
                  color={iconColor}
                />
                {item.key === 'Favorites' && favoritesCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {favoritesCount > 9 ? '9+' : favoritesCount}
                    </Text>
                  </View>
                )}
              </View>

              {!isCompact ? (
                <Text
                  style={[
                    styles.navItemLabel,
                    { color: isDarkMode ? '#CBD5E1' : '#334155' },
                    isActive && styles.navItemLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              ) : (
                <Text
                  style={[
                    styles.compactLabel,
                    { color: isDarkMode ? '#CBD5E1' : '#334155' },
                    isActive && styles.compactLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}

        {/* AI SMART ASSISTANT EXTRA BUTTON */}
        {onOpenAiSupport && (
          <TouchableOpacity
            style={[
              styles.navItemBtn,
              styles.aiSupportBtn,
              isCompact && styles.navItemBtnCompact,
              activeTab === 'AI_SUPPORT' && styles.navItemBtnActive,
            ]}
            activeOpacity={0.75}
            onPress={onOpenAiSupport}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="sparkles" size={20} color="#00BDD6" />
            </View>
            {!isCompact ? (
              <View style={styles.aiLabelRow}>
                <Text style={styles.aiLabelText}>Trợ lý AI</Text>
                <View style={styles.aiBadgePill}>
                  <Text style={styles.aiBadgePillText}>24/7</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.compactLabel}>Trợ lý</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* 3. BOTTOM USER INFO & APP VERSION */}
      <View style={[styles.bottomSection, isCompact && styles.bottomSectionCompact, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.userCardBtn, isCompact && styles.userCardBtnCompact]}
          activeOpacity={0.8}
          onPress={() => onTabChange('Profile')}
        >
          <Image
            source={{
              uri:
                user?.avatarUrl ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
            }}
            style={styles.avatar}
          />
          {!isCompact && (
            <View style={styles.userInfoTextCol}>
              <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                {user?.name || 'Du khách'}
              </Text>
              <Text style={[styles.userRole, { color: colors.textSecondary }]}>
                {user?.email ? user.email.split('@')[0] : 'Thành viên VIP'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {!isCompact && (
          <View style={styles.footerNoteRow}>
            <View style={styles.onlineDot} />
            <Text style={[styles.footerNoteText, { color: colors.textSecondary }]}>
              Travelling Web App
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    borderRightWidth: 1,
    paddingVertical: 20,
    justifyContent: 'space-between',
    zIndex: 99,
    ...(Platform.OS === 'web'
      ? ({
          position: 'sticky',
          top: 0,
          userSelect: 'none',
        } as any)
      : null),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerCompact: {
    paddingHorizontal: 0,
    justifyContent: 'center',
  },
  brandIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#00BDD6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00BDD6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  brandTextCol: {
    marginLeft: 12,
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  brandSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00BDD6',
    marginTop: 1,
  },
  navMenu: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 10,
    gap: 6,
  },
  navItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 12,
    position: 'relative',
  },
  navItemBtnCompact: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  navItemBtnActive: {
    backgroundColor: '#EDF9FA',
  },
  activeBarIndicator: {
    position: 'absolute',
    left: 0,
    top: '25%',
    bottom: '25%',
    width: 3.5,
    backgroundColor: '#00BDD6',
    borderRadius: 2,
  },
  iconContainer: {
    position: 'relative',
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    minWidth: 17,
    height: 17,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
  },
  navItemLabel: {
    fontSize: 14.5,
    fontWeight: '600',
    marginLeft: 12,
    color: '#334155',
  },
  navItemLabelActive: {
    color: '#00BDD6',
    fontWeight: '700',
  },
  compactLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  compactLabelActive: {
    color: '#00BDD6',
    fontWeight: '700',
  },
  aiSupportBtn: {
    marginTop: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  aiLabelRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  aiLabelText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0284C7',
  },
  aiBadgePill: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aiBadgePillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#0284C7',
  },
  bottomSection: {
    borderTopWidth: 1,
    paddingTop: 14,
    paddingHorizontal: 12,
  },
  bottomSectionCompact: {
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  userCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 10,
  },
  userCardBtnCompact: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#00BDD6',
  },
  userInfoTextCol: {
    marginLeft: 10,
    flex: 1,
  },
  userName: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  userRole: {
    fontSize: 11,
    marginTop: 1,
  },
  footerNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 6,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  footerNoteText: {
    fontSize: 11,
    fontWeight: '500',
  },
});

