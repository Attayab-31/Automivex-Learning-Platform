ALTER TABLE lesson_check_attempts ADD COLUMN reflection_sha256 TEXT;
ALTER TABLE lesson_check_attempts ADD COLUMN choice_value INTEGER;
ALTER TABLE lesson_check_attempts ADD COLUMN policy_version TEXT NOT NULL DEFAULT '2026.1';

ALTER TABLE quiz_attempts ADD COLUMN evidence_sha256 TEXT;
ALTER TABLE quiz_attempts ADD COLUMN policy_version TEXT NOT NULL DEFAULT '2026.1';

ALTER TABLE project_submissions ADD COLUMN human_review_status TEXT NOT NULL DEFAULT 'pending'
  CHECK(human_review_status IN ('pending','approved','rejected'));
ALTER TABLE project_submissions ADD COLUMN reviewer_id TEXT;
ALTER TABLE project_submissions ADD COLUMN review_notes TEXT;
ALTER TABLE project_submissions ADD COLUMN reviewed_at TEXT;

ALTER TABLE sessions ADD COLUMN user_agent_sha256 TEXT;
ALTER TABLE sessions ADD COLUMN ip_sha256 TEXT;

CREATE INDEX IF NOT EXISTS idx_project_review_status
  ON project_submissions(human_review_status, submitted_at DESC);
