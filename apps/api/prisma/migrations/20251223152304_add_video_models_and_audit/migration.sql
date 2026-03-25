-- CreateTable: Video model
CREATE TABLE "videos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "uploaded_by_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "s3_key" VARCHAR(500) NOT NULL,
    "thumbnail_key" VARCHAR(500),
    "duration" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "fps" DECIMAL(5,2),
    "file_size" BIGINT NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "category" VARCHAR(50),
    "club_type" VARCHAR(50),
    "view_angle" VARCHAR(50),
    "status" VARCHAR(20) NOT NULL DEFAULT 'processing',
    "error_code" VARCHAR(50),
    "error_message" TEXT,
    "processing_version" INTEGER NOT NULL DEFAULT 1,
    "checksum_sha256" VARCHAR(64),
    "visibility" VARCHAR(20) NOT NULL DEFAULT 'private',
    "share_expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable: VideoAnnotation model
CREATE TABLE "video_annotations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "video_id" UUID NOT NULL,
    "created_by_id" UUID NOT NULL,
    "timestamp" DECIMAL(10,3) NOT NULL,
    "duration" DECIMAL(10,3),
    "frame_number" INTEGER,
    "type" VARCHAR(50) NOT NULL,
    "schema_version" INTEGER NOT NULL DEFAULT 1,
    "coordinate_space" VARCHAR(20) NOT NULL DEFAULT 'normalized_0_1',
    "drawing_data" JSONB NOT NULL,
    "color" VARCHAR(20) NOT NULL DEFAULT '#FF0000',
    "stroke_width" INTEGER NOT NULL DEFAULT 3,
    "audio_key" VARCHAR(500),
    "audio_duration" DECIMAL(10,3),
    "note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_annotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable: VideoComparison model
CREATE TABLE "video_comparisons" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "created_by_id" UUID NOT NULL,
    "primary_video_id" UUID NOT NULL,
    "comparison_video_id" UUID NOT NULL,
    "title" VARCHAR(255),
    "notes" TEXT,
    "sync_point_1" DECIMAL(10,3) NOT NULL,
    "sync_point_2" DECIMAL(10,3) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable: VideoComment model
CREATE TABLE "video_comments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "video_id" UUID NOT NULL,
    "created_by_id" UUID NOT NULL,
    "parent_id" UUID,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "video_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AuditEvent model
CREATE TABLE "audit_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "actor_id" UUID NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "resource_type" VARCHAR(100) NOT NULL,
    "resource_id" UUID NOT NULL,
    "subject_id" UUID,
    "metadata" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "request_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "videos_tenant_id_player_id_created_at_idx" ON "videos"("tenant_id", "player_id", "created_at" DESC);
CREATE INDEX "videos_tenant_id_status_idx" ON "videos"("tenant_id", "status");
CREATE INDEX "videos_tenant_id_uploaded_by_id_idx" ON "videos"("tenant_id", "uploaded_by_id");

CREATE INDEX "video_annotations_video_id_timestamp_idx" ON "video_annotations"("video_id", "timestamp");

CREATE INDEX "video_comparisons_primary_video_id_idx" ON "video_comparisons"("primary_video_id");
CREATE INDEX "video_comparisons_tenant_id_idx" ON "video_comparisons"("tenant_id");

CREATE INDEX "video_comments_video_id_created_at_idx" ON "video_comments"("video_id", "created_at" DESC);

CREATE INDEX "audit_events_tenant_id_action_created_at_idx" ON "audit_events"("tenant_id", "action", "created_at" DESC);
CREATE INDEX "audit_events_resource_type_resource_id_idx" ON "audit_events"("resource_type", "resource_id");
CREATE INDEX "audit_events_actor_id_idx" ON "audit_events"("actor_id");

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "videos" ADD CONSTRAINT "videos_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "videos" ADD CONSTRAINT "videos_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "video_annotations" ADD CONSTRAINT "video_annotations_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "video_annotations" ADD CONSTRAINT "video_annotations_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "video_comparisons" ADD CONSTRAINT "video_comparisons_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "video_comparisons" ADD CONSTRAINT "video_comparisons_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "video_comparisons" ADD CONSTRAINT "video_comparisons_primary_video_id_fkey" FOREIGN KEY ("primary_video_id") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "video_comparisons" ADD CONSTRAINT "video_comparisons_comparison_video_id_fkey" FOREIGN KEY ("comparison_video_id") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "video_comments" ADD CONSTRAINT "video_comments_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "video_comments" ADD CONSTRAINT "video_comments_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "video_comments" ADD CONSTRAINT "video_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "video_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
