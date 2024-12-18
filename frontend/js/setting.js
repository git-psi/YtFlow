// Get references to modal elements
const settingModal = document.getElementById('settingModal');
const settingModalObject = new bootstrap.Modal(settingModal)

// Get references to folder selection elements
const folderPathInput = document.getElementById('folderPath');
const chooseFolderBtn = document.getElementById('chooseFolderBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
let savedDownloadDirectory = 0

// Get reference to automatic update toggle and its state
const automaticUpdateToggle = document.getElementById('automaticUpdateToggle');
let automaticUpdate = false

// Get reference to first result toggle and its state  
const firstResultToggle = document.getElementById('firstResultToggle');
let firstResult = false

// Hidden span used to measure text width
const hiddenSpan = document.getElementById('hidden-span');

// Ajout d'une variable pour stocker le chemin complet
let fullFolderPath = '';

// Adjusts the displayed path to fit within the input width
function adjustPathToFit(dir) {
    fullFolderPath = dir; // Stocke le chemin complet
    const inputStyles = window.getComputedStyle(folderPathInput);
    chooseFolderBtn.setAttribute('data-bs-title', dir)
    setupTooltip()
    let path = dir.split('\\')
    
    // Copy input styles to hidden span for accurate width measurement
    hiddenSpan.style.font = inputStyles.font;
    hiddenSpan.style.padding = inputStyles.padding;
    hiddenSpan.textContent = dir;

    // Truncate path from start until it fits in input width
    while (hiddenSpan.offsetWidth > folderPathInput.clientWidth && path.length > 1) {
        path.shift();
        hiddenSpan.textContent = '...\\' + path.join('\\');
    }
    folderPathInput.value = hiddenSpan.textContent
}

// Load saved settings on startup
// Load all settings from storage
const settingsToLoad = [
    {key: 'selectedFolder', setter: (value) => {
        savedDownloadDirectory = value;
        fullFolderPath = value;
    }},
    {key: 'firstResult', setter: (value) => firstResult = value},
    {key: 'automaticUpdate', setter: (value) => automaticUpdate = value}, 
];

// Load each setting
settingsToLoad.forEach(async ({key, setter}) => {
    const value = await window.electronAPI.getSetting(key);
    if (value) {
        setter(value);
    }
});

// Open folder selection dialog when button clicked
chooseFolderBtn.addEventListener('click', async () => {
    const folderPath = await window.electronAPI.openFolderDialog()
    hideTooltip()
    if (folderPath) {
        adjustPathToFit(folderPath)
    }
});

// Save settings when save button clicked
saveSettingsBtn.addEventListener('click', () => {
    const automaticUpdateValue = automaticUpdateToggle.checked;
    const firstResultValue = firstResultToggle.checked;

    savedDownloadDirectory = fullFolderPath; // Utilise le chemin complet
    automaticUpdate = automaticUpdateValue;
    firstResult = firstResultValue;
    window.electronAPI.saveSettings([
        ['selectedFolder', fullFolderPath], // Sauvegarde le chemin complet
        ['automaticUpdate', automaticUpdateValue],
        ['firstResult', firstResultValue]
    ]);

    settingModalObject.hide();
});

// Update UI with saved settings when modal is shown
settingModal.addEventListener('shown.bs.modal', function (event) {
    if (bootstrapModalActiveEvent){
        folderPathInput.value = savedDownloadDirectory;
        automaticUpdateToggle.checked = automaticUpdate;
        firstResultToggle.checked = firstResult;
        adjustPathToFit(savedDownloadDirectory);
    }
});
// Reset folder path input when modal is closed
settingModal.addEventListener('', function (event) {
    if (bootstrapModalActiveEvent){
        folderPathInput.value = savedDownloadDirectory;
    }
});

// Reset settings when reset button clicked
document.getElementById('resetSettingsBtn').addEventListener('click', async () => {
    const confirmation = confirm("Êtes-vous sûr de vouloir tout réinitialiser ? Cela supprimera toutes les configurations et les sessions ouvertes.");
    if (confirmation) {
        // Reset settings to default values
        window.electronAPI.forgetAll();
    }
});