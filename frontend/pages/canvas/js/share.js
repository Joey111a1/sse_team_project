// share.js
// 获取按钮元素
const shareButton = document.getElementById('shareButton');
const overlay = document.getElementById('overlay');
const previewCanvas = document.getElementById('previewCanvas');
const sharePosterButton = document.getElementById('sharePosterButton');
const exportPngButton = document.getElementById('exportPngButton');
const userId = localStorage.getItem('user_id');
const username = localStorage.getItem('username');

shareButton.addEventListener('click', function () {
    overlay.style.display = 'flex';
    drawPreviewCanvas();
});

async function drawPreviewCanvas() {
    const previewCtx = previewCanvas.getContext('2d');

    // 设置预览画布高度为窗口高度的80%，宽度为窗口宽度的50%
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    const previewHeight = windowHeight * 0.8; // 高度为窗口高度的80%
    const previewWidth = windowWidth * 0.5; // 宽度为窗口宽度的50%

    const margin = 30; // 边距
    const whiteBarHeight = 80; // 白条的高度
    const availableHeight = previewHeight - whiteBarHeight; // 可用区域的高度

    previewCanvas.width = previewWidth;
    previewCanvas.height = previewHeight;

    // 填充背景颜色
    const dominantColor = getDominantColor(canvas);
    const lightenedColor = lightenColor(dominantColor, 30);
    previewCtx.fillStyle = `rgba(${lightenedColor.join(',')}, 0.8)`;
    previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);

    // 计算缩放比例，确保canvas完整显示在内部可用区域
    const scale = Math.min(
        (previewWidth - margin * 2) / canvas.width, // 水平方向可用宽度
        (availableHeight - margin * 2) / canvas.height // 垂直方向可用高度
    );
    const scaledWidth = canvas.width * scale;
    const scaledHeight = canvas.height * scale;

    // 计算居中位置
    const offsetX = (previewWidth - scaledWidth) / 2; // 水平居中
    const offsetY = (availableHeight - scaledHeight) / 2; // 垂直居中（在白条上方）

    // 保存当前 ctx 状态
    previewCtx.save();

    // 将旋转中心移动到图像中心
    previewCtx.translate(offsetX + scaledWidth / 2, offsetY + scaledHeight / 2);
    previewCtx.drawImage(canvas, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);

    // 恢复 ctx 状态（取消旋转和移动）
    previewCtx.restore();

    // 添加阴影（仅对中间画布内容，不对二维码）
    previewCtx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    previewCtx.shadowBlur = 8;
    previewCtx.shadowOffsetX = 4;
    previewCtx.shadowOffsetY = 4;

    // 选择随机字体
    const font = getRandomFont();
    const fontSizeTitle = 36;
    const fontSizeUserInfo = 24;
    const username = 'i';
    const userInfo = `${username} - ${artworkId}`;

    try {
        // 等待字体加载完成
        await document.fonts.load(`${fontSizeTitle}px ${font}`);
        await document.fonts.load(`${fontSizeUserInfo}px ${font}`);

        previewCtx.font = `${fontSizeTitle}px ${font}`;
        previewCtx.fillStyle = '#fff';
        previewCtx.fillText('Pixel Art Editor', margin, margin + fontSizeTitle);

        previewCtx.font = `${fontSizeUserInfo}px ${font}`;
        const textWidth = previewCtx.measureText(userInfo).width;
        previewCtx.fillText(userInfo, previewWidth - textWidth - margin, previewHeight - margin);
    } catch (error) {
        console.error("Font failed to load:", font, error);
    }

    // 在下方插入一个白色的长条
    previewCtx.fillStyle = '#fff';
    previewCtx.fillRect(0, previewHeight - whiteBarHeight, previewWidth, whiteBarHeight);

    // 在右边放置二维码图片（去除阴影）
    const qrCode = new Image();
    qrCode.src = '../../assets/website/webQR.png';
    qrCode.onload = () => {
        const qrCodeSize = 60;
        const qrCodeX = previewWidth - qrCodeSize - margin;
        const qrCodeY = previewHeight - whiteBarHeight + (whiteBarHeight - qrCodeSize) / 2;

        // 保存当前 ctx 状态
        previewCtx.save();

        // 去除阴影
        previewCtx.shadowColor = 'transparent';
        previewCtx.shadowBlur = 0;
        previewCtx.shadowOffsetX = 0;
        previewCtx.shadowOffsetY = 0;

        // 绘制二维码
        previewCtx.drawImage(qrCode, qrCodeX, qrCodeY, qrCodeSize, qrCodeSize);

        // 恢复 ctx 状态
        previewCtx.restore();
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
sharePosterButton.addEventListener('click', function () {
    try {
        // 1. 将 Canvas 转换为 Base64 图片数据（JPG 格式）
        const imageData = previewCanvas.toDataURL('image/jpeg', 0.9); // 使用 JPG 格式，质量为 90%

        // 2. 创建一个临时链接元素
        const link = document.createElement('a');
        link.href = imageData; // 设置链接的 href 为 Base64 数据
        link.download = 'pixel-art-poster.jpg'; // 设置下载的文件名

        // 3. 触发下载
        document.body.appendChild(link); // 将链接添加到 DOM 中
        link.click(); // 模拟点击下载
        document.body.removeChild(link); // 下载完成后移除链接

    } catch (error) {
        console.error('Failed to export image:', error);
        alert('Failed to export image. Please try again.');
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