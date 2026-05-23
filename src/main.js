import { renderLightning } from './renderer.js';
import { buildGUI, initAccordion, initPresets, initInputListeners } from './ui.js';
import { initExport } from './export.js';
import { getAllOptionsFromDOM } from './presets.js';

// --- Canvas references ---
const canvases = {
    base: document.getElementById("baseCanv"),
    glow: document.getElementById("glowCanv"),
    final: document.getElementById("finalCanv"),
};

// --- Dirty flag for render loop ---
let unsavedChanges = false;
function markDirty() {
    unsavedChanges = true;
}

// --- Build UI ---
buildGUI();
initAccordion();
initPresets(markDirty);
initInputListeners(markDirty);
initExport(canvases);

// --- Resize canvases based on output settings ---
function updateCanvasSize(width, height) {
    for (const canv of Object.values(canvases)) {
        canv.width = width;
        canv.height = height;
    }
}

// --- Render function ---
function renderFromInputs() {
    const options = getAllOptionsFromDOM();

    // Update canvas size if changed
    const width = options.outputWidth || 2000;
    const height = options.outputHeight || 1000;
    if (canvases.final.width !== width || canvases.final.height !== height) {
        updateCanvasSize(width, height);
    }

    renderLightning(canvases, options);
}

// --- Initial render ---
renderFromInputs();

// --- Randomize button ---
document.getElementById("randomize").addEventListener("click", () => {
    const seedInput = document.getElementById("realisticSeed");
    if (seedInput) {
        seedInput.value = Math.floor(Math.random() * 10000);
    }
    const branchSeedInput = document.getElementById("realisticBranchSeed");
    if (branchSeedInput) {
        branchSeedInput.value = Math.floor(Math.random() * 10000);
    }
    markDirty();
});

// --- Keyboard shortcut: Space to randomize ---
document.addEventListener("keydown", (e) => {
    // Don't trigger when typing in an input
    if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
    if (e.code === "Space") {
        e.preventDefault();
        document.getElementById("randomize").click();
    }
});

// --- Render loop (polls for changes at ~50fps) ---
function tick() {
    if (unsavedChanges) {
        try {
            renderFromInputs();
        } catch (err) {
            console.error("Render error:", err);
        }
        unsavedChanges = false;
    }
    setTimeout(tick, 20);
}
tick();
