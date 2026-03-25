/**
 * Connected BASELINE Screen
 *
 * Wraps the presentational BaselineScreen with API data
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { tokens } from '@iup/design-system';

import { BaselineScreen } from '@screens/BASELINE';
import { useBaselineData } from '../hooks/useBaselineData';
import { useAuth } from '../contexts/AuthContext';
import { useHaptics } from '../hooks/useNativeFeatures';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function BaselineScreenConnected() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const playerId = user?.playerId || '';

  const { data, loading, error, saving, confirmBaseline } = useBaselineData(playerId);
  const { notification } = useHaptics();

  // Loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={tokens.colors.charcoal} />
        <Text style={styles.loadingText}>Laster data...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Kunne ikke laste data</Text>
      </View>
    );
  }

  // Already locked
  if (data?.isLocked) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.lockedTitle}>Baseline er satt</Text>
        <Text style={styles.lockedValue}>{data.currentBaseline?.toFixed(1)}</Text>
        <Text style={styles.lockedText}>
          Din baseline er låst og kan ikke endres.
        </Text>
      </View>
    );
  }

  // Handle confirm
  const handleConfirm = async (option: { type: 'season' | 'last8'; value: number }) => {
    const success = await confirmBaseline(option);
    if (success) {
      notification('success');
      navigation.navigate('Home');
    }
  };

  return (
    <>
      <BaselineScreen
        seasonAverage={data?.seasonAverage}
        last8Average={data?.last8Average}
        onConfirm={handleConfirm}
      />
      {saving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="large" color={tokens.colors.white} />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: tokens.colors.white,
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
  },
  lockedTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: tokens.colors.charcoal,
    marginBottom: 16,
  },
  lockedValue: {
    fontSize: 48,
    fontWeight: '700',
    color: tokens.colors.charcoal,
    marginBottom: 16,
  },
  lockedText: {
    fontSize: 17,
    color: tokens.colors.steel,
    textAlign: 'center',
  },
  savingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BaselineScreenConnected;
