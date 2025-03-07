document.addEventListener('DOMContentLoaded', function () {
    // 获取显示用户名的元素
    const usernameDisplay = document.getElementById('usernameDisplay');

    // 获取 URL 参数中的用户名
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');

    // 如果用户名存在，显示在页面上；否则跳转回登录页面
    // if (username) {
    //     usernameDisplay.textContent = username; // 显示用户名
        // fetchHistoryData(username); // 根据用户名获取历史画布数据
    // } else {
    //     window.location.href = '../login/login.html'; // 如果没有用户名，跳转到登录页面
    // }

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
function fetchHistoryData(username) {
    // 模拟从后端获取数据
    const apiUrl = `https://example.com/api/history?username=${username}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // 动态生成历史画布项目
            const historyList = document.querySelector('.history-list');
            historyList.innerHTML = ''; // 清空现有内容

            data.forEach(item => {
                const historyItem = document.createElement('div');
                historyItem.classList.add('history-item');
                historyItem.setAttribute('data-url', item.url);

                const artworkId = document.createElement('span');
                artworkId.classList.add('artwork-id');
                artworkId.textContent = item.artworkId;

                const modifiedTime = document.createElement('span');
                modifiedTime.classList.add('modified-time');
                modifiedTime.textContent = item.modifiedTime;

                historyItem.appendChild(artworkId);
                historyItem.appendChild(modifiedTime);

                historyList.appendChild(historyItem);
            });

            // 为历史画布项添加点击事件
            const historyItems = document.querySelectorAll('.history-item');
            historyItems.forEach(item => {
                item.addEventListener('click', function () {
                    const url = item.getAttribute('data-url');
                    window.location.href = url; // 跳转到对应的画布页面
                });
            });
        })
        .catch(error => {
            console.error('Error fetching history data:', error);
        });
}