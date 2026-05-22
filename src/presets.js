export const builtInPresets = {
    "Strike": {"baseLength":1000,"taper":70,"noiseType":"Fractal","twitchAmount":400,"twitchScale":0.005,"twitchOctaves":5,"twitchSeed":8,"numBranches":5,"branchLen":300,"branchLenDelta":54,"branchAngle":33,"coreSize":7,"softness":4,"coreColor":"#ffffff","glowDepth":8,"glowRadius":2.5,"glowColor":"#00AAff","glowNoiseType":"Fractal","glowTwitchAmount":0,"glowTwitchScale":0.008,"glowTwitchOctaves":7,"glowTwitchSeed":1},
    "Flash": {"baseLength":1176,"taper":81,"noiseType":"Fractal","twitchAmount":360,"twitchScale":0.006,"twitchOctaves":5,"twitchSeed":19,"numBranches":5,"branchLen":362,"branchLenDelta":49,"branchAngle":24,"coreSize":7,"softness":5,"coreColor":"#ffe070","glowDepth":9,"glowRadius":2,"glowColor":"#ff7300","glowNoiseType":"Fractal","glowTwitchAmount":0,"glowTwitchScale":0.008,"glowTwitchOctaves":7,"glowTwitchSeed":1},
    "Arc": {"baseLength":770,"taper":0,"noiseType":"Fractal","twitchAmount":506,"twitchScale":0.004,"twitchOctaves":9,"twitchSeed":80,"numBranches":0,"branchLen":300,"branchLenDelta":54,"branchAngle":33,"coreSize":3,"softness":3,"coreColor":"#ffffff","glowDepth":11,"glowRadius":1.1,"glowColor":"#ffffff","glowNoiseType":"Perlin","glowTwitchAmount":0,"glowTwitchScale":0.008,"glowTwitchOctaves":7,"glowTwitchSeed":1},
    "Laser Blast": {"baseLength":600,"taper":100,"noiseType":"Perlin","twitchAmount":54,"twitchScale":0.064,"twitchOctaves":9,"twitchSeed":14,"numBranches":8,"branchLen":210,"branchLenDelta":16,"branchAngle":5,"coreSize":16,"softness":4,"coreColor":"#ffffff","glowDepth":6,"glowRadius":3,"glowColor":"#ff1a7d","glowNoiseType":"Perlin","glowTwitchAmount":131,"glowTwitchScale":0.008,"glowTwitchOctaves":7,"glowTwitchSeed":1},
    "Lightsaber": {"baseLength":1000,"taper":0,"noiseType":"Fractal","twitchAmount":32,"twitchScale":0.088,"twitchOctaves":9,"twitchSeed":17,"numBranches":-3,"branchLen":210,"branchLenDelta":16,"branchAngle":5,"coreSize":11,"softness":4,"coreColor":"#ffffff","glowDepth":11,"glowRadius":1.1,"glowColor":"#1a7dff","glowNoiseType":"Perlin","glowTwitchAmount":100,"glowTwitchScale":0.008,"glowTwitchOctaves":5,"glowTwitchSeed":2},
    "Voldemort": {"baseLength":1111,"taper":76,"noiseType":"Fractal","twitchAmount":414,"twitchScale":0.005,"twitchOctaves":9,"twitchSeed":9,"numBranches":5,"branchLen":338,"branchLenDelta":42,"branchAngle":-10,"coreSize":8,"softness":4,"coreColor":"#ffffff","glowDepth":6,"glowRadius":4.2,"glowColor":"#80ff00","glowNoiseType":"Fractal","glowTwitchAmount":56,"glowTwitchScale":0.01,"glowTwitchOctaves":9,"glowTwitchSeed":1},
    "Muzzle Flash": {"baseLength":180,"taper":54,"noiseType":"Fractal","twitchAmount":60,"twitchScale":0.09,"twitchOctaves":9,"twitchSeed":26,"numBranches":-3,"branchLen":210,"branchLenDelta":16,"branchAngle":5,"coreSize":36,"softness":5,"coreColor":"#ffdf99","glowDepth":4,"glowRadius":9,"glowColor":"#ff9633","glowNoiseType":"Perlin","glowTwitchAmount":0,"glowTwitchScale":0.008,"glowTwitchOctaves":5,"glowTwitchSeed":2},
    "Wavefunction": {"baseLength":1000,"taper":0,"noiseType":"Fractal","twitchAmount":800,"twitchScale":0.008,"twitchOctaves":2,"twitchSeed":13,"numBranches":0,"branchLen":300,"branchLenDelta":54,"branchAngle":33,"coreSize":5,"softness":2,"coreColor":"#ffffff","glowDepth":8,"glowRadius":2.5,"glowColor":"#ff00f7","glowNoiseType":"Perlin","glowTwitchAmount":0,"glowTwitchScale":0.008,"glowTwitchOctaves":7,"glowTwitchSeed":1},
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
