const { app, core, imaging, constants, action } = require("photoshop");
const { entrypoints, storage } = require("uxp");

/** @type {HTMLWebViewElement} */
let webView = document.getElementById("container");

window.addEventListener("message", (e) => {
    if (typeof e.data == "string") e.data = JSON.parse(e.data);
    console.log(e);

    if (e.data.type == "exportLayer") {
        // The webview sends back the lightning layer as base64-encoded raw RGBA bytes
        console.log("exporting");

        core.executeAsModal(async (executionContext) => {
            // Suspend history to capture changes as one state
            const suspensionID = await executionContext.hostControl.suspendHistory({
                documentID: app.activeDocument.id,
                name: "Add Lightning Layer (Zeus)"
            });

            try {
                // Decode base64 → binary string → Uint8Array of raw RGBA bytes
                let binary = atob(e.data.data);
                let bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                    bytes[i] = binary.charCodeAt(i);
                }

                // Pass the raw RGBA buffer directly — no image decoding needed
                let imageData = await imaging.createImageDataFromBuffer(bytes, {
                    width: 2000,
                    height: 1000,
                    components: 4,
                    colorSpace: "RGB",
                });

                // Insert the lightning as a new pixel layer
                let pixelLayer = await app.activeDocument.layers.add();
                await imaging.putPixels({
                    layerID: pixelLayer.id,
                    imageData: imageData,
                });
                pixelLayer.bringToFront();
                pixelLayer.name = "render";

                // Store the preset metadata in a hidden text layer (for later re-editing)
                let textLayer = await app.activeDocument.createTextLayer({
                    contents: e.data.metadata,
                    position: { x: 0, y: app.activeDocument.height / 2 },
                    fontSize: 1,
                });
                textLayer.name = "metadata";
                textLayer.visible = false;
                textLayer.bringToFront();

                // Convert both layers into a single Smart Object
                app.activeDocument.activeLayers = [pixelLayer, textLayer];
                await action.batchPlay([
                    {
                        _obj: "newPlacedLayer",
                        _isCommand: true,
                        _options: {
                            dialogOptions: "dontDisplay",
                        }
                    }
                ], {});

                // Name and blend the Smart Object
                app.activeDocument.activeLayers[0].name = "Zeus";
                app.activeDocument.activeLayers[0].blendMode = constants.BlendMode.SCREEN;

                // Resume history
                await executionContext.hostControl.resumeHistory(suspensionID);
                
                // Activate Free Transform
                core.performMenuCommand({ commandID: 2207 }).catch(err => core.showAlert(err));
            } catch(err) {
                await executionContext.hostControl.resumeHistory(suspensionID, false);
                throw err;
            }
        }, { commandName: "Add Lightning Layer (Zeus)" }).catch(err => core.showAlert(err));
    }
});