// history.js
// for redo, undo
const userId = localStorage.getItem('user_id');
if (!userId) {
    console.error("User ID is not available in localStorage"); // Prevent sending the request if no user_id
}

else {
    window.is_saving = false;

    const undoTool = document.getElementById('undo-tool');
    const redoTool = document.getElementById('redo-tool');

    let history = [];
    let redoStack = [];
    const maxHistorySize = 20;

    document.getElementById('undo-tool').addEventListener('click', () => {
        if (history.length > 1) {
            const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
            if (!currentState) {
                console.error('Failed to get ImageData');
                return;
            }
            redoStack.push(currentState); // 当前状态存入重做栈
            history.pop(); // 移除最后一个状态
            const previousState = history[history.length - 1]; // 获取上一个状态
            if (previousState) {
                ctx.putImageData(previousState, 0, 0); // 恢复上一个状态
            }
        }
    });

    document.getElementById('redo-tool').addEventListener('click', () => {
        if (redoStack.length > 0) {
            const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
            if (!currentState) {
                console.error('Failed to get ImageData');
                return;
            }
            const nextState = redoStack.pop(); // 获取下一个状态
            if (nextState) {
                ctx.putImageData(nextState, 0, 0); // 恢复下一个状态
                history.push(nextState); // 当前状态存入历史记录
            }
        }
    });

    function saveState() {
        console.log("saveState function is called");  // Debug log
        const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);

        if (!currentState) {
            console.error('Failed to get ImageData');
            return;
        }

        if (history.length > 0) {
            const lastState = history[history.length - 1];
            if (arraysEqual(lastState.data, currentState.data) && !is_saving) return;
        }

        if (history.length >= maxHistorySize) {
            history.shift();
        }

        history.push(currentState);
        redoStack = [];
        if (is_saving === true) {
            syncWithBackend();
        }
        saveCanvasState();  // 保存画布状态
    }

    function arraysEqual(a, b) {
        if (!a || !b) return false;
        if (a.length !== b.length) return false;

        for (let i = 0; i < a.length; i += 4) {
            if (a[i] !== b[i] ||     // R
                a[i + 1] !== b[i + 1] || // G
                a[i + 2] !== b[i + 2] || // B
                a[i + 3] !== b[i + 3]) { // A
                return false;
            }
        }
        return true;
    }

    function syncWithBackend() {
        console.log("syncWithBackend function is called");
        // Generate a valid PNG data URL
        const dataURL = canvas.toDataURL('image/png');
        fetch('https://pixel-art.azurewebsites.net/api/history/save', {
            method: 'POST',
            body: JSON.stringify({ user_id: userId, imageData: dataURL }),
            headers: { 'Content-Type': 'application/json' }
        }).then(response => {
            if (!response.ok) {
                console.error("Failed to save history:", response.statusText);
            } else {
                console.log("History saved successfully.");
            }
        })
        .catch(error => {
            console.error("Error while saving history:", error);
        });
    }
}
