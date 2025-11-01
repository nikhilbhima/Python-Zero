# PythonZero PWA Icons

## Icon Files

This directory contains the PWA icons for PythonZero.

### Current Setup
- `icon.svg` - Source SVG icon (scalable)
- Placeholder icons for PWA requirements

### Required Sizes for PWA
PWAs need icons in multiple sizes for different devices:
- 192x192 (Android home screen)
- 512x512 (Android splash screen)
- 180x180 (iOS home screen)
- 152x152 (iPad)
- 144x144 (Windows tiles)

### Generating Icons

To generate PNG icons from the SVG, you can use:

**Option 1: Online Tools**
- Visit https://realfavicongenerator.net/
- Upload `icon.svg`
- Generate all required sizes

**Option 2: ImageMagick (if installed)**
```bash
# 192x192
convert -background none -resize 192x192 icon.svg icon-192.png

# 512x512
convert -background none -resize 512x512 icon.svg icon-512.png

# Other sizes...
```

**Option 3: Use this Python script**
```python
# Requires: pip install cairosvg
from cairosvg import svg2png

sizes = {
    'icon-192.png': 192,
    'icon-512.png': 512,
    'icon-180.png': 180,
    'icon-152.png': 152,
    'icon-144.png': 144
}

for filename, size in sizes.items():
    svg2png(url='icon.svg', write_to=filename, output_width=size, output_height=size)
```

### Current State
The SVG icon is a placeholder with the PythonZero branding (terminal prompt, "Py", and "0").

For production, consider:
1. Hiring a designer for professional icon design
2. Using the SVG as a starting point
3. Ensuring the icon is recognizable at small sizes (48x48)

### Icon Design Guidelines
- Simple and recognizable
- Works at small sizes
- Represents the app (Python + terminal aesthetic)
- High contrast for visibility
- Matches brand colors (neon green #0aff0a on black #000000)
