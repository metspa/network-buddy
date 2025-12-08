# Icon Generation Guide

## Quick Icon Generation

You can use one of these free online tools to generate all required icon sizes:

### Option 1: PWA Icon Generator (Recommended)
1. Visit https://www.pwabuilder.com/imageGenerator
2. Upload a 512x512 image
3. Download the generated icon pack
4. Extract all icons to this `public/icons/` folder

### Option 2: Real Favicon Generator
1. Visit https://realfavicongenerator.net/
2. Upload your icon image
3. Generate icons for all platforms
4. Download and extract to this folder

### Option 3: Favicon.io
1. Visit https://favicon.io/
2. Use text-to-icon or upload image
3. Generate and download
4. Place files in this folder

## Required Icon Sizes

The app needs these icon sizes:
- 72x72 (icon-72x72.png)
- 96x96 (icon-96x96.png)
- 128x128 (icon-128x128.png)
- 144x144 (icon-144x144.png)
- 152x152 (icon-152x152.png)
- 180x180 (icon-180x180.png) - iOS
- 192x192 (icon-192x192.png) - Android
- 384x384 (icon-384x384.png)
- 512x512 (icon-512x512.png) - Required for PWA

## Design Guidelines

**Icon Design Tips:**
- Use a simple, recognizable symbol (e.g., business card, network nodes, handshake)
- Primary color: Blue (#2563eb) to match app theme
- Ensure icon works at small sizes (72x72)
- Use flat design (no gradients or complex shadows)
- Consider a square or rounded square shape
- Make it distinctive and professional

**Suggested Icon Concept:**
- A business card with a scanning beam or AI sparkle
- Network nodes forming a connection
- Stylized "NB" monogram in a circle
- Handshake with digital elements

## Quick Placeholder (For Development)

For now, you can use a simple colored square:
1. Create a 512x512 blue square with "NB" text
2. Use the PWA Icon Generator to create all sizes
3. Replace with professional icon later

## Apple Touch Icon

Don't forget to also create:
- apple-touch-icon.png (180x180)
- Place in public/ root directory
