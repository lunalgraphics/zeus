# Zeus

Procedural noise-based lightning and electricity renderer. Generates stylized lightning bolts on an HTML5 canvas with full control over shape, branching, glow, and distortion. Ships as a web app, Electron desktop app, Photoshop plugin, and Photopea plugin.

## Features

- **Noise-displaced strands** — Fractal noise or Perlin turbulence displaces bolt geometry for natural, jagged shapes
- **Recursive branching** — Configurable depth, angle, length interpolation, and depth shrink factor
- **Crossing prevention** — Pre-displaced segment intersection checks prune overlapping branches before rendering
- **Stochastic variation** — Seeded PRNG (mulberry32) controls branch count and length variance deterministically
- **Glow and core rendering** — Multi-pass Gaussian blur glow with separate color, plus lens blur (SVG feConvolveMatrix) on the core
- **Glow distortion** — Optional noise overlay on the glow for atmospheric texture
- **Presets** — Built-in presets (Strike, Flash, Arc, Laser Blast, Lightsaber, Voldemort, Wavefunction) for quick starting points
- **Multi-platform export** — PNG download, Photoshop layer insertion (UXP), Photopea layer insertion, Electron standalone

## Project Structure

```
├── index.html                  # Main HTML shell (Alpine.js reactive GUI)
├── package.json                # Root package (Vite, Alpine.js, photopea)
├── vite.config.js              # Build config with VITE_BUILD_MODE routing
├── src/
│   ├── main.js                 # App entry: Alpine store, preset loading, render trigger
│   ├── renderLightning.js      # Core rendering pipeline
│   ├── style.css               # UI styles
│   ├── data/
│   │   ├── guiData.js          # GUI field definitions, defaults, tooltips
│   │   └── presets.js          # Built-in preset configurations
│   ├── ui/
│   │   └── activateExportButtons.js  # Platform-aware export logic
│   └── utils/
│       ├── ConvolveMatrixFilter.js   # SVG feConvolveMatrix wrapper (lens blur)
│       ├── FractalNoise.js           # SVG feTurbulence noise texture generator
│       ├── NumberCircle.js           # Circular convolution kernel generator
│       └── PixelManipulator.js       # Raw pixel read/write on canvas
├── photoshop-plugin/           # Adobe Photoshop UXP plugin
├── electron-app/               # Electron desktop wrapper
├── public/                     # Static assets (icon)
└── .github/workflows/          # CI/CD (GitHub Pages deploy, Electron builds)
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Development

```bash
npm install
npm run dev
```

Opens a local Vite dev server with hot reload.

### Build

```bash
# Web (GitHub Pages)
npm run build

# Photopea plugin
npm run build:photopea

# Photoshop plugin (UXP webview)
npm run build:photoshop

# Electron app assets
npm run build:electron
```

Build output directories are controlled by `VITE_BUILD_MODE` in `vite.config.js`:
| Mode | Output Directory |
|------|-----------------|
| (default) | `dist/` |
| `photopea` | `photopea-plugin/` |
| `photoshop` | `photoshop-plugin/webview-contents/` |
| `electron` | `electron-app/app/` |

### Deploy

Push to `master` triggers the GitHub Actions workflow which builds the web app + Photopea plugin and deploys to GitHub Pages.

## Rendering Pipeline

1. **Displacement map generation** — `FractalNoise` creates a 2000×1000 noise texture via SVG feTurbulence
2. **Tree construction** — `buildTree` recursively generates branch structure, checking pre-displaced straight segments for intersection to prevent crossover
3. **Strand rendering** — `renderStrand` draws each strand as connected line segments with round caps, sampling the displacement map for Y-offset at each pixel
4. **Glow pass** — The white bolt is colorized, then drawn N times with increasing blur (quadratic radius) in screen mode
5. **Core pass** — Bolt is re-colorized to core color and composited with lens blur (circular convolution kernel)
6. **Glow distortion** — Optional noise overlay with saturation/contrast adjustments

## Configuration

All parameters are defined in `src/data/guiData.js` with tooltips. Key sections:

- **Dimensions** — Bolt length and taper
- **Twitch** — Noise displacement (type, amount, scale, complexity, seed)
- **Branches** — Count, length range, variance, depth shrink, angle, recursion depth, seed
- **Core** — Size, softness (lens blur), color
- **Glow** — Depth (passes), radius, color
- **Glow Distortion** — Secondary noise overlay on the glow

## License

MIT License. See [LICENSE](LICENSE) for details.
