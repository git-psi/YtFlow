// The modal that contain the youtube video when you click on a thumbnail
const videoModal = document.getElementById("viewVideoModal")
const videoModalObject = new bootstrap.Modal(videoModal)
const videoFrame = document.getElementById("viewVideoFrame")
const videoTitle = document.getElementById("viewVideoTitle")

// The modal that contain the spotify video when you click on a thumbnail
const spotifyModal = document.getElementById("spotifyModal")
const spotifyModalObject = new bootstrap.Modal(spotifyModal)
const spotifyFrame = document.getElementById("spotifyFrame")

// All components of the search bar
const searchBarForm = document.getElementById('searchBarForm');
const searchBarInput = document.getElementById('searchBarInput');
const searchBarButton = document.getElementById('searchBarButton');

// The buttons to restart or go to the next downloading music
const restartDownloadingBtn = document.getElementById('restartDownloadingBtn');
const goToNextDownloadBtn = document.getElementById('goToNextDownloadBtn');

// If the video modal or the spotify modal is closed, return to the search modal
let returnToSearchModal = false;

// The div that contain the list of downloading musics
const downloadQueueList = document.getElementById('downloadQueue');

// The button to open the folder
const openFolderBtn = document.getElementById('openFolderBtn');

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('spotifyPlaylistsBtn').style.setProperty('display', 'none', 'important');
});

// When the user click on the open folder button, open the folder in wich the musics are downloaded
openFolderBtn.addEventListener('click', async () => {
  const res = await window.electronAPI.openFolder()
  if (res && res.error){
    createAlert(res.error, 'danger')
  }
})

// Close the video when the video modal is closed
videoModal.addEventListener('hidden.bs.modal', function (event) {
  if (bootstrapModalActiveEvent){
    videoFrame.removeAttribute("src")
    if (returnToSearchModal){
      searchModalObject.show()
      returnToSearchModal = false;
    }
  }
});

// Close the spotify iframe when the spotify modal is closed
spotifyModal.addEventListener('hidden.bs.modal', function (event) {
  if (bootstrapModalActiveEvent){
    spotifyFrame.removeAttribute("src")
    if (returnToSearchModal){
      searchModalObject.show()
      returnToSearchModal = false;
    }
  }
});

// When click on targets buttons, open the video modal (with the video)
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('openEmbedVideoBtn')) {
    const button = event.target;
    const musicTitle = document.getElementById("music-title-"+button.getAttribute('music-id')).value
    
    videoTitle.innerText = musicTitle
    videoFrame.setAttribute("src", button.getAttribute("embed-url"));
    videoModalObject.show();
  }
});

// When the user write in the search bar, check if the url is a valid youtube url
searchBarInput.addEventListener('input', () => {
  if (isValidUrl(searchBarInput.value)){
    searchBarForm.classList.add("url")
  }else {
    searchBarForm.classList.remove("url")
  }
})

// When the user submit the search bar, check if the url is a valid youtube url
searchBarForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const input = searchBarInput.value;
  
  searchFromInput(input);
});

function searchFromInput(input){
  if (input){
    if (input.toLowerCase() == "spotify"){
      document.getElementById('spotifyPlaylistsBtn').style.removeProperty('display', 'none', 'important');
    }
    else if (isValidUrl(input)){
      const musicItem = new MusicItem(url=input)
      musicItem.searchComplementaryInfo()
    }else {
      if (!firstResult){
        searchVideos(input)
      }else {
        const musicItem = new MusicItem()
        musicItem.setFromSearch(input)
      }
    }
    searchBarInput.value = ""
    searchBarForm.classList.remove("url")
  }
}

window.electronAPI.searchFromString((event, input) => {
    searchFromInput(input);
})

// When the user click on the restart downloading button, restart the download
restartDownloadingBtn.addEventListener('click', () => {
  isDownloadingPaused = false
  startDownload()
})

// When the user click on the go to next downloading button, go to the next downloading music
goToNextDownloadBtn.addEventListener('click', () => {
  const { id } = downloadQueue[0];
  downloadQueueList.removeChild(document.getElementById(id));
  downloadQueue.shift()
  isDownloadingPaused = false
  startDownload()
})

// Truncate a string to a certain length
function truncateString(str, maxLength) {
  return str.length > maxLength ? str.slice(0, maxLength-3) + "..." : str;
}

// Check if the url is a valid youtube url
function isValidUrl(url) {
  const youtubePattern = /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=[\w-]+$/;
  
  return youtubePattern.test(url.trim());
}

// Setup all tooltip
function setupTooltip() {
  const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  
  tooltips.forEach(tooltip => {
      // Check if the tooltip already exists
      const existingTooltip = bootstrap.Tooltip.getInstance(tooltip);
      if (!existingTooltip) {
        // Create a new instance
        new bootstrap.Tooltip(tooltip);
      }
  });
}

// Hide all tooltip
function hideTooltip() {
  const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]')

  tooltips.forEach(e => {
      const tooltip = bootstrap.Tooltip.getInstance(e);
      if (tooltip) {
          tooltip.hide();
      }
  });
}

// Hide all tooltips when any modal is closed
document.addEventListener('hidden.bs.modal', () => {
    hideTooltip();
});


// Var to check if a modal is active
let isControlPressed = false;

// Listen for keydown and keyup events to check if the Control key is pressed
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey) {
        isControlPressed = true;
    }
});
document.addEventListener('keyup', function(event) {
    if (event.key === 'Control') {
        isControlPressed = false;
    }
});