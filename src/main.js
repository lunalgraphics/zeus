import Alpine from "alpinejs";

import renderLightning from "./renderLightning.js";

import buildGUI from "./ui/buildGUI.js";
import activateExportButtons from "./ui/activateExportButtons.js";

import { buildPresetSelector } from "./data/presets.js";

if (import.meta.env.DEV) {
    console.log("Welcome, developer.");
    window.Alpine = Alpine;
}

Alpine.start();

buildGUI();
activateExportButtons();
buildPresetSelector();

window.unsavedChanges = false;

function renderFromInputs() {
    var options = {};
    for (var inputElem of document.querySelectorAll("#options input, #options select")) {
        options[inputElem.id] = inputElem.value;
        if (!isNaN(inputElem.value)) options[inputElem.id] = parseFloat(inputElem.value);
    }
    renderLightning(options);
}
renderFromInputs();

for (var inputElem of document.querySelectorAll("#options input, #options select")) {
    inputElem.addEventListener("input", () => {
        window.unsavedChanges = true;
    });

    inputElem.addEventListener("focus", function(e) {
        document.querySelector(`label[for=${this.id}]`).style.color = "deepskyblue";
    });
    inputElem.addEventListener("blur", function(e) {
        document.querySelector(`label[for=${this.id}]`).style.color = "";
    });
}

let tick = () => {
    if (window.unsavedChanges) {
        try {
            renderFromInputs();
        }
        catch(err) {
            console.log(err);
        }
        window.unsavedChanges = false;
    }
    setTimeout(tick, 20);
};
tick();