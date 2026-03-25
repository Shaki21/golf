-- Dashboard Query Performance Indexes

-- Composite index for getBreakingPoints query
-- Optimizes: WHERE status IN (...) ORDER BY severity DESC, identifiedDate DESC
CREATE INDEX IF NOT EXISTS "breaking_points_status_severity_identifiedDate_idx"
ON "breaking_points" ("status", "severity", "identified_date" DESC);

-- Composite index for getNextTest query
-- Optimizes: WHERE playerId = ... AND sessionType = 'test' AND assignedDate >= ... AND status IN (...)
CREATE INDEX IF NOT EXISTS "daily_training_assignments_player_session_date_status_idx"
ON "daily_training_assignments" ("player_id", "session_type", "assigned_date", "status");
