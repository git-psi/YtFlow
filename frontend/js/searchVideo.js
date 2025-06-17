// The modal that contain all search results
const searchModal = document.getElementById("searchModal")
const searchModalObject = new bootstrap.Modal(document.getElementById("searchModal"))
const allResults = document.getElementById("allResults")
const searchModalTitle = document.getElementById("searchModalTitle")
const searchModalMessage = document.getElementById("searchModalMessage")

// Delete all search results
async function deleteSearchResults() {
    const oldResultItems = allResults.querySelectorAll('.result')
    oldResultItems.forEach(e => allResults.removeChild(e))
    searchModalMessage.classList.add("d-none")
}

// Show a message in the search modal
async function showSearchModalMessage(message) {
    searchModalMessage.innerText = message
    searchModalMessage.classList.remove("d-none")
}

// Search videos in youtube
async function searchVideos(search) {
    searchModalObject.show()

    // Set the modal title
    searchModalTitle.innerText = `Recherche pour: "${truncateString(search, 20)}"`
    // Delete all search results
    deleteSearchResults()

    // Fetch all videos from youtube
    const videos = await window.electronAPI.multipleSearch(search)
    if (videos.error){
        searchModalObject.hide()
        createAlert(videos.error, 'danger')
        return
    }
    // For each video, create a result item
    videos.forEach(video => {
        // Destructure video info
        const { infoTitle, infoUrl, infoThumbnail, infoAuthor, infoDurationString } = video;

        // Create a result item
        const resultItem = document.createElement('div');
        resultItem.className = 'result w-100 bg-body-secondary rounded-2 p-2 d-flex flex-row align-items-center overflow-hidden position-relative';
        resultItem.style = 'height: 70px;'
        resultItem.innerHTML = `
            <div class="h-100 position-relative">
                <img src="${infoThumbnail}" class="h-100 rounded">
                <button class="viewVideoBtn border-0 position-absolute top-0 bottom-0 start-0 end-0 bg-black center thumbnailHover rounded">
                    <i class="bi-play-circle text-white fs-1 pe-none"></i>
                </button>
            </div>
            <div class="w-100 d-flex flex-column overflow-hidden ms-2">
                <p class="text-truncate mb-0 fw-semibold">${infoTitle}</p>
                <p class="text-truncate mb-0 text-secondary" style="letter-spacing: -0.5px; font-size: 14px;">${infoAuthor}</p>
            </div>
            <button class="addMusicBtn btn music-item-download-btn btn-primary p-0 ms-3" style="min-height: 38px; min-width: 38px;"><i class="bi bi-plus-circle fs-5"></i></button>`

        // Add a click event listener to buttons
        const addMusicBtn = resultItem.querySelector('.addMusicBtn')
        const viewVideoBtn = resultItem.querySelector('.viewVideoBtn')
        addMusicBtn.addEventListener('click', () => {
            new MusicItem(infoUrl, infoTitle, infoAuthor, infoThumbnail, infoDurationString)

            if (!isControlPressed){
                deleteSearchResults()
                searchModalObject.hide()
            }
        })
        viewVideoBtn.addEventListener('click', () => {
            videoTitle.innerText = infoTitle
            videoFrame.setAttribute("src", infoUrl.replace("watch?v=", "embed/"));
            returnToSearchModal = true;
            videoModalObject.show();
            searchModalObject.hide();
        })

        // Add the result item to the all results div
        allResults.appendChild(resultItem)
    });
}