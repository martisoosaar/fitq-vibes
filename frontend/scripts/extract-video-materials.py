#!/usr/bin/env python3
import re
import json

# Read the SQL file
with open('/Users/soss/htdocs/fitq-vibes/fitq_live_db (3).sql', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the trainer_program_unit_video_materials insert
start_idx = -1
for i, line in enumerate(lines):
    if 'INSERT INTO `trainer_program_unit_video_materials`' in line:
        start_idx = i
        break

if start_idx == -1:
    print("Could not find trainer_program_unit_video_materials insert")
    exit(1)

# Extract video materials
materials = []
in_values = False
current_record = []

for i in range(start_idx + 1, min(start_idx + 500, len(lines))):
    line = lines[i].strip()
    
    # Check if we've reached the end
    if line.startswith('--') or line.startswith('ALTER TABLE') or line.startswith('CREATE TABLE'):
        break
    
    # Parse records
    if line.startswith('('):
        # Start of a record
        if line.endswith('),') or line.endswith(');'):
            # Complete record on one line
            materials.append(line)
        else:
            # Multi-line record
            current_record = [line]
    elif current_record:
        # Continue multi-line record
        current_record.append(line)
        if line.endswith('),') or line.endswith(');'):
            # End of multi-line record
            materials.append(' '.join(current_record))
            current_record = []

print(f"Found {len(materials)} video materials")

# Parse and save as JSON
parsed_materials = []
for record in materials:
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
        material = {
            'id': int(parts[0]),
            'unit_id': int(parts[1]),
            'video_id': int(parts[2]),
            'created_at': clean_value(parts[3]),
            'updated_at': clean_value(parts[4]),
            'deleted_at': clean_value(parts[5])
        }
        parsed_materials.append(material)
    except Exception as e:
        print(f"Error parsing record: {e}")
        print(f"Record: {record[:100]}...")

# Save as JSON
with open('/tmp/video_materials.json', 'w', encoding='utf-8') as f:
    json.dump(parsed_materials, f, ensure_ascii=False, indent=2)

print(f"Saved {len(parsed_materials)} video materials to /tmp/video_materials.json")

# Group by unit_id for summary
from collections import defaultdict
by_unit = defaultdict(list)
for material in parsed_materials:
    if material['deleted_at'] is None:
        by_unit[material['unit_id']].append(material)

print(f"\nNon-deleted materials: {sum(len(v) for v in by_unit.values())}")
print("Sample units with materials:")
for unit_id in sorted(by_unit.keys())[:10]:
    materials_list = by_unit[unit_id]
    print(f"  Unit {unit_id}: {len(materials_list)} videos")