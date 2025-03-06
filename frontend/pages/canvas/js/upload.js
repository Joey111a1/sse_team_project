document.getElementById('uploadButton').addEventListener('click', async () => {
    try {
        console.log("Button click event triggered");

        // 创建文件输入元素
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';

        // 等待用户选择文件
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

        // 检查文件大小（例如限制为 5MB）
        const maxSizeMB = 5; // 最大文件大小（MB）
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
        alert(error.message); // 提示用户错误信息
    }
});

// 处理图片（加载、调整大小、绘制到画布）
async function processImage(file) {
    // 读取文件内容
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

    // 加载图片
    const img = await loadImage(imageSrc);

    // 调整图片大小以适应画布
    const { width, height, offsetX, offsetY } = resizeImageToFitCanvas(img);

    // 绘制图片到画布，居中显示
    ctx.drawImage(img, -offsetX, -offsetY, width, height);

    // 将图片转换为像素风
    await convertToPixelArt();

    console.log("Image processing completed");
    
    saveState();
}

// 加载图片
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // 允许跨域图片
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

// 压缩图片
async function compressImage(file, maxSizeBytes) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
            // 创建 Canvas 元素
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // 计算压缩后的尺寸
            let width = img.width;
            let height = img.height;
            const maxDimension = 1024; // 最大宽度或高度

            if (width > maxDimension || height > maxDimension) {
                const ratio = Math.min(maxDimension / width, maxDimension / height);
                width *= ratio;
                height *= ratio;
            }

            // 设置 Canvas 尺寸
            canvas.width = width;
            canvas.height = height;

            // 绘制图片到 Canvas
            ctx.drawImage(img, 0, 0, width, height);

            // 将 Canvas 内容转换为 Blob
            canvas.toBlob(
                (blob) => {
                    // 检查压缩后的文件大小
                    if (blob.size <= maxSizeBytes) {
                        console.log("Compression successful, compressed size:", (blob.size / 1024 / 1024).toFixed(2), "MB");
                        resolve(blob);
                    } else {
                        // 如果仍然过大，继续降低质量
                        const quality = 0.8; // 初始质量
                        compressWithQuality(canvas, maxSizeBytes, quality, resolve);
                    }
                },
                'image/jpeg', // 压缩格式
                0.9 // 初始质量
            );
        };
    });
}

// 递归压缩，直到文件大小符合要求
function compressWithQuality(canvas, maxSizeBytes, quality, resolve) {
    canvas.toBlob(
        (blob) => {
            if (blob.size <= maxSizeBytes || quality <= 0.1) {
                console.log("Compression successful, compressed size:", (blob.size / 1024 / 1024).toFixed(2), "MB");
                resolve(blob);
            } else {
                // 降低质量，继续压缩
                const newQuality = quality - 0.1;
                compressWithQuality(canvas, maxSizeBytes, newQuality, resolve);
            }
        },
        'image/jpeg', // 压缩格式
        quality // 当前质量
    );
}

// 调整图片大小以适应画布
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

// 高斯模糊
function gaussianBlur(imageData, radius = 1) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;

    // 高斯核
    const kernel = [
        [1, 2, 1],
        [2, 4, 2],
        [1, 2, 1]
    ];
    const kernelSize = 3;
    const kernelSum = 16; // 1+2+1 + 2+4+2 + 1+2+1 = 16

    // 创建一个新的 Uint8ClampedArray 来存储模糊结果
    const output = new Uint8ClampedArray(data.length);

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let r = 0, g = 0, b = 0;

            // 对每个像素应用高斯核
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const pixelIndex = ((y + ky) * width + (x + kx)) * 4;
                    const weight = kernel[ky + 1][kx + 1];

                    r += data[pixelIndex] * weight;
                    g += data[pixelIndex + 1] * weight;
                    b += data[pixelIndex + 2] * weight;
                }
            }

            // 将结果写入输出数组
            const outputIndex = (y * width + x) * 4;
            output[outputIndex] = r / kernelSum;     // R
            output[outputIndex + 1] = g / kernelSum; // G
            output[outputIndex + 2] = b / kernelSum; // B
            output[outputIndex + 3] = 255;           // Alpha
        }
    }

    return new ImageData(output, width, height);
}

