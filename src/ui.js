import { builtInPresets, getPresetFromDOM, applyPresetToDOM } from './presets.js';

/**
 * Tooltip descriptions for parameters.
 */
const tooltips = {
    baseLength: "Length of the bolt in pixels",
    taper: "How much the bolt thins toward the end (0 = uniform, 100 = full taper)",
    outputWidth: "Output canvas width in pixels",
    outputHeight: "Output canvas height in pixels",
    realisticSeed: "Random seed for bolt shape (same seed = same shape)",
    realisticDetail: "Subdivision depth (higher = more jagged detail)",
    realisticDisplacement: "How far the bolt deviates from a straight line",
    realisticBranchSeed: "Random seed for branch placement",
    realisticBranchChance: "Probability of a branch at each evaluation point",
    realisticBranchLength: "Branch length as fraction of remaining trunk",
    realisticBranchAngle: "Max angle branches can deviate from trunk tangent",
    realisticMaxBranchDepth: "How many levels of sub-branching (0 = no branches)",
    coreSize: "Thickness of the bolt core in pixels",
    softness: "Lens blur radius for the core (higher = softer edges)",
    coreColor: "Color of the bright inner core",
    glowDepth: "Number of blur passes for the glow (more = wider glow)",
    glowRadius: "Blur radius multiplier for glow spread",
    glowColor: "Color of the outer glow",
    glowNoiseType: "Noise algorithm for glow distortion texture",
    glowTwitchAmount: "Intensity of glow distortion overlay",
    glowTwitchScale: "Scale of the distortion noise pattern",
    glowTwitchOctaves: "Complexity of the distortion noise",
    glowTwitchSeed: "Random seed for glow distortion pattern",
};

/**
 * GUI section definitions for ygui.
 */
const guiSections = {
    Output: [
        { label: "Width", id: "outputWidth", type: "number", attr: { value: 2000, step: 100, min: 100, max: 8000 } },
        { label: "Height", id: "outputHeight", type: "number", attr: { value: 1000, step: 100, min: 100, max: 4000 } },
    ],
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

    // Apply tooltips to labels
    for (const [id, tip] of Object.entries(tooltips)) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (label) label.title = tip;
    }
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
    // Start all sections collapsed except "Shape" (most useful for exploration)
    for (const section of document.querySelectorAll("#options > div")) {
        section.style.display = "none";
    }
    const shapeSection = document.getElementById("Shape");
    if (shapeSection) {
        shapeSection.style.display = "block";
        const shapeHeader = findSectionHeader("Shape");
        if (shapeHeader) shapeHeader.style.color = "deepskyblue";
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
 * Populate the preset selector dropdown and wire up change events.
 * Includes saved custom presets from localStorage.
 */
export function initPresets(markDirty) {
    const selector = document.querySelector("#presetselector");

    // Built-in presets
    for (const presetName in builtInPresets) {
        const option = document.createElement("option");
        option.textContent = presetName;
        option.value = JSON.stringify(builtInPresets[presetName]);
        selector.appendChild(option);
    }

    // Apply the first preset as default
    const firstPresetKey = Object.keys(builtInPresets)[0];
    if (firstPresetKey) {
        applyPresetToDOM(builtInPresets[firstPresetKey], markDirty);
    }

    // Custom presets from localStorage
    const customPresets = loadCustomPresets();
    if (Object.keys(customPresets).length > 0) {
        const separator = document.createElement("option");
        separator.disabled = true;
        separator.textContent = "── Custom ──";
        selector.appendChild(separator);

        for (const presetName in customPresets) {
            const option = document.createElement("option");
            option.textContent = presetName;
            option.value = JSON.stringify(customPresets[presetName]);
            selector.appendChild(option);
        }
    }

    selector.addEventListener("change", function () {
        applyPresetToDOM(JSON.parse(this.value), markDirty);
    });

    // Reset button: re-apply the currently selected preset
    document.getElementById("resetPreset").addEventListener("click", () => {
        if (selector.value) {
            applyPresetToDOM(JSON.parse(selector.value), markDirty);
        }
    });

    // Save preset button
    document.getElementById("savePreset").addEventListener("click", () => {
        const name = prompt("Preset name:");
        if (!name) return;
        const data = getPresetFromDOM();
        const presets = loadCustomPresets();
        presets[name] = data;
        saveCustomPresets(presets);
        // Add to dropdown
        const option = document.createElement("option");
        option.textContent = name;
        option.value = JSON.stringify(data);
        selector.appendChild(option);
        selector.value = option.value;
    });

    // Export preset button
    document.getElementById("exportPreset").addEventListener("click", () => {
        const data = getPresetFromDOM();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "zeus-preset.json";
        a.click();
        URL.revokeObjectURL(a.href);
    });

    // Import preset button
    document.getElementById("importPreset").addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        input.addEventListener("change", () => {
            const file = input.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const data = JSON.parse(reader.result);
                    applyPresetToDOM(data, markDirty);
                } catch (e) {
                    alert("Invalid preset file.");
                }
            };
            reader.readAsText(file);
        });
        input.click();
    });
}

function loadCustomPresets() {
    try {
        return JSON.parse(localStorage.getItem("zeus-custom-presets") || "{}");
    } catch {
        return {};
    }
}

function saveCustomPresets(presets) {
    localStorage.setItem("zeus-custom-presets", JSON.stringify(presets));
}

/**
 * Wire up input change listeners for live re-rendering.
 * Returns a function to read current options from the DOM.
 */
export function initInputListeners(markDirty) {
    for (const inputElem of document.querySelectorAll("#options input, #options select")) {
        inputElem.addEventListener("input", () => markDirty());
        inputElem.addEventListener("focus", function () {
            const label = document.querySelector(`label[for="${this.id}"]`);
            if (label) label.style.color = "deepskyblue";
        });
        inputElem.addEventListener("blur", function () {
            const label = document.querySelector(`label[for="${this.id}"]`);
            if (label) label.style.color = "";
        });
    }
    return getPresetFromDOM;
}
