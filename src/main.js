/**
 * Application entry point.
 * Initializes the Alpine.js reactive store, loads the default preset,
 * wires up the GUI sections to the renderer, and triggers the initial render.
 */
import Alpine from "alpinejs";

import renderLightning from "./renderLightning.js";
import activateExportButtons from "./ui/activateExportButtons.js";
import { guiSections, getDefaultOptions } from "./data/guiData.js";
import { availPresets, setPreset } from "./data/presets.js";

if (import.meta.env.DEV) {
    console.log("Welcome, developer.");
    window.Alpine = Alpine;
}

Alpine.store("lightning", {
    options: getDefaultOptions(),
    sections: guiSections,

    render() {
        const numericOptions = {};
        for (const [key, val] of Object.entries(this.options)) {
            numericOptions[key] = isNaN(val) ? val : parseFloat(val);
        }
        try {
            renderLightning(numericOptions);
        } catch (err) {
            console.log(err);
        }
    },
});

setPreset(availPresets["Strike"]);

// Build preset selector
Alpine.store("availPresets", availPresets);
Alpine.store("setPreset", setPreset);

Alpine.start();

activateExportButtons();

// Initial render
Alpine.store("lightning").render();
