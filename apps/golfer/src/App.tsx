/**
 * AK Golf Mobile App - Main Entry Point
 *
 * React Native app for golfers with:
 * - Session tracking
 * - Video proof capture
 * - Offline-first sync
 * - Push notifications
 */

import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SyncProvider } from './contexts/SyncContext';

// Screens - Connected versions with API integration
import LoginScreen from './screens/LoginScreen';
import HomeScreenConnected from './screens/HomeScreenConnected';
import SessionScreenConnected from './screens/SessionScreenConnected';
import ReflectionScreenConnected from './screens/ReflectionScreenConnected';
import BaselineScreenConnected from './screens/BaselineScreenConnected';
import TrajectoryScreenConnected from './screens/TrajectoryScreenConnected';
import ProofScreenConnected from './screens/ProofScreenConnected';

// Types
import { RootStackParamList } from './navigation/types';

// Suppress known warnings in development
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
]);

const Stack = createNativeStackNavigator<RootStackParamList>();

// Auth Navigator - shown when not logged in
function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

// Main Navigator - shown when logged in
function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Home" component={HomeScreenConnected} />
      <Stack.Screen name="Session" component={SessionScreenConnected} />
      <Stack.Screen name="Reflection" component={ReflectionScreenConnected} />
      <Stack.Screen name="Baseline" component={BaselineScreenConnected} />
      <Stack.Screen name="Trajectory" component={TrajectoryScreenConnected} />
      <Stack.Screen name="Proof" component={ProofScreenConnected} />
    </Stack.Navigator>
  );
}

// Root Navigator - switches between auth and main
function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Could show splash screen here
    return null;
  }

  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
}

// Main App Component
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SyncProvider>
          <NavigationContainer>
            <StatusBar barStyle="dark-content" backgroundColor="#FAFBFC" />
            <RootNavigator />
          </NavigationContainer>
        </SyncProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
