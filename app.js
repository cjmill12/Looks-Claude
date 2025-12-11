document.addEventListener('DOMContentLoaded', () => {
    // 1. Get DOM elements
    const videoFeed = document.getElementById('video-feed');
    const aiResultImg = document.getElementById('ai-result');
    const canvas = document.getElementById('hidden-canvas');
    const centralViewport = document.getElementById('central-viewport');
    
    // Buttons and Controls
    const takeSelfieBtn = document.getElementById('take-selfie-btn');
    const tryOnBtn = document.getElementById('try-on-btn');
    const spinner = document.getElementById('loading-spinner');
    
    const statusMessage = document.getElementById('status-message');
    
    // Filter elements (using IDs for sections)
    // NOTE: genderSelector removed, replaced by specific buttons
    const complexionSelector = document.getElementById('complexion-selector');
    const complexionGroup = document.getElementById('complexion-options-group');
    const galleryContainer = document.getElementById('hairstyle-gallery'); 
    
    // New Gender Buttons
    const maleGenderBtn = document.getElementById('male-gender-btn');
    const femaleGenderBtn = document.getElementById('female-gender-btn');

    // State tracking variables
    let capturedImageBase64 = null; 
    let selectedPrompt = null; 
    let cameraStarted = false; 
    let selectedGender = 'Male'; // Set default gender
    let selectedComplexion = null;

    // --- CONSTANTS ---
    const NEGATIVE_PROMPT = "extra fingers, blurry, low resolution, bad hands, deformed face, mask artifact, bad blending, unnatural hair hair color, ugly, tiling, duplicate, abstract, cartoon, distorted pupils, bad lighting, cropped, grainy, noise, poor lighting, poor composition, low quality"; 

    // --- Helper Functions ---

    // Function to handle gender selection (New)
    function handleGenderSelect(gender) {
        selectedGender = gender;

        // Remove 'selected' class from all gender buttons
        maleGenderBtn.classList.remove('selected');
        femaleGenderBtn.classList.remove('selected');

        // Add 'selected' class to the clicked button
        if (gender === 'Male') {
            maleGenderBtn.classList.add('selected');
        } else if (gender === 'Female') {
            femaleGenderBtn.classList.add('selected');
        }
    }

    // Function to handle accordion collapse/expand (kept for other filters)
    function toggleFilterSection(section) {
        // ... (rest of the toggleFilterSection function remains the same)
        if (section.classList.contains('collapsed')) {
            section.classList.remove('collapsed');
            section.classList.add('expanded');
        } else {
            section.classList.remove('expanded');
            section.classList.add('collapsed');
        }
    }
    
    // Function to handle complexion tile selection (remains the same)
    function handleComplexionSelect(tile) {
        // ... (rest of the handleComplexionSelect function remains the same)
        const complexionTiles = complexionGroup.querySelectorAll('.complexion-tile');
        complexionTiles.forEach(t => t.classList.remove('selected'));
        tile.classList.add('selected');
        selectedComplexion = tile.dataset.complexion;
    }
    
    // Function to handle hairstyle selection (remains the same)
    function handleStyleSelect(styleOption) {
        // ... (rest of the handleStyleSelect function remains the same)
        const styleOptions = galleryContainer.querySelectorAll('.style-option');
        styleOptions.forEach(o => o.classList.remove('selected'));
        styleOption.classList.add('selected');
        selectedPrompt = styleOption.dataset.prompt;
        // Logic to update the status message
    }
    
    // Function to start camera stream (remains the same)
    async function startCamera() {
        // ... (rest of the startCamera function remains the same)
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoFeed.srcObject = stream;
            cameraStarted = true;
            centralViewport.classList.add('active'); // Show viewport
            // ... (rest of success logic)
        } catch (error) {
            // ... (rest of error logic)
        }
    }
    
    // Function to stop camera stream (remains the same)
    function stopCamera() {
        // ... (rest of stopCamera function remains the same)
        if (videoFeed.srcObject) {
            videoFeed.srcObject.getTracks().forEach(track => track.stop());
            videoFeed.srcObject = null;
        }
        cameraStarted = false;
        centralViewport.classList.remove('active'); // Hide viewport
        // ... (rest of UI updates)
    }
    
    // Function to capture image (remains the same)
    function captureImage() {
        // ... (rest of captureImage function remains the same)
        // ... (logic to draw video to canvas and get base64)
        // ... (UI updates to show image and try-on button)
    }
    
    // Function to run AI try-on (remains the same)
    tryOnBtn.addEventListener('click', async () => {
        // ... (rest of tryOnBtn logic remains the same)
        // ... (ensures capturedImageBase64 and selectedPrompt are set)
        
        // --- IMPORTANT: Ensure gender is included in the prompt! ---
        const finalPrompt = `A high quality, professional studio portrait of a ${selectedGender} model with a ${selectedComplexion} complexion, featuring a new hairstyle: ${selectedPrompt}. The face should be clear and well-lit.`;
        
        // ... (rest of fetch request with finalPrompt)
    });


    // --- INITIALIZATION and EVENT LISTENERS ---

    // Set initial gender selection (Default to Male if buttons exist)
    if (maleGenderBtn) {
        handleGenderSelect('Male');
    }
    
    // New Gender Button Listeners
    if (maleGenderBtn) {
        maleGenderBtn.addEventListener('click', () => handleGenderSelect('Male'));
    }

    if (femaleGenderBtn) {
        femaleGenderBtn.addEventListener('click', () => handleGenderSelect('Female'));
    }

    // Toggle button listeners for remaining filters (Complexion, Hairstyle)
    if (complexionSelector) {
        complexionSelector.querySelector('h3').addEventListener('click', () => toggleFilterSection(complexionSelector));
    }
    if (galleryContainer) {
        galleryContainer.querySelector('h3').addEventListener('click', () => toggleFilterSection(galleryContainer));
    }

    // Complexion tile listeners
    if (complexionGroup) {
        complexionGroup.querySelectorAll('.complexion-tile').forEach(tile => {
            tile.addEventListener('click', () => handleComplexionSelect(tile));
        });
    }

    // Hairstyle option listeners
    if (galleryContainer) {
        galleryContainer.querySelectorAll('.style-option').forEach(option => {
            option.addEventListener('click', () => handleStyleSelect(option));
        });
    }

    // Camera/Selfie button logic
    takeSelfieBtn.addEventListener('click', () => {
        // ... (rest of takeSelfieBtn logic remains the same)
        if (!cameraStarted) {
            // If camera is off, start it
            startCamera();
            takeSelfieBtn.textContent = "📸";
        } else {
            // If camera is on, capture image
            captureImage();
        }
    });

    // Initial state setup for filters (optional)
    if (complexionSelector) complexionSelector.classList.add('collapsed');
    if (galleryContainer) galleryContainer.classList.add('expanded');
    
    // Hide spinner initially
    spinner.style.display = 'none';
});
