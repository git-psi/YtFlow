// When the app want to quit, check if there is a music item or a downloading music item
window.electronAPI.wantQuitApp(() => {
    try {
        if (musicList.querySelector('.music-item') || downloadQueueList.querySelector('.download-music')){
            window.electronAPI.focusApp();
            askConfimartion("Fermer l'application", "Êtes-vous sûr de vouloir quitter l'application ? Les vidéos ajoutées et en cours de téléchargement ne seront pas sauvegardées !").then(accept => {
                if (accept) {
                    window.electronAPI.quitApp()
                }
            })
        } else {
            window.electronAPI.quitApp();
        }
    } catch (error) {
        console.log(error);
    }
})