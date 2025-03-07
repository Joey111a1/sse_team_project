// Retrieve DOM elements for sharing functionality
const shareButton = document.getElementById('shareButton');
const overlay = document.getElementById('overlay');
const previewCanvas = document.getElementById('previewCanvas');
const sharePosterButton = document.getElementById('sharePosterButton');
const exportPngButton = document.getElementById('exportPngButton');
const userId = localStorage.getItem('user_id');
const username = localStorage.getItem('username');

// When the share button is clicked, display the overlay and draw the preview canvas
shareButton.addEventListener('click', function () {
    overlay.style.display = 'flex';
    drawPreviewCanvas();
});

// Function to draw a preview of the canvas for sharing
async function drawPreviewCanvas() {
    const previewCtx = previewCanvas.getContext('2d');

    // Set preview canvas to a fixed square size
    const previewSize = 500; // Size of the preview canvas
    const margin = 40;       // Margin inside the preview canvas
    const innerSize = previewSize - margin * 2; // Available drawing area within the canvas

    previewCanvas.width = previewSize;
    previewCanvas.height = previewSize;

    // Fill the preview canvas background with a lightened version of the canvas's dominant color
    const dominantColor = getDominantColor(canvas);
    const lightenedColor = lightenColor(dominantColor, 30);
    previewCtx.fillStyle = `rgba(${lightenedColor.join(',')}, 0.8)`;
    previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);

    // Calculate the scale factor to fit the original canvas content into the available area
    const scale = Math.min(innerSize / canvas.width, innerSize / canvas.height);
    const scaledWidth = canvas.width * scale;
    const scaledHeight = canvas.height * scale;

    // Calculate offsets to center the scaled canvas content in the preview
    const offsetX = (previewSize - scaledWidth) / 2;
    const offsetY = (previewSize - scaledHeight) / 2;

    // Save the current state of the preview context
    previewCtx.save();

    // Translate the context to center the image
    previewCtx.translate(offsetX + scaledWidth / 2, offsetY + scaledHeight / 2);
    // Draw the original canvas image scaled down to fit in the preview area
    previewCtx.drawImage(canvas, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);

    // Restore the context to its original state
    previewCtx.restore();

    // Add shadow effect for visual depth
    previewCtx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    previewCtx.shadowBlur = 10;
    previewCtx.shadowOffsetX = 5;
    previewCtx.shadowOffsetY = 5;

    // Choose a random handwriting font from a list
    const font = getRandomFont();
    const fontSizeTitle = 45;
    const fontSizeUserInfo = 30;
    const username = 'i'; // Note: This redefines username locally; ensure proper value if needed
    const userInfo = `${username} - ${artworkId}`;

    try {
        // Wait for the fonts to load
        await document.fonts.load(`${fontSizeTitle}px ${font}`);
        await document.fonts.load(`${fontSizeUserInfo}px ${font}`);

        // Draw the application title on the preview
        previewCtx.font = `${fontSizeTitle}px ${font}`;
        previewCtx.fillStyle = '#fff';
        previewCtx.fillText('Pixel Art Editor', margin, margin + fontSizeTitle);

        // Draw the user info (username and artwork ID) at the bottom-right of the preview
        previewCtx.font = `${fontSizeUserInfo}px ${font}`;
        const textWidth = previewCtx.measureText(userInfo).width;
        previewCtx.fillText(userInfo, previewSize - textWidth - margin, previewSize - margin);
    } catch (error) {
        console.error("Font failed to load:", font, error);
    }
}

// List of handwriting fonts for random selection
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

// Returns a random font from the handwriting fonts array
function getRandomFont() {
    return handwritingFonts[Math.floor(Math.random() * handwritingFonts.length)];
}

// Get the dominant color of the canvas by counting the occurrences of each color
function getDominantColor(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const colorCount = {};

    // Count the frequency of each color (R,G,B)
    for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const color = `${r},${g},${b}`;
        colorCount[color] = (colorCount[color] || 0) + 1;
    }

    // Return the color that appears most frequently
    let dominantColor = Object.keys(colorCount).reduce((a, b) => colorCount[a] > colorCount[b] ? a : b);
    return dominantColor.split(',').map(Number);
}

// Lighten a given RGB color by a specified percentage
function lightenColor(color, percent) {
    const [r, g, b] = color;
    const lighten = (value) => Math.min(255, value + 255 * (percent / 100));
    return [lighten(r), lighten(g), lighten(b)];
}

// Event listener for the "Share Current Poster" button click
sharePosterButton.addEventListener('click', async function () {
    try {
        // Convert the preview canvas to a Base64 PNG image string (excluding the data URI prefix)
        const imageData = previewCanvas.toDataURL('image/png').split(',')[1];

        // Build the request payload with artwork and user information
        const requestBody = {
            history_id: artworkId,
            user_id: userId,
            platform: "web", // Replace with actual platform if needed
            image_data: imageData, // Base64 image data
        };

        // Send a POST request to the backend share API
        const response = await fetch('http://127.0.0.1:8000/api/share', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error('Failed to upload image');
        }

        // Parse the response to get the share link and image URL
        const result = await response.json();
        const shareLink = result.share_link;
        const imageURL = result.image_url;

        // Open a new window to display the share poster
        window.open(`../share/share-poster.html?image=${encodeURIComponent(imageURL)}`);

    } catch (error) {
        console.error('Failed to generate image:', error);
        alert('Failed to generate image. Please try again.');
    }
});

// Event listener for exporting the canvas as PNG
exportPngButton.addEventListener('click', function () {
    exportCanvas('png', window.rotation);
});

// Function to export the canvas as a PNG file
function exportCanvas(format, angle) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    const radians = (angle * Math.PI) / 180;
    const width = canvas.width;
    const height = canvas.height;
    // Calculate dimensions for the temporary canvas after rotation
    tempCanvas.width = Math.abs(width * Math.cos(radians)) + Math.abs(height * Math.sin(radians));
    tempCanvas.height = Math.abs(height * Math.cos(radians)) + Math.abs(width * Math.sin(radians));

    // Translate and draw the original canvas onto the temporary canvas
    tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
    tempCtx.drawImage(canvas, -width / 2, -height / 2);

    // Trigger a download of the PNG file
    const link = document.createElement('a');
    link.download = `pixel-art.${format}`;
    link.href = tempCanvas.toDataURL(`image/${format}`);
    link.click();
}

// Get the close button element for the overlay
const closeOverlayButton = document.getElementById('closeOverlayButton');

// Close the overlay when the close button is clicked
closeOverlayButton.addEventListener('click', function () {
    overlay.style.display = 'none';
});
