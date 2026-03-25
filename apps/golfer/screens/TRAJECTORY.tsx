/**
 * TRAJECTORY Screen
 *
 * Responsibility: Provide historical view of test results without interpretation.
 * Contract: See docs/IMPLEMENTATION_CONTRACT.md (T-01 to T-62, T-E1 to T-E5)
 *
 * MUST: Show chronological test history, grouped by date, with filtering
 * MUST NOT: Show trends, charts, arrows, predictions, averages, or color-coded results
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { tokens } from '@iup/design-system';

// Types
interface TestResult {
  id: string;
  testName: string;
  category: string;
  value: number;
  unit: string;
  baseline?: number; // undefined if not set (T-E4)
  benchmarkDate: Date;
  isFirstTest?: boolean; // T-E3
}

interface TrajectoryScreenProps {
  tests: TestResult[];
  onSelectTest: (testId: string) => void;
  onBack: () => void;
}

// Category definitions
const CATEGORIES = [
  { id: 'alle', label: 'Alle' },
  { id: 'putting', label: 'Putting' },
  { id: 'langspill', label: 'Langspill' },
  { id: 'kortspill', label: 'Kortspill' },
  { id: 'fysisk', label: 'Fysisk' },
  { id: 'mental', label: 'Mental' },
];

export function TrajectoryScreen({
  tests,
  onSelectTest,
  onBack,
}: TrajectoryScreenProps) {
  // T-04: "Alle" selected by default
  const [selectedCategory, setSelectedCategory] = useState('alle');

  // Filter tests by category
  const filteredTests = useMemo(() => {
    if (selectedCategory === 'alle') return tests;
    return tests.filter(
      t => t.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [tests, selectedCategory]);

  // T-11: Order chronologically, most recent first
  const sortedTests = useMemo(() => {
    return [...filteredTests].sort(
      (a, b) => b.benchmarkDate.getTime() - a.benchmarkDate.getTime()
    );
  }, [filteredTests]);

  // T-05: Group by benchmark date
  const groupedTests = useMemo(() => {
    const groups: { date: Date; tests: TestResult[] }[] = [];
    let currentDate: string | null = null;

    sortedTests.forEach(test => {
      const dateKey = test.benchmarkDate.toISOString().split('T')[0];
      if (dateKey !== currentDate) {
        groups.push({ date: test.benchmarkDate, tests: [test] });
        currentDate = dateKey;
      } else {
        groups[groups.length - 1].tests.push(test);
      }
    });

    return groups;
  }, [sortedTests]);

  // T-06: Format date as "18. DESEMBER 2025" (uppercase)
  const formatDateHeader = (date: Date): string => {
    const months = [
      'JANUAR', 'FEBRUAR', 'MARS', 'APRIL', 'MAI', 'JUNI',
      'JULI', 'AUGUST', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER',
    ];
    return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Format value with unit
  const formatValue = (value: number, unit: string): string => {
    return `${value.toFixed(1)}${unit}`;
  };

  // T-10: Calculate and format delta
  const formatDelta = (test: TestResult): string => {
    // T-E4: Baseline not set
    if (test.baseline === undefined) {
      return '(—)';
    }
    const delta = test.value - test.baseline;
    if (delta === 0) {
      return '(0)';
    }
    const sign = delta > 0 ? '+' : '−'; // Using actual minus sign
    return `(${sign}${Math.abs(delta).toFixed(1)})`;
  };

  // T-09: Format baseline reference
  const formatBaseline = (test: TestResult): string => {
    // T-E4
    if (test.baseline === undefined) {
      return 'Baseline: Ikke satt';
    }
    return `Baseline: ${formatValue(test.baseline, test.unit)}`;
  };

  // T-02: Test count
  const testCount = tests.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Region 1: Header (T-01, T-02) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Historikk</Text>
          <Text style={styles.headerCount}>{testCount} tester registrert</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Region 2: Category Filter (T-03, T-04) */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {CATEGORIES.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.filterChip,
                selectedCategory === category.id && styles.filterChipSelected,
              ]}
              onPress={() => setSelectedCategory(category.id)} // T-13
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === category.id && styles.filterChipTextSelected,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Region 3: History (T-05 to T-12) */}
      <ScrollView
        style={styles.historyScroll}
        contentContainerStyle={styles.historyContent}
      >
        {/* T-E1: No tests registered */}
        {tests.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Ingen tester registrert</Text>
          </View>
        )}

        {/* T-E2: Category filter has no results */}
        {tests.length > 0 && filteredTests.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Ingen tester i denne kategorien
            </Text>
          </View>
        )}

        {/* Test cards grouped by date */}
        {groupedTests.map((group, groupIndex) => (
          <View key={groupIndex}>
            {/* Date header (T-06) */}
            <Text style={styles.dateHeader}>{formatDateHeader(group.date)}</Text>

            {/* Test cards */}
            {group.tests.map(test => (
              <TouchableOpacity
                key={test.id}
                style={styles.testCard}
                onPress={() => onSelectTest(test.id)} // T-12
              >
                {/* T-07: Test name */}
                <Text style={styles.testName}>{test.testName}</Text>

                {/* T-08: Test value */}
                <Text style={styles.testValue}>
                  {formatValue(test.value, test.unit)}
                </Text>

                {/* T-09, T-10: Baseline and delta */}
                <Text style={styles.baselineText}>
                  {formatBaseline(test)}  {formatDelta(test)}
                </Text>

                {/* T-E3: First test note */}
                {test.isFirstTest && (
                  <Text style={styles.firstTestNote}>Første registrerte test</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.snow,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: tokens.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.mist,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backButtonText: {
    fontSize: 24,
    color: tokens.colors.charcoal,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: tokens.colors.charcoal,
  },
  headerCount: {
    fontSize: 15,
    color: tokens.colors.steel,
    marginTop: 2,
  },
  headerSpacer: {
    width: 44,
  },

  // Filter
  filterContainer: {
    backgroundColor: tokens.colors.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.mist,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: tokens.colors.mist,
    borderRadius: 18,
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: tokens.colors.charcoal,
  },
  filterChipText: {
    fontSize: 15,
    fontWeight: '500',
    color: tokens.colors.charcoal,
  },
  filterChipTextSelected: {
    color: tokens.colors.white,
  },

  // History
  historyScroll: {
    flex: 1,
  },
  historyContent: {
    padding: 16,
    paddingBottom: 32,
  },

  // Date headers
  dateHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: tokens.colors.steel,
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
  },

  // Test cards
  testCard: {
    backgroundColor: tokens.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  testName: {
    fontSize: 17,
    fontWeight: '600',
    color: tokens.colors.charcoal,
    marginBottom: 8,
  },
  testValue: {
    fontSize: 22,
    fontWeight: '700',
    color: tokens.colors.charcoal, // T-60, T-61: Neutral color
    fontVariant: ['tabular-nums'],
    marginBottom: 4,
  },
  baselineText: {
    fontSize: 15,
    color: tokens.colors.steel, // T-60, T-61: Same neutral color for all deltas
    fontVariant: ['tabular-nums'],
  },
  firstTestNote: {
    fontSize: 13,
    color: tokens.colors.steel,
    marginTop: 8,
    fontStyle: 'italic',
  },

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateText: {
    fontSize: 17,
    color: tokens.colors.steel,
    textAlign: 'center',
  },
});

export default TrajectoryScreen;
