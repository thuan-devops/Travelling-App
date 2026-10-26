import React from 'react';
import { View, StyleSheet } from 'react-native';

interface AppLogoProps {
  size?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 80 }) => {
  // Proportions relative to base size of 80x80
  const scale = size / 80;

  const leftWidth = 26 * scale;
  const leftHeight = 64 * scale;
  const circleSize = 26 * scale;
  const gap = 8 * scale;
  const horizontalGap = 7 * scale;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={styles.logoRow}>
        {/* Teal curved left shape */}
        <View
          style={[
            styles.leftPillar,
            {
              width: leftWidth,
              height: leftHeight,
              borderTopLeftRadius: leftWidth,
              borderBottomLeftRadius: leftWidth,
              borderTopRightRadius: leftWidth * 0.45,
              borderBottomRightRadius: 2 * scale,
              marginRight: horizontalGap,
            },
          ]}
        />

        {/* Right side circles */}
        <View style={[styles.rightColumn, { height: leftHeight }]}>
          {/* Top purple circle */}
          <View
            style={[
              styles.circlePurple,
              {
                width: circleSize,
                height: circleSize,
                borderRadius: circleSize / 2,
                marginBottom: gap,
              },
            ]}
          />
          {/* Bottom blue circle */}
          <View
            style={[
              styles.circleBlue,
              {
                width: circleSize,
                height: circleSize,
                borderRadius: circleSize / 2,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftPillar: {
    backgroundColor: '#00BDD6', // Vibrant Cyan / Turquoise
  },
  rightColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  circlePurple: {
    backgroundColor: '#8B5CF6', // Purple / Violet
  },
  circleBlue: {
    backgroundColor: '#3B82F6', // Royal Blue
  },
});
