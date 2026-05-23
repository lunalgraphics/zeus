import Photopea from 'photopea';

/**
 * Set up export button behavior.
 * - "Export PNG": downloads the final canvas as PNG
 * - Photopea plugin mode: sends to parent document with screen blend
 */
export function initExport(canvases) {
    const isPhotopeaPlugin = new URLSearchParams(location.search).get("photopeaPlugin") === "yes";
    const exportBtn = document.querySelector("#exportPNG");

    if (isPhotopeaPlugin) {
        exportBtn.innerText = "Add to document";
        const pea = new Photopea(window.parent);

        exportBtn.addEventListener("click", async () => {
            await pea.openFromURL(canvases.final.toDataURL());
            await pea.runScript("app.activeDocument.activeLayer.blendMode = 'scrn';");
            await pea.runScript("app.activeDocument.activeLayer.name = 'Zeus';");
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
            const a = document.createElement("a");
            a.href = canvases.final.toDataURL("image/png");
            a.download = "Zeus.png";
            a.click();
        });
    }
}
