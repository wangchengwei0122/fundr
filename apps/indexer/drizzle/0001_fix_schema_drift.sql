-- =============================================================================
-- Migration: Fix Schema Drift
-- =============================================================================
-- This migration fixes the discrepancy between the Drizzle schema definition
-- and the actual database structure created by the initial migration.
--
-- Changes:
-- 1. checkpoints: Change id from serial to text (for "factory:0x..." format)
-- 2. checkpoints: Rename last_indexed_block to block
-- 3. campaigns: Add unique constraint on address
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Step 1: Fix checkpoints table
-- -----------------------------------------------------------------------------
-- Drop the old checkpoints table and recreate with correct schema
-- Note: This will lose checkpoint data, but indexer will resync from DEPLOY_BLOCK

DROP TABLE IF EXISTS checkpoints;

CREATE TABLE checkpoints (
  "id" text PRIMARY KEY NOT NULL,
  "block" bigint,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- -----------------------------------------------------------------------------
-- Step 2: Add unique constraint to campaigns.address
-- -----------------------------------------------------------------------------
-- This ensures upsert operations work correctly with onConflictDoUpdate

ALTER TABLE campaigns
ADD CONSTRAINT campaigns_address_unique UNIQUE (address);
