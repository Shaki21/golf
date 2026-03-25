-- CreateTable
CREATE TABLE "notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "category" VARCHAR(50),
    "tags" VARCHAR(50)[] DEFAULT ARRAY[]::VARCHAR(50)[],
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "color" VARCHAR(7),
    "linked_entity_type" VARCHAR(50),
    "linked_entity_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notes_user_id_idx" ON "notes"("user_id");

-- CreateIndex
CREATE INDEX "notes_category_idx" ON "notes"("category");

-- CreateIndex
CREATE INDEX "notes_is_pinned_idx" ON "notes"("is_pinned");

-- CreateIndex
CREATE INDEX "notes_created_at_idx" ON "notes"("created_at");

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
