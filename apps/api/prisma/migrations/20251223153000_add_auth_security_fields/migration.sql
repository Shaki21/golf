-- Add password reset fields
ALTER TABLE "users" ADD COLUMN "password_reset_token" VARCHAR(255);
ALTER TABLE "users" ADD COLUMN "password_reset_expires" TIMESTAMPTZ(6);

-- Add two-factor authentication fields
ALTER TABLE "users" ADD COLUMN "two_factor_secret" VARCHAR(255);
ALTER TABLE "users" ADD COLUMN "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "two_factor_backup_codes" TEXT[] NOT NULL DEFAULT '{}';

-- Create index for password reset token lookups
CREATE INDEX "users_password_reset_token_idx" ON "users"("password_reset_token") WHERE "password_reset_token" IS NOT NULL;
