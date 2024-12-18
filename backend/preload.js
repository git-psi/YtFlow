const { contextBridge, ipcRenderer } = require('electron');

// Expose a secure API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Functions for YouTube video search and information
  fetchVideoInfo: (url) => ipcRenderer.invoke('fetch-video-info', url),
  singleSearch: (search) => ipcRenderer.invoke('single-search', search),
  multipleSearch: (search) => ipcRenderer.invoke('multiple-search', search),

  // Functions for Spotify integration
  spotifyGenerateToken: () => ipcRenderer.invoke('spotify-generate-token'),
  spotifyFetchPlaylists: () => ipcRenderer.invoke('spotify-fetch-playlists'),
  closeSpotifyWindow: () => ipcRenderer.invoke('close-spotify-window'),
  spotifyFetchPlaylistTracks: (href) => ipcRenderer.invoke('spotify-fetch-playlist-tracks', href),
  addSpotifyPlaylistTracks: (callback) => ipcRenderer.on('add-spotify-playlist-tracks', callback),
  
  // Function for music downloading
  downloadMusic: (url, title, thumbnail_url, author, format) => ipcRenderer.invoke('download-music', url, title, thumbnail_url, author, format),

  // Functions for settings management
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
  saveSettings: (settingsArray) => ipcRenderer.invoke('save-settings', settingsArray),
  getSetting: (settingName) => ipcRenderer.invoke('get-setting', settingName),
  openFolder: () => ipcRenderer.invoke('open-folder'),
  forgetAll: () => ipcRenderer.invoke('forget-all'),

  // Function for application updates
  update: () => ipcRenderer.invoke('update'),

  // Functions for application management
  quitApp: () => ipcRenderer.invoke('quit-app'),
  focusApp: () => ipcRenderer.invoke('focus-app'),
  wantQuitApp: (callback) => ipcRenderer.on('want-quit-app', callback),

  // Functions for messages and notifications display
  showMessage: (message) => ipcRenderer.on('show-message', message),
  showUpdateModal: (versions) => ipcRenderer.on('show-update', versions),
});
