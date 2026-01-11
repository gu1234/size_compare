#!/usr/bin/env python3
"""
Validation script for objects.json

Checks:
- All required fields are present
- Texture files exist
- No duplicate names
- Valid renderMode values
- Positive size values
- Valid object types

Usage:
    python3 test_objects.py
"""

import os
import json
import sys


def validate_objects():
    """Validate all objects in objects.json"""

    # Load objects.json
    try:
        with open('objects.json', 'r') as f:
            objects = json.load(f)
    except FileNotFoundError:
        print("✗ Error: objects.json not found")
        return False
    except json.JSONDecodeError as e:
        print(f"✗ Error: objects.json is not valid JSON: {e}")
        return False

    if not isinstance(objects, list):
        print("✗ Error: objects.json should contain an array")
        return False

    if len(objects) == 0:
        print("✗ Error: objects.json is empty")
        return False

    issues = []
    warnings = []

    # Valid values for validation
    valid_render_modes = ['sphere', 'flat', 'billboard']
    valid_types = ['planet', 'moon', 'nebula', 'galaxy', 'star_cluster', 'star']

    # Track names for duplicate detection
    names = []

    print(f"Validating {len(objects)} objects...\n")

    for idx, obj in enumerate(objects):
        obj_id = obj.get('name', f'Object #{idx}')

        # Check required fields
        required_fields = ['name', 'size', 'color', 'texture']
        for field in required_fields:
            if field not in obj:
                issues.append(f"{obj_id}: Missing required field '{field}'")
            elif not obj[field]:
                issues.append(f"{obj_id}: Field '{field}' is empty")

        # Check name
        if 'name' in obj:
            names.append(obj['name'])

        # Check size
        if 'size' in obj:
            try:
                size = float(obj['size'])
                if size <= 0:
                    issues.append(f"{obj_id}: Size must be positive (got {size})")
            except (ValueError, TypeError):
                issues.append(f"{obj_id}: Size must be a number (got {obj['size']})")

        # Check color
        if 'color' in obj:
            try:
                color = int(obj['color'])
                if color < 0 or color > 16777215:  # 0xFFFFFF
                    warnings.append(f"{obj_id}: Color value seems unusual ({color})")
            except (ValueError, TypeError):
                issues.append(f"{obj_id}: Color must be an integer (got {obj['color']})")

        # Check texture file exists
        if 'texture' in obj and obj['texture']:
            texture_path = os.path.join('textures', obj['texture'])
            if not os.path.exists(texture_path):
                issues.append(f"{obj_id}: Texture file not found: {texture_path}")
            else:
                # Check file size
                size_mb = os.path.getsize(texture_path) / 1024 / 1024
                if size_mb > 5:
                    warnings.append(f"{obj_id}: Texture file is large ({size_mb:.1f} MB)")

        # Check optional fields
        if 'type' in obj:
            if obj['type'] not in valid_types:
                issues.append(f"{obj_id}: Invalid type '{obj['type']}' (must be one of {valid_types})")

        if 'renderMode' in obj:
            if obj['renderMode'] not in valid_render_modes:
                issues.append(f"{obj_id}: Invalid renderMode '{obj['renderMode']}' (must be one of {valid_render_modes})")

        if 'parent' in obj:
            if obj.get('type') != 'moon':
                warnings.append(f"{obj_id}: Has 'parent' field but type is not 'moon'")

        if 'emissive' in obj:
            if not isinstance(obj['emissive'], bool):
                issues.append(f"{obj_id}: emissive must be a boolean (got {obj['emissive']})")

    # Check for duplicate names
    if len(names) != len(set(names)):
        duplicates = [name for name in names if names.count(name) > 1]
        issues.append(f"Duplicate object names found: {set(duplicates)}")

    # Print results
    print("-" * 70)

    if issues:
        print(f"\n✗ VALIDATION FAILED - {len(issues)} issue(s) found:\n")
        for issue in issues:
            print(f"  • {issue}")
        success = False
    else:
        print(f"\n✓ All {len(objects)} objects validated successfully!")
        success = True

    if warnings:
        print(f"\n⚠ {len(warnings)} warning(s):\n")
        for warning in warnings:
            print(f"  • {warning}")

    print("\n" + "-" * 70)

    # Print summary
    print(f"\nSummary:")
    print(f"  Total objects: {len(objects)}")
    print(f"  Issues: {len(issues)}")
    print(f"  Warnings: {len(warnings)}")

    # Count by type
    type_counts = {}
    for obj in objects:
        obj_type = obj.get('type', 'unknown')
        type_counts[obj_type] = type_counts.get(obj_type, 0) + 1

    if type_counts:
        print(f"\n  Objects by type:")
        for obj_type, count in sorted(type_counts.items()):
            print(f"    {obj_type}: {count}")

    # Count by renderMode
    mode_counts = {}
    for obj in objects:
        mode = obj.get('renderMode', 'not specified')
        mode_counts[mode] = mode_counts.get(mode, 0) + 1

    if mode_counts:
        print(f"\n  Objects by renderMode:")
        for mode, count in sorted(mode_counts.items()):
            print(f"    {mode}: {count}")

    print()

    return success


def main():
    """Main entry point"""
    print("=" * 70)
    print("Objects Validation Script")
    print("=" * 70)
    print()

    success = validate_objects()

    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
