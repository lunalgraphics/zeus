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
    Twitch: [
        { label: "Noise Type", id: "noiseType", type: "select", options: ["Perlin", "Fractal"], attr: { value: "Fractal" } },
        { label: "Amount", id: "twitchAmount", type: "number", attr: { value: 400, step: 1 } },
        { label: "Scale", id: "twitchScale", type: "number", attr: { value: 0.005, step: 0.001 } },
        { label: "Complexity", id: "twitchOctaves", type: "number", attr: { value: 5, step: 1, min: 1, max: 9 } },
        { label: "Seed", id: "twitchSeed", type: "number", attr: { value: 8, step: 1 } },
    ],
    Branches: [
        { label: "Amount", id: "numBranches", type: "number", attr: { value: 5, step: 1 } },
        { label: "Max Length", id: "branchLen", type: "number", attr: { value: 300, step: 1 } },
        { label: "Length Delta", id: "branchLenDelta", type: "number", attr: { value: 54, step: 1, min: 0 } },
        { label: "Angle", id: "branchAngle", type: "number", attr: { value: 33, step: 1, min: 0, max: 360 } },
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
    document.querySelector("#noiseType").value = "Fractal";
}

/**
 * Set up accordion behavior: click section headers to expand/collapse.
 */
export function initAccordion() {
    for (const sectionHeader of document.querySelectorAll("#options b")) {
        sectionHeader.addEventListener("click", function () {
            const correspondingSection = document.getElementById(this.innerText.replaceAll(" ", "_"));
            if (correspondingSection.style.display === "none") {
                correspondingSection.style.display = "block";
            } else {
                correspondingSection.style.display = "none";
            }
            this.style.color = this.style.color === "" ? "deepskyblue" : "";
        });
    }
    // Start all sections collapsed
    for (const section of document.querySelectorAll("#options div")) {
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
            document.querySelector(`label[for=${this.id}]`).style.color = "deepskyblue";
        });
        inputElem.addEventListener("blur", function () {
            document.querySelector(`label[for=${this.id}]`).style.color = "";
        });
    }
    return getPresetFromDOM;
}
