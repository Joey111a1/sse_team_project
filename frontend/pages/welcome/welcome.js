document.addEventListener('DOMContentLoaded', function () {
    // 获取显示用户名的元素
    const usernameDisplay = document.getElementById('usernameDisplay');

    // 获取 URL 参数中的用户名
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');

    // 如果用户名存在，显示在页面上；否则跳转回登录页面
    if (username) {
        usernameDisplay.textContent = username; // 显示用户名
        fetchHistoryData(username); // 根据用户名获取历史画布数据
    } else {
        window.location.href = '../login/login.html'; // 如果没有用户名，跳转到登录页面
    }

    // 获取新建项目按钮
    const newProjectButton = document.getElementById('newProject');

    // 获取模式选择面板
    const modeSelectionPanel = document.getElementById('modeSelectionPanel');

    // 获取模式选择按钮
    const soloModeButton = document.getElementById('soloMode');
    const multiplayerModeButton = document.getElementById('multiplayerMode');

    // 处理新建项目按钮点击事件
    if (newProjectButton) {
        newProjectButton.addEventListener('click', function () {
            modeSelectionPanel.style.display = 'flex'; // 显示模式选择面板
        });
    }

    // 处理 Solo 模式按钮点击事件
    if (soloModeButton) {
        soloModeButton.addEventListener('click', function () {
            window.location.href = '../canvas/canvas.html?mode=solo'; // 跳转到 Solo 模式画布页面
        });
    }

    // 处理 Multiplayer 模式按钮点击事件
    if (multiplayerModeButton) {
        multiplayerModeButton.addEventListener('click', function () {
            window.location.href = '../canvas/canvas.html?mode=multiplayer'; // 跳转到 Multiplayer 模式画布页面
        });
    }
});

// 获取历史画布数据
function fetchHistoryData() {
    const apiUrl = 'https://pixel-art.azurewebsites.net/api/history/user'; // Backend API endpoint to fetch user history

    console.log('[fetchHistoryData] Starting function execution');
    
    // Ensure the user is authenticated before making the request
    const token = localStorage.getItem('access_token');
    console.log('[fetchHistoryData] Retrieved token:', token);
    
    if (!token) {
        console.error('[fetchHistoryData] No token found. Redirecting to login.');
        window.location.href = '../login/login.html'; // Redirect to login if the user is not authenticated
        return;
    }

    console.log('[fetchHistoryData] Token exists, making fetch request to:', apiUrl);

    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Using JWT token for authorization
        }
    })
    .then(response => {
        console.log('[fetchHistoryData] Received response:', response);
        if (!response.ok) {
            console.error('[fetchHistoryData] Response not OK. Status:', response.status);
            return response.json().then(err => {
                console.error('[fetchHistoryData] Error details:', err);
                throw new Error(`Failed to fetch history data: ${err.detail || 'Unknown error'}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('[fetchHistoryData] Data received:', data);
        // Dynamically generate the history artwork list
        const historyList = document.querySelector('.history-list');
        if (!historyList) {
            console.error('[fetchHistoryData] Could not find element with class "history-list"');
            return;
        }
        historyList.innerHTML = ''; // Clear existing content

        data.forEach(item => {
            console.log('[fetchHistoryData] Processing item:', item);
            const historyItem = document.createElement('div');
            historyItem.classList.add('history-item');
            historyItem.setAttribute('data-history-id', item.id); // Store history artwork ID

            const artworkId = document.createElement('span');
            artworkId.classList.add('artwork-id');
            artworkId.textContent = `Artwork ${item.id}`;

            const modifiedTime = document.createElement('span');
            modifiedTime.classList.add('modified-time');
            modifiedTime.textContent = new Date(item.created_at).toLocaleString(); // Format date

            // Add image element if imageData exists
            const imgElement = document.createElement('img');
            if (item.imageData) {
                imgElement.src = item.imageData; // Assuming imageData is a Base64 string or data URL
            }

            historyItem.appendChild(artworkId);
            historyItem.appendChild(modifiedTime);
            historyItem.appendChild(imgElement);

            historyList.appendChild(historyItem);
        });

        // Add click event listener to each history item
        const historyItems = document.querySelectorAll('.history-item');
        console.log('[fetchHistoryData] Adding click event listeners to history items:', historyItems.length);
        historyItems.forEach(item => {
            item.addEventListener('click', function () {
                const historyId = item.getAttribute('data-history-id');
                console.log('[fetchHistoryData] History item clicked, ID:', historyId);
                window.location.href = `https://pixel-art.azurewebsites.net/api/history/${historyId}`; // Redirect to the history artwork detail page (frontend route)
            });
        });
    })
    .catch(error => {
        console.error('[fetchHistoryData] Error fetching history data:', error);
        // Optionally, display an error message to the user
        const errorMessage = document.createElement('div');
        errorMessage.textContent = 'Currently you have no existing artwork.';
        errorMessage.style.color = 'red';
        const historyList = document.querySelector('.history-list');
        if (historyList) {
            historyList.appendChild(errorMessage);
        } else {
            console.error('[fetchHistoryData] Could not find element with class "history-list" to display error message.');
        }
    });
}
