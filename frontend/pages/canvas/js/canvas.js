// canvas.js
const canvas = document.getElementById('pixel-canvas');
const ctx = canvas.getContext('2d');
const gridCanvas = document.getElementById('grid-canvas');
const gridCtx = gridCanvas.getContext('2d');
const cursorCanvas = document.getElementById('cursor-canvas');
const cursorCtx = cursorCanvas.getContext('2d');
const canvasWidthDisplay = document.getElementById('canvas-width-display');
const canvasHeightDisplay = document.getElementById('canvas-height-display');

const pixelSize = 10; // Each pixel is 10x10 pixels

let showGrid = true; // 控制网格显示

// 初始化画布
function initCanvas(width, height, artworkId) {
    const canvasWidth = width * pixelSize;
    const canvasHeight = height * pixelSize;

    // 设置画布尺寸
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    gridCanvas.width = canvasWidth;
    gridCanvas.height = canvasHeight;
    cursorCanvas.width = canvasWidth;
    cursorCanvas.height = canvasHeight;

    // 更新显示的宽度和高度
    canvasWidthDisplay.textContent = width;
    canvasHeightDisplay.textContent = height;

    // 保存状态并初始化画布位置
    saveState();
    initCanvasPosition();

    // 根据画布大小调整缩放比例
    adjustScaleToFitCanvas();
}

// 调整缩放比例以使画布完全可见
function adjustScaleToFitCanvas() {
    const containerWidth = canvasContainer.clientWidth;
    const containerHeight = canvasContainer.clientHeight;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // 计算缩放比例
    const scaleX = containerWidth / canvasWidth;
    const scaleY = containerHeight / canvasHeight;
    const newScale = Math.min(scaleX, scaleY);
    defaultScale = newScale;
    scale = defaultScale;

    // 更新缩放比例
    zoomCanvas(newScale);
}


// 初始化画布位置
function initCanvasPosition() {
    const canvasWidth = canvas.width * scale;
    const canvasHeight = canvas.height * scale;
    canvasContainer.style.width = `${canvasWidth}px`;
    canvasContainer.style.height = `${canvasHeight}px`;
    
    // 居中显示
    canvasContainer.style.top = '50%';
    canvasContainer.style.left = '50%';
    canvasContainer.style.transform = `translate(-50%, -50%) scale(${scale})`;

    drawGrid();
}

// 绘制网格
function drawGrid() {
    gridCtx.save();
    gridCtx.strokeStyle = '#cccccc';
    gridCtx.lineWidth = 0.5;

    for (let x = 0; x <= canvas.width; x += pixelSize) {
        gridCtx.beginPath();
        gridCtx.moveTo(x, 0);
        gridCtx.lineTo(x, canvas.height);
        gridCtx.stroke();
    }

    for (let y = 0; y <= canvas.height; y += pixelSize) {
        gridCtx.beginPath();
        gridCtx.moveTo(0, y);
        gridCtx.lineTo(canvas.width, y);
        gridCtx.stroke();
    }
    gridCtx.restore();
}

function toggleGrid() {
    showGrid = !showGrid;
    redrawGrid();
}

function redrawGrid() {
    gridCtx.clearRect(0, 0, canvas.width, canvas.height); // 清空网格画布
    if (showGrid) {
        drawGrid();
    }
}

// 添加切换网格按钮
document.getElementById('toggle-grid').addEventListener('click', toggleGrid);

// 绘制笔刷预览框
function drawBrushPreview(x, y) {
	cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);

    // 找到光标所在的格子
    const startX = x - Math.floor(brushSize / 2);
	const startY = y - Math.floor(brushSize / 2);

    // 绘制矩形框
    cursorCtx.strokeStyle = 'rgba(255, 0, 0, 0.75)'; // 框的颜色和透明度
    cursorCtx.lineWidth = 1.5; // 框的线宽
    cursorCtx.strokeRect(
        startX * pixelSize, // 起始 X
        startY * pixelSize, // 起始 Y
        brushSize * pixelSize, // 宽度
        brushSize * pixelSize // 高度
    );
}

window.addEventListener('resize', () => {
    adjustScaleToFitCanvas();
    updateTransform();
});