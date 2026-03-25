-- ============================================================================
-- Demo Players & Annual Plan Migration
-- Adds fields for demo player onboarding and annual plan periodization
-- ============================================================================

-- Enable btree_gist extension for UUID overlap constraints
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Add new columns to players table for demo data
ALTER TABLE players ADD COLUMN IF NOT EXISTS target_category CHAR(1);
ALTER TABLE players ADD COLUMN IF NOT EXISTS career_goal TEXT;

-- Create annual_plan_periods table
CREATE TABLE IF NOT EXISTS annual_plan_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  period_type VARCHAR(50) NOT NULL CHECK (period_type IN ('evaluation', 'base_training', 'specialization', 'tournament')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  weekly_hours INTEGER NOT NULL CHECK (weekly_hours > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure no overlapping periods for same player
  CONSTRAINT no_overlapping_periods EXCLUDE USING GIST (
    player_id WITH =,
    daterange(start_date, end_date, '[]') WITH &&
  )
);

-- Create period_training_distribution table
CREATE TABLE IF NOT EXISTS period_training_distribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID NOT NULL REFERENCES annual_plan_periods(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL CHECK (category IN ('physical', 'technique', 'golf_shots', 'course_play', 'tournament')),
  hours_per_week DECIMAL(5,2) CHECK (hours_per_week >= 0),
  percentage DECIMAL(5,2) CHECK (percentage >= 0 AND percentage <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique category per period
  UNIQUE(period_id, category)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_annual_plan_periods_player ON annual_plan_periods(player_id);
CREATE INDEX IF NOT EXISTS idx_annual_plan_periods_dates ON annual_plan_periods(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_period_training_dist_period ON period_training_distribution(period_id);

-- Create or replace update function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at timestamps
CREATE TRIGGER update_annual_plan_periods_updated_at
  BEFORE UPDATE ON annual_plan_periods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE annual_plan_periods IS 'Stores annual training plan periods (evaluation, base training, specialization, tournament) for players';
COMMENT ON TABLE period_training_distribution IS 'Stores training hour distribution across pyramid categories for each period';
COMMENT ON COLUMN players.target_category IS 'Target skill category player aims to achieve (A-K)';
COMMENT ON COLUMN players.career_goal IS 'Long-term career aspiration (e.g., "Bli profesjonell spiller")';
