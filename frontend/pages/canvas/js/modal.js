// modal.js
const modal = document.getElementById('canvas-size-modal');
const canvasWidthInput = document.getElementById('canvas-width');
const canvasHeightInput = document.getElementById('canvas-height');
const confirmButton = document.getElementById('confirm-canvas-size');
const errorMessage = document.getElementById('canvas-size-error');

const minPixels = 2;
const maxPixels = 200;

let artworkId;

// 显示模态窗口
modal.style.display = 'flex';

function validateInput(value, min, max, dimension) {
    if (value < min) {
        return `The minimum allowed ${dimension} is ${min} pixels. Please enter a larger value.`;
    } else if (value > max) {
        return `The maximum allowed ${dimension} is ${max} pixels. Please enter a smaller value.`;
    }
    return ''; // 输入有效，返回空字符串
}

confirmButton.addEventListener('click', () => {
    const width = parseInt(canvasWidthInput.value);
    const height = parseInt(canvasHeightInput.value);
    artworkId = document.getElementById('artwork-id').value.trim();

    const widthError = validateInput(width, minPixels, maxPixels, 'width');
    const heightError = validateInput(height, minPixels, maxPixels, 'height');

    if (widthError || heightError) {
        errorMessage.textContent = [widthError, heightError].filter(Boolean).join('\n');
        return;
    }

    if (!artworkId) {
        errorMessage.textContent = "Please enter an artwork name.";
        return;
    }

    errorMessage.textContent = "";
    closeModal();
    initCanvas(width, height, artworkId);
});

function closeModal() {
    modal.style.display = 'none';
}