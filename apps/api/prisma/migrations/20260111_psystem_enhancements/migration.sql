-- P-System Enhancements for Frontend Integration
-- Adds P-level tracking, repetitions, priority ordering, drills, responsible persons, and progress media

-- ============================================================================
-- 1. Add new fields to technique_tasks
-- ============================================================================

-- P-level field for P1.0 through P10.0 tracking
ALTER TABLE technique_tasks
ADD COLUMN p_level VARCHAR(5); -- e.g., 'P1.0', 'P2.0', ..., 'P10.0'

-- Repetitions tracking
ALTER TABLE technique_tasks
ADD COLUMN repetitions INTEGER DEFAULT 0 NOT NULL;

-- Priority ordering for drag-and-drop (lower number = higher priority)
ALTER TABLE technique_tasks
ADD COLUMN priority_order INTEGER DEFAULT 0 NOT NULL;

-- Image URLs for progress tracking (JSON array)
ALTER TABLE technique_tasks
ADD COLUMN image_urls JSONB DEFAULT '[]'::jsonb;

-- Add index for p_level queries
CREATE INDEX idx_technique_tasks_p_level ON technique_tasks(player_id, p_level) WHERE p_level IS NOT NULL;

-- Add index for priority ordering
CREATE INDEX idx_technique_tasks_priority ON technique_tasks(player_id, priority_order);

-- ============================================================================
-- 2. Create technique_task_drills junction table
-- ============================================================================

CREATE TABLE technique_task_drills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES technique_tasks(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0 NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(task_id, exercise_id)
);

CREATE INDEX idx_technique_task_drills_task ON technique_task_drills(task_id);
CREATE INDEX idx_technique_task_drills_exercise ON technique_task_drills(exercise_id);

COMMENT ON TABLE technique_task_drills IS 'Links technique tasks to specific drills/exercises';
COMMENT ON COLUMN technique_task_drills.order_index IS 'Order of drill within the task';

-- ============================================================================
-- 3. Create technique_task_responsible junction table
-- ============================================================================

CREATE TABLE technique_task_responsible (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES technique_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50), -- e.g., 'primary_coach', 'swing_coach', 'putting_coach', 'player'
  assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(task_id, user_id)
);

CREATE INDEX idx_technique_task_responsible_task ON technique_task_responsible(task_id);
CREATE INDEX idx_technique_task_responsible_user ON technique_task_responsible(user_id);

COMMENT ON TABLE technique_task_responsible IS 'Assigns responsible persons (coaches/players) to technique tasks';
COMMENT ON COLUMN technique_task_responsible.role IS 'Role of the assigned person for this task';

-- ============================================================================
-- 4. Add message conversation types for filtering
-- ============================================================================

-- Add index for conversation type filtering (for frontend message filters)
CREATE INDEX idx_conversations_type_updated ON conversations(type, updated_at DESC);

-- ============================================================================
-- 5. Migrate existing data
-- ============================================================================

-- Set default priority_order based on created_at (earlier = higher priority)
UPDATE technique_tasks
SET priority_order = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY created_at ASC) as row_num
  FROM technique_tasks
) AS subquery
WHERE technique_tasks.id = subquery.id;

-- ============================================================================
-- 6. Add constraints and validations
-- ============================================================================

-- Ensure p_level follows correct format (P + number + .0)
ALTER TABLE technique_tasks
ADD CONSTRAINT check_p_level_format
CHECK (p_level IS NULL OR p_level ~ '^P([1-9]|10)\.0$');

COMMENT ON CONSTRAINT check_p_level_format ON technique_tasks IS 'Ensures p_level is in format P1.0 through P10.0';

-- Ensure repetitions is non-negative
ALTER TABLE technique_tasks
ADD CONSTRAINT check_repetitions_non_negative
CHECK (repetitions >= 0);

-- Ensure priority_order is non-negative
ALTER TABLE technique_tasks
ADD CONSTRAINT check_priority_order_non_negative
CHECK (priority_order >= 0);
