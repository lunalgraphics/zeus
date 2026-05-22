import { renderLightning } from './renderer.js';
import { buildGUI, initAccordion, initPresets, initInputListeners } from './ui.js';
import { initExport } from './export.js';

// --- Canvas references ---
const canvases = {
    base: document.getElementById("baseCanv"),
    displacementMap: document.getElementById("displacementMapCanv"),
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
const getOptions = initInputListeners(markDirty);
initExport(() => canvases.final);

// --- Render function ---
function renderFromInputs() {
    const options = getOptions();
    renderLightning(canvases, options);
}

// --- Initial render ---
renderFromInputs();

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
