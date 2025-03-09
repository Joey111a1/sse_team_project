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

function rotateCanvas(canvas, ctx, degrees) {
    // turn negative degree to that between 0 and 360
    degrees = ((degrees % 360) + 360) % 360;

    const width = canvas.width;
    const height = canvas.height;

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // create a new canvas to store the rotated pixel info
    const newCanvas = document.createElement('canvas');
    const newCtx = newCanvas.getContext('2d');

    let newWidth, newHeight;

    // resize canvas according to new degrees
    if (degrees === 90 || degrees === 270) {
        newWidth = height;
        newHeight = width;
    } else {
        newWidth = width;
        newHeight = height;
    }

    newCanvas.width = newWidth;
    newCanvas.height = newHeight;

    // create new pixel data
    const newImageData = newCtx.createImageData(newWidth, newHeight);
    const newData = newImageData.data;

    // new locs after rotation
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            let newX, newY, newIndex;

            if (degrees === 90) {
                // 90 degree to the right
                newX = height - y - 1;
                newY = x;
            } else if (degrees === 180) {
                // 180 degree
                newX = width - x - 1;
                newY = height - y - 1;
            } else if (degrees === 270) {
                // 90 degree to the left or 270 degree to the right
                newX = y;
                newY = width - x - 1;
            } else {
                // no rotation
                newX = x;
                newY = y;
            }

            newIndex = (newY * newWidth + newX) * 4;

            // copy pixel data
            newData[newIndex] = data[index];         // R
            newData[newIndex + 1] = data[index + 1]; // G
            newData[newIndex + 2] = data[index + 2]; // B
            newData[newIndex + 3] = data[index + 3]; // A
        }
    }

    // rewrite the canvas data back to the 
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

// 重置画布
function resetCanvas() {
    if (savedImageData) {
        ctx.putImageData(savedImageData, 0, 0); // 恢复到保存的状态
    }

    // 重置变换参数
    translateX = defaultX;
    translateY = defaultY;
    rotation = defaultRotation;
    scale = defaultScale;
    isFlippedHorizontal = false;
    isFlippedVertical = false;

    // 更新变换
    updateTransform();

    console.log("Canvas's transformation has been reseted");
}

// 绑定重置按钮事件
document.getElementById('reset-canvas').addEventListener('click', resetCanvas);