CREATE TABLE IF NOT EXISTS lesson_check_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  passed INTEGER NOT NULL DEFAULT 0 CHECK(passed IN (0,1)),
  reflection_length INTEGER NOT NULL DEFAULT 0,
  attempted_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_lesson_attempt_user_lesson
  ON lesson_check_attempts(user_id, course_id, lesson_id, attempted_at DESC);
