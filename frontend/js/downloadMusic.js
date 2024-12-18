// The queue that contain every infos
let downloadQueue = [];
let isDownloading = false; 

let isDownloadingPaused = false

// Add a music to the download queue
function addToDownloadQueue(musicItemClass) {
    musicItem = musicItemClass.mainDiv;
    id = musicItem.id;
    // Get all info of the music item
    const url = musicItem.querySelector('.music-item-url').value;
    const title = musicItem.querySelector('.music-item-title').value;
    const author = musicItem.querySelector('.music-item-author').value;
    const thumbnail = musicItem.querySelector('.music-item-thumbnail').getAttribute("src");
    const format = musicItem.querySelector('.music-item-format').value;
    // Change the id from "no-download-[id]" to "to-download-[id]"
    id = id.replace("no", "to")
    
    // Create the item in the list of music to download
    const toDownloadItem = document.createElement('div');
    toDownloadItem.id = id
    toDownloadItem.className = 'download-music w-100 bg-body-tertiary rounded-2 p-2 d-flex flex-row align-items-center overflow-hidden position-relative';
    toDownloadItem.innerHTML = `
            <div class="bg-black position-absolute start-0 end-0 bottom-0 top-0 z-1 opacity-75 center only-downloading">
                <i class="fs-4 bi bi-download text-white position-absolute"></i>
                <div class="spinner-border text-white position-absolute" style="width: 3rem; height: 3rem;" role="status"></div>
            </div>
            <img src="${thumbnail}" class="h-100 rounded">
            <div class="w-100 d-flex flex-column overflow-hidden ms-1">
                <p class="text-truncate mb-0 fw-semibold">${title}</p>
                <p class="text-truncate mb-0 text-secondary" style="letter-spacing: -0.5px; font-size: 14px;">${author}</p>
            </div>`
    
    // Add info of the item to the download queue
    downloadQueue.push({ url, title, thumbnail, author, id, format });

    // Add the created item in the list of music to download
    downloadQueueList.appendChild(toDownloadItem);
    // Remove the old music item of the music list
    musicItemClass.destroy();

    // Start the downloading
    startDownload();
}

// Start the downloading or do nothing if 'idDownloading === true'
async function startDownload() {
    downloadQueueList.classList.remove("download-paused")
    if (isDownloading || downloadQueue.length === 0 || isDownloadingPaused) return;
    isDownloading = true;

    // Run while the downloading queue is not empty
    while (downloadQueue.length > 0) {
    // Get music info in the download queue
    const { url, title, thumbnail, author, id, format } = downloadQueue[0];
    downloadingThisMusic = true;

    // Set the downloading class to the download music item
    currentDownloadingItem = document.getElementById(id);
    currentDownloadingItem.classList.add("downloading")

    // Run while the music is not downloaded or the user cancel the downloading of this music
    while (downloadingThisMusic){
        try {
        // Ask the 'backend' part to download the music
        const res = await window.electronAPI.downloadMusic(url, title, thumbnail, author, format);
        const err = res.error
        if (!err){
            downloadingThisMusic = false;
        }else {
            if (err == 1){ createAlert("Une erreur à eu lieu lors du téléchargement", "danger") }
            else {createAlert(err, "danger")}
            downloadQueueList.classList.add("download-paused")
            currentDownloadingItem.classList.remove("downloading")
            isDownloadingPaused = true
            isDownloading = false
            return
        }
        } catch (error) {
        console.error('Erreur lors du téléchargement :', error);
        downloadQueueList.classList.add("download-paused")
        currentDownloadingItem.classList.remove("downloading")
        isDownloadingPaused = true
        isDownloading = false
        createAlert("Une erreur à eu lieu lors du téléchargement", "danger")
        return
        }
    }
    // Remove the item
    downloadQueue.shift();
    downloadQueueList.removeChild(currentDownloadingItem)
    }

    // Stop downloading
    isDownloading = false;
}

// Buttons to add all music to the download list
document.querySelectorAll('.download-all').forEach(button => {
    button.addEventListener('click', () => {
        const forcedFormat = button.getAttribute('format');
        const allMusicItems = document.querySelectorAll('.music-item');
        allMusicItems.forEach((musicItem) => {
            if(!musicItem.classList.contains("not-ready")){
                const musicItemClass = musicItemDict[musicItem.id];
                if (musicItemClass){
                    // If format is "prechoose", keep the music's format
                    // Otherwise use the forced format (mp3 or mp4)
                    if (forcedFormat !== "prechoose") {
                        musicItem.querySelector('.music-item-format').value = forcedFormat;
                    }
                    addToDownloadQueue(musicItemClass);
                } else {
                    musicList.removeChild(musicItem);
                }
            }
        });
    });
});
