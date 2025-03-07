// Tool state variables
let currentTool = 'pencil';   // Currently selected tool
let currentColor = '#000000'; // Current color for drawing
let brushSize = 1;            // Brush size
let isDrawing = false;        // Flag indicating if the mouse is pressed

// Get DOM elements for tool buttons and inputs
const pencilTool = document.getElementById('pencil-tool');
const bucketTool = document.getElementById('bucket-tool');
const eraserTool = document.getElementById('eraser-tool');
const colorpickerTool = document.getElementById('colorpicker-tool');
const brushSizeInput = document.getElementById('brush-size');
const colorPickerInput = document.getElementById('color-picker');

// Initialize event listeners for tool interactions
function initTools() {
    // Pencil tool: select pencil tool on click
    pencilTool.addEventListener('click', () => {
        currentTool = 'pencil';
        setActiveTool(pencilTool);
    });

    // Bucket tool: select bucket tool on click
    bucketTool.addEventListener('click', () => {
        currentTool = 'bucket';
        setActiveTool(bucketTool);
    });

    // Eraser tool: select eraser tool on click
    eraserTool.addEventListener('click', () => {
        currentTool = 'eraser';
        setActiveTool(eraserTool);
    });

    // Color picker tool: select colorpicker tool on click
    colorpickerTool.addEventListener('click', () => {
        currentTool = 'colorpicker';
        setActiveTool(colorpickerTool);
    });

    // Update brush size when the range input changes
    brushSizeInput.addEventListener('input', (e) => {
        brushSize = parseInt(e.target.value);
    });

    // Update current color when the color input changes
    colorPickerInput.addEventListener('input', (e) => {
        currentColor = e.target.value;
    });
}

// Additional listener for color picker (redundant, but included)
document.getElementById('color-picker').addEventListener('input', (e) => {
    currentColor = e.target.value;
});

// Clear canvas event: clears the entire canvas when "clear" is clicked
document.getElementById('clear-canvas').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Event listeners for color palette selection; update current color and color input
document.querySelectorAll('.color-palette .color').forEach(color => {
    color.addEventListener('click', () => {
        currentColor = color.getAttribute('data-color');
        document.getElementById('color-picker').value = currentColor;
    });
});

// Set the active tool by adding the "active" class to the selected tool button
function setActiveTool(tool) {
    // Remove the "active" class from all tool buttons
    pencilTool.classList.remove('active');
    bucketTool.classList.remove('active');
    eraserTool.classList.remove('active');
    colorpickerTool.classList.remove('active');

    // Add the "active" class to the selected tool button
    tool.classList.add('active');
}

// Process drawing at coordinates (x, y) based on the selected tool
function handleDraw(x, y) {
    console.log('Handling draw at:', x, y); // Log draw event

    // Ensure coordinates are within canvas bounds
    if (x < 0 || x >= canvas.width / pixelSize || 
        y < 0 || y >= canvas.height / pixelSize) return;

    // Execute drawing action based on current tool
    if (currentTool === 'pencil') {
        drawPixelWithBrushSize(x, y);
    } else if (currentTool === 'bucket') {
        fillArea(x, y);
    } else if (currentTool === 'eraser') {
        erasePixel(x, y);
    } else if (currentTool === 'colorpicker') {
        pickColor(x, y);
    }
}

// Draw a pixel using the current brush size and color
function drawPixelWithBrushSize(x, y) {
    ctx.fillStyle = currentColor;

    const startX = x - Math.floor(brushSize / 2);
    const startY = y - Math.floor(brushSize / 2);

    ctx.fillRect(
        startX * pixelSize, // Starting X coordinate
        startY * pixelSize, // Starting Y coordinate
        brushSize * pixelSize, // Width of the drawn area
        brushSize * pixelSize  // Height of the drawn area
    );
}

// Draw a single pixel at (x, y) using the current color
function drawPixel(x, y) {
    ctx.fillStyle = currentColor;
    ctx.fillRect(
        x * pixelSize, // X coordinate
        y * pixelSize, // Y coordinate
        pixelSize,     // Width
        pixelSize      // Height
    );
}

// Bucket tool: fill an area starting from (x, y) with the current color
function fillArea(x, y) {
    const targetColor = getPixelColor(x, y);

    if (!targetColor || targetColor === currentColor) return;

    const stack = [[x, y]]; // Stack for pixels to fill
    const filled = new Set(); // Track filled pixels
    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1] // Directions: left, right, up, down
    ];

    while (stack.length > 0) {
        const [currentX, currentY] = stack.pop();
        const pixelKey = `${currentX},${currentY}`;

        // Skip if pixel is out of bounds or already filled
        if (currentX < 0 || currentX >= canvas.width / pixelSize || 
            currentY < 0 || currentY >= canvas.height / pixelSize || filled.has(pixelKey)) {
            continue;
        }

        // Skip if the pixel color does not match the target color
        const pixelColor = getPixelColor(currentX, currentY);
        if (pixelColor !== targetColor) continue;

        // Fill the pixel and mark it as filled
        drawPixel(currentX, currentY);
        filled.add(pixelKey);

        // Add adjacent pixels to the stack
        for (const [dx, dy] of directions) {
            stack.push([currentX + dx, currentY + dy]);
        }
    }
}

// Eraser tool: erase a pixel area by making it transparent
function erasePixel(x, y) {
    const startX = x - Math.floor(brushSize / 2);
    const startY = y - Math.floor(brushSize / 2);

    ctx.globalCompositeOperation = 'destination-out'; // Set to erase mode
    ctx.fillRect(
        startX * pixelSize, // X coordinate
        startY * pixelSize, // Y coordinate
        brushSize * pixelSize, // Width
        brushSize * pixelSize  // Height
    );
    ctx.globalCompositeOperation = 'source-over'; // Restore default drawing mode
}

// Color picker tool: pick color at (x, y) and update current color
function pickColor(x, y) {
    const color = getPixelColor(x, y); // Get color at the specified pixel
    currentColor = color;              // Update current color
    colorPickerInput.value = rgbToHex(color); // Update the color picker input
}

// Retrieve the color of the pixel at (x, y)
function getPixelColor(x, y) {
    const imageData = ctx.getImageData(x * pixelSize, y * pixelSize, 1, 1).data;
    const alpha = imageData[3]; // Get the alpha channel value

    if (alpha === 0) {
        return 'transparent'; // Return transparent if alpha is 0
    }

    const r = imageData[0].toString(16).padStart(2, '0');
    const g = imageData[1].toString(16).padStart(2, '0');
    const b = imageData[2].toString(16).padStart(2, '0');

    return `#${r}${g}${b}`; // Return color in HEX format
}

// Convert an RGB color string to HEX format
function rgbToHex(rgb) {
    if (rgb.charAt(0) === '#') return rgb;

    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return '#000000';
    const r = parseInt(match[1], 10).toString(16).padStart(2, '0');
    const g = parseInt(match[2], 10).toString(16).padStart(2, '0');
    const b = parseInt(match[3], 10).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
}

// Initialize tool event listeners
initTools();