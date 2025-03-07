document.getElementById('uploadButton').addEventListener('click', async () => {
    try {
        console.log("Button click event triggered");

        // Create a file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';

        // Wait for the user to select a file
        const file = await new Promise((resolve, reject) => {
            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    console.log("File selection event triggered");
                    resolve(file);
                } else {
                    reject(new Error("No file selected"));
                }
            };
            fileInput.onerror = (error) => {
                reject(new Error("File selection failed", error));
            };
            fileInput.click();
        });

        // Check file size limit to 5MB
        const maxSizeMB = 5; // Maximum file size limit to 5MB
        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        if (file.size > maxSizeBytes) {
            console.log("File is too large, starting compression...");
            const compressedFile = await compressImage(file, maxSizeBytes);
            await processImage(compressedFile);
        } else {
            console.log("File size is acceptable, no compression needed");
            await processImage(file);
        }
    } catch (error) {
        console.error("An error occurred:", error);
        alert(error.message); // Notify user of error
    }
});

// Process the image (load, resize, draw on canvas)
async function processImage(file) {
    // Read the file contents
    const imageSrc = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            console.log("File read successfully");
            resolve(event.target.result);
        };
        reader.onerror = (error) => {
            reject(new Error("File read failed", error));
        };
        reader.readAsDataURL(file);
    });

    // Load the image
    const img = await loadImage(imageSrc);

    // Resize the image to fit the canvas
    const { width, height, offsetX, offsetY } = resizeImageToFitCanvas(img);

    // Draw the image on the canvas, centered
    ctx.drawImage(img, -offsetX, -offsetY, width, height);

    // Convert the image to pixel art style
    await convertToPixelArt();

    console.log("Image processing completed");
    
    saveState();
}

// Load an image from a given source
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // Allow cross-origin images
        img.onload = () => {
            console.log("Image loaded successfully");
            resolve(img);
        };
        img.onerror = (error) => {
            reject(new Error("Image load failed", error));
        };
        img.src = src;
    });
}

// Compress an image
async function compressImage(file, maxSizeBytes) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
            // Create a canvas element
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Calculate the compressed dimensions
            let width = img.width;
            let height = img.height;
            const maxDimension = 1024; // Maximum width or height

            if (width > maxDimension || height > maxDimension) {
                const ratio = Math.min(maxDimension / width, maxDimension / height);
                width *= ratio;
                height *= ratio;
            }

            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;

            // Draw the image on the canvas
            ctx.drawImage(img, 0, 0, width, height);

            // Convert the canvas content to a Blob
            canvas.toBlob(
                (blob) => {
                    // Check if the compressed file size is acceptable
                    if (blob.size <= maxSizeBytes) {
                        console.log("Compression successful, compressed size:", (blob.size / 1024 / 1024).toFixed(2), "MB");
                        resolve(blob);
                    } else {
                        // If still too large, further reduce quality
                        const quality = 0.8; // Initial quality
                        compressWithQuality(canvas, maxSizeBytes, quality, resolve);
                    }
                },
                'image/jpeg', // Compression format
                0.9 // Initial quality
            );
        };
    });
}

// Recursive compression until file size is acceptable
function compressWithQuality(canvas, maxSizeBytes, quality, resolve) {
    canvas.toBlob(
        (blob) => {
            if (blob.size <= maxSizeBytes || quality <= 0.1) {
                console.log("Compression successful, compressed size:", (blob.size / 1024 / 1024).toFixed(2), "MB");
                resolve(blob);
            } else {
                // Reduce quality further
                const newQuality = quality - 0.1;
                compressWithQuality(canvas, maxSizeBytes, newQuality, resolve);
            }
        },
        'image/jpeg', // Compression format
        quality // Current quality level
    );
}

// Resize the image to fit the canvas
function resizeImageToFitCanvas(img) {
    const canvasAspectRatio = canvas.width / canvas.height;
    const imgAspectRatio = img.width / img.height;

    let width, height;
    let offsetX = 0, offsetY = 0;

    if (imgAspectRatio > canvasAspectRatio) {
        height = canvas.height;
        width = canvas.height * imgAspectRatio;
        offsetX = (width - canvas.width) / 2;
    } else {
        width = canvas.width;
        height = canvas.width / imgAspectRatio;
        offsetY = (height - canvas.height) / 2;
    }

    return { width, height, offsetX, offsetY };
}

// Apply Gaussian blur
function gaussianBlur(imageData, radius = 1) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;

    // Gaussian kernel
    const kernel = [
        [1, 2, 1],
        [2, 4, 2],
        [1, 2, 1]
    ];
    const kernelSize = 3;
    const kernelSum = 16; // 1+2+1 + 2+4+2 + 1+2+1 = 16

    // Create a new Uint8ClampedArray to store the blurred result
    const output = new Uint8ClampedArray(data.length);

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let r = 0, g = 0, b = 0;

            // Apply Gaussian kernel to each pixel
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const pixelIndex = ((y + ky) * width + (x + kx)) * 4;
                    const weight = kernel[ky + 1][kx + 1];

                    r += data[pixelIndex] * weight;
                    g += data[pixelIndex + 1] * weight;
                    b += data[pixelIndex + 2] * weight;
                }
            }

            // Write results to output array
            const outputIndex = (y * width + x) * 4;
            output[outputIndex] = r / kernelSum;     // R
            output[outputIndex + 1] = g / kernelSum; // G
            output[outputIndex + 2] = b / kernelSum; // B
            output[outputIndex + 3] = 255;           // Alpha
        }
    }

    return new ImageData(output, width, height);
}

