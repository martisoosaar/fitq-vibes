-- Extract programs data from SQL dump
-- Run: mysql -u root fitq_vibes_legacy < extract-programs.sql

USE fitq_vibes_legacy;

-- First load the data from dump
source /Users/soss/htdocs/fitq-vibes/fitq_live_db (3).sql;

-- Export to CSV
SELECT 
  id,
  trainer_id,
  title,
  short_description,
  description,
  picture,
  url_slug,
  faq,
  unit_length,
  unit_visibility,
  language_id,
  status,
  comments_enabled,
  feedback_enabled,
  created_at,
  updated_at,
  deleted_at
FROM trainer_programs
INTO OUTFILE '/tmp/programs.csv'
FIELDS TERMINATED BY '|'
ENCLOSED BY '"'
LINES TERMINATED BY '\n';