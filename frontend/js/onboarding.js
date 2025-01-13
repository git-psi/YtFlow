const onboardingTitle = document.getElementById('onboardingTitle')
const onboardingSubtitle = document.getElementById('onboardingSubtitle')
const onboardingDiv = document.getElementById('onboardingDiv')
let onboardingInProgress = true


const popoverList = [];
[document.getElementById('searchBarForm'), document.getElementById('musicList'), document.getElementById('downloadQueue')].forEach(e => {
    popoverList.push([e, new bootstrap.Popover(e, {html: true, sanitize: false})])
});

const onBoardingAlreadyCompleted = window.electronAPI.getSetting('onboardingCompleted').then((onboardingCompleted) => {
    if (!onboardingCompleted) {
        onboardingDiv.classList.add('view');
        setTimeout(() => {
            onboardingTitle.classList.add('view');
            setTimeout(() => {
                onboardingSubtitle.classList.add('view');
                setTimeout(() => {
                    onboardingTitle.classList.remove('view');
                    onboardingSubtitle.classList.remove('view');
                    onboardingTitle.classList.add('close');
                    onboardingSubtitle.classList.add('close');
                    onboardingDiv.classList.add('second-part');
                    showPopover();
                }, 2000);
            }, 2000);
        }, 2000);
    } else {
        completeOnboarding();
    }
});


// After onboarding is completed, set the flag
function completeOnboarding() {
    window.electronAPI.getSetting('onboardingCompleted').then((onBoardingAlreadyCompleted) => {
        if (!onBoardingAlreadyCompleted) {
            window.electronAPI.saveSettings([['onboardingCompleted', true]]);
        }
        onboardingInProgress = false;
        if (haveToOpenUpdateModal) {
            updateModal.show();
        }
    });
}

function showPopover(num = 0) {
    //const popoverInstance = new bootstrap.Popover(popoverList[num], {html: true, sanitize: false})
    //const popover = [popoverList[num], popoverInstance];
    const popover = popoverList[num]
    popover[0].classList.add("hasShownPopover");

    // Create a button element
    let nextButton = document.createElement('button');
    nextButton.innerText = num + 1 < popoverList.length ? 'Suivant' : 'Fermer';
    nextButton.className = 'btn btn-primary btn-sm mt-2'; // Add some styling
    nextButton.id = "onboardingNextBtn-"+num

    popover[1]._config.content = `<div class="d-flex flex-column">${popover[1]._config.content}${nextButton.outerHTML}</div>`;
    popover[1].update()

    popover[1].show();

    nextButton = document.getElementById('onboardingNextBtn-'+num)
    nextButton.addEventListener('click', function () {
        popover[0].classList.remove('hasShownPopover')
        popover[1].hide(); // Hide the current popover
        if (num+1 <  popoverList.length){
            showPopover(num + 1); // Show the next popover
        }else {
            onboardingDiv.classList.remove('view')
            completeOnboarding()
        }
    })

    if (num > 0) { // Check if it's not the first popover
        popoverList.forEach(popoverElement => {
            const existingPopover = bootstrap.Popover.getInstance(popoverElement);
            if (existingPopover) {
                existingPopover.hide(); // Hide existing popovers
            }
        });
    }
}


// Function to adjust the height of the music list dynamically
function adjustSomeDivHeight() {
    const totalLeftPartHeight = document.getElementById('totalLeftPartHeight').offsetHeight;
    const topLeftPartHeight = document.getElementById('topLeftPart').offsetHeight;

    // Calculate the total height available for the music list
    const totalHeight = totalLeftPartHeight - topLeftPartHeight - 24; // 24 for the margin

    // Set the min-height of the music list
    const musicList = document.getElementById('musicList');
    musicList.style.minHeight = totalHeight + 'px';
}

// Call the function on window resize and load
window.addEventListener('resize', adjustSomeDivHeight);
window.addEventListener('load', adjustSomeDivHeight);