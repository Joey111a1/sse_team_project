// Canvas setup
const canvas = document.getElementById('pixel-canvas');
const ctx = canvas.getContext('2d');

// Set canvas size
const canvasSize = 400; // 400x400 pixels
canvas.width = canvasSize;
canvas.height = canvasSize;

// Set pixel size
const pixelSize = 10; // Each pixel is 10x10 pixels
const gridSize = canvasSize / pixelSize;

// Initialize canvas with white background
ctx.globalCompositeOperation = 'source-over';
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, canvasSize, canvasSize);

// Canvas setup
const gridCanvas = document.getElementById('grid-canvas');
const gridCtx = gridCanvas.getContext('2d');

// Set canvas size
canvas.width = canvasSize;
canvas.height = canvasSize;
gridCanvas.width = canvasSize;
gridCanvas.height = canvasSize;

// 初始化网格
function initGrid() {
    drawGrid();
}

// 初始化画布位置
function initCanvasPosition() {
    const container = document.querySelector('.canvas-container');
    const canvasWidth = canvasSize * scale;
    const canvasHeight = canvasSize * scale;
    container.style.width = `${canvasWidth}px`;
    container.style.height = `${canvasHeight}px`;
    updateTransform();
    drawGrid();
}

// 页面加载后初始化
window.addEventListener('load', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空画布

    // 保存空白状态到 history
    saveState();

    // 初始化网格（如果需要）
    initCanvasPosition();
});

// 绘制网格
function drawGrid(lineColor = '#cccccc', lineWidth = 0.5) {
    gridCtx.save(); // 保存当前网格画布状态
    gridCtx.strokeStyle = lineColor;
    gridCtx.lineWidth = lineWidth;

    // 绘制垂直线
    for (let x = 0; x <= canvasSize; x += pixelSize) {
        gridCtx.beginPath();
        gridCtx.moveTo(x, 0);
        gridCtx.lineTo(x, canvasSize);
        gridCtx.stroke();
    }

    // 绘制水平线
    for (let y = 0; y <= canvasSize; y += pixelSize) {
        gridCtx.beginPath();
        gridCtx.moveTo(0, y);
        gridCtx.lineTo(canvasSize, y);
        gridCtx.stroke();
    }
    gridCtx.restore(); // 恢复网格画布状态
}

let showGrid = true; // 控制网格显示

function toggleGrid() {
    showGrid = !showGrid;
    redrawGrid();
}

function redrawGrid() {
    gridCtx.clearRect(0, 0, canvasSize, canvasSize); // 清空网格画布
    if (showGrid) {
        drawGrid();
    }
}

// 添加切换网格按钮
document.getElementById('toggle-grid').addEventListener('click', toggleGrid);

function resizeCanvas(newWidth, newHeight) {
    canvas.width = newWidth;
    canvas.height = newHeight;
    gridCanvas.width = newWidth;
    gridCanvas.height = newHeight;
    redrawGrid(); // 重新绘制网格
}





// Tool states
let currentTool = 'pencil';
let currentColor = '#000000';
let isDrawing = false; // Track if the mouse is pressed

// Get button elements
const pencilTool = document.getElementById('pencil-tool');
const bucketTool = document.getElementById('bucket-tool');
const eraserTool = document.getElementById('eraser-tool');
const colorpickerTool = document.getElementById('colorpicker-tool');

// Event listeners for tools
pencilTool.addEventListener('click', () => {
    currentTool = 'pencil';
    setActiveTool(pencilTool); // Choose Pencil
    bucketTool.classList.remove('active'); 
    eraserTool.classList.remove('active'); 
	colorpickerTool.classList.remove('active');
    brushPanel.style.display = 'flex'; // 显示 Panel
});

bucketTool.addEventListener('click', () => {
    currentTool = 'bucket';
    setActiveTool(bucketTool); // 选中 Bucket
    pencilTool.classList.remove('active');
    eraserTool.classList.remove('active');
	colorpickerTool.classList.remove('active');
    brushPanel.style.display = 'none'; // 隐藏 Panel
});

eraserTool.addEventListener('click', () => {
    currentTool = 'eraser';
    setActiveTool(eraserTool); // 选中 Eraser
    pencilTool.classList.remove('active'); 
    bucketTool.classList.remove('active'); 
	colorpickerTool.classList.remove('active');
    brushPanel.style.display = 'flex'; // 显示 Panel
});

colorpickerTool.addEventListener('click', () => {
    currentTool = 'colorpicker';
    setActiveTool(colorpickerTool); // 选中 Color Picker
    pencilTool.classList.remove('active'); 
    bucketTool.classList.remove('active'); 
	colorpickerTool.classList.remove('active');
    brushPanel.style.display = 'none'; // 隐藏 Panel
});

// Set active tool function
function setActiveTool(tool) {
    // 移除所有工具的选中状态
    pencilTool.classList.remove('active');
    bucketTool.classList.remove('active');
    eraserTool.classList.remove('active');
    colorpickerTool.classList.remove('active');
    // 设置当前工具为选中状态
    tool.classList.add('active');
}

