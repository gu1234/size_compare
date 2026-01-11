#!/usr/bin/env python3
"""
Script to add astronomical objects to objects.json with automatic texture downloading.

Usage:
    python3 add_stellar_objects.py

Dependencies:
    pip install requests pillow
"""

import os
import json
import sys
import requests
from PIL import Image
from io import BytesIO


def load_objects():
    """Load existing objects from objects.json"""
    try:
        with open('objects.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print("Error: objects.json not found")
        sys.exit(1)
    except json.JSONDecodeError:
        print("Error: objects.json is not valid JSON")
        sys.exit(1)


def save_objects(objects):
    """Save objects to objects.json with pretty formatting"""
    with open('objects.json', 'w') as f:
        json.dump(objects, f, indent=2)
    print(f"✓ Saved {len(objects)} objects to objects.json")


def download_texture(url, filename, target_size=(2048, 1024)):
    """
    Download texture from URL and save to textures/ directory.

    Args:
        url: URL of the texture image
        filename: Target filename (e.g., 'europa.jpg')
        target_size: Tuple of (width, height) for resizing. Use (2048, 1024) for spherical maps.

    Returns:
        True if successful, False otherwise
    """
    textures_dir = 'textures'
    if not os.path.exists(textures_dir):
        os.makedirs(textures_dir)

    filepath = os.path.join(textures_dir, filename)

    # Check if file already exists
    if os.path.exists(filepath):
        overwrite = input(f"  Texture {filename} already exists. Overwrite? (y/n): ").lower()
        if overwrite != 'y':
            print(f"  Using existing {filename}")
            return True

    try:
        print(f"  Downloading texture from {url}...")
        response = requests.get(url, timeout=30)
        response.raise_for_status()

        # Open image from response
        img = Image.open(BytesIO(response.content))

        # Convert to RGB if necessary (removes alpha channel for JPG)
        if img.mode != 'RGB' and filename.lower().endswith('.jpg'):
            img = img.convert('RGB')

        # Resize to target size
        if img.size != target_size:
            print(f"  Resizing from {img.size} to {target_size}...")
            img = img.resize(target_size, Image.Resampling.LANCZOS)

        # Save
        img.save(filepath, quality=85, optimize=True)
        file_size = os.path.getsize(filepath) / 1024 / 1024  # Size in MB
        print(f"  ✓ Saved {filename} ({file_size:.2f} MB)")
        return True

    except requests.exceptions.RequestException as e:
        print(f"  ✗ Error downloading texture: {e}")
        return False
    except Exception as e:
        print(f"  ✗ Error processing image: {e}")
        return False


def hex_to_decimal(hex_color):
    """Convert hex color string to decimal integer"""
    if hex_color.startswith('#'):
        hex_color = hex_color[1:]
    elif hex_color.startswith('0x'):
        hex_color = hex_color[2:]
    return int(hex_color, 16)


def get_texture_size(render_mode):
    """Get appropriate texture size based on render mode"""
    if render_mode == 'sphere':
        return (2048, 1024)  # Spherical projection map
    elif render_mode in ['flat', 'billboard']:
        return (2048, 2048)  # Square for face-on objects
    else:
        return (2048, 1024)  # Default


def add_object_interactive():
    """Interactive prompt to add a new astronomical object"""
    print("\n" + "="*60)
    print("Add New Astronomical Object")
    print("="*60)

    # Get object details
    name = input("\nObject name (e.g., 'Europa', 'Crab Nebula'): ").strip()
    if not name:
        print("Error: Name cannot be empty")
        return False

    # Get size
    while True:
        size_input = input("Size in kilometers (e.g., 3122): ").strip()
        try:
            size = float(size_input)
            if size <= 0:
                print("Error: Size must be positive")
                continue
            break
        except ValueError:
            print("Error: Please enter a valid number")

    # Get color
    while True:
        color_input = input("Fallback color in hex (e.g., #EFEFEF or EFEFEF): ").strip()
        try:
            color = hex_to_decimal(color_input)
            break
        except ValueError:
            print("Error: Invalid hex color format")

    # Get texture filename
    texture = input("Texture filename (e.g., 'europa.jpg'): ").strip()
    if not texture:
        print("Error: Texture filename cannot be empty")
        return False

    # Get type
    print("\nObject type:")
    print("  1. planet")
    print("  2. moon")
    print("  3. nebula")
    print("  4. galaxy")
    print("  5. star_cluster")
    print("  6. star")
    while True:
        type_choice = input("Choose type (1-6): ").strip()
        type_map = {
            '1': 'planet', '2': 'moon', '3': 'nebula',
            '4': 'galaxy', '5': 'star_cluster', '6': 'star'
        }
        if type_choice in type_map:
            obj_type = type_map[type_choice]
            break
        print("Error: Please choose 1-6")

    # Get parent (for moons)
    parent = None
    if obj_type == 'moon':
        parent = input("Parent body (e.g., 'Jupiter', or leave empty): ").strip()
        if not parent:
            parent = None

    # Get render mode
    print("\nRender mode:")
    print("  1. sphere (planets, moons, stars)")
    print("  2. flat (face-on galaxies, symmetric nebulae)")
    print("  3. billboard (irregular nebulae, always faces camera)")
    while True:
        mode_choice = input("Choose render mode (1-3): ").strip()
        mode_map = {'1': 'sphere', '2': 'flat', '3': 'billboard'}
        if mode_choice in mode_map:
            render_mode = mode_map[mode_choice]
            break
        print("Error: Please choose 1-3")

    # Get emissive
    emissive = input("Is object self-luminous/emissive? (y/n): ").strip().lower() == 'y'

    # Get texture URL
    texture_url = input("\nTexture URL (or leave empty to skip download): ").strip()

    # Download texture if URL provided
    if texture_url:
        target_size = get_texture_size(render_mode)
        success = download_texture(texture_url, texture, target_size)
        if not success:
            print("\nWarning: Texture download failed, but object will still be added.")
            continue_anyway = input("Continue adding object? (y/n): ").strip().lower()
            if continue_anyway != 'y':
                return False
    else:
        print(f"\nSkipping texture download. Make sure {texture} exists in textures/ directory.")

    # Build object
    obj = {
        "name": name,
        "size": size,
        "color": color,
        "texture": texture,
        "type": obj_type,
        "renderMode": render_mode
    }

    if parent:
        obj["parent"] = parent

    if emissive:
        obj["emissive"] = True

    # Show preview
    print("\n" + "-"*60)
    print("Object preview:")
    print(json.dumps(obj, indent=2))
    print("-"*60)

    confirm = input("\nAdd this object to objects.json? (y/n): ").strip().lower()
    if confirm != 'y':
        print("Cancelled.")
        return False

    # Load, append, save
    objects = load_objects()

    # Check for duplicates
    if any(o['name'] == name for o in objects):
        print(f"\nWarning: Object with name '{name}' already exists!")
        overwrite = input("Replace existing object? (y/n): ").strip().lower()
        if overwrite == 'y':
            objects = [o for o in objects if o['name'] != name]
        else:
            print("Cancelled.")
            return False

    objects.append(obj)
    save_objects(objects)
    print(f"\n✓ Successfully added '{name}' to objects.json ({len(objects)} total objects)")
    return True


def main():
    """Main entry point"""
    print("="*60)
    print("Stellar Objects Manager")
    print("="*60)
    print("\nThis script helps you add new astronomical objects to objects.json")
    print("with automatic texture downloading and resizing.\n")

    # Check dependencies
    try:
        import requests
        import PIL
    except ImportError as e:
        print(f"Error: Missing dependency - {e}")
        print("\nPlease install required packages:")
        print("  pip install requests pillow")
        sys.exit(1)

    # Check if objects.json exists
    if not os.path.exists('objects.json'):
        print("Error: objects.json not found in current directory")
        print("Please run this script from the project root directory.")
        sys.exit(1)

    # Main loop
    while True:
        success = add_object_interactive()

        print("\n" + "="*60)
        another = input("Add another object? (y/n): ").strip().lower()
        if another != 'y':
            break

    print("\n✓ Done!")


if __name__ == '__main__':
    main()
