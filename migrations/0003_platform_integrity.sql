CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  event_type TEXT NOT NULL CHECK(length(event_type) BETWEEN 2 AND 100),
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  course_id TEXT,
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_events_user
  ON audit_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_entity
  ON audit_events(entity_type, entity_id, created_at DESC);

ALTER TABLE project_submissions ADD COLUMN repository_id TEXT;
ALTER TABLE project_submissions ADD COLUMN commit_sha TEXT;
ALTER TABLE project_submissions ADD COLUMN tree_sha TEXT;
ALTER TABLE project_submissions ADD COLUMN verified_branch TEXT;
ALTER TABLE project_submissions ADD COLUMN verification_json TEXT;

ALTER TABLE certificates ADD COLUMN evidence_json TEXT;
ALTER TABLE certificates ADD COLUMN signature TEXT;
