// transform.js
const canvasContainer = document.querySelector(".canvas-container");
const defaultRotation = 0;
const defaultX = 0;
const defaultY = 0;
const scaleStep = 0.1;
const defaultIsFlippedHorizontal = false;
const defaultIsFlippedVertical = false;

let defaultScale = 1;
let scale = defaultScale;
window.rotation = defaultRotation;
let isDragging = false;
let startX, startY;
let translateX = defaultX, translateY = defaultY;
window.isFlippedHorizontal = defaultIsFlippedHorizontal;
window.isFlippedVertical = defaultIsFlippedVertical;

// 更新画布变换
function updateTransform() {
    const canvasWidth = canvas.width * scale;
    const canvasHeight = canvas.height * scale;

    // 设置容器的尺寸
    canvasContainer.style.width = `${canvasWidth}px`;
    canvasContainer.style.height = `${canvasHeight}px`;

    // 居中显示
    canvasContainer.style.transform = `translate(-50%, -50%) scale(${scale})`;
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
    rotateCanvas(canvas, ctx, -90); // 逆时针旋转 90°
    window.rotation -= 90;
    // updateTransform();
});

document.getElementById('rotate-right').addEventListener('click', () => {
    rotateCanvas(canvas, ctx, 90); // 顺时针旋转 90°
    window.rotation += 90;
    // updateTransform();
});

// 绑定按钮点击事件
document.getElementById('horizontal-flip').addEventListener('click', function () {
    flipHorizontal(canvas, ctx);
});

document.getElementById('vertical-flip').addEventListener('click', function () {
    flipVertical(canvas, ctx);
});

// 旋转画布的像素数据
function rotateCanvas(canvas, ctx, degrees) {
    const width = canvas.width;
    const height = canvas.height;

    // 获取画布的像素数据
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // 创建一个新的画布来存储旋转后的像素数据
    const newCanvas = document.createElement('canvas');
    const newCtx = newCanvas.getContext('2d');

    let newWidth, newHeight;

    // 根据旋转角度调整新画布的尺寸
    if (degrees === 90 || degrees === 270) {
        newWidth = height;
        newHeight = width;
    } else {
        newWidth = width;
        newHeight = height;
    }

    newCanvas.width = newWidth;
    newCanvas.height = newHeight;

    // 创建新的像素数据
    const newImageData = newCtx.createImageData(newWidth, newHeight);
    const newData = newImageData.data;

    // 旋转像素数据
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            let newX, newY, newIndex;

            if (degrees === 90) {
                newX = y;
                newY = width - x - 1;
            } else if (degrees === 180) {
                newX = width - x - 1;
                newY = height - y - 1;
            } else if (degrees === 270) {
                newX = height - y - 1;
                newY = x;
            } else {
                newX = x;
                newY = y;
            }

            newIndex = (newY * newWidth + newX) * 4;

            // 复制像素数据
            newData[newIndex] = data[index];         // R
            newData[newIndex + 1] = data[index + 1]; // G
            newData[newIndex + 2] = data[index + 2]; // B
            newData[newIndex + 3] = data[index + 3]; // A
        }
    }

    // 将旋转后的像素数据写回画布
    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.putImageData(newImageData, 0, 0);
}

// 水平翻转
function flipHorizontal(canvas,ctx) {
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
    window.isFlippedHorizontal = !window.isFlippedHorizontal;
}

// 垂直翻转
function flipVertical(canvas,ctx) {
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
    window.isFlippedVertical = !window.isFlippedVertical;
}


// 缩放画布
function zoomCanvas(newScale) {
    scale = newScale;
    updateTransform();
}

document.getElementById('zoomin-tool').addEventListener('click', () => {
    zoomCanvas(scale + scaleStep);
});

document.getElementById('zoomout-tool').addEventListener('click', () => {
    zoomCanvas(scale - scaleStep);
});

// 重置画布
document.getElementById('reset-canvas').addEventListener('click', () => {
    translateX = defaultX;
    translateY = defaultY;
    window.rotation = defaultRotation;
    scale = defaultScale;
    // 如果当前是水平翻转状态，则再次翻转以恢复
    if (window.isFlippedHorizontal) {
        flipHorizontal(canvas,ctx);
    }

    // 如果当前是垂直翻转状态，则再次翻转以恢复
    if (window.isFlippedVertical) {
        flipVertical(canvas,ctx);
    }
    window.isFlippedHorizontal = false;
    window.isFlippedVertical = false;
    // updateTransform();
});

// 绑定按钮点击事件
document.getElementById('horizontal-flip').addEventListener('click', function () {
    flipHorizontal(canvas, ctx);
});

document.getElementById('vertical-flip').addEventListener('click', function () {
    flipVertical(canvas, ctx);
});