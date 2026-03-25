/**
 * BASELINE Screen
 *
 * Responsibility: Establish a neutral reference point for future measurement.
 * Contract: See docs/IMPLEMENTATION_CONTRACT.md (B-01 to B-60, B-E1 to B-E6)
 *
 * MUST: Allow user to select baseline, confirm permanence
 * MUST NOT: Show improvement language, recommendations, predictions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { tokens } from '@iup/design-system';

// Types
interface BaselineOption {
  type: 'season' | 'last8';
  value: number;
  roundCount?: number;
}

interface BaselineScreenProps {
  seasonAverage?: BaselineOption;
  last8Average?: BaselineOption;
  onConfirm: (baseline: BaselineOption) => void;
}

type Step = 1 | 2 | 3;

export function BaselineScreen({
  seasonAverage,
  last8Average,
  onConfirm,
}: BaselineScreenProps) {
  const [step, setStep] = useState<Step>(1);
  const [selectedOption, setSelectedOption] = useState<BaselineOption | undefined>(undefined);

  // B-E2: If only season average available
  const availableOptions = [seasonAverage, last8Average].filter(Boolean) as BaselineOption[];

  // Step indicator (B-01)
  const StepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map(s => (
        <View
          key={s}
          style={[
            styles.stepDot,
            s <= step ? styles.stepDotActive : styles.stepDotInactive,
          ]}
        />
      ))}
    </View>
  );

  // Step 1: Context (B-02, B-03)
  if (step === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <StepIndicator />
        </View>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>◎</Text>
          </View>
          <Text style={styles.title}>Ditt utgangspunkt</Text>
          <Text style={styles.explanation}>
            En baseline er referansepunktet vi måler fra. Den sier ikke noe om hvor du skal — bare hvor du starter.
          </Text>
          <Text style={styles.explanation}>
            Alt vi måler fremover blir sammenlignet med dette punktet.
          </Text>
        </View>
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setStep(2)}
          >
            <Text style={styles.primaryButtonText}>Fortsett</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Step 2: Selection (B-04 to B-06)
  if (step === 2) {
    // B-E1: No historical data
    if (availableOptions.length === 0) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setStep(1)} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.stepText}>Steg 2/3</Text>
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>Velg utgangspunkt</Text>
            <Text style={styles.explanation}>Ingen historiske data</Text>
            {/* Manual entry would go here in a full implementation */}
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep(1)} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.stepText}>Steg 2/3</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Velg utgangspunkt</Text>
          <Text style={styles.subtitle}>
            Velg hvilken verdi som skal være ditt referansepunkt.
          </Text>

          {/* Option cards */}
          <View style={styles.optionsContainer}>
            {seasonAverage && (
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  selectedOption?.type === 'season' && styles.optionCardSelected,
                ]}
                onPress={() => setSelectedOption(seasonAverage)}
              >
                <Text style={styles.optionTitle}>Sesonggjennomsnitt</Text>
                <Text style={styles.optionValue}>{seasonAverage.value.toFixed(1)}</Text>
                <Text style={styles.optionDescription}>
                  Basert på {seasonAverage.roundCount} runder fra hele sesongen
                </Text>
              </TouchableOpacity>
            )}

            {last8Average && (
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  selectedOption?.type === 'last8' && styles.optionCardSelected,
                ]}
                onPress={() => setSelectedOption(last8Average)}
              >
                <Text style={styles.optionTitle}>Siste 8 runder</Text>
                <Text style={styles.optionValue}>{last8Average.value.toFixed(1)}</Text>
                <Text style={styles.optionDescription}>
                  Basert på dine 8 siste registrerte runder
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              !selectedOption && styles.primaryButtonDisabled,
            ]}
            onPress={() => selectedOption && setStep(3)}
            disabled={!selectedOption} // B-06
          >
            <Text style={styles.primaryButtonText}>Velg og fortsett</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Step 3: Confirmation (B-07 to B-12)
  if (step === 3 && selectedOption) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep(2)} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.stepText}>Steg 3/3</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Bekreft utgangspunkt</Text>

          {/* Confirmation card (B-07) */}
          <View style={styles.confirmationCard}>
            <Text style={styles.confirmationLabel}>Din baseline</Text>
            <Text style={styles.confirmationValue}>{selectedOption.value.toFixed(1)}</Text>
            <Text style={styles.confirmationSource}>
              {selectedOption.type === 'season' ? 'Sesonggjennomsnitt' : 'Siste 8 runder'}
            </Text>
          </View>

          {/* Implications (B-08) */}
          <View style={styles.implications}>
            <Text style={styles.implicationsTitle}>Dette betyr:</Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Målinger vises som differanse fra {selectedOption.value.toFixed(1)}
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Referansepunktet er fast etter bekreftelse
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              {/* B-09 */}
              <Text style={styles.bulletText}>
                Verdien kan ikke endres senere
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => onConfirm(selectedOption)} // B-12: Lock after confirm
          >
            <Text style={styles.primaryButtonText}>Bekreft</Text>
          </TouchableOpacity>
          {/* B-11 */}
          <TouchableOpacity onPress={() => setStep(2)}>
            <Text style={styles.secondaryLink}>Gå tilbake</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.white,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    position: 'absolute',
    left: 24,
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: tokens.colors.charcoal,
  },
  stepText: {
    fontSize: 15,
    color: tokens.colors.steel,
  },

  // Step indicator
  stepIndicator: {
    flexDirection: 'row',
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepDotActive: {
    backgroundColor: tokens.colors.charcoal,
  },
  stepDotInactive: {
    backgroundColor: tokens.colors.mist,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 48,
    color: tokens.colors.charcoal,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: tokens.colors.charcoal,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 17,
    color: tokens.colors.charcoal,
    textAlign: 'center',
    marginBottom: 24,
  },
  explanation: {
    fontSize: 17,
    color: tokens.colors.charcoal,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },

  // Option cards
  optionsContainer: {
    gap: 16,
    marginTop: 16,
  },
  optionCard: {
    backgroundColor: tokens.colors.white,
    borderWidth: 1,
    borderColor: tokens.colors.mist,
    borderRadius: 16,
    padding: 20,
  },
  optionCardSelected: {
    borderWidth: 2,
    borderColor: tokens.colors.charcoal,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: tokens.colors.charcoal,
  },
  optionValue: {
    fontSize: 34,
    fontWeight: '700',
    color: tokens.colors.charcoal,
    marginVertical: 8,
  },
  optionDescription: {
    fontSize: 15,
    color: tokens.colors.steel,
  },

  // Confirmation
  confirmationCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  confirmationLabel: {
    fontSize: 15,
    color: tokens.colors.steel,
  },
  confirmationValue: {
    fontSize: 34,
    fontWeight: '700',
    color: tokens.colors.charcoal,
    marginVertical: 8,
  },
  confirmationSource: {
    fontSize: 17,
    color: tokens.colors.charcoal,
  },

  // Implications
  implications: {
    marginTop: 8,
  },
  implicationsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: tokens.colors.charcoal,
    marginBottom: 16,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bullet: {
    fontSize: 17,
    color: tokens.colors.charcoal,
    marginRight: 8,
  },
  bulletText: {
    fontSize: 17,
    color: tokens.colors.charcoal,
    flex: 1,
    lineHeight: 24,
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.mist,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: tokens.colors.mist,
    borderColor: tokens.colors.mist,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: tokens.colors.charcoal,
  },
  secondaryLink: {
    fontSize: 17,
    color: tokens.colors.steel,
    marginTop: 16,
  },
});

export default BaselineScreen;
