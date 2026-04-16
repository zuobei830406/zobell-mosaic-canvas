# Zobell Mosaic Canvas Calculator

A professional canvas size calculator for mosaic/tile-based artwork. Helps artists find optimal canvas dimensions based on tile size, aspect ratio, and subdivision depth.

## Screenshots

![Ratio Search — find optimal canvas sizes with source image overlay](screenshots/ratio-search.jpg)

![Matrix Heatmap — visualize all width×height combinations by subdivision depth](screenshots/matrix-heatmap.jpg)

## Features

- **Ratio Search** — Find canvas sizes by aspect ratio (1:1, 4:3, 16:9, etc.) with tile alignment
- **Free Search** — Input custom width/height and find nearby tile-aligned sizes
- **Size Analysis** — Analyze any dimension's subdivision chain and tile compatibility
- **Matrix Heatmap** — Visual heatmap of all width×height combinations colored by subdivision depth
- **Source Image Overlay** — Load a reference image onto the canvas preview
- **Subdivision Tiers** — S/A/B/C/D grading system based on recursive subdivision depth

## Quick Start

### Option 1: Browser (development)

```bash
npm install
npm run dev
```

### Option 2: Desktop App (macOS)

Runs as a native window via [pywebview](https://pywebview.flowrl.com/).

```bash
# First time setup
npm install
npm run build
python3 -m venv venv
source venv/bin/activate
pip install pywebview

# Run
./start.sh
```

Or double-click `start.command` in Finder.

## Tech Stack

- React 19 + Vite
- pywebview (desktop wrapper)
- Single-file component (`src/canvas-tool.jsx`)

## License

MIT
