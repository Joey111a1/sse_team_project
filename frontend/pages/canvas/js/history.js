// For managing undo and redo functionality
const undoTool = document.getElementById('undo-tool');
const redoTool = document.getElementById('redo-tool');

let history = [];       // Stack for history states
let redoStack = [];     // Stack for redo states
const maxHistorySize = 20;  // Maximum number of history states to store

// Undo button event: revert to the previous canvas state
document.getElementById('undo-tool').addEventListener('click', () => {
    if (history.length > 1) {
        // Capture the current state before undoing
        const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
        if (!currentState) {
            console.error('Failed to get ImageData');
            return;
        }
        // Push current state onto the redo stack
        redoStack.push(currentState);
        // Remove the latest state from history
        history.pop();
        // Get the previous state from history
        const previousState = history[history.length - 1];
        if (previousState) {
            ctx.putImageData(previousState, 0, 0); // Restore the previous state
        }
    }
});

// Redo button event: reapply the next canvas state from the redo stack
document.getElementById('redo-tool').addEventListener('click', () => {
    if (redoStack.length > 0) {
        // Capture the current state before redoing
        const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
        if (!currentState) {
            console.error('Failed to get ImageData');
            return;
        }
        // Pop the next state from the redo stack
        const nextState = redoStack.pop();
        if (nextState) {
            ctx.putImageData(nextState, 0, 0); // Restore the next state
            history.push(nextState);           // Add it back to the history stack
        }
    }
});

// Save the current canvas state for undo/redo functionality
function saveState() {
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    if (!currentState) {
        console.error('Failed to get ImageData');
        return;
    }
    // If the current state is identical to the last saved state, do nothing
    if (history.length > 0) {
        const lastState = history[history.length - 1];
        if (arraysEqual(lastState.data, currentState.data)) return;
    }
    // Limit the history size and sync with backend if needed
    if (history.length >= maxHistorySize) {
        history.shift();
        syncWithBackend();
    }
    history.push(currentState);
    redoStack = []; // Clear redo stack after a new state is saved
    saveCanvasState(currentState);  // Optionally, save the state to the backend
}

// Compare two ImageData arrays for equality (checking RGBA values)
function arraysEqual(a, b) {
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 4) {
        if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2] || a[i + 3] !== b[i + 3]) {
            return false;
        }
    }
    return true;
}

// Sync the canvas state with the backend by sending the image data
function syncWithBackend(state) {
    const imageData = Array.from(state.data);
    fetch('/saveHistory', {
        method: 'POST',
        body: JSON.stringify({ imageData }),
        headers: { 'Content-Type': 'application/json' }
    });
}
