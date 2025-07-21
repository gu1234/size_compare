import os
import json
import urllib.request

# List of new stellar objects to add
new_objects = [
    {
        "name": "Orion Nebula",
        "type": "nebula",
        "size": 24,
        "img_url": "https://cdn.spacetelescope.org/archives/images/screen/heic0601a.jpg",
        "texture": "orion_nebula.jpg"
    },
    {
        "name": "Eagle Nebula",
        "type": "nebula",
        "size": 70,
        "img_url": "https://cdn.spacetelescope.org/archives/images/screen/heic1501a.jpg",
        "texture": "eagle_nebula.jpg"
    },
    {
        "name": "Crab Nebula",
        "type": "nebula",
        "size": 11,
        "img_url": "https://cdn.spacetelescope.org/archives/images/screen/heic0515a.jpg",
        "texture": "crab_nebula.jpg"
    },
    {
        "name": "Helix Nebula",
        "type": "nebula",
        "size": 2.5,
        "img_url": "https://cdn.spacetelescope.org/archives/images/screen/heic0310a.jpg",
        "texture": "helix_nebula.jpg"
    },
    {
        "name": "Andromeda Galaxy",
        "type": "galaxy",
        "size": 220000,
        "img_url": "https://cdn.spacetelescope.org/archives/images/screen/heic1502a.jpg",
        "texture": "andromeda.jpg"
    },
    {
        "name": "Milky Way",
        "type": "galaxy",
        "size": 105700,
        "img_url": "https://cdn.spacetelescope.org/archives/images/screen/opo0328a.jpg",
        "texture": "milky_way.jpg"
    },
    {
        "name": "Sombrero Galaxy",
        "type": "galaxy",
        "size": 49000,
        "img_url": "https://cdn.spacetelescope.org/archives/images/screen/heic0103a.jpg",
        "texture": "sombrero_galaxy.jpg"
    },
    {
        "name": "Whirlpool Galaxy",
        "type": "galaxy",
        "size": 76000,
        "img_url": "https://cdn.spacetelescope.org/archives/images/screen/opo0328b.jpg",
        "texture": "whirlpool_galaxy.jpg"
    },
    {
        "name": "Pleiades",
        "type": "star cluster",
        "size": 43,
        "img_url": "https://upload.wikimedia.org/wikipedia/commons/0/0f/Pleiades_large.jpg",
        "texture": "pleiades.jpg"
    },
    {
        "name": "Omega Centauri",
        "type": "star cluster",
        "size": 150,
        "img_url": "https://cdn.spacetelescope.org/archives/images/screen/heic0809a.jpg",
        "texture": "omega_centauri.jpg"
    },
    {
        "name": "Double Cluster",
        "type": "star cluster",
        "size": 70,
        "img_url": "https://upload.wikimedia.org/wikipedia/commons/2/2e/Double_Cluster.jpg",
        "texture": "double_cluster.jpg"
    }
]

# Ensure textures directory exists
os.makedirs('textures', exist_ok=True)

# Download images
for obj in new_objects:
    img_path = os.path.join('textures', obj['texture'])
    if not os.path.exists(img_path):
        print(f"Downloading {obj['name']} texture...")
        try:
            urllib.request.urlretrieve(obj['img_url'], img_path)
        except Exception as e:
            print(f"Failed to download {obj['name']} from {obj['img_url']}: {e}")
            print(f"Please download manually from the above URL and save it as: {img_path}\n")
            continue
    else:
        print(f"Texture for {obj['name']} already exists.")

# Load existing objects.json
with open('objects.json', 'r') as f:
    objects = json.load(f)

# Add new objects to objects.json
for obj in new_objects:
    # Use a default color (white) for deep sky objects
    entry = {
        "name": obj['name'],
        "size": obj['size'],
        "color": 16777215,  # white
        "texture": obj['texture'],
        "type": obj['type']
    }
    # Avoid duplicates
    if not any(o['name'] == obj['name'] for o in objects):
        objects.append(entry)

# Save updated objects.json
with open('objects.json', 'w') as f:
    json.dump(objects, f, indent=2)

print("Done! New objects added and textures downloaded.") 