// Parse URL parameters from the current page's URL
const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode'); // Retrieve the value of the "mode" parameter

// Get the multiplayer mode panel element
const multiplayerPanel = document.getElementById('multiplayer-panel');

// Show the multiplayer panel if the mode is "multiplayer" and the panel element exists
if (mode === 'multiplayer' && multiplayerPanel) {
    multiplayerPanel.style.display = 'block';

    // Get the invite friend button and finish drawing button
    const inviteButton = document.getElementById('invite-friend');
    const finishDrawingButton = document.getElementById('finish-drawing');
    
    // If the invite button exists, attach a click event listener
    if (inviteButton) {
        inviteButton.addEventListener('click', function () {
            alert('Invite link copied to clipboard!');
            // Add actual invite logic here
        });
    }

    // If the finish drawing button exists, attach a click event listener.
    // Note: The code uses 'completeDrawingButton', which appears to be a mistake.
    // It likely should reference 'finishDrawingButton'.
    if (finishDrawingButton) {
        completeDrawingButton.addEventListener('click', function () {
            alert('Drawing marked as complete!');
            // Add logic for marking the drawing as complete here
        });
    }
}
