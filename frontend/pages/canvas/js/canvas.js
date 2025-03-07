// Retrieve canvas elements and their drawing contexts
const canvas = document.getElementById('pixel-canvas');
const ctx = canvas.getContext('2d');
const gridCanvas = document.getElementById('grid-canvas');
const gridCtx = gridCanvas.getContext('2d');
const cursorCanvas = document.getElementById('cursor-canvas');
const cursorCtx = cursorCanvas.getContext('2d');

// Elements for displaying canvas dimensions
const canvasWidthDisplay = document.getElementById('canvas-width-display');
const canvasHeightDisplay = document.getElementById('canvas-height-display');
const canvasContainer = document.querySelector('.canvas-container');

const pixelSize = 10; // Each pixel measures 10x10 pixels

let showGrid = true;       // Control flag for grid display
let savedImageData = null; // For storing canvas state for reset

// Initialize the canvas with given dimensions and artwork ID
function initCanvas(width, height, artworkId) {
    const canvasWidth = width * pixelSize;
    const canvasHeight = height * pixelSize;

    // Set canvas, grid, and cursor canvas sizes
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    gridCanvas.width = canvasWidth;
    gridCanvas.height = canvasHeight;
    cursorCanvas.width = canvasWidth;
    cursorCanvas.height = canvasHeight;

    // Update displayed canvas dimensions
    canvasWidthDisplay.textContent = width;
    canvasHeightDisplay.textContent = height;

    // Save current state, update transformation, and draw grid
    saveState();
    updateTransform();
    drawGrid();

    // Adjust scaling to fit the canvas within its container
    adjustScaleToFitCanvas();
}

// Adjust the canvas scale so that it fits within the container
function adjustScaleToFitCanvas() {
    const containerWidth = canvasContainer.clientWidth;
    const containerHeight = canvasContainer.clientHeight;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Calculate scale factors for width and height and choose the smaller
    const scaleX = containerWidth / canvasWidth;
    const scaleY = containerHeight / canvasHeight;
    const newScale = Math.min(scaleX, scaleY);
    defaultScale = newScale;
    scale = defaultScale;

    // Apply the new scale
    zoomCanvas(newScale);
}

// Update canvas container size and apply scaling transformation
function updateTransform() {
    canvasContainer.style.width = `${canvas.width * scale}px`;
    canvasContainer.style.height = `${canvas.height * scale}px`;
    canvas.style.width = `${canvas.width * scale}px`;
    canvas.style.height = `${canvas.height * scale}px`;
    gridCanvas.style.width = `${canvas.width * scale}px`;
    gridCanvas.style.height = `${canvas.height * scale}px`;
    cursorCanvas.style.width = `${canvas.width * scale}px`;
    cursorCanvas.style.height = `${canvas.height * scale}px`;

    // Center the container and apply scaling
    canvasContainer.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

// Draw a grid overlay on the canvas
function drawGrid() {
    gridCtx.save();
    gridCtx.strokeStyle = '#cccccc';
    gridCtx.lineWidth = 0.5;

    // Draw vertical grid lines
    for (let x = 0; x <= canvas.width; x += pixelSize) {
        gridCtx.beginPath();
        gridCtx.moveTo(x, 0);
        gridCtx.lineTo(x, canvas.height);
        gridCtx.stroke();
    }
    // Draw horizontal grid lines
    for (let y = 0; y <= canvas.height; y += pixelSize) {
        gridCtx.beginPath();
        gridCtx.moveTo(0, y);
        gridCtx.lineTo(canvas.width, y);
        gridCtx.stroke();
    }
    gridCtx.restore();
}

// Toggle the grid visibility and redraw accordingly
function toggleGrid() {
    showGrid = !showGrid;
    redrawGrid();
}

// Clear the grid and redraw it if necessary
function redrawGrid() {
    gridCtx.clearRect(0, 0, canvas.width, canvas.height);
    if (showGrid) {
        drawGrid();
    }
}

// Save the current canvas state for potential reset
function saveCanvasState() {
    savedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

// Bind the toggle grid button click event
document.getElementById('toggle-grid').addEventListener('click', toggleGrid);

// Draw a brush preview at the given canvas coordinates
function drawBrushPreview(x, y) {
    console.log('Drawing brush preview at:', x, y);
    cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);

    // Calculate the top-left position of the preview rectangle
    const startX = x - Math.floor(brushSize / 2);
    const startY = y - Math.floor(brushSize / 2);

    // Draw the preview rectangle with a red outline
    cursorCtx.strokeStyle = 'rgba(255, 0, 0, 0.75)';
    cursorCtx.lineWidth = 1.5;
    cursorCtx.strokeRect(
        startX * pixelSize,
        startY * pixelSize,
        brushSize * pixelSize,
        brushSize * pixelSize
    );
}

// Adjust canvas scale on window resize
window.addEventListener('resize', () => {
    adjustScaleToFitCanvas();
    updateTransform();
});

// Set up mouse event listeners once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    console.log('Canvas element found:', canvas);
    canvas.focus();

    console.log('Binding mouse events...');
    canvas.addEventListener('mousedown', (e) => {
        console.log('Mouse down event triggered');
        const x = Math.floor(e.offsetX / pixelSize);
        const y = Math.floor(e.offsetY / pixelSize);

        // Draw brush preview on the cursor canvas
        drawBrushPreview(x, y);
        isDrawing = true;      // Start drawing
        handleDraw(x, y);      // Draw the initial pixel
    });
    console.log('Mouse down event bound.');

    canvas.addEventListener('mousemove', (e) => {
        console.log('Mouse move event triggered');
        const x = Math.floor(e.offsetX / pixelSize);
        const y = Math.floor(e.offsetY / pixelSize);

        // Update the brush preview position
        drawBrushPreview(x, y);
        if (isDrawing) {
            handleDraw(x, y);  // Draw pixel only when mouse is pressed
        }
    });

    canvas.addEventListener('mouseup', () => {
        console.log('Mouse up event triggered');
        isDrawing = false;     // Stop drawing
        saveState();           // Save current canvas state
    });

    canvas.addEventListener('mouseleave', () => {
        console.log('Mouse leave event triggered');
        isDrawing = false;     // Stop drawing when mouse leaves canvas
        saveState();           // Save current canvas state
    });
});

// Rotate canvas buttons
document.getElementById('rotate-left').addEventListener('click', () => {
    rotateCanvas(canvas, ctx, -90);  // Rotate canvas 90° counterclockwise
    rotation -= 90;
});

document.getElementById('rotate-right').addEventListener('click', () => {
    rotateCanvas(canvas, ctx, 90);   // Rotate canvas 90° clockwise
    rotation += 90;
});

// Bind horizontal flip button
document.getElementById('horizontal-flip').addEventListener('click', function () {
    flipHorizontal(canvas, ctx);
});

// Bind vertical flip button
document.getElementById('vertical-flip').addEventListener('click', function () {
    flipVertical(canvas, ctx);
});
