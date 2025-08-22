#!/bin/bash

SQL_FILE="/Users/soss/htdocs/fitq-vibes/fitq_live_db (3).sql"

echo "Extracting video tasks data..."

# Extract all video task inserts
sed -n '/INSERT INTO `trainer_program_unit_video_tasks`/,/;$/p' "$SQL_FILE" > /tmp/video_tasks.sql

# Count records
echo "Found $(grep -o "([0-9]*, [0-9]*," /tmp/video_tasks.sql | wc -l) video task records"

# Show sample
echo "Sample records:"
head -20 /tmp/video_tasks.sql

# Search for unit 1241
echo ""
echo "Searching for unit 1241..."
grep ", 1241," /tmp/video_tasks.sql || echo "No direct match for unit 1241"