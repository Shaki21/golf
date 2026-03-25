-- CreateTable
CREATE TABLE "weekly_training_stats" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "player_id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "week_number" INTEGER NOT NULL,
    "week_start_date" DATE NOT NULL,
    "week_end_date" DATE NOT NULL,
    "planned_sessions" INTEGER NOT NULL DEFAULT 0,
    "completed_sessions" INTEGER NOT NULL DEFAULT 0,
    "skipped_sessions" INTEGER NOT NULL DEFAULT 0,
    "completion_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "planned_minutes" INTEGER NOT NULL DEFAULT 0,
    "actual_minutes" INTEGER NOT NULL DEFAULT 0,
    "session_type_breakdown" JSONB NOT NULL DEFAULT '{}',
    "learning_phase_minutes" JSONB NOT NULL DEFAULT '{}',
    "avg_quality" DECIMAL(3,2),
    "avg_focus" DECIMAL(3,2),
    "avg_intensity" DECIMAL(3,2),
    "sessions_change" INTEGER NOT NULL DEFAULT 0,
    "minutes_change" INTEGER NOT NULL DEFAULT 0,
    "completion_rate_change" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak_in_week" INTEGER NOT NULL DEFAULT 0,
    "period" VARCHAR(1),
    "calculated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weekly_training_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_training_stats" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "player_id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "total_sessions" INTEGER NOT NULL DEFAULT 0,
    "completed_sessions" INTEGER NOT NULL DEFAULT 0,
    "completion_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "total_minutes" INTEGER NOT NULL DEFAULT 0,
    "avg_minutes_per_session" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "avg_minutes_per_day" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "session_type_breakdown" JSONB NOT NULL DEFAULT '{}',
    "avg_quality" DECIMAL(3,2),
    "avg_focus" DECIMAL(3,2),
    "sessions_change" INTEGER NOT NULL DEFAULT 0,
    "minutes_change" INTEGER NOT NULL DEFAULT 0,
    "tests_completed" INTEGER NOT NULL DEFAULT 0,
    "tests_passed" INTEGER NOT NULL DEFAULT 0,
    "badges_earned" INTEGER NOT NULL DEFAULT 0,
    "calculated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monthly_training_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_training_stats" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "player_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "planned_sessions" INTEGER NOT NULL DEFAULT 0,
    "completed_sessions" INTEGER NOT NULL DEFAULT 0,
    "planned_minutes" INTEGER NOT NULL DEFAULT 0,
    "actual_minutes" INTEGER NOT NULL DEFAULT 0,
    "sessions" JSONB NOT NULL DEFAULT '[]',
    "avg_quality" DECIMAL(3,2),
    "avg_focus" DECIMAL(3,2),
    "streak_day" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_training_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievement_definitions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "icon" VARCHAR(50) NOT NULL,
    "tier" VARCHAR(20) NOT NULL DEFAULT 'bronze',
    "requirements" JSONB NOT NULL,
    "points_value" INTEGER NOT NULL DEFAULT 0,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievement_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_achievements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "player_id" UUID NOT NULL,
    "achievement_id" UUID NOT NULL,
    "earned_at" TIMESTAMPTZ(6) NOT NULL,
    "context" JSONB,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "notified_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "player_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_groups" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "group_type" VARCHAR(50) NOT NULL,
    "avatar_url" VARCHAR(500),
    "avatar_initials" VARCHAR(5),
    "avatar_color" VARCHAR(7),
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "is_muted" BOOLEAN NOT NULL DEFAULT false,
    "created_by" UUID NOT NULL,
    "last_message_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_group_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "group_id" UUID NOT NULL,
    "member_type" VARCHAR(20) NOT NULL,
    "member_id" UUID NOT NULL,
    "role" VARCHAR(20) NOT NULL DEFAULT 'member',
    "last_read_at" TIMESTAMPTZ(6),
    "last_read_message_id" UUID,
    "unread_count" INTEGER NOT NULL DEFAULT 0,
    "is_muted" BOOLEAN NOT NULL DEFAULT false,
    "notifications_enabled" BOOLEAN NOT NULL DEFAULT true,
    "joined_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMPTZ(6),

    CONSTRAINT "chat_group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "group_id" UUID NOT NULL,
    "sender_type" VARCHAR(20) NOT NULL,
    "sender_id" UUID,
    "message_type" VARCHAR(20) NOT NULL DEFAULT 'text',
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "reply_to_id" UUID,
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "edited_at" TIMESTAMPTZ(6),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_goals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "player_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "goal_type" VARCHAR(50) NOT NULL,
    "timeframe" VARCHAR(20) NOT NULL,
    "target_value" DECIMAL(10,2),
    "current_value" DECIMAL(10,2),
    "start_value" DECIMAL(10,2),
    "unit" VARCHAR(50),
    "progress_percent" INTEGER NOT NULL DEFAULT 0,
    "start_date" DATE NOT NULL,
    "target_date" DATE NOT NULL,
    "completed_date" DATE,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "icon" VARCHAR(50),
    "linked_test_id" UUID,
    "linked_breaking_point_id" UUID,
    "progress_history" JSONB NOT NULL DEFAULT '[]',
    "coach_notes" TEXT,
    "player_notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "player_goals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "weekly_training_stats_player_id_idx" ON "weekly_training_stats"("player_id");

