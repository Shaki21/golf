/**
 * Connected SESSION Screen
 *
 * Wraps session execution with API data and state management
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { tokens } from '@iup/design-system';

import { useSessionData } from '../hooks/useSessionData';
import { useHaptics } from '../hooks/useNativeFeatures';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SessionRouteProp = RouteProp<RootStackParamList, 'Session'>;

export function SessionScreenConnected() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SessionRouteProp>();
  const { sessionId } = route.params;

  const {
    session,
    loading,
    error,
    saving,
    startSession,
    completeBlock,
    completeSession,
    pauseSession,
  } = useSessionData(sessionId);

  const { impact, notification } = useHaptics();

  const [isActive, setIsActive] = useState(false);
  const [repsRemaining, setRepsRemaining] = useState<number | null>(null);

  // Initialize reps from current block
  useEffect(() => {
    if (session && session.blocks.length > 0) {
      const currentBlock = session.blocks[session.currentBlockIndex];
      if (currentBlock?.reps) {
        setRepsRemaining(currentBlock.reps);
      }
    }
  }, [session?.currentBlockIndex]);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={tokens.colors.charcoal} />
          <Text style={styles.loadingText}>Laster økt...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Kunne ikke laste økten</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Tilbake</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentBlock = session.blocks[session.currentBlockIndex];
  const isLastBlock = session.currentBlockIndex >= session.blocks.length - 1;
  const isCompleted = session.status === 'completed';

  // Handlers
  const handleStart = async () => {
    await startSession();
    setIsActive(true);
    impact('medium');
  };

  const handlePause = async () => {
    await pauseSession();
    setIsActive(false);
    impact('light');
  };

  const handleRepComplete = async () => {
    impact('light');

    if (repsRemaining === null) return;

    if (repsRemaining <= 1) {
      setRepsRemaining(0);
      const wasLastBlock = await completeBlock();
      if (wasLastBlock) {
        notification('success');
        handleFinishSession();
      } else {
        // Move to next block
        const nextBlock = session.blocks[session.currentBlockIndex + 1];
        if (nextBlock?.reps) {
          setRepsRemaining(nextBlock.reps);
        }
      }
    } else {
      setRepsRemaining(repsRemaining - 1);
    }
  };

  const handleFinishBlock = async () => {
    const wasLastBlock = await completeBlock();
    if (wasLastBlock) {
      notification('success');
      handleFinishSession();
    } else {
      impact('medium');
      const nextBlock = session.blocks[session.currentBlockIndex + 1];
      if (nextBlock?.reps) {
        setRepsRemaining(nextBlock.reps);
      }
    }
  };

  const handleFinishSession = async () => {
    await completeSession();

    // Calculate actual session duration
    const durationMinutes = session.startedAt
      ? Math.round((Date.now() - new Date(session.startedAt).getTime()) / 60000)
      : 60; // Fallback if startedAt is not set

    // Navigate to reflection
    navigation.navigate('Reflection', {
      sessionId,
      sessionSummary: {
        trainingArea: session.trainingArea,
        blockCount: session.blocks.length,
        durationMinutes,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerBackText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{session.trainingArea}</Text>
        <Text style={styles.headerProgress}>
          {session.currentBlockIndex + 1}/{session.blocks.length}
        </Text>
      </View>

      {/* Block content */}
      <View style={styles.content}>
        {currentBlock && (
          <>
            <Text style={styles.blockTitle}>{currentBlock.title}</Text>
            {currentBlock.description && (
              <Text style={styles.blockDescription}>{currentBlock.description}</Text>
            )}
          </>
        )}

        {/* Reps counter */}
        {repsRemaining !== null && (
          <View style={styles.repsContainer}>
            <Text style={styles.repsLabel}>Repetisjoner</Text>
            <Text style={styles.repsValue}>{repsRemaining}</Text>
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {!isActive && !isCompleted && (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStart}
              disabled={saving}
            >
              <Text style={styles.primaryButtonText}>
                {session.status === 'in_progress' ? 'Fortsett' : 'Start'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleFinishBlock}
              disabled={saving}
            >
              <Text style={styles.secondaryButtonText}>Fullfør blokk</Text>
            </TouchableOpacity>
          </>
        )}

        {isActive && (
          <>
            <TouchableOpacity
              style={styles.repButton}
              onPress={handleRepComplete}
              disabled={saving}
            >
              <Text style={styles.repButtonText}>Rep ferdig</Text>
            </TouchableOpacity>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.pauseButton}
                onPress={handlePause}
                disabled={saving}
              >
                <Text style={styles.pauseButtonText}>Pause</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.finishButton}
                onPress={handleFinishBlock}
                disabled={saving}
              >
                <Text style={styles.finishButtonText}>
                  {isLastBlock ? 'Fullfør' : 'Neste blokk'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {isCompleted && (
          <View style={styles.completedContainer}>
            <Text style={styles.completedText}>Økt fullført!</Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.primaryButtonText}>Ferdig</Text>
            </TouchableOpacity>
          </View>
        )}

        {saving && (
          <ActivityIndicator
            size="small"
            color={tokens.colors.charcoal}
            style={styles.savingIndicator}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.snow,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: tokens.colors.surface,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: tokens.colors.charcoal,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: tokens.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.mist,
  },
  headerBackText: {
    fontSize: 24,
    color: tokens.colors.charcoal,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: tokens.colors.charcoal,
  },
  headerProgress: {
    fontSize: 15,
    color: tokens.colors.steel,
  },

  // Content
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  blockTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: tokens.colors.charcoal,
    textAlign: 'center',
    marginBottom: 16,
  },
  blockDescription: {
    fontSize: 17,
    color: tokens.colors.steel,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Reps counter
  repsContainer: {
    alignItems: 'center',
    marginTop: 48,
  },
  repsLabel: {
    fontSize: 15,
    color: tokens.colors.steel,
    marginBottom: 8,
  },
  repsValue: {
    fontSize: 72,
    fontWeight: '700',
    color: tokens.colors.charcoal,
    fontVariant: ['tabular-nums'],
  },

  // Controls
  controls: {
    padding: 24,
    backgroundColor: tokens.colors.white,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.mist,
  },
  primaryButton: {
    backgroundColor: tokens.colors.charcoal,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: tokens.colors.white,
  },
  secondaryButton: {
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.mist,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: tokens.colors.charcoal,
  },
  repButton: {
    backgroundColor: tokens.colors.charcoal,
    paddingVertical: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  repButtonText: {
    fontSize: 22,
    fontWeight: '700',
    color: tokens.colors.white,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pauseButton: {
    flex: 1,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.mist,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  pauseButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: tokens.colors.charcoal,
  },
  finishButton: {
    flex: 1,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.mist,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  finishButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: tokens.colors.charcoal,
  },
  completedContainer: {
    alignItems: 'center',
  },
  completedText: {
    fontSize: 22,
    fontWeight: '700',
    color: tokens.colors.charcoal,
    marginBottom: 24,
  },
  savingIndicator: {
    marginTop: 16,
  },
});

export default SessionScreenConnected;