// Sobel edge detection
function sobelEdgeDetection(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;

    // Create a new Uint8ClampedArray to store edge detection results
    const output = new Uint8ClampedArray(data.length);

    // Sobel convolution kernels
    const kernelX = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ];
    const kernelY = [
        [-1, -2, -1],
        [ 0,  0,  0],
        [ 1,  2,  1]
    ];

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let sumX = 0, sumY = 0;

            // Apply Sobel kernel to each pixel
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const pixelIndex = ((y + ky) * width + (x + kx)) * 4;
                    const grayValue = (data[pixelIndex] + data[pixelIndex + 1] + data[pixelIndex + 2]) / 3;

                    sumX += grayValue * kernelX[ky + 1][kx + 1];
                    sumY += grayValue * kernelY[ky + 1][kx + 1];
                }
            }

            // Compute gradient magnitude
            const gradient = Math.sqrt(sumX * sumX + sumY * sumY);

            // Write gradient values to output array
            const outputIndex = (y * width + x) * 4;
            output[outputIndex] = gradient;     // R
            output[outputIndex + 1] = gradient; // G
            output[outputIndex + 2] = gradient; // B
            output[outputIndex + 3] = 255;      // Alpha
        }
    }

    return new ImageData(output, width, height);
}

// Convert image to pixel art style
async function convertToPixelArt() {
    try {
        console.log("Starting pixel art conversion");

        // Retrieve image data from the canvas
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Save a copy of the original color data
        const originalData = new Uint8ClampedArray(imageData.data);

        // Apply Gaussian blur first
        const blurredImageData = gaussianBlur(imageData);
        console.log("Gaussian blur completed");

        // Then apply Sobel edge detection
        const edgeData = sobelEdgeDetection(blurredImageData);
        console.log("Sobel edge detection completed");

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Iterate through each pixel block
        for (let y = 0; y < canvas.height; y += pixelSize) {
            for (let x = 0; x < canvas.width; x += pixelSize) {
                // Get the average gradient of the current block
                const avgGradient = getAverageGradient(edgeData.data, x, y, canvas.width, canvas.height);

                // Get the average color of the current block from the original image
                const avgColor = getAverageColor(originalData, x, y, canvas.width, canvas.height);

                // Determine if this block is an edge based on the gradient threshold
                const isEdge = avgGradient > 64; 

                // Get the average alpha value for the current block
                const avgAlpha = getAverageAlpha(originalData, x, y, canvas.width, canvas.height);

                // Skip drawing if the block is fully transparent
                if (avgAlpha === 0) {
                    continue;
                }

                // Set fill style to black if it's an edge; otherwise, use the original color
                ctx.fillStyle = isEdge ? 'black' : `rgba(${avgColor.r}, ${avgColor.g}, ${avgColor.b}, ${avgAlpha / 255})`;
                ctx.fillRect(x, y, pixelSize, pixelSize);
            }
        }

        console.log("Pixel art conversion completed");
    } catch (error) {
        console.error("Pixel art conversion failed:", error);
    }
}

// Compute the average alpha value for a given block of pixels
function getAverageAlpha(data, x, y, width, height) {
    let alphaSum = 0;
    let count = 0;

    for (let dy = 0; dy < pixelSize; dy++) {
        for (let dx = 0; dx < pixelSize; dx++) {
            const pixelX = x + dx;
            const pixelY = y + dy;

            if (pixelX < width && pixelY < height) {
                const pixelIndex = (pixelY * width + pixelX) * 4;
                alphaSum += data[pixelIndex + 3]; // Alpha value in the A channel
                count++;
            }
        }
    }

    return Math.round(alphaSum / count);
}

// Compute the average gradient value for a given block of pixels
function getAverageGradient(data, x, y, width, height) {
    let gradientSum = 0;
    let count = 0;

    for (let dy = 0; dy < pixelSize; dy++) {
        for (let dx = 0; dx < pixelSize; dx++) {
            const pixelX = x + dx;
            const pixelY = y + dy;

            if (pixelX < width && pixelY < height) {
                const pixelIndex = (pixelY * width + pixelX) * 4;
                gradientSum += data[pixelIndex]; // Gradient value in the R channel
                count++;
            }
        }
    }

    return gradientSum / count;
}

// Compute the average color for a given block of pixels
function getAverageColor(data, x, y, width, height) {
    let r = 0, g = 0, b = 0;
    let count = 0;

    for (let dy = 0; dy < pixelSize; dy++) {
        for (let dx = 0; dx < pixelSize; dx++) {
            const pixelX = x + dx;
            const pixelY = y + dy;

            if (pixelX < width && pixelY < height) {
                const pixelIndex = (pixelY * width + pixelX) * 4;
                r += data[pixelIndex];
                g += data[pixelIndex + 1];
                b += data[pixelIndex + 2];
                count++;
            }
        }
    }

    return {
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count)
    };
}