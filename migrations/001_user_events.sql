-- User events table for cohort analysis
-- Run this in Neon console to create the table

CREATE TABLE IF NOT EXISTS user_events (
  id SERIAL PRIMARY KEY,
  client_id VARCHAR(36) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_user_events_client_id ON user_events(client_id);
CREATE INDEX IF NOT EXISTS idx_user_events_created_at ON user_events(created_at);
CREATE INDEX IF NOT EXISTS idx_user_events_type ON user_events(event_type);
