document.addEventListener('DOMContentLoaded', function () {
    // 获取显示用户名的元素
    const usernameDisplay = document.getElementById('usernameDisplay');

    // 获取 URL 参数中的用户名
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');

    // 如果用户名存在，显示在页面上；否则跳转回登录页面
    // if (username) {
    //     usernameDisplay.textContent = username; // 显示用户名
    // } else {
    //     window.location.href = '../login/index.html'; // 如果没有用户名，跳转到登录页面
    // }

    // 获取按钮元素
    const singlePlayerButton = document.getElementById('singlePlayer');
    const multiPlayerButton = document.getElementById('multiPlayer');

    // 处理 "Single Player" 按钮点击
    if (singlePlayerButton) {
        singlePlayerButton.addEventListener('click', function () {
            // 跳转到 canvas.html（单机模式）
            window.location.href = '../canvas/canvas.html';
        });
    }

    // 处理 "Multiplayer" 按钮点击
    if (multiPlayerButton) {
        multiPlayerButton.addEventListener('click', function () {
            // 跳转到 multiplayer.html（多人模式）
            window.location.href = '../multiplayer.html';
        });
    }
});