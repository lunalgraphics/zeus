import ygui from "./ygui.js";

export default function buildGUI() {
    ygui.buildGUIsection([
        {
            label: "Length",
            id: "baseLength",
            type: "number",
            attr: { value: 1000, step: 1 }
        },
        {
            label: "Taper",
            id: "taper",
            type: "number",
            attr: { value: 70, step: 1, min: 0, max: 100, }
        },
    ], document.getElementById("Dimensions"));
    ygui.buildGUIsection([
        {
            label: "Noise Type",
            id: "noiseType",
            type: "select",
            options: ["Perlin", "Fractal"],
            attr: { value: "Fractal" },
        },
        {
            label: "Amount",
            id: "twitchAmount",
            type: "number",
            attr: { value: 400, step: 1 }
        },
        {
            label: "Scale",
            id: "twitchScale",
            type: "number",
            attr: { value: 0.005, step: 0.001 }
        },
        {
            label: "Complexity",
            id: "twitchOctaves",
            type: "number",
            attr: { value: 5, step: 1, min: 1, max: 9 }
        },
        {
            label: "Seed",
            id: "twitchSeed",
            type: "number",
            attr: { value: 8, step: 1 }
        }
    ], document.getElementById("Twitch"));
    ygui.buildGUIsection([
        {
            label: "Amount",
            id: "numBranches",
            type: "number",
            attr: { value: 5, step: 1 }
        },
        {
            label: "Max Length",
            id: "branchLen",
            type: "number",
            attr: { value: 300, step: 1 }
        },
        {
            label: "Length Delta",
            id: "branchLenDelta",
            type: "number",
            attr: { value: 54, step: 1, min: 0 }
        },
        {
            label: "Angle",
            id: "branchAngle",
            type: "number",
            attr: { value: 33, step: 1, min: 0, max: 360 }
        }
    ], document.getElementById("Branches"));
    ygui.buildGUIsection([
        {
            label: "Size",
            id: "coreSize",
            type: "number",
            attr: { value: 7, step: 1 }
        },
        {
            label: "Softness",
            id: "softness",
            type: "number",
            attr: { value: 4, step: 1, min: 0, max: 29, }
        },
        {
            label: "Color",
            id: "coreColor",
            type: "color",
            attr: { value: "#FFFFFF" }
        }
    ], document.getElementById("Core"));
    ygui.buildGUIsection([
        {
            label: "Depth",
            id: "glowDepth",
            type: "number",
            attr: { value: 8, step: 1, min: 0, max: 20 }
        },
        {
            label: "Radius",
            id: "glowRadius",
            type: "number",
            attr: { value: 2.5, step: 0.1, min: 0, }
        },
        {
            label: "Color",
            id: "glowColor",
            type: "color",
            attr: { value: "#00AAFF" }
        }
    ], document.getElementById("Glow"));
    ygui.buildGUIsection([
        {
            label: "Noise Type",
            id: "glowNoiseType",
            type: "select",
            options: ["Perlin", "Fractal"],
            attr: { value: "Fractal" }
        },
        {
            label: "Amount",
            id: "glowTwitchAmount",
            type: "number",
            attr: { value: 0, step: 1 }
        },
        {
            label: "Scale",
            id: "glowTwitchScale",
            type: "number",
            attr: { value: 0.008, step: 0.001 }
        },
        {
            label: "Complexity",
            id: "glowTwitchOctaves",
            type: "number",
            attr: { value: 7, step: 1, min: 1, max: 9 }
        },
        {
            label: "Seed",
            id: "glowTwitchSeed",
            type: "number",
            attr: { value: 1, step: 1 }
        }
    ], document.getElementById("Glow_Distortion"));
    document.querySelector("#glowNoiseType").value = "Fractal"; //????
    document.querySelector("#noiseType").value = "Fractal";
}