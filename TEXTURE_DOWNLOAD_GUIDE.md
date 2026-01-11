# Texture Download Guide

This guide provides instructions for downloading textures for the 25+ new astronomical objects.

## Current Status

✅ **Already downloaded:**
- Crab Nebula (crab_nebula.jpg) - 13.8 MB

⏳ **Need to download:**
- 6 moons (Io, Europa, Ganymede, Callisto, Titan, Enceladus)
- 9 more nebulae
- 6 galaxies
- 4 star clusters

---

## Method 1: Using add_stellar_objects.py Script (Recommended)

You can use the interactive script we created:

```bash
python3 add_stellar_objects.py
```

However, you'll need direct image URLs. See Method 2 for finding those URLs.

---

## Method 2: Manual Download from Sources

### Moons (6 objects)

#### Steve Albers' Planetary Maps
**Source:** https://stevealbers.net/albers/sos/sos.html

Visit the website and manually download the following textures:

1. **Io** - `io_rgb_cyl.jpg` (look for "Io" section, click download link)
2. **Europa** - `europa_rgb_cyl_juno.png` (convert to JPG after download)
3. **Ganymede** - `ganymede_4k.jpg`
4. **Callisto** - Look for Callisto section, download the available texture
5. **Titan** - `titan_rgb_cyl_www.jpg`
6. **Enceladus** - `enceladus_rgb_cyl_www.jpg`

**After downloading:**
- Save files to the `textures/` directory
- Rename to match objects.json entries (io.jpg, europa.jpg, etc.)
- If PNG files, either convert to JPG or update objects.json texture field

#### Alternative: Solar System Scope
**Source:** https://www.solarsystemscope.com/textures/

Free textures under Creative Commons Attribution 4.0 license. However, as of our search, only Earth's Moon is available, not the Galilean or Saturnian moons.

#### Alternative: NASA 3D Resources
**Source:** https://nasa3d.arc.nasa.gov/images

Search for each moon individually. NASA provides high-quality textures in the public domain.

---

### Nebulae (9 more objects)

We already have Crab Nebula. Need 9 more:

1. Orion Nebula (227 trillion km / 24 LY)
2. Eagle Nebula (662 trillion km / 70 LY)
3. Ring Nebula (9.5 trillion km / 1 LY)
4. Helix Nebula (27 trillion km / 2.87 LY)
5. Pillars of Creation (38 trillion km / 4 LY)
6. Horsehead Nebula (33 trillion km / 3.5 LY)
7. Cat's Eye Nebula (3.8 trillion km / 0.4 LY)
8. Butterfly Nebula (28 trillion km / 3 LY)
9. Lagoon Nebula (520 trillion km / 55 LY)

#### NASA Hubble Space Telescope
**Source:** https://hubblesite.org/

1. Search for each nebula by name
2. Look for high-resolution images
3. Download the largest available JPG/PNG
4. Save to `textures/` with filenames like `orion_nebula.jpg`

#### ESA Hubble
**Source:** https://esahubble.org/

Similar to NASA Hubble, search for nebulae and download high-res images.

#### Tips for Nebulae:
- Look for square or rectangular images (not necessarily spherical projections)
- 2048x2048 or 2048x1024 resolution is ideal
- These will use `renderMode: "billboard"` or `"flat"`

---

### Galaxies (6 objects)

1. Milky Way (1 quintillion km / 105,700 LY)
2. Andromeda Galaxy (2.08 quintillion km / 220,000 LY)
3. Triangulum Galaxy (567 quadrillion km / 60,000 LY)
4. Sombrero Galaxy (473 quadrillion km / 50,000 LY)
5. Whirlpool Galaxy (719 quadrillion km / 76,000 LY)
6. Pinwheel Galaxy (1.6 quintillion km / 170,000 LY)

#### Sources:
- **NASA Hubble:** https://hubblesite.org/ (search for each galaxy)
- **ESA Hubble:** https://esahubble.org/
- **NASA APOD:** https://apod.nasa.gov/ (Astronomy Picture of the Day archive)

#### Tips for Galaxies:
- Look for face-on views of spiral galaxies
- Use `renderMode: "flat"` for these
- Square images work best (2048x2048)

---

### Star Clusters (4 objects)

1. Pleiades (123 trillion km / 13 LY)
2. Omega Centauri (1,419 trillion km / 150 LY)
3. Globular Cluster M13 (1,372 trillion km / 145 LY)
4. Beehive Cluster (142 trillion km / 15 LY)

#### Sources:
- **NASA Hubble:** https://hubblesite.org/
- **ESA Hubble:** https://esahubble.org/

#### Tips:
- Star clusters can use `renderMode: "sphere"` or `"billboard"`
- Look for wide-field images showing the full cluster

---

## Method 3: Quick Start with Placeholder Textures

If you want to test the games before downloading all textures:

1. Create simple colored circles using any graphics program
2. Save as JPG files with appropriate names
3. Place in `textures/` directory
4. Test the games to ensure rendering works
5. Replace with real textures later

---

## After Downloading Textures

1. **Validate:** Run `python3 test_objects.py` to check all textures are present
2. **Test Size:** Textures should ideally be 500KB - 5MB each
3. **Resize if needed:** Use ImageMagick or online tools to resize large images:
   ```bash
   convert large_image.jpg -resize 2048x1024 output.jpg
   ```

---

## Image Conversion Tips

### Convert PNG to JPG:
```bash
convert input.png -quality 85 output.jpg
```

### Resize Image:
```bash
convert input.jpg -resize 2048x1024 output.jpg
```

### Batch resize all images in textures/:
```bash
for img in textures/*.jpg; do
    convert "$img" -resize 2048x1024 -quality 85 "${img%.jpg}_resized.jpg"
done
```

---

## Licensing Note

All sources mentioned (NASA, ESA, Steve Albers' maps) provide imagery in the public domain or under Creative Commons licenses. Always verify licensing before using in your project.

**NASA/ESA images:** Public domain
**Steve Albers' maps:** Compiled from public domain sources
**Solar System Scope:** CC BY 4.0

Include proper attribution in your project's README or LICENSE file.

---

## Next Steps

After downloading all textures:

1. ✅ Moons (6) - textures needed
2. ✅ Nebulae (10) - Crab Nebula done, 9 more needed
3. ✅ Galaxies (6) - all needed
4. ✅ Star Clusters (4) - all needed

Total: 25 textures to download (1 already complete)

Run `python3 test_objects.py` after each batch to verify progress!
