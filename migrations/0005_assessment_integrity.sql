CREATE TABLE IF NOT EXISTS assessment_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  nonce_hash TEXT NOT NULL UNIQUE,
  variant_json TEXT NOT NULL,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  submitted_at TEXT,
  invalid_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_assessment_session_user_course
  ON assessment_sessions(user_id, course_id, started_at DESC);