// Sobel 边缘检测
function sobelEdgeDetection(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;

    // 创建一个新的 Uint8ClampedArray 来存储边缘检测结果
    const output = new Uint8ClampedArray(data.length);

    // Sobel 卷积核
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

            // 对每个像素应用 Sobel 核
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const pixelIndex = ((y + ky) * width + (x + kx)) * 4;
                    const grayValue = (data[pixelIndex] + data[pixelIndex + 1] + data[pixelIndex + 2]) / 3;

                    sumX += grayValue * kernelX[ky + 1][kx + 1];
                    sumY += grayValue * kernelY[ky + 1][kx + 1];
                }
            }

            // 计算梯度幅值
            const gradient = Math.sqrt(sumX * sumX + sumY * sumY);

            // 将梯度值写入输出数组
            const outputIndex = (y * width + x) * 4;
            output[outputIndex] = gradient;     // R
            output[outputIndex + 1] = gradient; // G
            output[outputIndex + 2] = gradient; // B
            output[outputIndex + 3] = 255;      // Alpha
        }
    }

    return new ImageData(output, width, height);
}

// 将图片转换为像素风
async function convertToPixelArt() {
    try {
        console.log("Starting pixel art conversion");

        // 获取画布上的图像数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // 保存原图的颜色数据
        const originalData = new Uint8ClampedArray(imageData.data);

        // 先应用高斯模糊
        const blurredImageData = gaussianBlur(imageData);
        console.log("Gaussian blur completed");

        // 再应用 Sobel 边缘检测
        const edgeData = sobelEdgeDetection(blurredImageData);
        console.log("Sobel edge detection completed");

        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 遍历每个像素块
        for (let y = 0; y < canvas.height; y += pixelSize) {
            for (let x = 0; x < canvas.width; x += pixelSize) {
                // 获取当前像素块的平均梯度值
                const avgGradient = getAverageGradient(edgeData.data, x, y, canvas.width, canvas.height);

                // 获取当前像素块的平均颜色（从原图获取）
                const avgColor = getAverageColor(originalData, x, y, canvas.width, canvas.height);

                // 判断是否为边缘（梯度值大于阈值）
                const isEdge = avgGradient > 64; // 阈值可以根据需要调整

                // 获取当前像素块的平均 alpha 值
                const avgAlpha = getAverageAlpha(originalData, x, y, canvas.width, canvas.height);

                // 如果 alpha 值为 0，则跳过绘制（保持透明）
                if (avgAlpha === 0) {
                    continue;
                }

                // 如果是边缘，设置为黑色；否则使用原图的颜色
                ctx.fillStyle = isEdge ? 'black' : `rgba(${avgColor.r}, ${avgColor.g}, ${avgColor.b}, ${avgAlpha / 255})`;
                ctx.fillRect(x, y, pixelSize, pixelSize);
            }
        }

        console.log("Pixel art conversion completed");
    } catch (error) {
        console.error("Pixel art conversion failed:", error);
    }
}

function getAverageAlpha(data, x, y, width, height) {
    let alphaSum = 0;
    let count = 0;

    for (let dy = 0; dy < pixelSize; dy++) {
        for (let dx = 0; dx < pixelSize; dx++) {
            const pixelX = x + dx;
            const pixelY = y + dy;

            if (pixelX < width && pixelY < height) {
                const pixelIndex = (pixelY * width + pixelX) * 4;
                alphaSum += data[pixelIndex + 3]; // alpha 值在 A 通道
                count++;
            }
        }
    }

    return Math.round(alphaSum / count);
}

// 获取像素块的平均梯度值
function getAverageGradient(data, x, y, width, height) {
    let gradientSum = 0;
    let count = 0;

    for (let dy = 0; dy < pixelSize; dy++) {
        for (let dx = 0; dx < pixelSize; dx++) {
            const pixelX = x + dx;
            const pixelY = y + dy;

            if (pixelX < width && pixelY < height) {
                const pixelIndex = (pixelY * width + pixelX) * 4;
                gradientSum += data[pixelIndex]; // 梯度值在 R 通道
                count++;
            }
        }
    }

    return gradientSum / count;
}

// 获取像素块的平均颜色
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