import Alpine from "alpinejs";

import renderLightning from "./renderLightning.js";
import activateExportButtons from "./ui/activateExportButtons.js";
import { guiSections, getDefaultOptions } from "./data/guiData.js";
import { availPresets, buildPresetSelector } from "./data/presets.js";

if (import.meta.env.DEV) {
    console.log("Welcome, developer.");
    window.Alpine = Alpine;
}

// Register an Alpine store that holds all lightning options.
Alpine.store("lightning", {
    options: getDefaultOptions(),
    sections: guiSections,
    unsavedChanges: false,

    // Called by x-model setters via $watch or x-effect
    markDirty() {
        this.unsavedChanges = true;
    },

    // Build a numeric-coerced copy of options for the renderer
    getNumericOptions() {
        const out = {};
        for (const [key, val] of Object.entries(this.options)) {
            out[key] = isNaN(val) ? val : parseFloat(val);
        }
        return out;
    },
});

Alpine.start();

activateExportButtons();
buildPresetSelector();

// Render loop — checks the store for dirty flag
let tick = () => {
    const store = Alpine.store("lightning");
    if (store.unsavedChanges) {
        try {
            renderLightning(store.getNumericOptions());
        } catch (err) {
            console.log(err);
        }
        store.unsavedChanges = false;
    }
    setTimeout(tick, 20);
};

// Initial render
const store = Alpine.store("lightning");
renderLightning(store.getNumericOptions());

tick();
