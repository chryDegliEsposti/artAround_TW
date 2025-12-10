document.addEventListener('DOMContentLoaded', () => {
    const sceneContainer = document.querySelector('.scene-container') as HTMLElement;
    const contentOverlay = document.querySelector('.content-overlay') as HTMLElement;
    const enterBtn = document.getElementById('enter-btn') as HTMLButtonElement;

    // Trigger animation after a short delay to ensure model is ready/page loaded
    setTimeout(() => {
        if (sceneContainer) {
            sceneContainer.classList.add('shrunk');
        }

        if (contentOverlay) {
            contentOverlay.classList.add('visible');
        }
    }, 1000); // 1 second delay before shrinking starts

    if (enterBtn) {
        enterBtn.addEventListener('click', () => {
            // Navigate to the main site
            // Assuming main site is at root or another path. For now, just an alert or placeholder.
            console.log("Entering site...");
            window.location.href = "/"; // Change this to the actual main page URL
        });
    }
});
