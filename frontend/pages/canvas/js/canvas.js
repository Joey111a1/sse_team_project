// canvas.js
const canvas = document.getElementById('pixel-canvas');
const ctx = canvas.getContext('2d');
const gridCanvas = document.getElementById('grid-canvas');
const gridCtx = gridCanvas.getContext('2d');
const cursorCanvas = document.getElementById('cursor-canvas');
const cursorCtx = cursorCanvas.getContext('2d');
const canvasWidthDisplay = document.getElementById('canvas-width-display');
const canvasHeightDisplay = document.getElementById('canvas-height-display');
const canvasContainer = document.querySelector('.canvas-container');

const pixelSize = 10; // Each pixel is 10x10 pixels

let showGrid = true; // 控制网格显示
let savedImageData = null; // For reset

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
    updateTransform();
    drawGrid();

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

// 更新容器的缩放和尺寸
function updateTransform() {
    // 设置容器的尺寸
    canvasContainer.style.width = `${canvas.width * scale}px`;
    canvasContainer.style.height = `${canvas.height * scale}px`;
    canvas.style.width = `${canvas.width * scale}px`;
    canvas.style.height = `${canvas.height * scale}px`;
    gridCanvas.style.width = `${canvas.width * scale}px`;
    gridCanvas.style.height = `${canvas.height * scale}px`;
    cursorCanvas.style.width = `${canvas.width * scale}px`;
    cursorCanvas.style.height = `${canvas.height * scale}px`;

    // 更新容器的缩放
    // canvasContainer.style.transform = `translate(-50%, -50%) scale(${scale})`;
    canvasContainer.style.transform = `
        translate(-50%, -50%) 
        translate(${translateX}px, ${translateY}px) 
        scale(${scale})
    `;
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

// 用于reset画布变换
function saveCanvasState() {
    savedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

// 添加切换网格按钮
document.getElementById('toggle-grid').addEventListener('click', toggleGrid);

// 绘制笔刷预览框
function drawBrushPreview(x, y) {
    console.log('Drawing brush preview at:', x, y); // 确保函数执行
    
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

document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed'); // 确保 DOM 加载完成
    if (!canvas) {
        console.error('Canvas element not found!'); // 确保 canvas 元素存在
        return;
    }
    console.log('Canvas element found:', canvas); // 打印 canvas 元素
    canvas.focus(); // 确保 canvas 元素获得焦点

    console.log('Binding mouse events...'); // 确保事件绑定代码执行
    canvas.addEventListener('mousedown', (e) => {
        if (e.button === 1 || e.ctrlKey) {
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            canvasContainer.style.cursor = 'grabbing'; // Change cursor to indicate dragging
            e.preventDefault(); // Prevent default behavior (like scrolling)
            return; // Exit so drawing events aren't processed here.
        }
        console.log('Mouse down event triggered'); // 确保事件触发
        // const x = Math.floor(e.offsetX / pixelSize);
        // const y = Math.floor(e.offsetY / pixelSize);
        const rect = canvas.getBoundingClientRect();
        const effectiveScale = rect.width / canvas.width;
        // Adjust mouse coordinates by subtracting the canvas's top-left position
        // and then dividing by the current scale factor.
        const x = Math.floor((e.clientX - rect.left) / effectiveScale / pixelSize);
        const y = Math.floor((e.clientY - rect.top) / effectiveScale / pixelSize);

        // 在光标画布上绘制笔刷预览框
        drawBrushPreview(x, y);

        isDrawing = true; // Start drawing
        handleDraw(x, y); // Draw the initial pixel
    });
    console.log('Mouse down event bound.'); // 确保事件绑定完成

    canvas.addEventListener('mousemove', (e) => {
        if (isDragging) {
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateTransform();
        }
        if (!isDragging) {
            console.log('Mouse move event triggered'); // 确保事件触发
            // const x = Math.floor(e.offsetX / pixelSize);
            // const y = Math.floor(e.offsetY / pixelSize);
            const rect = canvas.getBoundingClientRect();
            const effectiveScale = rect.width / canvas.width;
            // Adjust mouse coordinates by subtracting the canvas's top-left position
            // and then dividing by the current scale factor.
            const x = Math.floor((e.clientX - rect.left) / effectiveScale / pixelSize);
            const y = Math.floor((e.clientY - rect.top) / effectiveScale / pixelSize);

            // 在光标画布上绘制笔刷预览框
            drawBrushPreview(x, y);

            if (isDrawing) { // Only draw if the mouse is pressed
                handleDraw(x, y);
            }
        }
    });

    canvas.addEventListener('mouseup', () => {
        console.log('Mouse up event triggered'); // 确保事件触发
        isDrawing = false; // Stop drawing
        isDragging = false;
        canvasContainer.style.cursor = 'grab';
        saveState();
    });

    canvas.addEventListener('mouseleave', () => {
        console.log('Mouse leave event triggered'); // 确保事件触发
        isDrawing = false; // Stop drawing if the mouse leaves the canvas
        isDragging = false;
        canvasContainer.style.cursor = 'grab';
        saveState();
    });
});

// 旋转画布
document.getElementById('rotate-left').addEventListener('click', () => {
    rotateCanvas(canvas, ctx, -90); // 逆时针旋转 90°
    rotation -= 90;
    // updateTransform();
});

document.getElementById('rotate-right').addEventListener('click', () => {
    rotateCanvas(canvas, ctx, 90); // 顺时针旋转 90°
    rotation += 90;
    // updateTransform();
});

// 绑定按钮点击事件
document.getElementById('horizontal-flip').addEventListener('click', function () {
    flipHorizontal(canvas, ctx);
});

document.getElementById('vertical-flip').addEventListener('click', function () {
    flipVertical(canvas, ctx);
});

canvasContainer.style.cursor = 'grab';