// Color picker event listener
document.getElementById('color-picker').addEventListener('input', (e) => {
    currentColor = e.target.value;
});

// Clear canvas event listener
document.getElementById('clear-canvas').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Handle mouse events
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true; // Start drawing
    handleDraw(e); // Draw the initial pixel
});

canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) { // Only draw if the mouse is pressed
        handleDraw(e);
    }
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false; // Stop drawing
	saveState();
});

canvas.addEventListener('mouseleave', () => {
    isDrawing = false; // Stop drawing if the mouse leaves the canvas
	saveState();
});

// Handle drawing logic
function handleDraw(e) {
    const x = Math.floor(e.offsetX / pixelSize);
    const y = Math.floor(e.offsetY / pixelSize);

    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return;

    if (currentTool === 'pencil') {
        drawPixel(x, y);
    } else if (currentTool === 'bucket') {
        fillArea(x, y);
    } else if (currentTool === 'eraser') {
        erasePixel(x, y); 
    } else if (currentTool === 'colorpicker') {
        pickColor(x, y);
    }

    // saveState(); 
}

// Draw a single pixel
function drawPixel(x, y) {
    ctx.fillStyle = currentColor;
    ctx.fillRect(
        x * pixelSize, // 起始 X
        y * pixelSize, // 起始 Y
        brushSize * pixelSize, // 宽度
        brushSize * pixelSize // 高度
    );
}

// Flood fill algorithm (bucket tool)
function fillArea(x, y) {
    const targetColor = getPixelColor(x, y);
    console.log('Target Color:', targetColor); // 调试日志
    console.log('Current Color:', currentColor); // 调试日志

    if (!targetColor || targetColor === currentColor) return; // 如果目标颜色为空或与当前颜色相同，直接返回

    const stack = [[x, y]]; // 使用栈存储待填充的像素
    const filled = new Set(); // 记录已经填充的像素
    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1] // 左、右、上、下
    ];

    while (stack.length > 0) {
        const [currentX, currentY] = stack.pop();
        const pixelKey = `${currentX},${currentY}`;

        // 如果越界或者已填充，跳过
        if (currentX < 0 || currentX >= gridSize || currentY < 0 || currentY >= gridSize || filled.has(pixelKey)) {
            continue;
        }

        // 如果像素颜色不等于目标颜色，跳过
        const pixelColor = getPixelColor(currentX, currentY);
        console.log(`Checking (${currentX}, ${currentY}):`, pixelColor); // 调试日志
        if (pixelColor !== targetColor) continue;

        // 填充当前像素
        drawPixel(currentX, currentY);
        filled.add(pixelKey);

        // 将相邻像素加入栈中
        for (const [dx, dy] of directions) {
            stack.push([currentX + dx, currentY + dy]);
        }
    }
}

// Erase the pixel to white
function erasePixel(x, y) {
    ctx.globalCompositeOperation = 'destination-out'; // 让填充变透明
    ctx.fillRect(x * pixelSize, y * pixelSize, brushSize * pixelSize, brushSize * pixelSize);
    ctx.globalCompositeOperation = 'source-over'; // 恢复正常绘制模式
}

// 取色器功能：获取点击位置的颜色
function pickColor(x, y) {
    const color = getPixelColor(x, y); // 获取颜色
    currentColor = color; // 设置为当前颜色
    document.getElementById('color-picker').value = rgbToHex(color); // 更新颜色选择器
}

// 将 RGB 颜色转换为 HEX 格式
function rgbToHex(rgb) {
	if (rgb.charAt(0) === '#') return rgb;

    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return '#000000';
    const r = parseInt(match[1], 10).toString(16).padStart(2, '0');
    const g = parseInt(match[2], 10).toString(16).padStart(2, '0');
    const b = parseInt(match[3], 10).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
}

// Get the color of a specific pixel in HEX format
function getPixelColor(x, y) {
    const imageData = ctx.getImageData(x * pixelSize, y * pixelSize, 1, 1).data;
    const alpha = imageData[3]; // Alpha channel

    if (alpha === 0) {
        return 'transparent'; // Return a special value for transparency
    }

    const r = imageData[0].toString(16).padStart(2, '0');
    const g = imageData[1].toString(16).padStart(2, '0');
    const b = imageData[2].toString(16).padStart(2, '0');

    return `#${r}${g}${b}`;
}

document.querySelectorAll('.color-palette .color').forEach(color => {
    color.addEventListener('click', () => {
        currentColor = color.getAttribute('data-color');
        document.getElementById('color-picker').value = currentColor;
    });
});








// Brush Size 
const brushPanel = document.getElementById('brush-panel');
const brushSizeInput = document.getElementById('brush-size');

// 当前笔刷大小
let brushSize = 1;

// 监听滑杆输入事件
brushSizeInput.addEventListener('input', (e) => {
    brushSize = parseInt(e.target.value); // 更新笔刷大小
});









// Right Panel
const undoTool = document.getElementById('undo-tool');
const redoTool = document.getElementById('redo-tool');
const exportPngButton = document.getElementById('export-png');

// For redo/undo
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

// Export as PNG
document.getElementById('export-png').addEventListener('click', () => exportCanvas('png'));

