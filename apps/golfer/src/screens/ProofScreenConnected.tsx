/**
 * Connected PROOF Screen
 *
 * Wraps the presentational ProofScreen with API data
 * Also provides camera/upload functionality
 */

import React, { useState, useEffect } from 'react';
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

import { ProofScreen } from '@screens/PROOF';
import { useProofData } from '../hooks/useProofData';
import { useCamera, useHaptics } from '../hooks/useNativeFeatures';
import api from '../services/api';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ProofRouteProp = RouteProp<RootStackParamList, 'Proof'>;

interface TestData {
  testName: string;
  testDate?: Date;
  currentValue?: number;
  baseline?: number;
  unit: string;
  isFirstTest?: boolean;
}

export function ProofScreenConnected() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ProofRouteProp>();
  const { testId, breakingPointId } = route.params || {};

  const [testData, setTestData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);

  const { uploading, progress, error, uploadProof, reset } = useProofData();
  const { takePhoto, pickFromGallery, requestPermissions } = useCamera();
  const { notification, impact } = useHaptics();

  // Fetch test data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        if (testId) {
          // Fetch test details
          const tests = await api.tests.getAll();
          const test = (tests.data || tests || []).find((t: any) => t.id === testId);

          if (test) {
            setTestData({
              testName: test.name || test.testName || `Test ${test.testNumber}`,
              testDate: test.date ? new Date(test.date) : undefined,
              currentValue: test.value || test.score,
              baseline: test.baseline,
              unit: test.unit || '%',
              isFirstTest: test.isFirstTest,
            });
          }
        } else if (breakingPointId) {
          // Fetch breaking point details
          const bp = await api.breakingPoints.getById(breakingPointId);

          setTestData({
            testName: bp.name || bp.title,
            testDate: bp.targetDate ? new Date(bp.targetDate) : undefined,
            currentValue: bp.currentValue,
            baseline: bp.baseline,
            unit: bp.unit || '',
            isFirstTest: false,
          });
        }
      } catch (err) {
        console.error('Failed to fetch proof data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [testId, breakingPointId]);

  // Handle dismiss
  const handleDismiss = () => {
    navigation.goBack();
  };

  // Handle capture
  const handleCapture = async () => {
    impact('medium');
    await requestPermissions();
    const media = await takePhoto();

    if (media) {
      setCapturedMedia(media.webPath || media.path);
    }
  };

  // Handle gallery pick
  const handlePickFromGallery = async () => {
    await requestPermissions();
    const media = await pickFromGallery();

    if (media) {
      setCapturedMedia(media.webPath || media.path);
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!capturedMedia || !breakingPointId) return;

    const success = await uploadProof(
      { uri: capturedMedia, type: 'photo' },
      breakingPointId
    );

    if (success) {
      notification('success');
      navigation.goBack();
    }
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={tokens.colors.charcoal} />
        </View>
      </SafeAreaView>
    );
  }

  // No data - show proof capture UI
  if (!testData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleDismiss}>
            <Text style={styles.headerBackText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Last opp bevis</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.captureContainer}>
          {capturedMedia ? (
            <View style={styles.previewContainer}>
              <Text style={styles.previewText}>Bilde valgt</Text>
              <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
                <Text style={styles.uploadButtonText}>
                  {uploading ? `Laster opp... ${progress.progress}%` : 'Last opp'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCapturedMedia(null)}>
                <Text style={styles.retakeText}>Velg annet</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.captureButtons}>
              <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
                <Text style={styles.captureButtonText}>Ta bilde</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.galleryButton} onPress={handlePickFromGallery}>
                <Text style={styles.galleryButtonText}>Velg fra galleri</Text>
              </TouchableOpacity>
            </View>
          )}

          {error && (
            <Text style={styles.errorText}>{error.message}</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Show proof screen with data
  return (
    <ProofScreen
      data={testData}
      onDismiss={handleDismiss}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
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
  captureContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  captureButtons: {
    gap: 16,
    width: '100%',
  },
  captureButton: {
    backgroundColor: tokens.colors.charcoal,
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  captureButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: tokens.colors.white,
  },
  galleryButton: {
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.mist,
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  galleryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: tokens.colors.charcoal,
  },
  previewContainer: {
    alignItems: 'center',
    gap: 16,
    width: '100%',
  },
  previewText: {
    fontSize: 22,
    fontWeight: '700',
    color: tokens.colors.charcoal,
  },
  uploadButton: {
    backgroundColor: tokens.colors.charcoal,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  uploadButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: tokens.colors.white,
  },
  retakeText: {
    fontSize: 17,
    color: tokens.colors.steel,
    marginTop: 8,
  },
  errorText: {
    fontSize: 15,
    color: '#ff4444',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default ProofScreenConnected;
