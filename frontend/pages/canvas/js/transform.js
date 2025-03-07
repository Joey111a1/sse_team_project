// Default transformation parameters
const defaultRotation = 0;                     // Default rotation angle (degrees)
const defaultX = 0;                            // Default translation X
const defaultY = 0;                            // Default translation Y
const scaleStep = 0.1;                         // Step increment for scaling
const defaultIsFlippedHorizontal = false;      // Default horizontal flip state
const defaultIsFlippedVertical = false;        // Default vertical flip state

let defaultScale = 1;                          // Initial scale factor
let scale = defaultScale;                      // Current scale factor
let rotation = defaultRotation;                // Current rotation angle
let isDragging = false;                        // Flag for dragging state
let startX, startY;                            // Starting coordinates for dragging
let translateX = defaultX, translateY = defaultY; // Current translation values
let isFlippedHorizontal = defaultIsFlippedHorizontal; // Current horizontal flip state
let isFlippedVertical = defaultIsFlippedVertical;     // Current vertical flip state

// Rotate the canvas pixel data by a specified angle (in degrees)
function rotateCanvas(canvas, ctx, degrees) {
    // Normalize negative angles to positive equivalents
    degrees = ((degrees % 360) + 360) % 360;

    const width = canvas.width;
    const height = canvas.height;

    // Get the current pixel data from the canvas
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Create a new canvas to store the rotated pixel data
    const newCanvas = document.createElement('canvas');
    const newCtx = newCanvas.getContext('2d');

    let newWidth, newHeight;

    // Adjust new canvas dimensions based on rotation angle
    if (degrees === 90 || degrees === 270) {
        newWidth = height;
        newHeight = width;
    } else {
        newWidth = width;
        newHeight = height;
    }

    newCanvas.width = newWidth;
    newCanvas.height = newHeight;

    // Create a new image data object for the rotated data
    const newImageData = newCtx.createImageData(newWidth, newHeight);
    const newData = newImageData.data;

    // Rotate pixel data based on the specified angle
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            let newX, newY, newIndex;

            if (degrees === 90) {
                // Rotate 90° to the right
                newX = height - y - 1;
                newY = x;
            } else if (degrees === 180) {
                // Rotate 180°
                newX = width - x - 1;
                newY = height - y - 1;
            } else if (degrees === 270) {
                // Rotate 90° to the left (or 270° to the right)
                newX = y;
                newY = width - x - 1;
            } else {
                // No rotation
                newX = x;
                newY = y;
            }

            newIndex = (newY * newWidth + newX) * 4;

            // Copy RGBA values from the original image data
            newData[newIndex] = data[index];         // R
            newData[newIndex + 1] = data[index + 1];     // G
            newData[newIndex + 2] = data[index + 2];     // B
            newData[newIndex + 3] = data[index + 3];     // A
        }
    }

    // Update the canvas size and draw the rotated image data
    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.putImageData(newImageData, 0, 0);
}

// Flip the canvas horizontally
function flipHorizontal(canvas, ctx) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width / 2; x++) {
            const index1 = (y * width + x) * 4;
            const index2 = (y * width + (width - x - 1)) * 4;

            // Swap pixel data (RGBA) between symmetric positions
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

// Flip the canvas vertically
function flipVertical(canvas, ctx) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height / 2; y++) {
            const index1 = (y * width + x) * 4;
            const index2 = ((height - y - 1) * width + x) * 4;

            // Swap pixel data (RGBA) between symmetric positions vertically
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

// Zoom the canvas by setting a new scale and updating the transform
function zoomCanvas(newScale) {
    scale = newScale;
    updateTransform();
}

// Bind zoom in/out buttons to adjust the canvas scale
document.getElementById('zoomin-tool').addEventListener('click', () => {
    zoomCanvas(scale + scaleStep);
});

document.getElementById('zoomout-tool').addEventListener('click', () => {
    zoomCanvas(scale - scaleStep);
});

// Reset the canvas to the saved state and default transformation parameters
function resetCanvas() {
    if (savedImageData) {
        ctx.putImageData(savedImageData, 0, 0); // Restore the saved canvas state
    }

    // Reset transformation parameters to their default values
    translateX = defaultX;
    translateY = defaultY;
    rotation = defaultRotation;
    scale = defaultScale;
    isFlippedHorizontal = false;
    isFlippedVertical = false;

    // Update the canvas transform
    updateTransform();

    console.log("Canvas's transformation has been reseted");
}

// Bind the reset button to the resetCanvas function
document.getElementById('reset-canvas').addEventListener('click', resetCanvas);