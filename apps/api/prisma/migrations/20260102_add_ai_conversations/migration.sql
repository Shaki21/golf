-- CreateTable
CREATE TABLE "ai_conversations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "player_id" UUID NOT NULL,
    "title" VARCHAR(255),
    "messages" JSONB NOT NULL DEFAULT '[]',
    "context" JSONB,
    "total_input_tokens" INTEGER NOT NULL DEFAULT 0,
    "total_output_tokens" INTEGER NOT NULL DEFAULT 0,
    "tools_used" VARCHAR(100)[] DEFAULT ARRAY[]::VARCHAR(100)[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_conversations_player_id_is_active_idx" ON "ai_conversations"("player_id", "is_active");

-- CreateIndex
CREATE INDEX "ai_conversations_player_id_updated_at_idx" ON "ai_conversations"("player_id", "updated_at" DESC);

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
