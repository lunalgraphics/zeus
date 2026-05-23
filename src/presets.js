export const builtInPresets = {
    "Strike": {"baseLength":1000,"taper":70,"coreSize":7,"softness":4,"coreColor":"#ffffff","glowDepth":8,"glowRadius":2.5,"glowColor":"#00aaff","glowNoiseType":"Fractal","glowTwitchAmount":0,"glowTwitchScale":0.008,"glowTwitchOctaves":7,"glowTwitchSeed":1,"realisticSeed":8,"realisticDetail":7,"realisticDisplacement":130,"realisticBranchChance":0.025,"realisticBranchLength":0.4,"realisticBranchAngle":30,"realisticMaxBranchDepth":2},
    "Flash": {"baseLength":1176,"taper":81,"coreSize":7,"softness":5,"coreColor":"#ffe070","glowDepth":9,"glowRadius":2,"glowColor":"#ff7300","glowNoiseType":"Fractal","glowTwitchAmount":0,"glowTwitchScale":0.008,"glowTwitchOctaves":7,"glowTwitchSeed":1,"realisticSeed":19,"realisticDetail":7,"realisticDisplacement":120,"realisticBranchChance":0.025,"realisticBranchLength":0.4,"realisticBranchAngle":25,"realisticMaxBranchDepth":2},
    "Arc": {"baseLength":770,"taper":0,"coreSize":3,"softness":3,"coreColor":"#ffffff","glowDepth":11,"glowRadius":1.1,"glowColor":"#ffffff","glowNoiseType":"Perlin","glowTwitchAmount":0,"glowTwitchScale":0.008,"glowTwitchOctaves":7,"glowTwitchSeed":1,"realisticSeed":80,"realisticDetail":8,"realisticDisplacement":180,"realisticBranchChance":0,"realisticBranchLength":0.4,"realisticBranchAngle":30,"realisticMaxBranchDepth":0},
    "Laser Blast": {"baseLength":600,"taper":100,"coreSize":16,"softness":4,"coreColor":"#ffffff","glowDepth":6,"glowRadius":3,"glowColor":"#ff1a7d","glowNoiseType":"Perlin","glowTwitchAmount":131,"glowTwitchScale":0.008,"glowTwitchOctaves":7,"glowTwitchSeed":1,"realisticSeed":14,"realisticDetail":6,"realisticDisplacement":20,"realisticBranchChance":0.03,"realisticBranchLength":0.3,"realisticBranchAngle":8,"realisticMaxBranchDepth":1},
    "Lightsaber": {"baseLength":1000,"taper":0,"coreSize":11,"softness":4,"coreColor":"#ffffff","glowDepth":11,"glowRadius":1.1,"glowColor":"#1a7dff","glowNoiseType":"Perlin","glowTwitchAmount":100,"glowTwitchScale":0.008,"glowTwitchOctaves":5,"glowTwitchSeed":2,"realisticSeed":17,"realisticDetail":5,"realisticDisplacement":12,"realisticBranchChance":0,"realisticBranchLength":0.3,"realisticBranchAngle":30,"realisticMaxBranchDepth":0},
    "Voldemort": {"baseLength":1111,"taper":76,"coreSize":8,"softness":4,"coreColor":"#ffffff","glowDepth":6,"glowRadius":4.2,"glowColor":"#80ff00","glowNoiseType":"Fractal","glowTwitchAmount":56,"glowTwitchScale":0.01,"glowTwitchOctaves":9,"glowTwitchSeed":1,"realisticSeed":9,"realisticDetail":7,"realisticDisplacement":140,"realisticBranchChance":0.025,"realisticBranchLength":0.45,"realisticBranchAngle":25,"realisticMaxBranchDepth":3},
    "Muzzle Flash": {"baseLength":180,"taper":54,"coreSize":36,"softness":5,"coreColor":"#ffdf99","glowDepth":4,"glowRadius":9,"glowColor":"#ff9633","glowNoiseType":"Perlin","glowTwitchAmount":0,"glowTwitchScale":0.008,"glowTwitchOctaves":5,"glowTwitchSeed":2,"realisticSeed":26,"realisticDetail":5,"realisticDisplacement":25,"realisticBranchChance":0,"realisticBranchLength":0.3,"realisticBranchAngle":30,"realisticMaxBranchDepth":0},
    "Wavefunction": {"baseLength":1000,"taper":0,"coreSize":5,"softness":2,"coreColor":"#ffffff","glowDepth":8,"glowRadius":2.5,"glowColor":"#ff00f7","glowNoiseType":"Perlin","glowTwitchAmount":0,"glowTwitchScale":0.008,"glowTwitchOctaves":7,"glowTwitchSeed":1,"realisticSeed":13,"realisticDetail":9,"realisticDisplacement":250,"realisticBranchChance":0,"realisticBranchLength":0.3,"realisticBranchAngle":30,"realisticMaxBranchDepth":0},
    "Thunderbolt": {"baseLength":1200,"taper":75,"coreSize":6,"softness":3,"coreColor":"#ffffff","glowDepth":8,"glowRadius":2.2,"glowColor":"#6699ff","glowNoiseType":"Fractal","glowTwitchAmount":20,"glowTwitchScale":0.006,"glowTwitchOctaves":5,"glowTwitchSeed":3,"realisticSeed":42,"realisticDetail":7,"realisticDisplacement":140,"realisticBranchChance":0.02,"realisticBranchLength":0.4,"realisticBranchAngle":30,"realisticMaxBranchDepth":2},
    "Forked Lightning": {"baseLength":1400,"taper":60,"coreSize":5,"softness":3,"coreColor":"#ffffff","glowDepth":7,"glowRadius":2.5,"glowColor":"#aaccff","glowNoiseType":"Fractal","glowTwitchAmount":15,"glowTwitchScale":0.005,"glowTwitchOctaves":5,"glowTwitchSeed":7,"realisticSeed":99,"realisticDetail":7,"realisticDisplacement":180,"realisticBranchChance":0.03,"realisticBranchLength":0.45,"realisticBranchAngle":35,"realisticMaxBranchDepth":3},
    "Spark": {"baseLength":500,"taper":85,"coreSize":4,"softness":2,"coreColor":"#ffffff","glowDepth":6,"glowRadius":1.8,"glowColor":"#ffcc44","glowNoiseType":"Perlin","glowTwitchAmount":0,"glowTwitchScale":0.01,"glowTwitchOctaves":4,"glowTwitchSeed":1,"realisticSeed":17,"realisticDetail":6,"realisticDisplacement":60,"realisticBranchChance":0.015,"realisticBranchLength":0.3,"realisticBranchAngle":45,"realisticMaxBranchDepth":1},
};

/**
 * Read all current option values from the DOM.
 */
export function getPresetFromDOM() {
    const presetData = {};
    for (const inputElem of document.querySelectorAll("#options input, #options select")) {
        presetData[inputElem.id] = inputElem.value;
        if (!isNaN(inputElem.value)) presetData[inputElem.id] = parseFloat(inputElem.value);
    }
    return presetData;
}

/**
 * Apply a preset object to the DOM inputs.
 */
export function applyPresetToDOM(presetData, markDirty) {
    for (const key in presetData) {
        const el = document.getElementById(key);
        if (el) el.value = presetData[key];
    }
    if (markDirty) markDirty();
}
