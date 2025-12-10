document.addEventListener('DOMContentLoaded', function () {
    var sceneContainer = document.querySelector('.scene-container');
    var contentOverlay = document.querySelector('.content-overlay');
    var enterBtn = document.getElementById('enter-btn');
    
    setTimeout(function () {
        if (sceneContainer) {
            sceneContainer.classList.add('shrunk');
        }
        if (contentOverlay) {
            contentOverlay.classList.add('visible');
        }
    }, 1000); 
    if (enterBtn) {
        enterBtn.addEventListener('click', function () {
            
            
            console.log("Entering site...");
            window.location.href = "../home/home_user.html"; 
        });
    }
});
