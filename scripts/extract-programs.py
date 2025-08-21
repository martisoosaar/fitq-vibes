#!/usr/bin/env python3
import re
import json

# Read the SQL file
with open('/Users/soss/htdocs/fitq-vibes/fitq_live_db (3).sql', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the trainer_programs insert
start_idx = -1
for i, line in enumerate(lines):
    if 'INSERT INTO `trainer_programs`' in line:
        start_idx = i
        break

if start_idx == -1:
    print("Could not find trainer_programs insert")
    exit(1)

# Extract programs
programs = []
in_values = False
current_record = []

for i in range(start_idx + 1, len(lines)):
    line = lines[i].strip()
    
    # Check if we've reached the end
    if line.startswith('--') or line.startswith('ALTER TABLE') or line.startswith('CREATE TABLE'):
        break
    
    # Parse records
    if line.startswith('('):
        # Start of a record
        if line.endswith('),') or line.endswith(');'):
            # Complete record on one line
            programs.append(line)
        else:
            # Multi-line record
            current_record = [line]
    elif current_record:
        # Continue multi-line record
        current_record.append(line)
        if line.endswith('),') or line.endswith(');'):
            # End of multi-line record
            programs.append(' '.join(current_record))
            current_record = []

print(f"Found {len(programs)} programs")

# Parse and save as JSON
parsed_programs = []
for record in programs:
    # Remove the outer parentheses and trailing comma/semicolon
    record = record.strip()
    if record.endswith('),'):
        record = record[1:-2]
    elif record.endswith(');'):
        record = record[1:-2]
    else:
        record = record[1:-1]
    
    # Split by commas outside of quotes
    parts = []
    current = ''
    in_quote = False
    quote_char = ''
    escape_next = False
    
    for char in record:
        if escape_next:
            current += char
            escape_next = False
        elif char == '\\':
            current += char
            escape_next = True
        elif not in_quote and char in ["'", '"']:
            in_quote = True
            quote_char = char
            current += char
        elif in_quote and char == quote_char and not escape_next:
            in_quote = False
            current += char
        elif not in_quote and char == ',':
            parts.append(current.strip())
            current = ''
        else:
            current += char
    
    if current:
        parts.append(current.strip())
    
    # Clean values
    def clean_value(val):
        val = val.strip()
        if val == 'NULL':
            return None
        if val.startswith("'") and val.endswith("'"):
            return val[1:-1].replace("\\'", "'").replace('\\"', '"').replace('\\\\', '\\')
        return val
    
    try:
        program = {
            'id': int(parts[0]),
            'trainer_id': int(parts[1]),
            'title': clean_value(parts[2]),
            'short_description': clean_value(parts[3]),
            'description': clean_value(parts[4]),
            'picture': clean_value(parts[5]),
            'url_slug': clean_value(parts[6]),
            'faq': clean_value(parts[7]),
            'unit_length': clean_value(parts[8]),
            'unit_visibility': clean_value(parts[9]),
            'language_id': int(parts[10]),
            'status': clean_value(parts[11]),
            'comments_enabled': int(parts[12]),
            'feedback_enabled': int(parts[13]),
            'created_at': clean_value(parts[14]),
            'updated_at': clean_value(parts[15]),
            'deleted_at': clean_value(parts[16])
        }
        parsed_programs.append(program)
    except Exception as e:
        print(f"Error parsing record: {e}")
        print(f"Record: {record[:100]}...")

# Save as JSON
with open('/tmp/programs.json', 'w', encoding='utf-8') as f:
    json.dump(parsed_programs, f, ensure_ascii=False, indent=2)

print(f"Saved {len(parsed_programs)} programs to /tmp/programs.json")