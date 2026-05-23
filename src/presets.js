export const builtInPresets = {
    "Thunderbolt": {"outputWidth":2000,"outputHeight":1000,"baseLength":1200,"taper":75,"realisticSeed":5061,"realisticDetail":7,"realisticDisplacement":180,"realisticBranchSeed":8737,"realisticBranchChance":0.025,"realisticBranchLength":0.4,"realisticBranchAngle":15,"realisticMaxBranchDepth":2,"coreSize":6,"corePulse":15,"softness":3,"coreColor":"#ffffff","glowDepth":8,"glowRadius":2.2,"glowColor":"#6699ff","glowNoiseType":"Fractal","glowTwitchAmount":20,"glowTwitchScale":0.006,"glowTwitchOctaves":5,"glowTwitchSeed":3},
    "The Flash": {"outputWidth":2000,"outputHeight":1000,"baseLength":1176,"taper":81,"realisticSeed":4105,"realisticDetail":7,"realisticDisplacement":120,"realisticBranchSeed":8160,"realisticBranchChance":0.04,"realisticBranchLength":0.4,"realisticBranchAngle":25,"realisticMaxBranchDepth":2,"coreSize":7,"corePulse":10,"softness":5,"coreColor":"#ffe070","glowDepth":9,"glowRadius":2,"glowColor":"#ff7300","glowNoiseType":"Fractal","glowTwitchAmount":0,"glowTwitchScale":0.008,"glowTwitchOctaves":7,"glowTwitchSeed":1},
    "Arc": {"baseLength":770,"taper":0,"coreSize":3,"corePulse":50,"softness":3,"coreColor":"#ffffff","glowDepth":11,"glowRadius":1.1,"glowColor":"#ffffff","glowNoiseType":"Perlin","glowTwitchAmount":0,"glowTwitchScale":0.008,"glowTwitchOctaves":7,"glowTwitchSeed":1,"realisticSeed":80,"realisticDetail":8,"realisticDisplacement":180,"realisticBranchSeed":7919,"realisticBranchChance":0,"realisticBranchLength":0.4,"realisticBranchAngle":30,"realisticMaxBranchDepth":0},
    "Laser Blast": {"baseLength":600,"taper":100,"coreSize":16,"corePulse":0,"softness":4,"coreColor":"#ffffff","glowDepth":6,"glowRadius":3,"glowColor":"#ff1a7d","glowNoiseType":"Perlin","glowTwitchAmount":131,"glowTwitchScale":0.008,"glowTwitchOctaves":7,"glowTwitchSeed":1,"realisticSeed":14,"realisticDetail":6,"realisticDisplacement":20,"realisticBranchSeed":2099,"realisticBranchChance":0.03,"realisticBranchLength":0.3,"realisticBranchAngle":8,"realisticMaxBranchDepth":1},
    "Lightsaber": {"baseLength":1000,"taper":0,"coreSize":11,"corePulse":40,"softness":4,"coreColor":"#ffffff","glowDepth":11,"glowRadius":1.1,"glowColor":"#1a7dff","glowNoiseType":"Perlin","glowTwitchAmount":100,"glowTwitchScale":0.008,"glowTwitchOctaves":5,"glowTwitchSeed":2,"realisticSeed":17,"realisticDetail":5,"realisticDisplacement":12,"realisticBranchSeed":7919,"realisticBranchChance":0,"realisticBranchLength":0.3,"realisticBranchAngle":30,"realisticMaxBranchDepth":0},
    "Voldemort": {"outputWidth":2000,"outputHeight":1000,"baseLength":1111,"taper":76,"realisticSeed":6792,"realisticDetail":7,"realisticDisplacement":140,"realisticBranchSeed":3684,"realisticBranchChance":0.025,"realisticBranchLength":0.3,"realisticBranchAngle":0,"realisticMaxBranchDepth":3,"coreSize":8,"corePulse":10,"softness":4,"coreColor":"#ffffff","glowDepth":6,"glowRadius":4.2,"glowColor":"#80ff00","glowNoiseType":"Fractal","glowTwitchAmount":56,"glowTwitchScale":0.01,"glowTwitchOctaves":9,"glowTwitchSeed":1},
    "Spark": {"baseLength":500,"taper":85,"coreSize":4,"corePulse":0,"softness":2,"coreColor":"#ffffff","glowDepth":6,"glowRadius":1.8,"glowColor":"#ffcc44","glowNoiseType":"Perlin","glowTwitchAmount":0,"glowTwitchScale":0.01,"glowTwitchOctaves":4,"glowTwitchSeed":1,"realisticSeed":17,"realisticDetail":6,"realisticDisplacement":60,"realisticBranchSeed":5303,"realisticBranchChance":0.015,"realisticBranchLength":0.3,"realisticBranchAngle":45,"realisticMaxBranchDepth":1},
};

/**
 * Read all current option values from the DOM.
 */
export function getPresetFromDOM() {
    const presetData = {};
    for (const inputElem of document.querySelectorAll("#options input, #options select")) {
        if (inputElem.type === "checkbox") {
            presetData[inputElem.id] = inputElem.checked;
        } else {
            presetData[inputElem.id] = inputElem.value;
            if (!isNaN(inputElem.value)) presetData[inputElem.id] = parseFloat(inputElem.value);
        }
    }
    return presetData;
}

/**
 * Apply a preset object to the DOM inputs.
 */
export function applyPresetToDOM(presetData, markDirty) {
    for (const key in presetData) {
        const el = document.getElementById(key);
        if (!el) continue;
        if (el.type === "checkbox") {
            el.checked = !!presetData[key];
        } else {
            el.value = presetData[key];
        }
    }
    if (markDirty) markDirty();
}
