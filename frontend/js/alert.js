// When the backend send a message, create an alert
window.electronAPI.showMessage((event, message) => {
  createAlert(message); 
});

const alertContainer = document.getElementById('alertContainer')
// Create an alert
function createAlert(message, type="primary") {
  const alertDiv = document.createElement('div')
  alertDiv.className = `alertDiv alert alert-${type} rounded-2 p-2 ps-3 pe-auto position-absolute`
  alertDiv.role = 'alert'
  alertDiv.innerHTML =`
    <div class="center justify-content-between" style="min-width: 400px; width: 800px; min-height: 30px; height: auto;">
      <p class="m-0 small-scrollbar" style="white-space: nowrap; overflow: auto;">${message}</p>
      <button class="alertCloseBtn ms-2 btn btn-${type} rounded center opacity-75" style="height: 30px; width: 30px;"><i class="bi bi-x"></i></button>
    </div>`
  alertContainer.appendChild(alertDiv)
  
  function removeAlert() {
    alertDiv.remove()
  }
  
  const closeBtn = alertDiv.querySelector('.alertCloseBtn')
  closeBtn.addEventListener('click', removeAlert)
}