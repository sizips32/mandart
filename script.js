document.addEventListener('DOMContentLoaded', () => {
    const gridWrapper = document.getElementById('grid-wrapper');
    const listWrapper = document.getElementById('list-wrapper');
    const resetBtn = document.getElementById('reset-btn');
    const downloadBtn = document.getElementById('download-btn');

    // Controls
    const fontSizeInput = document.getElementById('font-size-input');
    const bgColorInput = document.getElementById('bg-color-input');
    const textColorInput = document.getElementById('text-color-input');

    // Tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    const viewSections = document.querySelectorAll('.view-section');

    // Data Structure: 9 blocks, each with 9 cells.
    // Block 4 is the center block.
    // Inside each block, Cell 4 is the center cell.

    // Initialize state from localStorage or default
    let mandalartData = JSON.parse(localStorage.getItem('mandalartData')) || Array(9).fill(null).map(() => Array(9).fill(''));

    // Initialize Settings
    const savedSettings = JSON.parse(localStorage.getItem('mandalartSettings')) || {
        fontSize: 12,
        bgColor: '#7B81E8',
        textColor: '#1e293b'
    };

    function applySettings() {
        document.documentElement.style.setProperty('--base-font-size', `${savedSettings.fontSize}px`);
        document.documentElement.style.setProperty('--bg-color', savedSettings.bgColor);
        document.documentElement.style.setProperty('--text-color', savedSettings.textColor);

        fontSizeInput.value = savedSettings.fontSize;
        bgColorInput.value = savedSettings.bgColor;
        textColorInput.value = savedSettings.textColor;
    }

    function saveSettings() {
        localStorage.setItem('mandalartSettings', JSON.stringify(savedSettings));
    }

    // Event Listeners for Controls
    fontSizeInput.addEventListener('input', (e) => {
        savedSettings.fontSize = e.target.value;
        document.documentElement.style.setProperty('--base-font-size', `${e.target.value}px`);
        saveSettings();
    });

    bgColorInput.addEventListener('input', (e) => {
        savedSettings.bgColor = e.target.value;
        document.documentElement.style.setProperty('--bg-color', e.target.value);
        saveSettings();
    });

    textColorInput.addEventListener('input', (e) => {
        savedSettings.textColor = e.target.value;
        document.documentElement.style.setProperty('--text-color', e.target.value);
        saveSettings();
    });

    // Tab Switching Logic
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            viewSections.forEach(s => s.classList.remove('active'));

            // Add active class to clicked
            btn.classList.add('active');
            const viewId = btn.dataset.view; // 'grid' or 'list'
            document.getElementById(`${viewId}-view`).classList.add('active');

            if (viewId === 'list') {
                renderListView();
            }
        });
    });

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
                textarea.dataset.bindex = bIndex;
                textarea.dataset.cindex = cIndex;

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

    function renderListView() {
        listWrapper.innerHTML = '';

        // 1. Core Goal Section (Block 4, Cell 4)
        const coreGoalGroup = document.createElement('div');
        coreGoalGroup.className = 'list-group';

        const coreHeader = document.createElement('h3');
        coreHeader.textContent = 'Core Goal';
        coreGoalGroup.appendChild(coreHeader);

        const coreInput = document.createElement('input');
        coreInput.className = 'list-header-input';
        coreInput.value = mandalartData[4][4];
        coreInput.placeholder = 'Enter Core Goal';
        coreInput.dataset.bindex = 4; // Add data attributes for updateListDOM
        coreInput.dataset.cindex = 4; // Add data attributes for updateListDOM
        coreInput.addEventListener('input', (e) => updateData(4, 4, e.target.value));
        coreGoalGroup.appendChild(coreInput);

        listWrapper.appendChild(coreGoalGroup);

        // 2. Sub Goals Sections (Blocks 0,1,2,3,5,6,7,8)
        const blockIndices = [0, 1, 2, 3, 5, 6, 7, 8];

        blockIndices.forEach(bIndex => {
            const group = document.createElement('div');
            group.className = 'list-group';

            // Sub Goal Title (Linked to Center Cell of this block)
            // This is stored at mandalartData[bIndex][4] AND mandalartData[4][bIndex]
            const subGoalTitle = mandalartData[bIndex][4];

            const headerInput = document.createElement('input');
            headerInput.className = 'list-header-input';
            headerInput.value = subGoalTitle;
            headerInput.placeholder = `Sub Goal ${getDirection(bIndex)}`;
            headerInput.style.fontSize = '1.2rem';
            headerInput.dataset.bindex = bIndex; // Add data attributes for updateListDOM
            headerInput.dataset.cindex = 4; // Add data attributes for updateListDOM
            headerInput.addEventListener('input', (e) => {
                // Updating the center cell of this block
                updateData(bIndex, 4, e.target.value);
            });
            group.appendChild(headerInput);

            // 8 Action Items (Surrounding cells of this block)
            const cellIndices = [0, 1, 2, 3, 5, 6, 7, 8];
            cellIndices.forEach(cIndex => {
                const row = document.createElement('div');
                row.className = 'list-item-row';

                const label = document.createElement('label');
                label.textContent = cIndex + 1; // Just a number

                const input = document.createElement('input');
                input.value = mandalartData[bIndex][cIndex];
                input.placeholder = 'Action Item';
                input.dataset.bindex = bIndex;
                input.dataset.cindex = cIndex;
                input.addEventListener('input', (e) => {
                    updateData(bIndex, cIndex, e.target.value);
                });

                row.appendChild(label);
                row.appendChild(input);
                group.appendChild(row);
            });

            listWrapper.appendChild(group);
        });
    }

    function getPlaceholder(bIndex, cIndex) {
        if (bIndex === 4 && cIndex === 4) return 'CORE GOAL';
        if (bIndex === 4) return `Sub Goal`;
        if (cIndex === 4) return `Sub Goal`;
        return '';
    }

    function getDirection(index) {
        // Map index to direction for better UX
        const directions = ['Top-Left', 'Top', 'Top-Right', 'Left', 'Center', 'Right', 'Bottom-Left', 'Bottom', 'Bottom-Right'];
        return directions[index] || '';
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
                updateGridDOM(cIndex, 4, value);
                updateListDOM(cIndex, 4, value);
            }
        }
        // 2. If we are editing a Surrounding Block (not Block 4)
        else {
            // If we edit the Center Cell (Cell 4)
            if (cIndex === 4) {
                // This corresponds to a cell in the Center Block (Block 4)
                // Mapping: Cell 4 in Block X -> Cell X in Block 4
                mandalartData[4][bIndex] = value;
                updateGridDOM(4, bIndex, value);
                updateListDOM(4, bIndex, value);
            }
        }

        // Always update the specific cell in Grid DOM
        updateGridDOM(bIndex, cIndex, value);

        // If List View is active, we might want to update it too, 
        // but re-rendering the whole list loses focus. 
        // So we should try to update the specific input if it exists.
        updateListDOM(bIndex, cIndex, value);

        saveData();
    }

    function updateGridDOM(bIndex, cIndex, value) {
        // Find the specific textarea and update it
        const block = gridWrapper.children[bIndex];
        if (!block) return;
        const cell = block.children[cIndex];
        if (!cell) return;
        const textarea = cell.querySelector('textarea');
        if (textarea && textarea.value !== value) {
            textarea.value = value;
        }
    }

    function updateListDOM(bIndex, cIndex, value) {
        // Find the input in the list view using data attributes
        const input = listWrapper.querySelector(`input[data-bindex="${bIndex}"][data-cindex="${cIndex}"]`);
        if (input && input.value !== value) {
            input.value = value;
        }
    }

    // Reset Functionality
    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your Mandalart?')) {
            mandalartData = Array(9).fill(null).map(() => Array(9).fill(''));
            saveData();
            renderGrid();
            renderListView();
        }
    });

    // Download Functionality
    downloadBtn.addEventListener('click', () => {
        const captureArea = document.getElementById('capture-area');
        const gridWrapper = document.getElementById('grid-wrapper');
        
        // 그리드 뷰가 활성화되어 있는지 확인
        const gridView = document.getElementById('grid-view');
        if (!gridView || !gridView.classList.contains('active')) {
            alert('그리드 뷰에서만 이미지를 저장할 수 있습니다.');
            return;
        }
        
        // 요소의 실제 렌더링된 크기 가져오기
        const rect = captureArea.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        
        // html2canvas 옵션 설정 - 전체 영역을 정확히 캡처하도록 개선
        html2canvas(captureArea, {
            backgroundColor: savedSettings.bgColor,
            scale: 2, // High resolution
            width: width, // 명시적으로 너비 설정
            height: height, // 명시적으로 높이 설정
            scrollX: 0, // 스크롤 위치 고정
            scrollY: 0, // 스크롤 위치 고정
            useCORS: true, // CORS 허용
            allowTaint: true, // 외부 리소스 허용
            logging: false, // 로깅 비활성화
            removeContainer: false, // 컨테이너 제거하지 않음
            foreignObjectRendering: false, // foreignObject 렌더링 비활성화 (호환성 향상)
            onclone: (clonedDoc) => {
                // 복제된 문서에서 요소의 스타일이 올바르게 적용되도록 보장
                const clonedElement = clonedDoc.getElementById('capture-area');
                const clonedGridWrapper = clonedDoc.getElementById('grid-wrapper');
                
                if (clonedElement) {
                    // 컨테이너 스타일 명시적 설정
                    clonedElement.style.width = width + 'px';
                    clonedElement.style.height = height + 'px';
                    clonedElement.style.display = 'block';
                    clonedElement.style.visibility = 'visible';
                    clonedElement.style.opacity = '1';
                    clonedElement.style.position = 'relative';
                    clonedElement.style.backgroundColor = savedSettings.bgColor;
                }
                
                if (clonedGridWrapper) {
                    // 그리드 래퍼가 보이도록 보장
                    clonedGridWrapper.style.display = 'grid';
                    clonedGridWrapper.style.visibility = 'visible';
                    clonedGridWrapper.style.opacity = '1';
                    clonedGridWrapper.style.width = '100%';
                    clonedGridWrapper.style.height = '100%';
                    
                    // 모든 블록과 셀이 보이도록 보장
                    const blocks = clonedGridWrapper.querySelectorAll('.block');
                    blocks.forEach(block => {
                        block.style.display = 'grid';
                        block.style.visibility = 'visible';
                        block.style.opacity = '1';
                        
                        const cells = block.querySelectorAll('.cell');
                        cells.forEach(cell => {
                            cell.style.visibility = 'visible';
                            cell.style.opacity = '1';
                            
                            const textarea = cell.querySelector('textarea');
                            if (textarea) {
                                textarea.style.visibility = 'visible';
                                textarea.style.opacity = '1';
                            }
                        });
                    });
                }
            }
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'my-mandalart.png';
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
        }).catch(error => {
            console.error('이미지 저장 중 오류 발생:', error);
            alert('이미지 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
        });
    });

    // Initial Render
    applySettings();
    renderGrid();
    renderListView();
});
