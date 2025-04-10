import json
import re

# Define the file path
file_path = r'c:\Users\dhiaf\ISS\schedule-generator\university-scheduler\public\courses.json'

# Function to convert time slot string to object
def convert_time_slot(time_slot):
    match = re.match(r'(\w+)\s(\d{2}:\d{2})-(\d{2}:\d{2})', time_slot)
    if match:
        return {
            "day": match.group(1),
            "start_time": match.group(2),
            "end_time": match.group(3)
        }
    return None

# Read the JSON file
with open(file_path, 'r') as file:
    data = json.load(file)

# Convert time slots
for course in data['courses']:
    for group in course['groups']:
        group['time_slots'] = [convert_time_slot(ts) for ts in group['time_slots']]

# Write the updated JSON back to the file
with open(file_path, 'w') as file:
    json.dump(data, file, indent=2)

print("Time slots have been successfully converted.")