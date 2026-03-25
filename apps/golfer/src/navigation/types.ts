/**
 * Navigation Types for AK Golf Mobile App
 */

// Session summary for reflection screen
export interface SessionSummary {
  trainingArea: string;
  blockCount: number;
  durationMinutes: number;
}

export type RootStackParamList = {
  // Auth screens
  Login: undefined;

  // Main screens
  Home: undefined;
  Session: {
    sessionId: string;
    resumeFromBlock?: number;
  };
  Reflection: {
    sessionId: string;
    sessionSummary: SessionSummary;
  };
  Baseline: {
    testType?: string;
  };
  Trajectory: undefined;
  Proof: {
    testId?: string;
    sessionId?: string;
    breakingPointId?: string;
  };
};

// Navigation prop types for each screen
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
