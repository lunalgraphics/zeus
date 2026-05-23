import { builtInPresets, getPresetFromDOM, applyPresetToDOM } from './presets.js';

/**
 * GUI section definitions for ygui.
 * ygui is loaded as a global from lib/ygui.min.js.
 */
const guiSections = {
    Dimensions: [
        { label: "Length", id: "baseLength", type: "number", attr: { value: 1000, step: 1 } },
        { label: "Taper", id: "taper", type: "number", attr: { value: 70, step: 1, min: 0, max: 100 } },
    ],
    Shape: [
        { label: "Seed", id: "realisticSeed", type: "number", attr: { value: 42, step: 1 } },
        { label: "Detail", id: "realisticDetail", type: "number", attr: { value: 7, step: 1, min: 3, max: 10 } },
        { label: "Displacement", id: "realisticDisplacement", type: "number", attr: { value: 150, step: 5, min: 0 } },
    ],
    Branches: [
        { label: "Seed", id: "realisticBranchSeed", type: "number", attr: { value: 7919, step: 1 } },
        { label: "Chance", id: "realisticBranchChance", type: "number", attr: { value: 0.02, step: 0.005, min: 0, max: 0.3 } },
        { label: "Length", id: "realisticBranchLength", type: "number", attr: { value: 0.4, step: 0.05, min: 0, max: 1.0 } },
        { label: "Angle", id: "realisticBranchAngle", type: "number", attr: { value: 30, step: 1, min: 0, max: 90 } },
        { label: "Max Depth", id: "realisticMaxBranchDepth", type: "number", attr: { value: 2, step: 1, min: 0, max: 6 } },
    ],
    Core: [
        { label: "Size", id: "coreSize", type: "number", attr: { value: 7, step: 1 } },
        { label: "Softness", id: "softness", type: "number", attr: { value: 4, step: 1, min: 0, max: 29 } },
        { label: "Color", id: "coreColor", type: "color", attr: { value: "#FFFFFF" } },
    ],
    Glow: [
        { label: "Depth", id: "glowDepth", type: "number", attr: { value: 8, step: 1, min: 0, max: 20 } },
        { label: "Radius", id: "glowRadius", type: "number", attr: { value: 2.5, step: 0.1, min: 0 } },
        { label: "Color", id: "glowColor", type: "color", attr: { value: "#00AAFF" } },
    ],
    "Glow_Distortion": [
        { label: "Noise Type", id: "glowNoiseType", type: "select", options: ["Perlin", "Fractal"], attr: { value: "Fractal" } },
        { label: "Amount", id: "glowTwitchAmount", type: "number", attr: { value: 0, step: 1 } },
        { label: "Scale", id: "glowTwitchScale", type: "number", attr: { value: 0.008, step: 0.001 } },
        { label: "Complexity", id: "glowTwitchOctaves", type: "number", attr: { value: 7, step: 1, min: 1, max: 9 } },
        { label: "Seed", id: "glowTwitchSeed", type: "number", attr: { value: 1, step: 1 } },
    ],
};

/**
 * Build all GUI sections using the global ygui library.
 */
export function buildGUI() {
    for (const [sectionId, fields] of Object.entries(guiSections)) {
        const container = document.getElementById(sectionId);
        if (container) {
            ygui.buildGUIsection(fields, container);
        }
    }
    // Force correct initial values for select elements
    document.querySelector("#glowNoiseType").value = "Fractal";
}

/**
 * Set up accordion behavior: click section headers to expand/collapse.
 */
export function initAccordion() {
    for (const sectionHeader of document.querySelectorAll("#options b")) {
        sectionHeader.addEventListener("click", function () {
            const correspondingSection = document.getElementById(this.innerText.replaceAll(" ", "_"));
            if (!correspondingSection) return;
            if (correspondingSection.style.display === "none") {
                correspondingSection.style.display = "block";
            } else {
                correspondingSection.style.display = "none";
            }
            this.style.color = this.style.color === "" ? "deepskyblue" : "";
        });
    }
    // Start all sections collapsed
    for (const section of document.querySelectorAll("#options > div")) {
        section.style.display = "none";
    }
}

/**
 * Populate the preset selector dropdown and wire up change events.
 */
export function initPresets(markDirty) {
    const selector = document.querySelector("#presetselector");
    for (const presetName in builtInPresets) {
        const option = document.createElement("option");
        option.textContent = presetName;
        option.value = JSON.stringify(builtInPresets[presetName]);
        selector.appendChild(option);
    }
    selector.addEventListener("change", function () {
        applyPresetToDOM(JSON.parse(this.value), markDirty);
    });
}

/**
 * Wire up input change listeners for live re-rendering.
 * Returns a function to read current options from the DOM.
 */
export function initInputListeners(markDirty) {
    for (const inputElem of document.querySelectorAll("#options input, #options select")) {
        inputElem.addEventListener("input", () => markDirty());
        inputElem.addEventListener("focus", function () {
            const label = document.querySelector(`label[for=${this.id}]`);
            if (label) label.style.color = "deepskyblue";
        });
        inputElem.addEventListener("blur", function () {
            const label = document.querySelector(`label[for=${this.id}]`);
            if (label) label.style.color = "";
        });
    }
    return getPresetFromDOM;
}
