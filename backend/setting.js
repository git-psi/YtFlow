const { session } = require('electron');
const { exec } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

const homeDir = os.homedir();
const platform = process.platform;
let musicDir = homeDir;

if (platform === 'win32') {
    // On Windows, "Music" can be in "Documents\Music" or just "Music"
    musicDir = path.join(homeDir, 'Music');
} else if (platform === 'darwin') {
    // On macOS, it's typically "Music"
    musicDir = path.join(homeDir, 'Music');
} else {
    // On Linux, check the XDG config file
    const xdgConfigPath = path.join(homeDir, '.config', 'user-dirs.dirs');

    if (fs.existsSync(xdgConfigPath)) {
        const fileContent = fs.readFileSync(xdgConfigPath, 'utf8');
        const match = fileContent.match(/^XDG_MUSIC_DIR=(.*)$/m);
  
        if (match) {
            musicDir = match[1].trim();

            // Remove any quotes if present
            if (musicDir.startsWith('"') && musicDir.endsWith('"')) {
                musicDir = musicDir.slice(1, -1);
            }

            // Replace $HOME with the actual user home path
            if (musicDir.startsWith('$HOME')) {
                musicDir = musicDir.replace('$HOME', homeDir);
            }
    }}
}

// Check if directory exists, if not create it
if (!fs.existsSync(musicDir)) {
    musicDir = homeDir;
}

// Name of all existing settings with their default values
const defaultSettings = {
    selectedFolder: musicDir,
    automaticUpdate: false,
    firstResult: false,
    onboardingCompleted: false,
    spotifyModalValidate: false,
    audioQuality: 'medium',
    videoQuality: 'max',
};

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
        if (folderPath) {
            try {
                if (process.platform === 'linux') {
                    // On Linux, use specific command to open file manager
                    return new Promise((resolve, reject) => {
                        // First try with nautilus (GNOME)
                        exec(`nautilus "${folderPath}"`, (error) => {
                            if (error) {
                                // If nautilus fails, try with dolphin (KDE)
                                exec(`dolphin "${folderPath}"`, (error) => {
                                    if (error) {
                                        // As last resort, use shell.openPath
                                        shell.openPath(folderPath);
                                    }
                                    resolve();
                                });
                            }
                            resolve();
                        });
                    });
                } else {
                    // On Windows and macOS, use shell.openPath
                    await shell.openPath(folderPath);
                }
            } catch (error) {
                console.error(error);
                return {error: 'Error opening folder'}
            }
        } else return {error: 'No folder selected, check settings'}
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