-- CreateIndex
CREATE INDEX "weekly_training_stats_year_week_number_idx" ON "weekly_training_stats"("year", "week_number");

-- CreateIndex
CREATE INDEX "weekly_training_stats_week_start_date_idx" ON "weekly_training_stats"("week_start_date");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_training_stats_player_id_year_week_number_key" ON "weekly_training_stats"("player_id", "year", "week_number");

-- CreateIndex
CREATE INDEX "monthly_training_stats_player_id_idx" ON "monthly_training_stats"("player_id");

-- CreateIndex
CREATE INDEX "monthly_training_stats_year_month_idx" ON "monthly_training_stats"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_training_stats_player_id_year_month_key" ON "monthly_training_stats"("player_id", "year", "month");

-- CreateIndex
CREATE INDEX "daily_training_stats_player_id_idx" ON "daily_training_stats"("player_id");

-- CreateIndex
CREATE INDEX "daily_training_stats_date_idx" ON "daily_training_stats"("date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_training_stats_player_id_date_key" ON "daily_training_stats"("player_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "achievement_definitions_code_key" ON "achievement_definitions"("code");

-- CreateIndex
CREATE INDEX "achievement_definitions_category_idx" ON "achievement_definitions"("category");

-- CreateIndex
CREATE INDEX "achievement_definitions_is_active_idx" ON "achievement_definitions"("is_active");

-- CreateIndex
CREATE INDEX "player_achievements_player_id_idx" ON "player_achievements"("player_id");

-- CreateIndex
CREATE INDEX "player_achievements_earned_at_idx" ON "player_achievements"("earned_at");

-- CreateIndex
CREATE UNIQUE INDEX "player_achievements_player_id_achievement_id_key" ON "player_achievements"("player_id", "achievement_id");

-- CreateIndex
CREATE INDEX "chat_groups_tenant_id_idx" ON "chat_groups"("tenant_id");

-- CreateIndex
CREATE INDEX "chat_groups_group_type_idx" ON "chat_groups"("group_type");

-- CreateIndex
CREATE INDEX "chat_groups_last_message_at_idx" ON "chat_groups"("last_message_at");

-- CreateIndex
CREATE INDEX "chat_group_members_group_id_idx" ON "chat_group_members"("group_id");

-- CreateIndex
CREATE INDEX "chat_group_members_member_id_idx" ON "chat_group_members"("member_id");

-- CreateIndex
CREATE INDEX "chat_group_members_unread_count_idx" ON "chat_group_members"("unread_count");

-- CreateIndex
CREATE UNIQUE INDEX "chat_group_members_group_id_member_type_member_id_key" ON "chat_group_members"("group_id", "member_type", "member_id");

-- CreateIndex
CREATE INDEX "chat_messages_group_id_idx" ON "chat_messages"("group_id");

-- CreateIndex
CREATE INDEX "chat_messages_sender_id_idx" ON "chat_messages"("sender_id");

-- CreateIndex
CREATE INDEX "chat_messages_created_at_idx" ON "chat_messages"("created_at");

-- CreateIndex
CREATE INDEX "player_goals_player_id_idx" ON "player_goals"("player_id");

-- CreateIndex
CREATE INDEX "player_goals_status_idx" ON "player_goals"("status");

-- CreateIndex
CREATE INDEX "player_goals_target_date_idx" ON "player_goals"("target_date");

-- AddForeignKey
ALTER TABLE "weekly_training_stats" ADD CONSTRAINT "weekly_training_stats_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_training_stats" ADD CONSTRAINT "monthly_training_stats_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_training_stats" ADD CONSTRAINT "daily_training_stats_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_achievements" ADD CONSTRAINT "player_achievements_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_achievements" ADD CONSTRAINT "player_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievement_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_group_members" ADD CONSTRAINT "chat_group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "chat_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "chat_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_reply_to_id_fkey" FOREIGN KEY ("reply_to_id") REFERENCES "chat_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_goals" ADD CONSTRAINT "player_goals_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
