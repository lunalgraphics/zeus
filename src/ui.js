import { builtInPresets, getPresetFromDOM, applyPresetToDOM } from './presets.js';

/**
 * GUI section definitions for ygui.
 * ygui is loaded as a global from lib/ygui.min.js.
 */
const guiSections = {
    Dimensions: [
        { label: "Mode", id: "generationMode", type: "select", options: ["Displacement", "Realistic"], attr: { value: "Displacement" } },
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
    Realistic: [
        { label: "Seed", id: "realisticSeed", type: "number", attr: { value: 42, step: 1 } },
        { label: "Detail", id: "realisticDetail", type: "number", attr: { value: 7, step: 1, min: 3, max: 10 } },
        { label: "Displacement", id: "realisticDisplacement", type: "number", attr: { value: 150, step: 5, min: 0 } },
        { label: "Branch Chance", id: "realisticBranchChance", type: "number", attr: { value: 0.04, step: 0.005, min: 0, max: 0.3 } },
        { label: "Branch Length", id: "realisticBranchLength", type: "number", attr: { value: 0.5, step: 0.05, min: 0, max: 1.0 } },
        { label: "Branch Angle", id: "realisticBranchAngle", type: "number", attr: { value: 35, step: 1, min: 0, max: 90 } },
        { label: "Max Branch Depth", id: "realisticMaxBranchDepth", type: "number", attr: { value: 4, step: 1, min: 0, max: 6 } },
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

// Sections that only apply to Displacement mode
const displacementOnlySections = ["Twitch", "Branches"];
// Sections that only apply to Realistic mode
const realisticOnlySections = ["Realistic"];

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
    document.querySelector("#generationMode").value = "Displacement";

    // Set initial section visibility based on mode
    updateModeVisibility("Displacement");
}

/**
 * Show/hide sections based on the selected generation mode.
 */
function updateModeVisibility(mode) {
    for (const sectionId of displacementOnlySections) {
        const header = findSectionHeader(sectionId);
        const container = document.getElementById(sectionId);
        if (header) header.style.display = mode === "Displacement" ? "" : "none";
        if (container) container.style.display = mode === "Displacement" ? "none" : "none"; // stays collapsed
    }
    for (const sectionId of realisticOnlySections) {
        const header = findSectionHeader(sectionId);
        const container = document.getElementById(sectionId);
        if (header) header.style.display = mode === "Realistic" ? "" : "none";
        if (container) container.style.display = mode === "Realistic" ? "none" : "none"; // stays collapsed
    }
}

/**
 * Find the <b> header element for a given section ID.
 */
function findSectionHeader(sectionId) {
    const displayName = sectionId.replaceAll("_", " ");
    for (const b of document.querySelectorAll("#options b")) {
        if (b.innerText === displayName) return b;
    }
    return null;
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

    // Mode change: show/hide relevant sections
    const modeSelect = document.querySelector("#generationMode");
    if (modeSelect) {
        modeSelect.addEventListener("input", () => {
            updateModeVisibility(modeSelect.value);
        });
    }

    return getPresetFromDOM;
}
