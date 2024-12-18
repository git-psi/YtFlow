const { session } = require('electron');

// Name of all existing settings with their default values
const defaultSettings = {
    selectedFolder: '',
    automaticUpdate: false,
    firstResult: false,
    onboardingCompleted: false,
    spotifyModalValidate: false,
}

module.exports = (store, win, dialog, shell, app) => {
    // Initialize settings with default values if they don't exist
    Object.entries(defaultSettings).forEach(([key, defaultValue]) => {
        if (store.get(key) === undefined) {
            store.set(key, defaultValue);
        }
    });

    // Function to get a setting
    async function getSetting(event, settingName) {
        if (defaultSettings.hasOwnProperty(settingName)) {
            return store.get(settingName);
        } else return 'Erreur'
    };

    // Function to open a folder dialog
    async function openFolderDialog() {
        const result = await dialog.showOpenDialog(win, {
            properties: ['openDirectory']
        });
        if (!result.canceled && result.filePaths.length > 0) {
            return result.filePaths[0]; // Retourne directement le dossier sélectionné
        }
        return null; // Si l'utilisateur annule
    };

    // Function to save settings
    async function saveSettings(event, settingsArray) {
        settingsArray.forEach(setting => {
            if (defaultSettings.hasOwnProperty(setting[0])) {
                store.set(setting[0], setting[1]);
            }
        });
    };

    // Function to open the folder
    async function openFolder() {
        const folderPath = store.get('selectedFolder', 0);
        if (folderPath){
            try {
                shell.openPath(folderPath);
            } catch (error) {
                console.log(error)
                return {error: 'Erreur lors de l\'ouverture du dossier'}
            }
        }else return {error: 'Aucun dossier sélectionné, voir dans les paramètres'}
    }

    // Function to restart from scratch
    async function forgetAll() {
        Object.entries(defaultSettings).forEach(([key, defaultValue]) => {
            store.set(key, defaultValue);
            session.defaultSession.clearStorageData();
        });
        app.relaunch(); // restart the app
        app.exit(); // exit the current instance
    }

    return {
        getSetting,
        openFolderDialog,
        saveSettings,
        openFolder,
        forgetAll,
    }
};