// Require functionnality from electron
const { app, BrowserWindow, ipcMain, shell, Notification, dialog } = require('electron');
// Require path to handle file paths
const path = require('path');

// Require innertube to handle youtube requests
const { Innertube } = require('youtubei.js');
let innertube;

// Require electron-store to handle settings
const Store = require('electron-store');
const store = new Store();

let win
let allowQuit = false

// Define the icon path based on the platform
const iconPath = process.platform === 'win32'
? path.resolve(__dirname, '../img/icon.ico')  // Use .ico for Windows
: path.resolve(__dirname, '../img/icon.png')  // Use .png for Linux

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Set the name of the app
app.setName('YtFlow');
// Add this line to set the app ID for notifications
if (process.platform === 'win32') {
    app.setAppUserModelId('YtFlow');
}

// Function to create the window
function createWindow() {
    win = new BrowserWindow({
        width: 900,
        height: 600,
        minWidth: 900,
        minHeight: 600,
        icon: iconPath,
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            devTools: process.env.NODE_ENV !== 'production',
        },
    });
}

function showWindow(){
    if (!win.isVisible()){
        win.show();
    }
    if (win.isMinimized()){
        win.restore();
    }
    win.focus();
}

app.whenReady().then(async () => {
    // Open the window when the app is ready
    createWindow()

    // Open external links in the default browser
    win.webContents.setWindowOpenHandler((handler) => {
        shell.openExternal(handler.url);
        return { action: "deny" };
    });

    // Create innertube instance
    innertube = await Innertube.create();

    // Require all other js files
    const downloadJS = require('./download')(store, path, win)
    const settingJS = require('./setting')(store, win, dialog, shell, app)
    const updateJS = require('./update')(win, app, settingJS, Notification)
    const queryYoutubeJS = require('./query/youtube')(innertube)
    const querySpotifyJS = require('./query/spotify')(store, BrowserWindow, win)

    // Handle all ipc requests
    ipcMain.handle('download-music', downloadJS.downloadMusic);

    ipcMain.handle('update', updateJS.update);

    ipcMain.handle('get-setting', settingJS.getSetting);
    ipcMain.handle('save-settings', settingJS.saveSettings);
    ipcMain.handle('open-folder-dialog', settingJS.openFolderDialog);
    ipcMain.handle('open-folder', settingJS.openFolder);
    ipcMain.handle('forget-all', settingJS.forgetAll);

    ipcMain.handle('fetch-video-info', queryYoutubeJS.fetchVideoInfo);
    ipcMain.handle('multiple-search', queryYoutubeJS.multipleSearch);
    ipcMain.handle('single-search', queryYoutubeJS.singleSearch);

    ipcMain.handle('spotify-generate-token', () => {querySpotifyJS.generateToken(true)});
    ipcMain.handle('spotify-fetch-playlists', querySpotifyJS.fetchUserPlaylists);
    ipcMain.handle('spotify-fetch-playlist-tracks', querySpotifyJS.fetchPlaylistTracks);
    ipcMain.handle('close-spotify-window', querySpotifyJS.closeSpotifyWindow);
    
    ipcMain.handle('quit-app',() => {app.quit()});
    ipcMain.handle('focus-app',() => {showWindow()});

    // Load the frontend
    await win.loadFile('frontend/index.html');
    win.show();

    // Check for updates
    updateJS.autoUpdater.checkForUpdates()

    win.on('close', (event) => {
        // Prevent the window from closing to show the quit dialog
        if (!allowQuit){
            event.preventDefault();
            win.webContents.send('want-quit-app')
        }
    });
    
});

app.on('before-quit', () => {
    allowQuit = true;
});