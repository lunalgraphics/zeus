import Photopea from "photopea";
import { getPreset } from "../data/presets.js";
const { VITE_BUILD_MODE } = import.meta.env;

export default function activateExportButtons() {
    if (VITE_BUILD_MODE === "photopea") {
        document.querySelector("#exportPNG").innerText = "Add to document";
        let pea = new Photopea(window.parent);
        document.querySelector("#exportPNG").addEventListener("click", async () => {
            let finalCanv = document.getElementById("finalCanv");
            await pea.openFromURL(finalCanv.toDataURL());
            await pea.runScript("app.activeDocument.activeLayer.blendMode = 'scrn';");
            await pea.runScript("app.activeDocument.activeLayer.name = 'Zeus';");
            // open free transform
            await pea.runScript(`
                var cTID = charIDToTypeID;

                var desc1 = new ActionDescriptor();
                var ref1 = new ActionReference();
                ref1.putEnumerated(cTID('Mn  '), cTID('MnIt'), cTID('FrTr'));
                desc1.putReference(cTID('null'), ref1);
                executeAction(cTID('slct'), desc1, DialogModes.NO);
            `);
        });
    }
    else if (VITE_BUILD_MODE === "photoshop") {
        document.querySelector("#exportPNG").innerText = "Add to Document";
        document.querySelector("#exportPNG").addEventListener("click", async () => {
            // Encode raw RGBA pixels as base64 — avoids PNG encoding/decoding
            // and doesn't rely on UXP canvas support.
            // Chunked String.fromCharCode prevents stack overflow on large images.
            let finalCanv = document.getElementById("finalCanv");
            let imageData = finalCanv.getContext("2d").getImageData(0, 0, glowCanv.width, glowCanv.height);
            let bytes = new Uint8Array(imageData.data.buffer);
            let binary = "";
            const CHUNK = 8192;
            for (let i = 0; i < bytes.length; i += CHUNK) {
                binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
            }
            window.uxpHost.postMessage({
                type: "exportLayer",
                data: btoa(binary),
                metadata: getPreset(),
            });
        });
    }
    else {
        document.querySelector("#exportPNG").addEventListener("click", async () => {
            let finalCanv = document.getElementById("finalCanv");
            let a = document.createElement("a");
            a.href = finalCanv.toDataURL();
            a.download = "Zeus.png";
            a.click();
        });
    }
}