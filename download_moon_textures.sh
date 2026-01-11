#!/bin/bash
#
# Download moon textures from Steve Albers' planetary maps collection
# These textures are compiled from NASA/ESA public domain imagery
#
# Source: https://stevealbers.net/albers/sos/sos.html
#
# Usage: bash download_moon_textures.sh
#

BASE_URL="https://stevealbers.net/albers/sos"
TEXTURES_DIR="textures"

# Create textures directory if it doesn't exist
mkdir -p "$TEXTURES_DIR"

echo "Downloading moon textures from Steve Albers' planetary maps..."
echo "================================================================"

# Download Io
echo "Downloading Io..."
curl -L "${BASE_URL}/io_rgb_cyl.jpg" -o "${TEXTURES_DIR}/io.jpg"

# Download Europa
echo "Downloading Europa..."
curl -L "${BASE_URL}/europa_rgb_cyl_juno.png" -o "${TEXTURES_DIR}/europa_temp.png"
# Convert PNG to JPG if needed (requires ImageMagick)
if command -v convert &> /dev/null; then
    convert "${TEXTURES_DIR}/europa_temp.png" "${TEXTURES_DIR}/europa.jpg"
    rm "${TEXTURES_DIR}/europa_temp.png"
else
    mv "${TEXTURES_DIR}/europa_temp.png" "${TEXTURES_DIR}/europa.png"
    echo "Note: Installed europa as PNG. Consider converting to JPG or update objects.json texture field"
fi

# Download Ganymede
echo "Downloading Ganymede..."
curl -L "${BASE_URL}/ganymede_4k.jpg" -o "${TEXTURES_DIR}/ganymede.jpg"

# Download Callisto
echo "Downloading Callisto..."
# Note: Callisto texture might need alternative source
echo "Warning: Callisto texture URL not directly available, trying alternative..."
curl -L "${BASE_URL}/callisto_rgb_cyl.jpg" -o "${TEXTURES_DIR}/callisto.jpg" || \
    echo "Failed to download Callisto, may need manual download"

# Download Titan
echo "Downloading Titan..."
curl -L "${BASE_URL}/titan_rgb_cyl_www.jpg" -o "${TEXTURES_DIR}/titan.jpg"

# Download Enceladus
echo "Downloading Enceladus..."
curl -L "${BASE_URL}/enceladus_rgb_cyl_www.jpg" -o "${TEXTURES_DIR}/enceladus.jpg"

echo ""
echo "================================================================"
echo "Download complete! Checking results..."
echo ""

# Check which files were downloaded successfully
for moon in io europa ganymede callisto titan enceladus; do
    if [ -f "${TEXTURES_DIR}/${moon}.jpg" ] || [ -f "${TEXTURES_DIR}/${moon}.png" ]; then
        size=$(du -h "${TEXTURES_DIR}/${moon}".* 2>/dev/null | tail -1 | cut -f1)
        echo "✓ ${moon}: ${size}"
    else
        echo "✗ ${moon}: MISSING"
    fi
done

echo ""
echo "If any textures are missing, you can manually download them from:"
echo "https://stevealbers.net/albers/sos/sos.html"
echo ""
echo "Run 'python3 test_objects.py' to validate all textures are present."
