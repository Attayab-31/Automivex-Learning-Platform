ALTER TABLE project_submissions ADD COLUMN social_attestations_json TEXT NOT NULL DEFAULT '{}'
  CHECK(json_valid(social_attestations_json));
