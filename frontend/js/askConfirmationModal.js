let bootstrapModalActiveEvent = true

const askConfimartionModal = document.getElementById('askConfimartionModal')
const askConfimartionModalTitle = document.getElementById('askConfimartionModalTitle')
const askConfimartionModalBody = document.getElementById('askConfimartionModalBody')
const askConfimartionModalBtn = document.getElementById('askConfimartionModalBtn')
const askConfimartionModalObject = new bootstrap.Modal(askConfimartionModal)
let resoled = false

async function askConfimartion(title="", content="", btnColor="danger", reopenOldModalIfAccept=true, btnTxt="Quitter"){
    return new Promise((resolve, reject) => {
        resoled = false

        // Store the currently open modal before closing it
        let openModal = null;
        document.querySelectorAll('.modal.show').forEach(modal => {
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) {
                bootstrapModalActiveEvent = false
                modalInstance.hide()
                openModal = modalInstancel 
                bootstrapModalActiveEvent = true
            }
        });

        // Customize and show the confirmation modal
        askConfimartionModalTitle.innerText = title
        askConfimartionModalBody.innerHTML = content
        askConfimartionModalBtn.className = `btn btn-${btnColor}`
        askConfimartionModalBtn.innerText = btnTxt
        askConfimartionModalObject.show()

        // Add event listener to reopen the previous modal when confirmation modal is hidden
        askConfimartionModal.addEventListener('hidden.bs.modal', () => {
            if (openModal && openModal !== askConfimartionModalObject && reopenOldModalIfAccept) {
                openModal.show();
            }else {
                if (openModal) {
                    openModal.hide();
                }
            }
            if (!resoled){
                resolve(0); // Resolve with 0 if the user cancel
            }
        }, { once: true });

        askConfimartionModalBtn.addEventListener('click', () => {
            resolve(1); // Resolve with 1 if the user clicks the button
            resoled = true
            askConfimartionModalObject.hide()
        });
    });
}