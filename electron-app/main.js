const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 900,
        title: "Zeus",
        icon: path.join(__dirname, "app/icon.png"),
        webPreferences: {
            contextIsolation: true,
            sandbox: true,
            devTools: !app.isPackaged
        }
    });

    mainWindow.setMenuBarVisibility(false);
    mainWindow.loadFile(path.join(__dirname, "app/index.html"));
    mainWindow.on("page-title-updated", (e) => e.preventDefault());
    mainWindow.maximize();
}

app.whenReady().then(() => {
    createWindow();

    // macOS: re-create window when dock icon is clicked and no windows exist
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    // On macOS, apps typically stay active until the user quits explicitly
    if (process.platform !== "darwin") {
        app.quit();
    }
});
