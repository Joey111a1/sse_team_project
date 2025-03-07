// share.js
// 获取按钮元素
const username = localStorage.getItem('username');

const shareButton = document.getElementById('shareButton');
const overlay = document.getElementById('overlay');
const previewCanvas = document.getElementById('previewCanvas');
const sharePosterButton = document.getElementById('sharePosterButton');
const exportPngButton = document.getElementById('exportPngButton');

shareButton.addEventListener('click', async function () {
    is_saving = true;
    await saveState();
    is_saving = false;
    overlay.style.display = 'flex';
    drawPreviewCanvas();
});

async function drawPreviewCanvas() {
    const previewCtx = previewCanvas.getContext('2d');

    // 设置预览画布为固定大小的正方形
    const previewSize = 500; // 预览画布的边长
    const margin = 40; // 边距
    const innerSize = previewSize - margin * 2; // 内部可用区域大小

    previewCanvas.width = previewSize;
    previewCanvas.height = previewSize;

    // 填充背景颜色
    const dominantColor = getDominantColor(canvas);
    const lightenedColor = lightenColor(dominantColor, 30);
    previewCtx.fillStyle = `rgba(${lightenedColor.join(',')}, 0.8)`;
    previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);

    // 计算缩放比例，将原始画布内容缩放到内部可用区域
    const scale = Math.min(innerSize / canvas.width, innerSize / canvas.height);
    const scaledWidth = canvas.width * scale;
    const scaledHeight = canvas.height * scale;

    // 计算居中位置
    const offsetX = (previewSize - scaledWidth) / 2;
    const offsetY = (previewSize - scaledHeight) / 2;

    // 保存当前 ctx 状态
    previewCtx.save();

    // 将旋转中心移动到图像中心
    previewCtx.translate(offsetX + scaledWidth / 2, offsetY + scaledHeight / 2);
    previewCtx.drawImage(canvas, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);

    // 恢复 ctx 状态（取消旋转和移动）
    previewCtx.restore();

    // 添加阴影
    previewCtx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    previewCtx.shadowBlur = 10;
    previewCtx.shadowOffsetX = 5;
    previewCtx.shadowOffsetY = 5;

    // 选择随机字体
    const font = getRandomFont();
    const fontSizeTitle = 45;
    const fontSizeUserInfo = 30;
    const userInfo = `${username} - ${artworkId}`;

    try {
        // **等待字体加载完成**
        await document.fonts.load(`${fontSizeTitle}px ${font}`);
        await document.fonts.load(`${fontSizeUserInfo}px ${font}`);

        previewCtx.font = `${fontSizeTitle}px ${font}`;
        previewCtx.fillStyle = '#fff';
        previewCtx.fillText('Pixel Art Editor', margin, margin + fontSizeTitle);

        previewCtx.font = `${fontSizeUserInfo}px ${font}`;
        const textWidth = previewCtx.measureText(userInfo).width;
        previewCtx.fillText(userInfo, previewSize - textWidth - margin, previewSize - margin);
    } catch (error) {
        console.error("Font failed to load:", font, error);
    }

    // add qrcode to the bottom-left corner
    const qrCode = new Image();
    qrCode.src = '../../assets/website/webQR.png';
    qrCode.onload = () => {
        const qrSize = 100; // modify qrcode size
        previewCtx.drawImage(qrCode, margin, previewCanvas.height - qrSize - margin, qrSize, qrSize);
    };
}

const handwritingFonts = [
    "Sigmar",
    "Annie Use Your Telescope",
    "Ribeye Marrow",
    "Knewave",
    "Dokdo",
    "Shizuru",
    "Henny Penny",
    "Jolly Lodger",
    "Borel"
];

function getRandomFont() {
    return handwritingFonts[Math.floor(Math.random() * handwritingFonts.length)];
}

function getDominantColor(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const colorCount = {};

    // 统计颜色出现次数
    for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const color = `${r},${g},${b}`;
        colorCount[color] = (colorCount[color] || 0) + 1;
    }

    // 找到出现次数最多的颜色
    let dominantColor = Object.keys(colorCount).reduce((a, b) => colorCount[a] > colorCount[b] ? a : b);
    return dominantColor.split(',').map(Number);
}

function lightenColor(color, percent) {
    const [r, g, b] = color;
    const lighten = (value) => Math.min(255, value + 255 * (percent / 100));
    return [lighten(r), lighten(g), lighten(b)];
}

// Share Current Poster 按钮点击事件
sharePosterButton.addEventListener('click', async function () {
    try {
        // 将 Canvas 转换为 Base64 图片数据
        const imageData = previewCanvas.toDataURL('image/png').split(',')[1]; // 去掉 data:image/png;base64, 前缀

        // 构造请求体
        const requestBody = {
            history_id: artworkId,
            user_id: userId,
            platform: "web", // 替换为实际的平台信息
            image_data: imageData, // Base64 图片数据
        };

        // 发送 POST 请求到后端
        const response = await fetch('https://pixel-art.azurewebsites.net/api/share', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error('Failed to upload image');
        }

        // 获取后端返回的分享链接和图片 URL
        const result = await response.json();
        const shareLink = result.share_link; // 分享链接
        const imageURL = result.image_url;   // 图片 URL

        // 打开新窗口并显示分享页面
        window.open(`../share/share-poster.html?image=${encodeURIComponent(imageURL)}`);

    } catch (error) {
        console.error('Failed to generate image:', error);
        alert('Failed to generate image. Please try again.');
    }
});

// Export Canvas to PNG 按钮点击事件
exportPngButton.addEventListener('click', function () {
    exportCanvasAsPng();
});

function exportCanvasAsPng() {
    // 1. 创建一个临时链接元素
    const link = document.createElement('a');
    link.download = 'pixel-art.png'; // 设置下载的文件名
    link.href = canvas.toDataURL('image/png'); // 将 canvas 导出为 PNG 格式

    // 2. 触发下载
    document.body.appendChild(link); // 将链接添加到 DOM 中
    link.click(); // 模拟点击下载
    document.body.removeChild(link); // 下载完成后移除链接
}


// 获取关闭按钮
const closeOverlayButton = document.getElementById('closeOverlayButton');

// 点击关闭按钮时隐藏覆盖层
closeOverlayButton.addEventListener('click', function () {
    overlay.style.display = 'none';
});