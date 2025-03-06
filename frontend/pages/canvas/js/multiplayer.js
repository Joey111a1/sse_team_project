// 解析 URL 参数
const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode');

// 获取多人模式面板
const multiplayerPanel = document.getElementById('multiplayer-panel');

// 根据模式显示或隐藏面板
if (mode === 'multiplayer' && multiplayerPanel) {
    multiplayerPanel.style.display = 'block';

    // 添加多人模式按钮的事件监听器
    const inviteButton = document.getElementById('invite-friend');
    const finishDrawingButton = document.getElementById('finish-drawing');
    if (inviteButton) {
        inviteButton.addEventListener('click', function () {
            alert('Invite link copied to clipboard!');
            // 这里可以添加实际的邀请逻辑
        });
    }

    if (finishDrawingButton) {
        completeDrawingButton.addEventListener('click', function () {
            alert('Drawing marked as complete!');
            // 这里可以添加完成作画的逻辑
        });
    }
}