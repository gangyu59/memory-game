document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    const startButton = document.getElementById('start-button');
    const difficultySlider = document.getElementById('difficulty-slider');
    const difficultyLabel = document.getElementById('difficulty-label');
    const messageDiv = document.getElementById('message');
    const moveCounter = document.getElementById('move-counter');
    const rulesModal = document.getElementById('rules-modal');
    const rulesButton = document.getElementById('rules-button');
    const closeButton = document.querySelector('.close-button');

    let size;
    let cards = [];
    let flipped = [];
    let matched = [];
    let firstFlip = null;
    let moveCount = 0;

    const difficulties = ['超易', '较易', '中等', '较难', '超难'];

    difficultySlider.addEventListener('input', (event) => {
        difficultyLabel.textContent = difficulties[event.target.value - 1];
    });

    startButton.addEventListener('click', () => {
        const level = parseInt(difficultySlider.value);
        size = level + 2;
        messageDiv.textContent = '';
        moveCount = 0;
        moveCounter.textContent = `翻牌次数 = ${moveCount}`;
        createGame(size);
        displayGame(size);
    });

    rulesButton.addEventListener('click', () => {
        rulesModal.style.display = 'block';
    });

    closeButton.addEventListener('click', () => {
        rulesModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === rulesModal) {
            rulesModal.style.display = 'none';
        }
    });

    function createGame(size) {
        const icons = ['⚽️', '🏀', '🏈', '⚾️', '🎾', '🎱', '🥎', '🏐', '🏉', '🥏', '🎳', '🏓', '🏸', '🥊', '🥋', '⛳️', '🥅', '⛸', '🥌', '🎿', '🏂', '🏋️‍♂️', '🏋️‍♀️', '🤼‍♂️', '🤼‍♀️', '🤸‍♂️', '🤸‍♀️', '⛹️‍♂️', '⛹️‍♀️', '🤺', '🤿', '🏊‍♂️', '🏊‍♀️', '🤽‍♂️', '🤽‍♀️', '🚴‍♂️', '🚴‍♀️', '🚵‍♂️', '🚵‍♀️', '🏇', '🧘‍♂️', '🧘‍♀️', '🏄‍♂️', '🏄‍♀️', '🏆', '🥇', '🥈', '🥉'];
        randomShuffle(icons);
        const selectedIcons = icons.slice(0, Math.floor((size * size) / 2));
        const pairs = selectedIcons.concat(selectedIcons);
        randomShuffle(pairs);
        cards = [];
        for (let i = 0; i < size; i++) {
            cards.push(pairs.slice(i * size, (i + 1) * size));
        }
        flipped = Array.from({ length: size }, () => Array(size).fill(false));
        matched = Array.from({ length: size }, () => Array(size).fill(false));
    }

    function displayGame(size) {
        gameContainer.innerHTML = '';
        gameContainer.style.gridTemplateColumns = `repeat(${size}, 60px)`;
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.addEventListener('click', () => handleCellClick(r, c));
                gameContainer.appendChild(cell);
            }
        }
    }

    function handleCellClick(row, col) {
        if (flipped[row][col] || matched[row][col]) return;
        flipped[row][col] = true;
        updateCell(row, col);
        updateMoveCounter();
        if (!firstFlip) {
            firstFlip = { row, col };
        } else {
            const { row: row1, col: col1 } = firstFlip;
            if (cards[row1][col1] === cards[row][col]) {
                matched[row1][col1] = true;
                matched[row][col] = true;
                if (matched.flat().filter(Boolean).length === size * size - 1) {
                    messageDiv.innerHTML = `<span style="color: green;">恭喜成功！一共用了${moveCount}步。</span>`;
                }
            } else {
                setTimeout(() => {
                    flipped[row1][col1] = false;
                    flipped[row][col] = false;
                    updateCell(row1, col1);
                    updateCell(row, col);
                }, 1000);
            }
            firstFlip = null;
        }
    }

    function updateCell(row, col) {
        const cell = gameContainer.children[row * size + col];
        if (flipped[row][col] || matched[row][col]) {
            cell.textContent = cards[row][col];
            cell.classList.add('flipped');
        } else {
            cell.textContent = '';
            cell.classList.remove('flipped');
        }
    }

    function updateMoveCounter() {
        moveCount++;
        moveCounter.textContent = `翻牌次数 = ${moveCount}`;
    }

    function randomShuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
});