function saveState() {
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (!currentState) {
        console.error('Failed to get ImageData');
        return;
    }

    if (history.length > 0) {
        const lastState = history[history.length - 1];
        if (arraysEqual(lastState.data, currentState.data)) return;
    }

    if (history.length >= maxHistorySize) {
        history.shift();
        syncWithBackend();
    }
    history.push(currentState);
    redoStack = [];
}

function arraysEqual(a, b) {
    if (!a || !b) return false; // 检查 a 和 b 是否存在
    if (a.length !== b.length) return false;

    // 比较每个像素的 RGBA 值
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

function syncWithBackend(state) {
    const imageData = Array.from(state.data); // 将 ImageData 转换为数组
    fetch('/saveHistory', {
        method: 'POST',
        body: JSON.stringify({ imageData }),
        headers: { 'Content-Type': 'application/json' }
    });
}

function exportCanvas(format) {
    const link = document.createElement('a');
    link.download = `pixel-art.${format}`;
    link.href = canvas.toDataURL(`image/${format}`);
    link.click();
}






// Bottom panel
// including features: canvas: rotation, zoom in/out, translation, reset
const defaultScale = 1;
const defaultRotation = 0;
const defaultX = 0;
const defaultY = 0;
const scaleStep = 0.1; // 每次缩放的比例
const canvasContainer = document.querySelector(".canvas-container");
const defaultIsFlippedHorizontal = false;
const defaultIsFlippedVertical = false;

let scale = defaultScale; // 当前缩放比例
let rotation = defaultRotation; // 当前旋转角度
let isDragging = false;
let startX, startY;
let translateX = defaultX, translateY = defaultY;
let isFlippedHorizontal = defaultIsFlippedHorizontal;
let isFlippedVertical = defaultIsFlippedVertical;

// 更新画布变换
function updateTransform() {
    canvasContainer.style.transform = `
        translate(${translateX}px, ${translateY}px)
        scale(${scale})
        rotate(${rotation}deg)
    `;
}

// 拖拽画布
canvasContainer.addEventListener('mousedown', (e) => {
    if (e.button === 1 || e.ctrlKey) { // 中键或 Ctrl + 左键
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        canvasContainer.style.cursor = 'grabbing'; // 拖拽时显示抓取中光标
    }
});

canvasContainer.addEventListener('mousemove', (e) => {
    if (isDragging) {
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        updateTransform(); // 更新变换
    }
});

canvasContainer.addEventListener('mouseup', () => {
    isDragging = false;
    canvasContainer.style.cursor = 'grab'; // 恢复抓取光标
});

canvasContainer.addEventListener('mouseleave', () => {
    isDragging = false;
    canvasContainer.style.cursor = 'grab'; // 恢复抓取光标
});

// 旋转画布
document.getElementById('rotate-left').addEventListener('click', () => {
    rotation -= 90;
    updateTransform(); // 更新变换
});

document.getElementById('rotate-right').addEventListener('click', () => {
    rotation += 90;
    updateTransform(); // 更新变换
});

// 水平翻转
function flipHorizontal() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width / 2; x++) {
            const index1 = (y * width + x) * 4;
            const index2 = (y * width + (width - x - 1)) * 4;

            for (let i = 0; i < 4; i++) {
                const temp = data[index1 + i];
                data[index1 + i] = data[index2 + i];
                data[index2 + i] = temp;
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
    isFlippedHorizontal = !isFlippedHorizontal;
}

// 垂直翻转
function flipVertical() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height / 2; y++) {
            const index1 = (y * width + x) * 4;
            const index2 = ((height - y - 1) * width + x) * 4;

            for (let i = 0; i < 4; i++) {
                const temp = data[index1 + i];
                data[index1 + i] = data[index2 + i];
                data[index2 + i] = temp;
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
    isFlippedVertical = !isFlippedVertical;
}

// 绑定按钮点击事件
document.getElementById('horizonal-flip').addEventListener('click', flipHorizontal);
document.getElementById('vertical-flip').addEventListener('click', flipVertical);

// 缩放画布
function zoomCanvas(newScale) {
    scale = newScale;
    updateTransform(); // 更新变换
}

// Zoom In
document.getElementById('zoomin-tool').addEventListener('click', () => {
    zoomCanvas(scale + scaleStep);
});

// Zoom Out
document.getElementById('zoomout-tool').addEventListener('click', () => {
    zoomCanvas(scale - scaleStep);
});

// Reset
document.getElementById('reset-canvas').addEventListener('click', () => {
    translateX = defaultX;
    translateY = defaultY;
    rotation = defaultRotation;
    scale = defaultScale;

    // 如果当前是水平翻转状态，则再次翻转以恢复
    if (isFlippedHorizontal) {
        flipHorizontal();
    }

    // 如果当前是垂直翻转状态，则再次翻转以恢复
    if (isFlippedVertical) {
        flipVertical();
    }

    // 重置翻转状态
    isFlippedHorizontal = defaultIsFlippedHorizontal;
    isFlippedVertical = defaultIsFlippedVertical;

    updateTransform(); // 更新变换
});