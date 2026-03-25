/**
 * Connected REFLECTION Screen
 *
 * Wraps the presentational ReflectionScreen with API save functionality
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { tokens } from '@iup/design-system';

import { ReflectionScreen } from '@screens/REFLECTION';
import { useReflectionData } from '../hooks/useReflectionData';
import { useHaptics } from '../hooks/useNativeFeatures';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ReflectionRouteProp = RouteProp<RootStackParamList, 'Reflection'>;

export function ReflectionScreenConnected() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ReflectionRouteProp>();
  const { sessionId, sessionSummary } = route.params;

  const { saving, error, saved, saveReflection, skipReflection } = useReflectionData(sessionId);
  const { notification } = useHaptics();

  // Handle save
  const handleSave = async (data: any) => {
    const success = await saveReflection(data);
    if (success) {
      notification('success');
      navigation.navigate('Home');
    }
  };

  // Handle skip
  const handleSkip = async () => {
    await skipReflection();
    navigation.navigate('Home');
  };

  // If already saved, show success and navigate
  if (saved) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.successText}>Refleksjon lagret!</Text>
      </View>
    );
  }

  return (
    <>
      <ReflectionScreen
        session={sessionSummary}
        onSave={handleSave}
        onSkip={handleSkip}
      />
      {saving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="large" color={tokens.colors.white} />
          <Text style={styles.savingText}>Lagrer...</Text>
        </View>
      )}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>Kunne ikke lagre: {error.message}</Text>
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
    backgroundColor: tokens.colors.snow,
  },
  successText: {
    fontSize: 22,
    fontWeight: '700',
    color: tokens.colors.charcoal,
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
  savingText: {
    marginTop: 16,
    fontSize: 17,
    color: tokens.colors.white,
  },
  errorBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ff4444',
    padding: 16,
  },
  errorText: {
    fontSize: 15,
    color: tokens.colors.white,
    textAlign: 'center',
  },
});

export default ReflectionScreenConnected;
