import Alpine from "alpinejs";

export function getPreset() {
    const store = Alpine.store("lightning");
    return store.getNumericOptions();
}

export function setPreset(presetData) {
    const store = Alpine.store("lightning");
    for (const key in presetData) {
        store.options[key] = presetData[key];
    }
    store.render();
}

export let availPresets = {
    "Strike": {"baseLength":1000,"taper":70,"noiseType":"Fractal","twitchAmount":400,"twitchScale":50,"twitchOctaves":5,"twitchSeed":8,"numBranches":5,"branchLenMax":300,"branchLenMin":80,"branchLenVariance":10,"branchShrink":50,"branchProbability":60,"branchAngle":42,"maxDepth":3,"branchSeed":1,"coreSize":5,"softness":2,"coreColor":"#ffffff","glowDepth":8,"glowRadius":2,"glowColor":"#0080ff","glowNoiseType":"Fractal","glowTwitchAmount":0,"glowTwitchScale":80,"glowTwitchOctaves":7,"glowTwitchSeed":1},
    "Flash": {"baseLength":1176,"taper":81,"noiseType":"Fractal","twitchAmount":360,"twitchScale":60,"twitchOctaves":5,"twitchSeed":19,"numBranches":5,"branchLenMax":362,"branchLenMin":120,"branchLenVariance":5,"branchShrink":70,"branchProbability":70,"branchAngle":24,"maxDepth":2,"branchSeed":16,"coreSize":5,"softness":3,"coreColor":"#ffe070","glowDepth":9,"glowRadius":2,"glowColor":"#ff7300","glowNoiseType":"Fractal","glowTwitchAmount":0,"glowTwitchScale":80,"glowTwitchOctaves":7,"glowTwitchSeed":1},
    "Arc": {"baseLength":770,"taper":0,"noiseType":"Fractal","twitchAmount":506,"twitchScale":40,"twitchOctaves":9,"twitchSeed":80,"numBranches":0,"branchLenMax":300,"branchLenMin":80,"branchLenVariance":5,"branchShrink":50,"branchProbability":100,"branchAngle":33,"maxDepth":1,"branchSeed":1,"coreSize":3,"softness":3,"coreColor":"#ffffff","glowDepth":11,"glowRadius":1.1,"glowColor":"#ffffff","glowNoiseType":"Perlin","glowTwitchAmount":0,"glowTwitchScale":80,"glowTwitchOctaves":7,"glowTwitchSeed":1},
    "Laser Blast": {"baseLength":600,"taper":100,"noiseType":"Perlin","twitchAmount":54,"twitchScale":640,"twitchOctaves":9,"twitchSeed":14,"numBranches":8,"branchLenMax":210,"branchLenMin":100,"branchLenVariance":5,"branchShrink":72,"branchProbability":75,"branchAngle":5,"maxDepth":2,"branchSeed":1,"coreSize":16,"softness":4,"coreColor":"#ffffff","glowDepth":6,"glowRadius":3,"glowColor":"#ff1a7d","glowNoiseType":"Perlin","glowTwitchAmount":131,"glowTwitchScale":80,"glowTwitchOctaves":7,"glowTwitchSeed":1},
    "Lightsaber": {"baseLength":1000,"taper":0,"noiseType":"Fractal","twitchAmount":32,"twitchScale":880,"twitchOctaves":9,"twitchSeed":17,"numBranches":-3,"branchLenMax":210,"branchLenMin":150,"branchLenVariance":5,"branchShrink":50,"branchProbability":100,"branchAngle":5,"maxDepth":1,"branchSeed":1,"coreSize":11,"softness":4,"coreColor":"#ffffff","glowDepth":11,"glowRadius":1.1,"glowColor":"#1a7dff","glowNoiseType":"Perlin","glowTwitchAmount":100,"glowTwitchScale":80,"glowTwitchOctaves":5,"glowTwitchSeed":2},
    "Voldemort": {"baseLength":1111,"taper":76,"noiseType":"Fractal","twitchAmount":414,"twitchScale":50,"twitchOctaves":9,"twitchSeed":9,"numBranches":5,"branchLenMax":338,"branchLenMin":130,"branchLenVariance":5,"branchShrink":50,"branchProbability":100,"branchAngle":-10,"maxDepth":1,"branchSeed":1,"coreSize":8,"softness":4,"coreColor":"#ffffff","glowDepth":6,"glowRadius":4.2,"glowColor":"#80ff00","glowNoiseType":"Fractal","glowTwitchAmount":56,"glowTwitchScale":100,"glowTwitchOctaves":9,"glowTwitchSeed":1},
    "Muzzle Flash": {"baseLength":180,"taper":54,"noiseType":"Fractal","twitchAmount":60,"twitchScale":900,"twitchOctaves":9,"twitchSeed":26,"numBranches":-3,"branchLenMax":180,"branchLenMin":140,"branchLenVariance":5,"branchShrink":50,"branchProbability":100,"branchAngle":5,"maxDepth":1,"branchSeed":1,"coreSize":36,"softness":5,"coreColor":"#ffdf99","glowDepth":4,"glowRadius":9,"glowColor":"#ff9633","glowNoiseType":"Perlin","glowTwitchAmount":0,"glowTwitchScale":80,"glowTwitchOctaves":5,"glowTwitchSeed":2},
    "Wavefunction": {"baseLength":1000,"taper":0,"noiseType":"Fractal","twitchAmount":800,"twitchScale":80,"twitchOctaves":2,"twitchSeed":13,"numBranches":0,"branchLenMax":300,"branchLenMin":80,"branchLenVariance":5,"branchShrink":50,"branchProbability":100,"branchAngle":33,"maxDepth":1,"branchSeed":1,"coreSize":5,"softness":2,"coreColor":"#ffffff","glowDepth":8,"glowRadius":2.5,"glowColor":"#ff00f7","glowNoiseType":"Perlin","glowTwitchAmount":0,"glowTwitchScale":80,"glowTwitchOctaves":7,"glowTwitchSeed":1},
};

export function buildPresetSelector() {
    for (var presetName in availPresets) {
        var option = document.createElement("option");
        option.innerHTML = presetName;
        option.value = JSON.stringify(availPresets[presetName]);
        document.querySelector("#presetselector").appendChild(option);
    }
    document.querySelector("#presetselector").addEventListener("change", function() {
        setPreset(JSON.parse(this.value));
    });
}
