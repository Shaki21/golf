/**
 * REFLECTION Screen
 *
 * Responsibility: Capture post-session facts and subjective input without evaluation.
 * Contract: See docs/IMPLEMENTATION_CONTRACT.md (R-01 to R-59, R-E1 to R-E5)
 *
 * MUST: Provide optional inputs for body/mind state, sleep, notes
 * MUST NOT: Show evaluation, progress, gamification, or comparison
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { tokens } from '@iup/design-system';

// Types
interface SessionSummary {
  trainingArea: string;
  blockCount: number;
  durationMinutes: number;
}

interface ReflectionData {
  bodyState?: number; // 1-5
  mindState?: number; // 1-5
  sleepHours?: number; // 5, 6, 7, 8, 9
  sleepQuality?: number; // 1-3
  notes?: string;
  nextFocus?: string;
}

interface ReflectionScreenProps {
  session: SessionSummary;
  onSave: (data: ReflectionData) => void;
  onSkip: () => void;
}

// Scale options (R-02, R-03, R-12)
const BODY_SCALE = [
  { value: 1, emoji: '😫' },
  { value: 2, emoji: '😕' },
  { value: 3, emoji: '😐' },
  { value: 4, emoji: '🙂' },
  { value: 5, emoji: '💪' },
];

const MIND_SCALE = [
  { value: 1, emoji: '😤' },
  { value: 2, emoji: '😔' },
  { value: 3, emoji: '😐' },
  { value: 4, emoji: '😊' },
  { value: 5, emoji: '😌' },
];

const SLEEP_HOURS = [5, 6, 7, 8, 9];

const SLEEP_QUALITY = [
  { value: 1, label: 'Dårlig', emoji: '😴' },
  { value: 2, label: 'Ok', emoji: '😐' },
  { value: 3, label: 'God', emoji: '😊' },
];

export function ReflectionScreen({ session, onSave, onSkip }: ReflectionScreenProps) {
  // State - all inputs start unselected (R-58)
  const [bodyState, setBodyState] = useState<number | undefined>(undefined);
  const [mindState, setMindState] = useState<number | undefined>(undefined);
  const [sleepHours, setSleepHours] = useState<number | undefined>(undefined);
  const [sleepQuality, setSleepQuality] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [nextFocus, setNextFocus] = useState('');

  // Format duration
  const formatDuration = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}t ${m}min`;
    return `${m}min`;
  };

  // Handlers
  const handleSave = () => {
    // R-E1: Allow empty submission
    const data: ReflectionData = {};
    if (bodyState !== undefined) data.bodyState = bodyState;
    if (mindState !== undefined) data.mindState = mindState;
    if (sleepHours !== undefined) data.sleepHours = sleepHours;
    if (sleepQuality !== undefined) data.sleepQuality = sleepQuality;
    if (notes.trim()) data.notes = notes.trim();
    if (nextFocus.trim()) data.nextFocus = nextFocus.trim();
    onSave(data);
  };

  const handleSkip = () => {
    // R-11: Show confirmation before discarding
    Alert.alert(
      'Hopp over refleksjon?',
      'Ingen data vil bli lagret.',
      [
        { text: 'Nei, gå tilbake', style: 'cancel' },
        { text: 'Ja, hopp over', onPress: onSkip },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Region 1: Header (R-01) */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Refleksjon</Text>
        <Text style={styles.headerSummary}>
          {session.trainingArea} · {session.blockCount} blokker · {formatDuration(session.durationMinutes)}
        </Text>
      </View>

      {/* Region 2: Input Sections */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* Section A: Body State (R-02, R-12, R-13) */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Hvordan føles kroppen?</Text>
          <View style={styles.scaleRow}>
            {BODY_SCALE.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.scaleOption,
                  bodyState === option.value && styles.scaleOptionSelected,
                ]}
                onPress={() => setBodyState(
                  bodyState === option.value ? undefined : option.value
                )}
              >
                <Text style={styles.scaleEmoji}>{option.emoji}</Text>
                {bodyState === option.value && <View style={styles.selectionDot} />}
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.anchorRow}>
            <Text style={styles.anchorText}>Sliten</Text>
            <Text style={styles.anchorText}>Nøytral</Text>
            <Text style={styles.anchorText}>Energisk</Text>
          </View>
        </View>

        {/* Section B: Mind State (R-03, R-12, R-13) */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Hvordan føles hodet?</Text>
          <View style={styles.scaleRow}>
            {MIND_SCALE.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.scaleOption,
                  mindState === option.value && styles.scaleOptionSelected,
                ]}
                onPress={() => setMindState(
                  mindState === option.value ? undefined : option.value
                )}
              >
                <Text style={styles.scaleEmoji}>{option.emoji}</Text>
                {mindState === option.value && <View style={styles.selectionDot} />}
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.anchorRow}>
            <Text style={styles.anchorText}>Frustrert</Text>
            <Text style={styles.anchorText}>Nøytral</Text>
            <Text style={styles.anchorText}>Fokusert</Text>
          </View>
        </View>

        {/* Section C: Sleep (R-04, R-05) */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Søvn i natt</Text>
          <Text style={styles.subLabel}>Timer</Text>
          <View style={styles.segmentRow}>
            {SLEEP_HOURS.map(hours => (
              <TouchableOpacity
                key={hours}
                style={[
                  styles.segmentOption,
                  sleepHours === hours && styles.segmentOptionSelected,
                ]}
                onPress={() => setSleepHours(
                  sleepHours === hours ? undefined : hours
                )}
              >
                <Text
                  style={[
                    styles.segmentText,
                    sleepHours === hours && styles.segmentTextSelected,
                  ]}
                >
                  {hours === 9 ? '9+' : hours}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.subLabel, { marginTop: 16 }]}>Kvalitet</Text>
          <View style={styles.qualityRow}>
            {SLEEP_QUALITY.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.qualityOption,
                  sleepQuality === option.value && styles.qualityOptionSelected,
                ]}
                onPress={() => setSleepQuality(
                  sleepQuality === option.value ? undefined : option.value
                )}
              >
                <Text style={styles.qualityEmoji}>{option.emoji}</Text>
                <Text
                  style={[
                    styles.qualityLabel,
                    sleepQuality === option.value && styles.qualityLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section D: Notes (R-06) */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notater fra økten</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Hva la du merke til?"
            placeholderTextColor={tokens.colors.steel}
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
            textAlignVertical="top"
          />
        </View>

        {/* Section E: Next Focus (R-07) */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Til neste økt</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Hva vil du fokusere på neste gang?"
            placeholderTextColor={tokens.colors.steel}
            value={nextFocus}
            onChangeText={setNextFocus}
          />
        </View>
      </ScrollView>

      {/* Region 3: Submit Bar (R-09, R-10) */}
      <View style={styles.submitBar}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Lagre</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipLink}>Hopp over</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.snow,
  },

  // Header
  header: {
    backgroundColor: tokens.colors.white,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.mist,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: tokens.colors.charcoal,
  },
  headerSummary: {
    fontSize: 15,
    color: tokens.colors.steel,
    marginTop: 4,
  },

  // Scroll area
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },

  // Section card
  section: {
    backgroundColor: tokens.colors.white,
    borderRadius: 12,
    padding: 16,
  },
  sectionLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: tokens.colors.charcoal,
    marginBottom: 16,
  },
  subLabel: {
    fontSize: 15,
    color: tokens.colors.steel,
    marginBottom: 8,
  },

  // Emoji scale
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scaleOption: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scaleOptionSelected: {
    // No background change - just the dot
  },
  scaleEmoji: {
    fontSize: 32,
  },
  selectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.colors.charcoal,
    marginTop: 4,
  },
  anchorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  anchorText: {
    fontSize: 12,
    color: tokens.colors.steel,
  },

  // Segment control
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentOption: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: tokens.colors.mist,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentOptionSelected: {
    backgroundColor: tokens.colors.charcoal,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '600',
    color: tokens.colors.charcoal,
  },
  segmentTextSelected: {
    color: tokens.colors.white,
  },

  // Quality row
  qualityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  qualityOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  qualityOptionSelected: {
    // Visual feedback via label color
  },
  qualityEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  qualityLabel: {
    fontSize: 13,
    color: tokens.colors.steel,
  },
  qualityLabelSelected: {
    color: tokens.colors.charcoal,
    fontWeight: '600',
  },

  // Text inputs
  textArea: {
    borderWidth: 1,
    borderColor: tokens.colors.mist,
    borderRadius: 8,
    padding: 16,
    fontSize: 17,
    color: tokens.colors.charcoal,
    minHeight: 100,
  },
  textInput: {
    borderWidth: 1,
    borderColor: tokens.colors.mist,
    borderRadius: 8,
    padding: 16,
    fontSize: 17,
    color: tokens.colors.charcoal,
  },

  // Submit bar
  submitBar: {
    backgroundColor: tokens.colors.white,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.mist,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.mist,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: tokens.colors.charcoal,
  },
  skipLink: {
    fontSize: 17,
    color: tokens.colors.steel,
    marginTop: 16,
  },
});

export default ReflectionScreen;
