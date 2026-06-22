# Zeus — Photoshop Plugin

Adobe Photoshop UXP panel plugin that embeds the Zeus lightning renderer in a webview and inserts rendered lightning directly into the active document as a Smart Object layer.

## How It Works

The plugin uses a UXP webview to load the Vite-built Zeus web app. When the user clicks "Add to Document":

1. The web app encodes the final canvas as raw RGBA pixel data (base64)
2. The webview posts a message to the host UXP script (`index.js`)
3. The host script decodes the data and creates a pixel layer via the Photoshop Imaging API
4. A hidden text layer stores the current preset settings as metadata (for future re-editing)
5. Both layers are grouped into a Smart Object named "Zeus" with Screen blend mode
6. Free Transform is activated so the user can immediately position/scale the effect

## Files

```
photoshop-plugin/
├── manifest.json       # UXP plugin manifest (v5)
├── index.html          # Host document: webview container + script loader
├── index.js            # UXP host script: message handler, layer creation
├── icons/              # Plugin panel icons (28×28 at 1x/2x/4x)
└── webview-contents/   # (Built) Vite output from `npm run build:photoshop`
```

## Building

From the project root:

```bash
npm run build:photoshop
```

This builds the web app into `photoshop-plugin/webview-contents/`. The plugin is then ready to load in Photoshop via UDT (UXP Developer Tools).

## Loading in Photoshop

1. Open UXP Developer Tools (Creative Cloud → UXP Developer Tools)
2. Click "Add Plugin" and select the `photoshop-plugin/manifest.json` file
3. Click "Load" to install the plugin in Photoshop
4. The Zeus panel appears under Window → Extensions → Zeus

## Requirements

- Adobe Photoshop 23.3.0 or later (UXP manifest v5)
- UXP Developer Tools for development/debugging

## Manifest Details

| Field | Value |
|-------|-------|
| Plugin ID | `com.lunalgraphics.zeus` |
| Panel size | 320×480 (preferred), 240×240 min |
| Permissions | Webview (local rendering + message bridge), launch process |
| Allowed domains | `https://yikuansun.github.io`, `https://*.adobe.com` |

## Architecture Notes

- The webview loads the same app as the web version, but detects `VITE_BUILD_MODE=photoshop` at build time
- Export logic in `src/ui/activateExportButtons.js` switches behavior based on build mode
- Raw RGBA transfer (not PNG) avoids encoding/decoding overhead and works around UXP canvas limitations
- Preset metadata in a hidden text layer enables potential future "edit existing Zeus layer" functionality
