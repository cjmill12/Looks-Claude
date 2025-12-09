document.addEventListener('DOMContentLoaded', () => {
    // 1. Get DOM elements
    const videoFeed = document.getElementById('video-feed');
    const canvas = document.getElementById('hidden-canvas');
    const takeSelfieBtn = document.getElementById('take-selfie-btn');
    const tryOnBtn = document.getElementById('try-on-btn');
    const styleOptions = document.querySelectorAll('.style-option'); 
    
    const spinner = document.getElementById('loading-spinner');
    
    const aiResultImg = document.getElementById('ai-result');
    const statusMessage = document.getElementById('status-message');
    
    let capturedImageBase64 = null; 
    let selectedPrompt = null; 
    let cameraStarted = false; 

    // --- NEW CONSTANT: THE NEGATIVE PROMPT (Remaining the same) ---
    const NEGATIVE_PROMPT = "extra fingers, blurry, low resolution, bad hands, deformed face, mask artifact, bad blending, unnatural hair color, ugly, tiling, duplicate, abstract, cartoon, distorted pupils, bad lighting, cropped, grainy, noise, poor quality, bad anatomy.";
    
    // --- Camera Initialization Function ---
    function startCamera() {
        if (cameraStarted) return;
        
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            statusMessage.textContent = "Attempting to access camera...";
            takeSelfieBtn.disabled = true; // Disable button while loading

            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    videoFeed.srcObject = stream;
                    cameraStarted = true;
                    
                    // 🚨 KEY CHANGE 1: Update button text when camera is ready
                    takeSelfieBtn.textContent = "📸 Take Selfie"; 
                    takeSelfieBtn.disabled = false;
                    statusMessage.textContent = "Camera ready. Click 'Take Selfie'!";
                })
                .catch(err => {
                    console.error("Camera access error:", err);
                    takeSelfieBtn.disabled = false; // Re-enable on failure
                    takeSelfieBtn.textContent = "Error: Camera Access Failed";
                    statusMessage.textContent = "Error: Cannot access camera. Check browser permissions.";
                });
        } else {
            statusMessage.textContent = "Error: Camera access not supported by your browser.";
        }
    }
    
    // 🚨 INITIAL STATE SETUP
    takeSelfieBtn.textContent = "▶️ Start Camera"; // Set initial text
    statusMessage.textContent = "Click 'Start Camera' to begin the virtual try-on.";
    

    // --- Capture Selfie/Camera Activation ---
    takeSelfieBtn.addEventListener('click', () => {
        // Step 1: Handle Camera Initialization (First Click)
        if (!cameraStarted) {
            startCamera(); 
            return; 
        }
        
        // Step 2: Handle Photo Capture (Second Click)
        if (videoFeed.readyState !== 4) { 
            statusMessage.textContent = "Camera feed not ready yet. Please wait a moment.";
            return;
        }

        canvas.width = videoFeed.videoWidth;
        canvas.height = videoFeed.videoHeight;
        const context = canvas.getContext('2d');
        
        context.drawImage(videoFeed, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        capturedImageBase64 = dataUrl.split(',')[1]; 

        aiResultImg.style.display = 'none';

        if (selectedPrompt) {
            tryOnBtn.disabled = false;
        }
        statusMessage.textContent = "Selfie captured. Select a style and click 'Try On!'";
    });

    // --- Style Selection Logic (Remaining the same) ---
    styleOptions.forEach(option => {
        option.addEventListener('click', () => {
            styleOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            selectedPrompt = option.getAttribute('data-prompt');
            
            if (capturedImageBase64) {
                tryOnBtn.disabled = false;
            }
            statusMessage.textContent = `${option.getAttribute('data-name')} selected. Click 'Try On!'`;
        });
    });


    // --- Call Netlify Function for AI Processing (Remaining the same) ---
    tryOnBtn.addEventListener('click', async () => {
        if (!capturedImageBase64 || !selectedPrompt) {
            statusMessage.textContent = "Please take a selfie AND select a style!";
            return;
        }

        statusMessage.textContent = `Applying your selected style... This may take a moment.`;
        tryOnBtn.disabled = true;
        spinner.style.display = 'inline-block'; 

        try {
            const response = await fetch('/.netlify/functions/tryon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    baseImage: capturedImageBase64,
                    prompt: `Edit the hair in this image using the following instruction: ${selectedPrompt}. Ensure the final result is photorealistic, seamlessly blended, and maintains the subject's face and original lighting.`,
                    negativePrompt: NEGATIVE_PROMPT 
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            
            aiResultImg.src = `data:image/jpeg;base64,${data.generatedImageBase64}`;
            aiResultImg.style.display = 'inline';
            statusMessage.textContent = `Done! Your new look is ready.`;

        } catch (error) {
            console.error('AI Processing Error:', error);
            statusMessage.textContent = `Error during AI try-on: ${error.message}. Please check your console/Netlify logs.`;
        } finally {
            tryOnBtn.disabled = false;
            spinner.style.display = 'none'; 
        }
    });
});
