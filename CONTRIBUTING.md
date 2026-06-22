# Contributing to Zeus

Thanks for your interest in contributing! This guide covers how to get set up and what to keep in mind when submitting changes.

## Getting Started

1. Fork the repository and clone your fork
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Make your changes and verify they work in the browser

## Project Layout

- `src/renderLightning.js` — Core rendering pipeline (tree building, displacement, drawing)
- `src/data/guiData.js` — GUI field definitions (add new parameters here)
- `src/data/presets.js` — Built-in presets (update when adding/removing parameters)
- `src/utils/` — Reusable utility classes (noise, pixel manipulation, filters)
- `src/ui/` — UI interaction handlers
- `photoshop-plugin/` — Adobe Photoshop UXP plugin wrapper
- `electron-app/` — Electron desktop app wrapper

## Development Guidelines

### Code Style

- No linter is enforced, but keep formatting consistent with existing code
- Use `let`/`const` (no `var`)
- Document functions with JSDoc comments describing parameters and behavior
- Add `tooltip` strings when creating new GUI fields in `guiData.js`

### Adding a New Parameter

1. Add the field definition to the appropriate section in `src/data/guiData.js`
2. Use it in `src/renderLightning.js` (or wherever relevant)
3. Add a sensible default to every preset in `src/data/presets.js`
4. Test across multiple presets to make sure nothing breaks

### Rendering Changes

- The renderer outputs to a 2000×1000 canvas — keep this resolution in mind for pixel-level math
- Displacement is Y-only and shared across all strands (this keeps branch junctions visually connected)
- The two-pass approach (build tree → render strands) exists to prevent branch crossover; changes to branching logic should maintain this separation
- Performance matters — the renderer runs on every parameter change. Avoid unnecessary allocations in hot loops

### Testing

There's no automated test suite. Verify your changes visually:
- Try all built-in presets
- Test edge cases (0 branches, max depth, extreme displacement values)
- Check that the Electron build still works: `npm run build:electron`

## Submitting Changes

1. Create a feature branch from `master`
2. Keep commits focused and descriptive
3. Open a pull request with:
   - A summary of what changed
   - Screenshots if there's a visual difference
   - Any presets that demonstrate the change well

## Build Targets

If your change affects the rendering or UI, make sure it works across build modes:

| Command | Target |
|---------|--------|
| `npm run dev` | Local dev server |
| `npm run build` | Web (GitHub Pages) |
| `npm run build:photoshop` | Photoshop UXP plugin |
| `npm run build:electron` | Electron desktop app |

The Photopea build (`npm run build:photopea`) uses the same code as web but outputs to a different directory.

## Reporting Issues

When filing a bug, include:
- The preset you were using (or custom parameter values)
- Browser/platform
- Screenshot of the issue
- Console errors if any

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
