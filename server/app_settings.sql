CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB
);
INSERT INTO app_settings (key, value) VALUES ('sheet_config', '{}') ON CONFLICT (key) DO NOTHING;
