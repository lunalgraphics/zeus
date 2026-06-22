# Zeus — Electron App

Standalone desktop application wrapping the Zeus lightning renderer using Electron. Produces portable executables for Windows, macOS, and Linux.

## How It Works

The Electron app loads the pre-built Zeus web app from the `app/` subdirectory. It provides:

- A frameless, maximized window with the full Zeus interface
- Sandboxed rendering with context isolation (no Node.js access from the renderer)
- Platform-native window management (dock behavior on macOS, quit on close elsewhere)
- PNG export via the browser's native download dialog

## Files

```
electron-app/
├── package.json    # Electron dependencies and electron-builder config
├── main.js         # Electron main process (window creation, lifecycle)
├── app/            # (Built) Vite output from `npm run build:electron`
└── resources/      # Build resources (icons for electron-builder)
```

## Building

### 1. Build the web assets

From the project root:

```bash
npm install
npm run build:electron
```

This outputs the Vite build to `electron-app/app/`.

### 2. Build the Electron executable

```bash
cd electron-app
npm install
npm run build          # All platforms (macOS + Linux + Windows)

# Or build for a specific platform:
npm run build:win32    # Windows portable (.exe)
npm run build:darwin   # macOS (.zip)
npm run build:linux    # Linux (.deb)
```

Built artifacts are placed in `electron-app/dist/`.

### 3. Run in development

```bash
cd electron-app
npm start
```

This launches Electron loading from the local `app/` directory. Make sure you've run `npm run build:electron` from the root first.

## CI/CD

The GitHub Actions workflow (`.github/workflows/electron-build.yml`) runs on manual dispatch:

- Matrix build across `ubuntu-latest`, `macos-latest`, `windows-latest`
- Builds web assets first, then runs electron-builder
- Uploads platform-specific artifacts (`.exe`, `.zip`, `.deb`)
- Code signing disabled (`CSC_IDENTITY_AUTO_DISCOVERY=false`)

## electron-builder Configuration

| Platform | Target | Output |
|----------|--------|--------|
| Windows | `portable` | Single `.exe` (no installer) |
| macOS | `zip` | `.zip` archive |
| Linux | `deb` | Debian package |

App ID: `com.electron.lunalgraphics-zeus`

## Requirements

- Node.js 20+
- npm
- Electron 37+ (specified in devDependencies)

## Security

The renderer process runs in a sandbox with:
- `contextIsolation: true` — No shared JavaScript context between main and renderer
- `sandbox: true` — OS-level process sandboxing
- `devTools` disabled in packaged builds
