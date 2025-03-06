// tools.js

// 工具状态
let currentTool = 'pencil'; // 当前选中的工具
let currentColor = '#000000'; // 当前颜色
let brushSize = 1; // 笔刷大小
let isDrawing = false; // Track if the mouse is pressed

// 获取工具按钮元素
const pencilTool = document.getElementById('pencil-tool');
const bucketTool = document.getElementById('bucket-tool');
const eraserTool = document.getElementById('eraser-tool');
const colorpickerTool = document.getElementById('colorpicker-tool');
const brushSizeInput = document.getElementById('brush-size');
const colorPickerInput = document.getElementById('color-picker');

// 初始化工具事件监听
function initTools() {
    // 铅笔工具
    pencilTool.addEventListener('click', () => {
        currentTool = 'pencil';
        setActiveTool(pencilTool);
    });

    // 油漆桶工具
    bucketTool.addEventListener('click', () => {
        currentTool = 'bucket';
        setActiveTool(bucketTool);
    });

    // 橡皮擦工具
    eraserTool.addEventListener('click', () => {
        currentTool = 'eraser';
        setActiveTool(eraserTool);
    });

    // 取色器工具
    colorpickerTool.addEventListener('click', () => {
        currentTool = 'colorpicker';
        setActiveTool(colorpickerTool);
    });

    // 笔刷大小调整
    brushSizeInput.addEventListener('input', (e) => {
        brushSize = parseInt(e.target.value);
    });

    // 颜色选择器
    colorPickerInput.addEventListener('input', (e) => {
        currentColor = e.target.value;
    });
}

// Color picker event listener
document.getElementById('color-picker').addEventListener('input', (e) => {
    currentColor = e.target.value;
});

// Clear canvas event listener
document.getElementById('clear-canvas').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

document.querySelectorAll('.color-palette .color').forEach(color => {
    color.addEventListener('click', () => {
        currentColor = color.getAttribute('data-color');
        document.getElementById('color-picker').value = currentColor;
    });
});



// 设置当前工具为选中状态
function setActiveTool(tool) {
    // 移除所有工具的选中状态
    pencilTool.classList.remove('active');
    bucketTool.classList.remove('active');
    eraserTool.classList.remove('active');
    colorpickerTool.classList.remove('active');

    // 设置当前工具为选中状态
    tool.classList.add('active');
}

// 处理绘制逻辑
function handleDraw(x, y) {
    console.log('Handling draw at:', x, y); // 确保函数执行
    
    if (x < 0 || x >= canvas.width / pixelSize || 
        y < 0 || y >= canvas.height / pixelSize) return;

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

// 使用笔刷大小绘制像素
function drawPixelWithBrushSize(x, y) {
    ctx.fillStyle = currentColor;

    const startX = x - Math.floor(brushSize / 2);
    const startY = y - Math.floor(brushSize / 2);

    ctx.fillRect(
        startX * pixelSize, // 起始 X
        startY * pixelSize, // 起始 Y
        brushSize * pixelSize, // 宽度
        brushSize * pixelSize // 高度
    );
}

function drawPixel(x, y) {
    ctx.fillStyle = currentColor;
    ctx.fillRect(
        x * pixelSize, // 起始 X
        y * pixelSize, // 起始 Y
        pixelSize, // 宽度
        pixelSize // 高度
    );
}

// 填充区域（油漆桶工具）
function fillArea(x, y) {
    const targetColor = getPixelColor(x, y);

    if (!targetColor || targetColor === currentColor) return;

    const stack = [[x, y]]; // 使用栈存储待填充的像素
    const filled = new Set(); // 记录已经填充的像素
    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1] // 左、右、上、下
    ];

    while (stack.length > 0) {
        const [currentX, currentY] = stack.pop();
        const pixelKey = `${currentX},${currentY}`;

        // 如果越界或者已填充，跳过
        if (currentX < 0 || currentX >= canvas.width / pixelSize || 
            currentY < 0 || currentY >= canvas.height / pixelSize || filled.has(pixelKey)) {
            continue;
        }

        // 如果像素颜色不等于目标颜色，跳过
        const pixelColor = getPixelColor(currentX, currentY);
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

// 擦除像素
function erasePixel(x, y) {
    const startX = x - Math.floor(brushSize / 2);
    const startY = y - Math.floor(brushSize / 2);

    ctx.globalCompositeOperation = 'destination-out'; // 让填充变透明
    ctx.fillRect(
        startX * pixelSize, // 起始 X
        startY * pixelSize, // 起始 Y
        brushSize * pixelSize, // 宽度
        brushSize * pixelSize // 高度
    );
    ctx.globalCompositeOperation = 'source-over'; // 恢复正常绘制模式
}

// 取色器功能：获取点击位置的颜色
function pickColor(x, y) {
    const color = getPixelColor(x, y); // 获取颜色
    currentColor = color; // 设置为当前颜色
    colorPickerInput.value = rgbToHex(color); // 更新颜色选择器
}

// 获取像素颜色
function getPixelColor(x, y) {
    const imageData = ctx.getImageData(x * pixelSize, y * pixelSize, 1, 1).data;
    const alpha = imageData[3]; // Alpha channel

    if (alpha === 0) {
        return 'transparent'; // 返回透明值
    }

    const r = imageData[0].toString(16).padStart(2, '0');
    const g = imageData[1].toString(16).padStart(2, '0');
    const b = imageData[2].toString(16).padStart(2, '0');

    return `#${r}${g}${b}`;
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

// 初始化工具
initTools();