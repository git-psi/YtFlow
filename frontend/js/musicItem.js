// The music id (incremented for each music item)
var musicId = 0;

// The div that contain the list of music added
const musicList = document.getElementById('musicList');
// A dictionary to store music items by their IDs
let musicItemDict = {} // id: class

// The class that represent a music item
class MusicItem {
    constructor(url="", title="", author="", thumbnail_url="", duration_string="") {
        musicId++;
        // All self properties
        this.id = musicId;
        this.url = url;
        this.title = title;
        this.author = author;
        this.thumbnail_url = thumbnail_url;
        this.duration_string = duration_string;

        // Create the main div of the music item
        this.mainDiv = document.createElement('div')
        this.mainDiv.className = 'mb-2 d-flex rounded-2 container align-items-center p-2 border bg-body-tertiary music-item position-relative overflow-hidden not-ready';
        this.mainDiv.id = `no-download-${this.id}`,
        this.mainDiv.innerHTML = 
            `<div class="music-item-loading position-absolute top-0 bottom-0 start-0 end-0 loading-wave z-1"></div>
            <div class="rounded overflow-hidden bg-secondary-subtle position-relative d-flex">
                <div style="height: 77px; width: 137px;" class="center">
                    <img src="${this.thumbnail_url}" class="music-item-thumbnail h-100">
                    <p class="text-white position-absolute bottom-0 end-0 m-1 rounded-2 px-2 music-item-duration" style="background-color: #000000B3;"></p>
                </div>
                <button embed-url="${this.url.replace("watch?v=", "embed/")}" music-id=${musicId} class="border-0 position-absolute top-0 bottom-0 start-0 end-0 bg-black d-flex justify-content-center align-items-center thumbnailHover openEmbedVideoBtn music-item-embed">
                    <i class="bi-play-circle text-white fs-1 pe-none"></i>
                </button>
                </div>
                <div class="ms-2 d-flex flex-column h-100 flex-grow-1">
                <div class="input-group mb-2">
                    <span style="width: 35px;" class="center input-group-text" data-bs-toggle="tooltip" data-bs-title="\\, /, :, *, ?, &quot;, <, > et | sont interdit">?</span>
                    <input id="music-title-${musicId}" disabled type="text" placeholder="Nom du fichier" class="form-control music-item-title" value="${this.title}">
                </div>
                <input disabled type="text" placeholder="Auteur" class="form-control music-item-author" value="${this.author}" />
                <input class="music-item-url" value="${this.url}" hidden>
            </div>
            <div class="ms-2 d-flex flex-column justify-content-start h-100">
                <div class="d-flex flex-row mb-2">
                    <button disabled class="btn music-item-download-btn btn-primary p-0" style="height: 38px; width: 38px;"><i class="bi bi-download fs-5"></i></button>
                    <button disabled class="btn music-item-delete-btn btn-danger p-0 ms-2" style="height: 38px; width: 38px;"><i class="bi bi-trash fs-5"></i></button>
                </div>
                <select disabled class="form-select form-select-sm music-item-format">
                    <option value="mp3">Audio</option>
                    <option value="mp4">Vidéo</option>
                </select>
            </div>`

        // If all info are set, disable the loading
        if (url && title && author && thumbnail_url && duration_string){
            this.disableLoading()
        }
        // Add the music item to the music list
        musicList.appendChild(this.mainDiv);

        // Get all elements of the music item
        this.loadingDiv = this.mainDiv.getElementsByClassName('music-item-loading')[0]
        this.thumbnailImg = this.mainDiv.getElementsByClassName('music-item-thumbnail')[0]
        this.durationTxt = this.mainDiv.getElementsByClassName('music-item-duration')[0]
        this.embedBtn = this.mainDiv.getElementsByClassName('music-item-embed')[0]
        this.titleInput = this.mainDiv.getElementsByClassName('music-item-title')[0]
        this.authorInput = this.mainDiv.getElementsByClassName('music-item-author')[0]
        this.urlInput = this.mainDiv.getElementsByClassName('music-item-url')[0]
        this.downloadBtn = this.mainDiv.getElementsByClassName('music-item-download-btn')[0]
        this.deleteBtn = this.mainDiv.getElementsByClassName('music-item-delete-btn')[0]

        // Add event listeners to the buttons
        this.deleteBtn.addEventListener('click', () => {
            this.destroy();
        });
        this.downloadBtn.addEventListener('click', () => {
            addToDownloadQueue(this);
        });
        // Forbide some character in the title of the music
        this.titleInput.addEventListener('input', (event) => {
            event.target.value = event.target.value.replace(/[\\/:*?"<>|]/g, '')
        })

        setupTooltip()

        musicItemDict[`no-download-${this.id}`] = this;
    }

    // Reset all info in the music item
    async resetAllInfo() {
        this.mainDiv.classList.remove("not-ready")
        this.durationTxt.innerText = this.duration_string;
        this.thumbnailImg.setAttribute("src", this.thumbnail_url);
        this.embedBtn.setAttribute("embed-url", this.url.replace("watch?v=", "embed/"));
        this.urlInput.value = this.url;
        this.titleInput.value = this.title
        this.authorInput.value = this.author
        this.disableLoading()
        musicItemDict[`no-download-${this.id}`] = this
    }

    // Disable the loading of the music item
    async disableLoading() {
        this.mainDiv.classList.remove("not-ready")
        this.mainDiv.removeChild(this.mainDiv.querySelector('.music-item-loading'))
        this.mainDiv.querySelectorAll("[disabled]").forEach(e => e.removeAttribute('disabled'))
        musicItemDict[`no-download-${this.id}`] = this
    }

    // Search for complementary info of the music item
    async searchComplementaryInfo() {
        try {
            // Ask the info the the 'backend' part
            const videoInfo = await window.electronAPI.fetchVideoInfo(url);
            if (videoInfo.error) {
                createAlert(videoInfo.error, "danger");
                this.destroy()
                return;
            }
            let { infoTitle, infoAuthor, infoThumbnail, infoDurationString } = videoInfo;
            infoTitle = infoTitle.replace(/[\\/:*?"<>|]/g, '')
            this.title = infoTitle
            this.author = infoAuthor
            this.thumbnail_url = infoThumbnail
            this.duration_string = infoDurationString

            // Set all info in the music item
            this.resetAllInfo()

        } catch (error) {
            // If there is an error, remove the music item and alert the user
            musicList.removeChild(this.mainDiv);
            console.error('Erreur lors de la récupération des informations de la vidéo :', error);
            createAlert('Erreur lors de la récupération des informations de la vidéo', "danger");
        }
        musicItemDict[`no-download-${this.id}`] = this
    }

    async setFromSearch(input) {
        try {
            // Ask the info the the 'backend' part
            const videoInfo = await window.electronAPI.singleSearch(input);
            if (videoInfo.error) {
                createAlert(videoInfo.error, "danger");
                this.destroy()
                return;
            }
            let { infoTitle, infoUrl, infoThumbnail, infoAuthor, infoDurationString } = videoInfo;
            infoTitle = infoTitle.replace(/[\\/:*?"<>|]/g, '')
            if (!this.title) {
                this.title = infoTitle
            }
            if (!this.author) {
                this.author = infoAuthor
            }
            this.thumbnail_url = infoThumbnail
            this.duration_string = infoDurationString
            this.url = infoUrl
            
            // Set all info in the music item
            this.resetAllInfo()

        } catch (error) {
            // If there is an error, remove the music item and alert the user
            musicList.removeChild(this.mainDiv);
            console.error('Erreur lors de la récupération des informations de la vidéo :', error);
                createAlert('Erreur lors de la récupération des informations de la vidéo', "danger");
        }
        musicItemDict[`no-download-${this.id}`] = this
    }

    // Destroy the music item
    destroy() {
        delete musicItemDict[`no-download-${this.id}`]
        musicList.removeChild(this.mainDiv)
        for (let prop in this) {
            if (this.hasOwnProperty(prop)) {
            delete this[prop];
            }
        }
    }
}