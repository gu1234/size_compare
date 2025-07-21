import os
import json

# Load objects.json
with open('objects.json', 'r') as f:
    objects = json.load(f)

# List all files in textures/
texture_files = set(os.listdir('textures'))

# Filter objects whose texture file exists
cleaned_objects = [obj for obj in objects if obj.get('texture') in texture_files]

removed = len(objects) - len(cleaned_objects)

# Save cleaned objects.json
with open('objects.json', 'w') as f:
    json.dump(cleaned_objects, f, indent=2)

print(f"Removed {removed} objects with missing textures. Cleaned objects.json saved.") 