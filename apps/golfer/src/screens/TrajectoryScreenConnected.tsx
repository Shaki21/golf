/**
 * Connected TRAJECTORY Screen
 *
 * Wraps the presentational TrajectoryScreen with API data
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { tokens } from '@iup/design-system';

import { TrajectoryScreen } from '@screens/TRAJECTORY';
import { useTrajectoryData } from '../hooks/useTrajectoryData';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function TrajectoryScreenConnected() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const playerId = user?.playerId || '';

  const { tests, loading, error, refresh } = useTrajectoryData(playerId);

  // Loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={tokens.colors.charcoal} />
        <Text style={styles.loadingText}>Laster historikk...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Kunne ikke laste historikk</Text>
      </View>
    );
  }

  // Handle test selection
  const handleSelectTest = (testId: string) => {
    navigation.navigate('Proof', { testId });
  };

  // Handle back
  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <TrajectoryScreen
      tests={tests}
      onSelectTest={handleSelectTest}
      onBack={handleBack}
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: tokens.colors.snow,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 17,
    color: tokens.colors.steel,
  },
  errorText: {
    fontSize: 17,
    color: tokens.colors.charcoal,
  },
});

export default TrajectoryScreenConnected;
