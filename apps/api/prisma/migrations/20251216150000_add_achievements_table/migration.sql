-- CreateTable
CREATE TABLE "user_achievements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "tier" VARCHAR(20) NOT NULL DEFAULT 'bronze',
    "icon" VARCHAR(50) NOT NULL,
    "points_value" INTEGER NOT NULL DEFAULT 0,
    "earned_at" TIMESTAMPTZ(6) NOT NULL,
    "context" JSONB,
    "is_new" BOOLEAN NOT NULL DEFAULT true,
    "viewed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_user_id_code_key" ON "user_achievements"("user_id", "code");

-- CreateIndex
CREATE INDEX "user_achievements_user_id_idx" ON "user_achievements"("user_id");

-- CreateIndex
CREATE INDEX "user_achievements_category_idx" ON "user_achievements"("category");

-- CreateIndex
CREATE INDEX "user_achievements_earned_at_idx" ON "user_achievements"("earned_at");

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
