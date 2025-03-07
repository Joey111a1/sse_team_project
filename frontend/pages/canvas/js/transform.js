// transform.js
const defaultRotation = 0;
const defaultX = 0;
const defaultY = 0;
const scaleStep = 0.1;
const defaultIsFlippedHorizontal = false;
const defaultIsFlippedVertical = false;

let defaultScale = 1;
let scale = defaultScale;
let rotation = defaultRotation;
let isDragging = false;
let startX, startY;
let translateX = defaultX, translateY = defaultY;
let isFlippedHorizontal = defaultIsFlippedHorizontal;
let isFlippedVertical = defaultIsFlippedVertical;

// 旋转画布的像素数据
function rotateCanvas(canvas, ctx, degrees) {
    // 将负角度转换为等效的正角度
    degrees = ((degrees % 360) + 360) % 360;

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
    initCanvas(newWidth/pixelSize, newHeight/pixelSize)

    // 创建新的像素数据
    const newImageData = newCtx.createImageData(newWidth, newHeight);
    const newData = newImageData.data;

    // 旋转像素数据
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            let newX, newY, newIndex;

            if (degrees === 90) {
                // 向右旋转90度
                newX = height - y - 1;
                newY = x;
            } else if (degrees === 180) {
                // 旋转180度
                newX = width - x - 1;
                newY = height - y - 1;
            } else if (degrees === 270) {
                // 向左旋转90度（或向右旋转270度）
                newX = y;
                newY = width - x - 1;
            } else {
                // 不旋转
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
    isFlippedHorizontal = !isFlippedHorizontal;
    console.log("Canvas is transformed horizontally");
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
    isFlippedVertical = !isFlippedVertical;
    console.log("Canvas is transformed vertically");
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