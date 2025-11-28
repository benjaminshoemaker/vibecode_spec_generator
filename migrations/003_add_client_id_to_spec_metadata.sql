-- Add client_id column to spec_metadata table for cohort analysis joins
-- Run this in Neon console to update the table

ALTER TABLE spec_metadata
ADD COLUMN IF NOT EXISTS client_id VARCHAR(36);

CREATE INDEX IF NOT EXISTS idx_spec_metadata_client_id ON spec_metadata(client_id);
