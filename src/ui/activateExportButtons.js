import Photopea from "photopea";

export default function activateExportButtons() {
    if (new URLSearchParams(location.search).get("photopeaPlugin") == "yes") {
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