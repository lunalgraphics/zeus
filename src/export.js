import Photopea from 'photopea';

/**
 * Set up export button behavior.
 * In Photopea plugin mode, sends the canvas to the parent document.
 * Otherwise, downloads as PNG.
 */
export function initExport(getFinalCanvas) {
    const isPhotopeaPlugin = new URLSearchParams(location.search).get("photopeaPlugin") === "yes";
    const exportBtn = document.querySelector("#exportPNG");

    if (isPhotopeaPlugin) {
        exportBtn.innerText = "Add to document";
        const pea = new Photopea(window.parent);

        exportBtn.addEventListener("click", async () => {
            const finalCanv = getFinalCanvas();
            await pea.openFromURL(finalCanv.toDataURL());
            await pea.runScript("app.activeDocument.activeLayer.blendMode = 'scrn';");
            await pea.runScript("app.activeDocument.activeLayer.name = 'Zeus';");
            // Open free transform
            await pea.runScript(`
                var cTID = charIDToTypeID;
                var desc1 = new ActionDescriptor();
                var ref1 = new ActionReference();
                ref1.putEnumerated(cTID('Mn  '), cTID('MnIt'), cTID('FrTr'));
                desc1.putReference(cTID('null'), ref1);
                executeAction(cTID('slct'), desc1, DialogModes.NO);
            `);
        });
    } else {
        exportBtn.addEventListener("click", () => {
            const finalCanv = getFinalCanvas();
            const a = document.createElement("a");
            a.href = finalCanv.toDataURL();
            a.download = "Zeus.png";
            a.click();
        });
    }
}
