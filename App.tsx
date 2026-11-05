import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { CurrencyProvider } from './src/context/CurrencyContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';

function MainApp() {
  const { isDarkMode, colors } = useTheme();

  return (
    <View style={[styles.outerContainer, { backgroundColor: isDarkMode ? '#0B0F17' : '#F3F4F6' }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={colors.statusBar} />
        <AppNavigator />
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider style={styles.outerContainer}>
      <AuthProvider>
        <ThemeProvider>
          <CurrencyProvider>
            <MainApp />
          </CurrencyProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    width: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
});
