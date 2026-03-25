-- CreateTable: Samlinger (Training Camps)
CREATE TABLE "samlinger" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "coach_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "venue" VARCHAR(255),
    "golf_course_id" UUID,
    "address" TEXT,
    "location_details" JSONB,
    "accommodation" TEXT,
    "meeting_point" TEXT,
    "transport_info" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMPTZ(6),
    "max_participants" INTEGER,
    "notes" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "samlinger_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Samling Participants
CREATE TABLE "samling_participants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "samling_id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "added_via" VARCHAR(20) NOT NULL,
    "source_group_id" UUID,
    "invitation_status" VARCHAR(20) NOT NULL DEFAULT 'invited',
    "responded_at" TIMESTAMPTZ(6),
    "decline_reason" TEXT,
    "checked_in" BOOLEAN NOT NULL DEFAULT false,
    "checked_in_at" TIMESTAMPTZ(6),
    "synced_to_calendar" BOOLEAN NOT NULL DEFAULT false,
    "synced_to_training_plan" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "samling_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Samling Sessions
CREATE TABLE "samling_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "samling_id" UUID NOT NULL,
    "session_date" DATE NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5),
    "duration" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "session_type" VARCHAR(50) NOT NULL,
    "location" VARCHAR(255),
    "exercises" JSONB NOT NULL DEFAULT '[]',
    "objectives" VARCHAR(255)[],
    "equipment" VARCHAR(100)[],
    "period" VARCHAR(1),
    "learning_phase" VARCHAR(10),
    "intensity" INTEGER,
    "session_template_id" UUID,
    "order_in_day" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "samling_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Samling Session Attendance
CREATE TABLE "samling_session_attendance" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "participant_id" UUID NOT NULL,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "attended_at" TIMESTAMPTZ(6),
    "performance" JSONB,
    "coach_notes" TEXT,
    "player_notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "samling_session_attendance_pkey" PRIMARY KEY ("id")
);

-- AlterTable: Add samling_session_id to daily_training_assignments
ALTER TABLE "daily_training_assignments" ADD COLUMN "samling_session_id" UUID;
ALTER TABLE "daily_training_assignments" ADD COLUMN "source_type" VARCHAR(20) NOT NULL DEFAULT 'plan';

-- CreateIndexes for samlinger
CREATE INDEX "samlinger_tenant_id_idx" ON "samlinger"("tenant_id");
CREATE INDEX "samlinger_coach_id_idx" ON "samlinger"("coach_id");
CREATE INDEX "samlinger_status_idx" ON "samlinger"("status");
CREATE INDEX "samlinger_start_date_idx" ON "samlinger"("start_date");

-- CreateIndexes for samling_participants
CREATE UNIQUE INDEX "samling_participants_samling_id_player_id_key" ON "samling_participants"("samling_id", "player_id");
CREATE INDEX "samling_participants_samling_id_idx" ON "samling_participants"("samling_id");
CREATE INDEX "samling_participants_player_id_idx" ON "samling_participants"("player_id");

-- CreateIndexes for samling_sessions
CREATE INDEX "samling_sessions_samling_id_idx" ON "samling_sessions"("samling_id");
CREATE INDEX "samling_sessions_session_date_idx" ON "samling_sessions"("session_date");

-- CreateIndexes for samling_session_attendance
CREATE UNIQUE INDEX "samling_session_attendance_session_id_participant_id_key" ON "samling_session_attendance"("session_id", "participant_id");
CREATE INDEX "samling_session_attendance_session_id_idx" ON "samling_session_attendance"("session_id");

-- AddForeignKey: samlinger
ALTER TABLE "samlinger" ADD CONSTRAINT "samlinger_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "samlinger" ADD CONSTRAINT "samlinger_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "samlinger" ADD CONSTRAINT "samlinger_golf_course_id_fkey" FOREIGN KEY ("golf_course_id") REFERENCES "golf_courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: samling_participants
ALTER TABLE "samling_participants" ADD CONSTRAINT "samling_participants_samling_id_fkey" FOREIGN KEY ("samling_id") REFERENCES "samlinger"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "samling_participants" ADD CONSTRAINT "samling_participants_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: samling_sessions
ALTER TABLE "samling_sessions" ADD CONSTRAINT "samling_sessions_samling_id_fkey" FOREIGN KEY ("samling_id") REFERENCES "samlinger"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "samling_sessions" ADD CONSTRAINT "samling_sessions_session_template_id_fkey" FOREIGN KEY ("session_template_id") REFERENCES "session_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: samling_session_attendance
ALTER TABLE "samling_session_attendance" ADD CONSTRAINT "samling_session_attendance_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "samling_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "samling_session_attendance" ADD CONSTRAINT "samling_session_attendance_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "samling_participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: daily_training_assignments
ALTER TABLE "daily_training_assignments" ADD CONSTRAINT "daily_training_assignments_samling_session_id_fkey" FOREIGN KEY ("samling_session_id") REFERENCES "samling_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
