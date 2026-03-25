/**
 * Connected HOME Screen
 *
 * Wraps the presentational HomeScreen with API data fetching
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { tokens } from '@iup/design-system';

import { HomeScreen } from '@screens/HOME';
import { useHomeData } from '../hooks/useHomeData';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreenConnected() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { data, loading, error, refresh } = useHomeData();

  // Loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={tokens.colors.charcoal} />
        <Text style={styles.loadingText}>Laster...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Kunne ikke laste data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Prøv igjen</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // No data
  if (!data) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Ingen data tilgjengelig</Text>
      </View>
    );
  }

  // Navigate to session
  const handleStartSession = (sessionId: string) => {
    navigation.navigate('Session', { sessionId });
  };

  const handleContinueSession = (sessionId: string) => {
    navigation.navigate('Session', { sessionId });
  };

  return (
    <HomeScreen
      userName={user?.firstName || user?.email?.split('@')[0] || 'Spiller'}
      nextSession={data.nextSession}
      timeContext={data.timeContext}
      effort={data.effort}
      onStartSession={handleStartSession}
      onContinueSession={handleContinueSession}
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: tokens.colors.snow,
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 17,
    color: tokens.colors.steel,
  },
  errorText: {
    fontSize: 17,
    color: tokens.colors.charcoal,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.mist,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: tokens.colors.charcoal,
  },
});

export default HomeScreenConnected;
