-- Add client_id column to subscribers table for cohort analysis joins
-- Run this in Neon console to update the table

ALTER TABLE subscribers
ADD COLUMN IF NOT EXISTS client_id VARCHAR(36);

CREATE INDEX IF NOT EXISTS idx_subscribers_client_id ON subscribers(client_id);
