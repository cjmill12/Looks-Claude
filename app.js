// ... (lines 1-118 of app.js remain the same) ...

    // --- FILTER STEP 2: Complexion Selector Generation ---
    function renderComplexionSelector() {
        complexionGroup.innerHTML = ''; 
        
        complexionData.forEach(c => {
            const tile = document.createElement('div');
            tile.classList.add('complexion-tile');
            tile.setAttribute('data-complexion', c.id);
            // Complexion tile is the color swatch itself
            tile.style.backgroundColor = c.color; 
            
            const label = document.createElement('p');
            label.textContent = c.name;
            
            tile.appendChild(label); // Label is appended directly to the colored tile
            complexionGroup.appendChild(tile);
            
            tile.addEventListener('click', (e) => {
                document.querySelectorAll('.complexion-tile').forEach(t => t.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                
                selectedComplexion = e.currentTarget.getAttribute('data-complexion');
                
                renderFinalGallery();

                // Collapse Step 2, Automatically Expand Inspiration (Step 3)
                setFilterState(complexionSelector, false);
                setFilterState(galleryContainer, true);

                statusMessage.textContent = "2. Complexion selected. Now choose your 3. Inspiration style below!";
            });
        });
    }

// ... (lines 135-263 of app.js remain the same) ...
