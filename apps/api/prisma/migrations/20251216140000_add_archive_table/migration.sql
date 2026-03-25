-- CreateTable
CREATE TABLE "archived_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" UUID NOT NULL,
    "entity_data" JSONB NOT NULL,
    "archived_at" TIMESTAMPTZ(6) NOT NULL,
    "reason" VARCHAR(255),

    CONSTRAINT "archived_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "archived_items_entity_type_entity_id_key" ON "archived_items"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "archived_items_user_id_idx" ON "archived_items"("user_id");

-- CreateIndex
CREATE INDEX "archived_items_entity_type_idx" ON "archived_items"("entity_type");

-- CreateIndex
CREATE INDEX "archived_items_archived_at_idx" ON "archived_items"("archived_at");

-- AddForeignKey
ALTER TABLE "archived_items" ADD CONSTRAINT "archived_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
