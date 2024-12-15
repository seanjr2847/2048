const gridContainer = document.querySelector('.grid-container');
const scoreDisplay = document.getElementById('score');
const restartButton = document.getElementById('restart');
let score = 0;
let grid = [];

function init() {
    grid = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    score = 0;
    scoreDisplay.innerText = score;
    generateTile();
    generateTile();
    updateGrid();
}

function generateTile() {
    let emptyTiles = [];
    grid.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
            if (value === 0) {
                emptyTiles.push({ rowIndex, colIndex });
            }
        });
    });
    if (emptyTiles.length > 0) {
        const { rowIndex, colIndex } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        grid[rowIndex][colIndex] = Math.random() < 0.9 ? 2 : 4;
        const tile = document.createElement('div');
        tile.classList.add('tile', 'new');
    }
}

function updateGrid() {
    gridContainer.innerHTML = '';
    grid.forEach(row => {
        row.forEach(value => {
            const tile = document.createElement('div');
            tile.classList.add('tile', `tile-${value}`);
            tile.innerText = value === 0 ? '' : value;
            gridContainer.appendChild(tile);
        });
    });
}

function move(direction) {
    let moved = false;
    const gridCopy = JSON.parse(JSON.stringify(grid));

    // Rotate grid to always process left-to-right
    if (direction === 'up') rotateGrid(3);
    if (direction === 'right') rotateGrid(2);
    if (direction === 'down') rotateGrid(1);

    // Process each row
    for (let i = 0; i < 4; i++) {
        const row = grid[i].filter(cell => cell !== 0);
        const missing = 4 - row.length;
        const zeros = Array(missing).fill(0);
        
        // Merge tiles
        for (let j = 0; j < row.length - 1; j++) {
            if (row[j] === row[j + 1]) {
                row[j] *= 2;
                row[j + 1] = 0;
                score += row[j];
                j++;
            }
        }
        
        // Remove zeros and add them to the end
        const mergedRow = row.filter(cell => cell !== 0);
        const newRow = mergedRow.concat(Array(4 - mergedRow.length).fill(0));
        grid[i] = newRow;
    }

    // Rotate back
    if (direction === 'up') rotateGrid(1);
    if (direction === 'right') rotateGrid(2);
    if (direction === 'down') rotateGrid(3);

    // Check if grid changed
    moved = !grid.every((row, i) => 
        row.every((cell, j) => cell === gridCopy[i][j])
    );

    if (moved) {
        generateTile();
        updateGrid();
        scoreDisplay.innerText = score;
    }

    return moved;
}

function rotateGrid(times = 1) {
    for (let t = 0; t < times; t++) {
        const newGrid = [];
        for (let i = 0; i < 4; i++) {
            newGrid.push([]);
            for (let j = 0; j < 4; j++) {
                newGrid[i][j] = grid[3 - j][i];
            }
        }
        grid = newGrid;
    }
}

function handleKeyPress(event) {
    switch(event.key) {
        case 'ArrowUp':
            event.preventDefault();
            move('up');
            break;
        case 'ArrowDown':
            event.preventDefault();
            move('down');
            break;
        case 'ArrowLeft':
            event.preventDefault();
            move('left');
            break;
        case 'ArrowRight':
            event.preventDefault();
            move('right');
            break;
    }
}

// Add touch handling variables and functions
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

function handleTouchStart(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
}

function handleTouchMove(event) {
    event.preventDefault(); // Prevent scrolling while swiping
}

function handleTouchEnd(event) {
    touchEndX = event.changedTouches[0].clientX;
    touchEndY = event.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // Minimum swipe distance to trigger movement
    const minSwipeDistance = 50;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                move('right');
            } else {
                move('left');
            }
        }
    } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0) {
                move('down');
            } else {
                move('up');
            }
        }
    }
}

// Add touch event listeners
gridContainer.addEventListener('touchstart', handleTouchStart, false);
gridContainer.addEventListener('touchmove', handleTouchMove, false);
gridContainer.addEventListener('touchend', handleTouchEnd, false);

document.addEventListener('keydown', handleKeyPress);
restartButton.addEventListener('click', init);
init();
