// Get references to update modal elements
const updateModal = new bootstrap.Modal(document.getElementById('updateAvailableModal'))
const updateVersionDesc = document.getElementById('updateVersionsDesc')
const updateButton = document.getElementById('updateButton')
const newVersionNumber = document.getElementById('newVersionNumber')
const currentVersionNumber = document.getElementById('currentVersionNumber')

let haveToOpenUpdateModal = false

// Listen for update available event from main process
window.electronAPI.showUpdateModal((event, version=[]) => {
    // Add version info and changelog to modal
    updateVersionDesc.innerHTML = `
        <div class="mt-3">
            <div class="d-flex justify-content-between align-items-center w-100"><div class="mx-2 bg-secondary w-100 rounded-5" style="height: 3px;"></div>v${version[0]}<div class="mx-2 bg-secondary w-100 rounded-5" style="height: 3px;"></div></div>
            <div class="mx-3">
                ${version[2]}
            </div>
        </div>`
    
    // Set version numbers in modal
    newVersionNumber.innerText = version[0]
    currentVersionNumber.innerText = version[1]

    if (!onboardingInProgress){
        // Show the update modal
        updateModal.show()
    }else {
        haveToOpenUpdateModal = true
    }
});

// Handle clicking update button
updateButton.addEventListener('click', () => {
    // Tell main process to start update
    window.electronAPI.update();
})