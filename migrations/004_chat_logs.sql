-- Migration: Create chat_logs table for storing chat message history
-- Created: 2025-11-30

CREATE TABLE IF NOT EXISTS chat_logs (
  id SERIAL PRIMARY KEY,
  client_id VARCHAR(36) NOT NULL,
  session_id VARCHAR(36) NOT NULL,
  step_name VARCHAR(50),
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_logs_client_id ON chat_logs(client_id);
CREATE INDEX idx_chat_logs_session_id ON chat_logs(session_id);
CREATE INDEX idx_chat_logs_step_name ON chat_logs(step_name);
CREATE INDEX idx_chat_logs_created_at ON chat_logs(created_at);
CREATE INDEX idx_chat_logs_role ON chat_logs(role);
