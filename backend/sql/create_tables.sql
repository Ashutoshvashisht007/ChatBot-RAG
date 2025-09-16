CREATE TABLE IF NOT EXISTS transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  transcript JSONB NOT NULL,     -- [{role, text, ts}, ...]
  metadata JSONB DEFAULT '{}'    -- optional metadata
);

-- Extension for gen_random_uuid() on Postgres >= 13:
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
