const { autoUpdater } = require('electron-updater');
// Disable automatic download and installation
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;

module.exports = (win, app, settingJS) => {
    autoUpdater.on('update-available', async (info) => {   
        const automaticUpdate = await settingJS.getSetting(0, 'automaticUpdate')
        if (automaticUpdate){
            // Hide the window and show a notification
            win.webContents.send('show-message', `L'application va télécharger la mise à jour puis se fermer`)
            autoUpdater.downloadUpdate()
        }else {
            // Get the current version of the application
            const currentVersion = app.getVersion();

            // Send the update information to the renderer process
            win.webContents.send('show-update', [info.releaseName, currentVersion, info.releaseNotes]);
        }
    })
    
    // Function to handle the update downloaded event
    autoUpdater.on('update-downloaded', () => {
        // Quit the application and install the update
        autoUpdater.quitAndInstall();
    })

    // Function to download the update
    async function update() {
        autoUpdater.downloadUpdate();
    };

    return {
        update,
        autoUpdater,
    }
};