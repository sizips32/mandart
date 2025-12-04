document.addEventListener('DOMContentLoaded', () => {
    const gridWrapper = document.getElementById('grid-wrapper');
    const resetBtn = document.getElementById('reset-btn');
    const downloadBtn = document.getElementById('download-btn');

    // Data Structure: 9 blocks, each with 9 cells.
    // Block 4 is the center block.
    // Inside each block, Cell 4 is the center cell.
    
    // Initialize state from localStorage or default
    let mandalartData = JSON.parse(localStorage.getItem('mandalartData')) || Array(9).fill(null).map(() => Array(9).fill(''));

    function saveData() {
        localStorage.setItem('mandalartData', JSON.stringify(mandalartData));
    }

    function renderGrid() {
        gridWrapper.innerHTML = '';

        // Create 9 Blocks
        for (let bIndex = 0; bIndex < 9; bIndex++) {
            const block = document.createElement('div');
            block.className = `block block-${bIndex}`;
            if (bIndex === 4) block.classList.add('center-block');

            // Create 9 Cells per Block
            for (let cIndex = 0; cIndex < 9; cIndex++) {
                const cell = document.createElement('div');
                cell.className = `cell cell-${cIndex}`;
                if (cIndex === 4) cell.classList.add('center-cell');

                const textarea = document.createElement('textarea');
                textarea.value = mandalartData[bIndex][cIndex];
                textarea.placeholder = getPlaceholder(bIndex, cIndex);
                
                // Event Listener for Input
                textarea.addEventListener('input', (e) => {
                    const newValue = e.target.value;
                    updateData(bIndex, cIndex, newValue);
                });

                cell.appendChild(textarea);
                block.appendChild(cell);
            }
            gridWrapper.appendChild(block);
        }
    }

    function getPlaceholder(bIndex, cIndex) {
        if (bIndex === 4 && cIndex === 4) return 'CORE GOAL';
        if (bIndex === 4) return `Sub Goal ${getDirection(cIndex)}`;
        if (cIndex === 4) return `Sub Goal`;
        return '';
    }

    function getDirection(index) {
        // Optional: Helper to give direction names if needed
        return '';
    }

    function updateData(bIndex, cIndex, value) {
        // Update current cell
        mandalartData[bIndex][cIndex] = value;

        // Logic for Data Binding
        // 1. If we are editing the Center Block (Block 4)
        if (bIndex === 4) {
            // If we edit a surrounding cell (not the center one at 4)
            if (cIndex !== 4) {
                // This cell corresponds to the Center Cell of a surrounding Block
                // Mapping: Cell X in Block 4 -> Cell 4 in Block X
                mandalartData[cIndex][4] = value;
                updateDOM(cIndex, 4, value);
            }
        }
        // 2. If we are editing a Surrounding Block (not Block 4)
        else {
            // If we edit the Center Cell (Cell 4)
            if (cIndex === 4) {
                // This corresponds to a cell in the Center Block (Block 4)
                // Mapping: Cell 4 in Block X -> Cell X in Block 4
                mandalartData[4][bIndex] = value;
                updateDOM(4, bIndex, value);
            }
        }

        saveData();
    }

    function updateDOM(bIndex, cIndex, value) {
        // Find the specific textarea and update it without re-rendering everything
        const block = gridWrapper.children[bIndex];
        const cell = block.children[cIndex];
        const textarea = cell.querySelector('textarea');
        if (textarea && textarea.value !== value) {
            textarea.value = value;
        }
    }

    // Reset Functionality
    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your Mandalart?')) {
            mandalartData = Array(9).fill(null).map(() => Array(9).fill(''));
            saveData();
            renderGrid();
        }
    });

    // Download Functionality
    downloadBtn.addEventListener('click', () => {
        const captureArea = document.getElementById('capture-area');
        
        // Temporarily adjust style for better screenshot if needed
        html2canvas(captureArea, {
            backgroundColor: '#0f172a', // Match bg color
            scale: 2 // High resolution
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'my-mandalart.png';
            link.href = canvas.toDataURL();
            link.click();
        });
    });

    // Initial Render
    renderGrid();
});
