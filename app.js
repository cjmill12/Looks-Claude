document.addEventListener('DOMContentLoaded', () => {
    // 1. Get DOM elements
    const videoFeed = document.getElementById('video-feed');
    const canvas = document.getElementById('hidden-canvas');
    const takeSelfieBtn = document.getElementById('take-selfie-btn');
    const tryOnBtn = document.getElementById('try-on-btn');
    const hairstyleSelect = document.getElementById('hairstyle-select');
    const originalSelfieImg = document.getElementById('original-selfie');
    const aiResultImg = document.getElementById('ai-result');
    const statusMessage = document.getElementById('status-message');
    let capturedImageBase64 = null; // Stores the selfie data

    // --- Start Camera ---
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            videoFeed.srcObject = stream;
            statusMessage.textContent = "Camera ready. Smile and click 'Take Selfie'!";
        })
        .catch(err => {
            console.error("Camera access error:", err);
            statusMessage.textContent = "Error: Cannot access camera. Check permissions.";
        });

    // --- Capture Selfie ---
    takeSelfieBtn.addEventListener('click', () => {
        if (videoFeed.readyState !== 4) return;

        canvas.width = videoFeed.videoWidth;
        canvas.height = videoFeed.videoHeight;
        const context = canvas.getContext('2d');
        
        // Draw the current video frame onto the canvas
        context.drawImage(videoFeed, 0, 0, canvas.width, canvas.height);
        
        // Get the image data URL and strip the "data:image/jpeg;base64," prefix
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        capturedImageBase64 = dataUrl.split(',')[1]; 

        originalSelfieImg.src = dataUrl;
        originalSelfieImg.style.display = 'inline';
        tryOnBtn.disabled = false;
        aiResultImg.style.display = 'none';
        statusMessage.textContent = "Selfie captured. Select a style and click 'Try On!'";
    });

    // --- Call Netlify Function for AI Processing ---
    tryOnBtn.addEventListener('click', async () => {
        if (!capturedImageBase64) return;

        const selectedHairstyle = hairstyleSelect.value;
        statusMessage.textContent = `Applying ${selectedHairstyle}... This may take a moment.`;
        tryOnBtn.disabled = true;

        try {
            const response = await fetch('/.netlify/functions/tryon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    baseImage: capturedImageBase64,
                    // Crafting a strong prompt for the Nano Banana model
                    prompt: `Apply a high-quality, photorealistic ${selectedHairstyle} hairstyle to the person in the image. Maintain natural shadows and lighting.`
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            
            // Display the AI-generated image
            aiResultImg.src = `data:image/jpeg;base64,${data.generatedImageBase64}`;
            aiResultImg.style.display = 'inline';
            statusMessage.textContent = `Done! Your new ${selectedHairstyle} look is ready.`;

        } catch (error) {
            console.error('AI Processing Error:', error);
            statusMessage.textContent = 'Error during AI try-on. Check the browser console.';
        } finally {
            tryOnBtn.disabled = false;
        }
    });
});
