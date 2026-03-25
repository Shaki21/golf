/**
 * PROOF Screen
 *
 * Responsibility: Present indisputable evidence of change without interpretation.
 * Contract: See docs/IMPLEMENTATION_CONTRACT.md (P-01 to P-63, P-E1 to P-E6)
 *
 * MUST: Show current value, baseline, delta — all in neutral colors
 * MUST NOT: Celebrate, console, explain causality, recommend actions
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { tokens } from '@iup/design-system';

// Types
interface ProofData {
  testName: string;
  testDate?: Date; // undefined if not completed (P-E2)
  currentValue?: number; // undefined if not completed
  baseline?: number; // undefined if not set (P-E3) or first test (P-E1)
  unit: string; // '%', 'm', etc.
  isFirstTest?: boolean; // P-E1
}

interface ProofScreenProps {
  data: ProofData;
  onDismiss: () => void;
}

export function ProofScreen({ data, onDismiss }: ProofScreenProps) {
  // Format date (P-02)
  const formatDate = (date: Date): string => {
    const months = [
      'januar', 'februar', 'mars', 'april', 'mai', 'juni',
      'juli', 'august', 'september', 'oktober', 'november', 'desember'
    ];
    return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Calculate delta (P-07)
  const calculateDelta = (): string | null => {
    // P-E1, P-E2, P-E3, P-E5
    if (data.currentValue === undefined || data.baseline === undefined) {
      return null;
    }
    const delta = data.currentValue - data.baseline;
    if (delta === 0) {
      return '(0)'; // P-E5: Just zero, not +0 or -0
    }
    const sign = delta > 0 ? '+' : '−'; // P-07: Using actual minus sign
    return `(${sign}${Math.abs(delta).toFixed(1)})`;
  };

  // Format value with unit
  const formatValue = (value: number | undefined): string => {
    if (value === undefined) return '—'; // P-09
    return `${value.toFixed(1)}${data.unit}`;
  };

  // Get baseline display text
  const getBaselineDisplay = (): string => {
    if (data.isFirstTest) return 'Første test'; // P-E1
    if (data.baseline === undefined) return 'Ikke satt'; // P-E3
    return formatValue(data.baseline);
  };

  // Get date display text
  const getDateDisplay = (): string => {
    if (!data.testDate) return 'Ikke gjennomført'; // P-E2
    return formatDate(data.testDate);
  };

  const delta = calculateDelta();

  return (
    <SafeAreaView style={styles.container}>
      {/* Region 1: Header (P-01, P-02) */}
      <View style={styles.header}>
        <Text style={styles.testName}>{data.testName}</Text>
        <Text style={styles.testDate}>{getDateDisplay()}</Text>
      </View>

      {/* Region 2: Comparison (P-03 to P-11) */}
      <View style={styles.comparison}>
        {/* Current value (P-03, P-04) */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>NÅ</Text>
          <Text style={styles.currentValue}>
            {data.currentValue !== undefined ? formatValue(data.currentValue) : '—'}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Baseline (P-05, P-06) */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>BASELINE</Text>
          <Text style={styles.baselineValue}>{getBaselineDisplay()}</Text>
        </View>

        <View style={styles.divider} />

        {/* Delta (P-07, P-08, P-09) */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ENDRING</Text>
          <Text style={styles.deltaValue}>
            {delta !== null ? delta : '—'}
          </Text>
        </View>
      </View>

      {/* Region 3: Dismiss (P-10, P-62) */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Text style={styles.dismissButtonText}>Forstått</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.white,
  },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
  },
  testName: {
    fontSize: 17,
    fontWeight: '600',
    color: tokens.colors.charcoal,
  },
  testDate: {
    fontSize: 15,
    color: tokens.colors.steel,
    marginTop: 4,
  },

  // Comparison
  comparison: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  section: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: tokens.colors.steel,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  // P-03: Current value is primary element, minimum 48pt
  currentValue: {
    fontSize: 56,
    fontWeight: '700',
    color: tokens.colors.charcoal, // P-11: Neutral color
    fontVariant: ['tabular-nums'],
  },
  baselineValue: {
    fontSize: 22,
    fontWeight: '600',
    color: tokens.colors.steel,
    fontVariant: ['tabular-nums'],
  },
  deltaValue: {
    fontSize: 28,
    fontWeight: '700',
    color: tokens.colors.charcoal, // P-11: Same neutral color for all
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    backgroundColor: tokens.colors.mist,
    marginHorizontal: 48,
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  // P-10: Subdued button, not primary color
  dismissButton: {
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.mist,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  dismissButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: tokens.colors.charcoal,
  },
});

export default ProofScreen;
