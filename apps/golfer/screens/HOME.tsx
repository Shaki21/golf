/**
 * HOME Screen
 *
 * Responsibility: Orient the user to the next action without evaluating progress.
 * Contract: See docs/IMPLEMENTATION_CONTRACT.md (H-01 to H-63, H-E1 to H-E6)
 *
 * MUST: Show next action, time context, effort accumulation
 * MUST NOT: Show progress, goals, encouragement, gamification
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { tokens } from '@iup/design-system';

// Types
interface NextSession {
  id: string;
  trainingArea: string;
  name: string;
  time: string; // "14:00"
  location: string;
  durationMinutes: number;
  date: Date;
  inProgress?: boolean;
  currentBlock?: number;
  totalBlocks?: number;
}

interface TimeContext {
  daysUntilBenchmark?: number;
  daysUntilEvent?: number;
  eventName?: string;
}

interface EffortData {
  totalHours: number;
  totalSessions: number;
  byArea: { area: string; hours: number }[];
  isFirstBenchmark: boolean;
}

interface HomeScreenProps {
  userName: string;
  nextSession?: NextSession;
  timeContext: TimeContext;
  effort: EffortData;
  onStartSession: (sessionId: string) => void;
  onContinueSession: (sessionId: string) => void;
}

export function HomeScreen({
  userName,
  nextSession,
  timeContext,
  effort,
  onStartSession,
  onContinueSession,
}: HomeScreenProps) {
  // Format date (H-02)
  const formatDate = (): string => {
    const days = ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'];
    const months = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];
    const now = new Date();
    return `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]}`;
  };

  // Check if session is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Format future date
  const formatFutureDate = (date: Date): string => {
    const days = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
    const months = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];
    return `${days[date.getDay()].charAt(0).toUpperCase() + days[date.getDay()].slice(1)} ${date.getDate()} ${months[date.getMonth()]}`;
  };

  // Determine next action state
  const getNextActionState = () => {
    if (!nextSession) {
      return 'none'; // H-E1
    }
    if (nextSession.inProgress) {
      return 'in-progress'; // H-14, H-E6
    }
    if (isToday(nextSession.date)) {
      return 'today'; // H-04
    }
    return 'future'; // H-12, H-13
  };

  const actionState = getNextActionState();

  return (
    <View style={styles.container}>
      {/* Region 1: Identity Bar (H-01, H-02) */}
      <View style={styles.identityBar}>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.currentDate}>{formatDate()}</Text>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* Region 2: Next Action (H-03 to H-14) */}
        <View style={styles.nextActionCard}>
          {actionState === 'none' ? (
            // H-E1: No sessions scheduled
            <>
              <Text style={styles.sectionLabel}>I DAG</Text>
              <Text style={styles.noSessionText}>Ingen økt planlagt</Text>
              <Text style={styles.noSessionSubtext}>Ingen økter planlagt</Text>
            </>
          ) : actionState === 'in-progress' ? (
            // H-14: Session in progress
            <>
              <Text style={styles.sectionLabel}>PÅGÅR</Text>
              <Text style={styles.trainingArea}>{nextSession!.trainingArea}</Text>
              <Text style={styles.sessionName}>{nextSession!.name}</Text>
              <Text style={styles.sessionDetails}>
                Startet {nextSession!.time} · Blokk {nextSession!.currentBlock} av {nextSession!.totalBlocks}
              </Text>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onContinueSession(nextSession!.id)}
              >
                <Text style={styles.actionButtonText}>Fortsett</Text>
              </TouchableOpacity>
            </>
          ) : actionState === 'today' ? (
            // H-03, H-04: Session today
            <>
              <Text style={styles.sectionLabel}>NESTE</Text>
              <Text style={styles.trainingArea}>{nextSession!.trainingArea}</Text>
              <Text style={styles.sessionName}>{nextSession!.name}</Text>
              <Text style={styles.sessionDetails}>
                {nextSession!.time} · {nextSession!.location} · {nextSession!.durationMinutes} min
              </Text>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onStartSession(nextSession!.id)}
              >
                <Text style={styles.actionButtonText}>Start</Text>
              </TouchableOpacity>
            </>
          ) : (
            // H-12, H-13: Future session
            <>
              <Text style={styles.sectionLabel}>I DAG</Text>
              <Text style={styles.noSessionText}>Ingen økt planlagt</Text>
              <Text style={styles.futureSessionLabel}>Neste økt: {formatFutureDate(nextSession!.date)}</Text>
              <Text style={styles.futureSessionDetails}>
                {nextSession!.trainingArea} · {nextSession!.time} · {nextSession!.durationMinutes} min
              </Text>
            </>
          )}
        </View>

        {/* Region 3: Time Context (H-05, H-06, H-E2) */}
        <View style={styles.countdownRow}>
          {timeContext.daysUntilBenchmark !== undefined && (
            <View style={styles.countdownCard}>
              <Text style={styles.countdownNumber}>{timeContext.daysUntilBenchmark}</Text>
              <Text style={styles.countdownLabel}>dager til test</Text>
            </View>
          )}
          {timeContext.daysUntilEvent !== undefined && (
            <View style={styles.countdownCard}>
              <Text style={styles.countdownNumber}>{timeContext.daysUntilEvent}</Text>
              <Text style={styles.countdownLabel}>dager til {timeContext.eventName}</Text>
            </View>
          )}
        </View>

        {/* Region 4: Effort Accumulation (H-07 to H-11, H-E4, H-E5) */}
        <View style={styles.effortCard}>
          {/* H-11, H-E4 */}
          <Text style={styles.sectionLabel}>
            {effort.isFirstBenchmark ? 'SIDEN START' : 'SIDEN SISTE TEST'}
          </Text>
          {/* H-07, H-08, H-E5 */}
          <Text style={styles.effortTotal}>
            {effort.totalHours} timer · {effort.totalSessions} økter
          </Text>
          {/* H-09 */}
          <View style={styles.areaBreakdown}>
            {effort.byArea.map(item => (
              <View key={item.area} style={styles.areaRow}>
                <Text style={styles.areaName}>{item.area}</Text>
                <Text style={styles.areaHours}>{item.hours}t</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.snow,
  },

  // Identity Bar
  identityBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: tokens.colors.white,
  },
  userName: {
    fontSize: 17,
    fontWeight: '600',
    color: tokens.colors.charcoal,
  },
  currentDate: {
    fontSize: 15,
    color: tokens.colors.steel,
  },

  // Scroll area
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },

  // Next Action Card
  nextActionCard: {
    backgroundColor: tokens.colors.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: tokens.colors.steel,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  trainingArea: {
    fontSize: 22,
    fontWeight: '700',
    color: tokens.colors.charcoal,
  },
  sessionName: {
    fontSize: 17,
    color: tokens.colors.charcoal,
    marginTop: 4,
  },
  sessionDetails: {
    fontSize: 15,
    color: tokens.colors.steel,
    marginTop: 8,
  },
  noSessionText: {
    fontSize: 22,
    fontWeight: '700',
    color: tokens.colors.charcoal,
  },
  noSessionSubtext: {
    fontSize: 15,
    color: tokens.colors.steel,
    marginTop: 8,
  },
  futureSessionLabel: {
    fontSize: 15,
    color: tokens.colors.charcoal,
    marginTop: 16,
  },
  futureSessionDetails: {
    fontSize: 15,
    color: tokens.colors.steel,
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.mist,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: tokens.colors.charcoal,
  },

  // Countdown Row
  countdownRow: {
    flexDirection: 'row',
    gap: 12,
  },
  countdownCard: {
    flex: 1,
    backgroundColor: tokens.colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  countdownNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: tokens.colors.charcoal,
  },
  countdownLabel: {
    fontSize: 12,
    color: tokens.colors.steel,
    marginTop: 4,
    textAlign: 'center',
  },

  // Effort Card
  effortCard: {
    backgroundColor: tokens.colors.white,
    borderRadius: 12,
    padding: 16,
  },
  effortTotal: {
    fontSize: 17,
    fontWeight: '600',
    color: tokens.colors.charcoal,
    marginBottom: 16,
  },
  areaBreakdown: {
    gap: 8,
  },
  areaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  areaName: {
    fontSize: 17,
    color: tokens.colors.charcoal,
  },
  areaHours: {
    fontSize: 17,
    color: tokens.colors.steel,
  },
});

export default HomeScreen;
