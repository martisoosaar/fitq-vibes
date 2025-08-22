#!/usr/bin/env python3
import re
import json

# Read the SQL file
with open('/Users/soss/htdocs/fitq-vibes/fitq_live_db (3).sql', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the trainer_program_units insert
start_idx = -1
for i, line in enumerate(lines):
    if 'INSERT INTO `trainer_program_units`' in line:
        start_idx = i
        break

if start_idx == -1:
    print("Could not find trainer_program_units insert")
    exit(1)

# Extract units
units = []
in_values = False
current_record = []

for i in range(start_idx + 1, min(start_idx + 2000, len(lines))):
    line = lines[i].strip()
    
    # Check if we've reached the end
    if line.startswith('--') or line.startswith('ALTER TABLE') or line.startswith('CREATE TABLE'):
        break
    
    # Parse records
    if line.startswith('('):
        # Start of a record
        if line.endswith('),') or line.endswith(');'):
            # Complete record on one line
            units.append(line)
        else:
            # Multi-line record
            current_record = [line]
    elif current_record:
        # Continue multi-line record
        current_record.append(line)
        if line.endswith('),') or line.endswith(');'):
            # End of multi-line record
            units.append(' '.join(current_record))
            current_record = []

print(f"Found {len(units)} units")

# Parse and save as JSON
parsed_units = []
for record in units:
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
        unit = {
            'id': int(parts[0]),
            'program_id': int(parts[1]),
            'order': int(parts[2]) if parts[2] != 'NULL' else None,
            'title': clean_value(parts[3]),
            'description': clean_value(parts[4]),
            'status': clean_value(parts[5]),
            'created_at': clean_value(parts[6]),
            'updated_at': clean_value(parts[7]),
            'deleted_at': clean_value(parts[8])
        }
        parsed_units.append(unit)
    except Exception as e:
        print(f"Error parsing record: {e}")
        print(f"Record: {record[:100]}...")

# Save as JSON
with open('/tmp/program_units.json', 'w', encoding='utf-8') as f:
    json.dump(parsed_units, f, ensure_ascii=False, indent=2)

print(f"Saved {len(parsed_units)} units to /tmp/program_units.json")

# Group by program_id for summary
from collections import defaultdict
by_program = defaultdict(list)
for unit in parsed_units:
    if unit['deleted_at'] is None:
        by_program[unit['program_id']].append(unit)

print("\nUnits per program (non-deleted):")
for prog_id in sorted(by_program.keys())[:10]:
    units_list = by_program[prog_id]
    published = sum(1 for u in units_list if u['status'] == 'PUBLISHED')
    print(f"  Program {prog_id}: {len(units_list)} units ({published} published)")