document.addEventListener('DOMContentLoaded', function () {
    // Get the element that displays the username
    const usernameDisplay = document.getElementById('usernameDisplay');

    // Parse URL parameters to retrieve the username
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');

    // If a username exists, display it and optionally fetch history data;
    // otherwise, redirect to the login page.
    // if (username) {
    //     usernameDisplay.textContent = username; // Display the username
    //     fetchHistoryData(username); // Retrieve history data based on the username
    // } else {
    //     window.location.href = '../login/login.html'; // Redirect to login page if username is missing
    // }

    // Get the "New Project" button element
    const newProjectButton = document.getElementById('newProject');

    // Get the mode selection panel element
    const modeSelectionPanel = document.getElementById('modeSelectionPanel');

    // Get the mode selection buttons
    const soloModeButton = document.getElementById('soloMode');
    const multiplayerModeButton = document.getElementById('multiplayerMode');

    // When "New Project" is clicked, display the mode selection panel
    if (newProjectButton) {
        newProjectButton.addEventListener('click', function () {
            modeSelectionPanel.style.display = 'flex'; // Show the mode selection overlay
        });
    }

    // When Solo mode is selected, redirect to the solo canvas page
    if (soloModeButton) {
        soloModeButton.addEventListener('click', function () {
            window.location.href = '../canvas/canvas.html?mode=solo'; // Navigate to solo mode canvas
        });
    }

    // When Multiplayer mode is selected, redirect to the multiplayer canvas page
    if (multiplayerModeButton) {
        multiplayerModeButton.addEventListener('click', function () {
            window.location.href = '../canvas/canvas.html?mode=multiplayer'; // Navigate to multiplayer mode canvas
        });
    }
});

// Function to fetch history data for a given username
function fetchHistoryData(username) {
    // Simulate an API call to retrieve history data based on the username
    const apiUrl = `https://example.com/api/history?username=${username}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Dynamically generate history items using the retrieved data
            const historyList = document.querySelector('.history-list');
            historyList.innerHTML = ''; // Clear existing content

            data.forEach(item => {
                // Create a new history item element
                const historyItem = document.createElement('div');
                historyItem.classList.add('history-item');
                historyItem.setAttribute('data-url', item.url);

                // Create and populate an element for the artwork ID
                const artworkId = document.createElement('span');
                artworkId.classList.add('artwork-id');
                artworkId.textContent = item.artworkId;

                // Create and populate an element for the modified time
                const modifiedTime = document.createElement('span');
                modifiedTime.classList.add('modified-time');
                modifiedTime.textContent = item.modifiedTime;

                // Append the artwork ID and modified time to the history item
                historyItem.appendChild(artworkId);
                historyItem.appendChild(modifiedTime);

                // Append the history item to the history list container
                historyList.appendChild(historyItem);
            });

            // Add a click event to each history item to navigate to its corresponding canvas page
            const historyItems = document.querySelectorAll('.history-item');
            historyItems.forEach(item => {
                item.addEventListener('click', function () {
                    const url = item.getAttribute('data-url');
                    window.location.href = url; // Redirect to the canvas page
                });
            });
        })
        .catch(error => {
            console.error('Error fetching history data:', error);
        });
}
