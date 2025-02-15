document.addEventListener('DOMContentLoaded', function() {
    // Login Page Logic
    const submitButton = document.getElementById('submitUsername');
    if (submitButton) {
        submitButton.addEventListener('click', function() {
            const username = document.getElementById('username').value.trim();
            if (username) {
                // Simulate a username check
                if (username === 'taken') { // Replace with your actual check logic
                    errorMessage.classList.remove('hidden'); // Show error message
                } else {
                    window.location.href = `welcome.html?username=${encodeURIComponent(username)}`;
                }
            } else {
                alert('Please enter a username.');
            }
        });
    }

    // Welcome Page Logic
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay) {
        // Get username from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const username = urlParams.get('username');
        if (username) {
            usernameDisplay.textContent = username;
        } else {
            // If no username is provided, redirect back to login
            window.location.href = 'login.html';
        }
    }

    // Handle Single Player and Multiplayer buttons
    const singlePlayerButton = document.getElementById('singlePlayer');
    const multiPlayerButton = document.getElementById('multiPlayer');

    if (singlePlayerButton) {
        singlePlayerButton.addEventListener('click', function() {
            // Redirect to index.html (Single Player)
            window.location.href = 'index.html';
        });
    }

    if (multiPlayerButton) {
        multiPlayerButton.addEventListener('click', function() {
            // Redirect to multiplayer.html (Multiplayer)
            window.location.href = 'multiplayer.html';
        });
    }
});