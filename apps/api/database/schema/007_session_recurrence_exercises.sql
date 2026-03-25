/**
 * Migration: 007_session_recurrence_exercises
 *
 * PHASE 5: Økt-planlegging UX
 *
 * Creates:
 * - Recurrence fields for repeating sessions
 * - Session exercises table for detailed exercise tracking
 * - Duration and repetition tracking
 *
 * Part of Phase 5: Session Planning UX Improvements
 */

-- ============================================================================
-- SESSION RECURRENCE FIELDS
-- ============================================================================

-- Add recurrence fields to training_sessions
ALTER TABLE training_sessions
  ADD COLUMN IF NOT EXISTS recurrence_rule VARCHAR(255),
  ADD COLUMN IF NOT EXISTS recurrence_end_date DATE,
  ADD COLUMN IF NOT EXISTS recurrence_count INTEGER,
  ADD COLUMN IF NOT EXISTS parent_session_id UUID REFERENCES training_sessions(id) ON DELETE CASCADE;

-- Index for parent session lookups
CREATE INDEX IF NOT EXISTS idx_training_sessions_parent
  ON training_sessions(parent_session_id)
  WHERE parent_session_id IS NOT NULL;

-- ============================================================================
-- SESSION EXERCISES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS session_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  estimated_duration INTEGER,
  estimated_repetitions INTEGER,
  order_index INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for session_exercises
CREATE INDEX IF NOT EXISTS idx_session_exercises_session_id
  ON session_exercises(session_id);
CREATE INDEX IF NOT EXISTS idx_session_exercises_exercise_id
  ON session_exercises(exercise_id)
  WHERE exercise_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_session_exercises_order
  ON session_exercises(session_id, order_index);

-- ============================================================================
-- UPDATE TRIGGERS
-- ============================================================================

-- Trigger for session_exercises updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_session_exercises_updated_at
  BEFORE UPDATE ON session_exercises
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN training_sessions.recurrence_rule IS 'RRULE format for repeating sessions (e.g., FREQ=WEEKLY;COUNT=5)';
COMMENT ON COLUMN training_sessions.recurrence_end_date IS 'End date for recurring sessions';
COMMENT ON COLUMN training_sessions.recurrence_count IS 'Number of occurrences for recurring sessions';
COMMENT ON COLUMN training_sessions.parent_session_id IS 'Reference to parent session for recurring instances';

COMMENT ON TABLE session_exercises IS 'Exercises/drills attached to a training session with duration and repetition estimates';
COMMENT ON COLUMN session_exercises.order_index IS 'Display order of exercises within the session';

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================

-- DROP TRIGGER IF EXISTS update_session_exercises_updated_at ON session_exercises;
-- DROP TABLE IF EXISTS session_exercises;
-- ALTER TABLE training_sessions DROP COLUMN IF EXISTS recurrence_rule;
-- ALTER TABLE training_sessions DROP COLUMN IF EXISTS recurrence_end_date;
-- ALTER TABLE training_sessions DROP COLUMN IF EXISTS recurrence_count;
-- ALTER TABLE training_sessions DROP COLUMN IF EXISTS parent_session_id;
