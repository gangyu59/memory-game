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
    let lockBoard = false;

    const difficulties = ['超易', '较易', '中等', '较难', '超难'];

    difficultySlider.addEventListener('input', (event) => {
        difficultyLabel.textContent = difficulties[event.target.value - 1];
    });

    startButton.addEventListener('click', () => {
        const level = parseInt(difficultySlider.value);
        size = level + 2;
        messageDiv.textContent = '';
        messageDiv.classList.remove('win');
        moveCount = 0;
        moveCounter.textContent = `翻牌次数 = ${moveCount}`;
        firstFlip = null;
        lockBoard = false;
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
        const icons = ['⚽️', '🏀', '🏈', '⚾️', '🎾', '🎱', '🥎', '🏐', '🏉', '🥏',
            '🎳', '🏓', '🏸', '🥊', '🥋', '⛳️', '🥅', '⛸', '🥌', '🎿',
            '🏂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🤿', '🏊', '🤽', '🚴',
            '🚵', '🏇', '🧘', '🏄', '🏆', '🥇', '🥈', '🥉', '🎯', '🎮',
            '🎲', '🃏', '🎸', '🎺', '🎻', '🎹', '🥁', '🎤', '🎧', '🎨'];
        randomShuffle(icons);
        const totalCells = size * size;
        const pairCount = Math.floor(totalCells / 2);
        const selectedIcons = icons.slice(0, pairCount);
        const pairs = selectedIcons.concat(selectedIcons);
        // Odd grid (e.g. 3×3=9): add a free tile instead of a duplicate icon
        if (totalCells % 2 === 1) {
            pairs.push('__free__');
        }
        randomShuffle(pairs);
        cards = [];
        for (let i = 0; i < size; i++) {
            cards.push(pairs.slice(i * size, (i + 1) * size));
        }
        flipped = Array.from({ length: size }, () => Array(size).fill(false));
        matched = Array.from({ length: size }, () => Array(size).fill(false));
        // Pre-match the free tile so win condition is never blocked
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (cards[r][c] === '__free__') {
                    matched[r][c] = true;
                    flipped[r][c] = true;
                }
            }
        }
    }

    function displayGame(size) {
        // Responsive card size: fit within screen width
        const availableWidth = Math.min(window.innerWidth - 40, 480);
        const gapTotal = (size - 1) * 6;
        const containerPadding = 28; // 14px × 2
        const cardSize = Math.min(
            Math.max(Math.floor((availableWidth - gapTotal - containerPadding) / size), 40),
            68
        );
        document.documentElement.style.setProperty('--card-size', cardSize + 'px');

        gameContainer.innerHTML = '';
        gameContainer.style.gridTemplateColumns = `repeat(${size}, var(--card-size, 64px))`;

        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');

                const cardInner = document.createElement('div');
                cardInner.classList.add('card-inner');

                const cardBack = document.createElement('div');
                cardBack.classList.add('card-back');

                const cardFront = document.createElement('div');
                cardFront.classList.add('card-front');

                cardInner.appendChild(cardBack);
                cardInner.appendChild(cardFront);
                cell.appendChild(cardInner);

                cell.addEventListener('click', () => handleCellClick(r, c));
                gameContainer.appendChild(cell);
            }
        }
        // Reveal any pre-matched free tiles
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (matched[r][c]) updateCell(r, c);
            }
        }
    }

    function handleCellClick(row, col) {
        if (lockBoard || flipped[row][col] || matched[row][col]) return;

        flipped[row][col] = true;
        updateCell(row, col);
        updateMoveCounter();

        if (!firstFlip) {
            firstFlip = { row, col };
        } else {
            const { row: row1, col: col1 } = firstFlip;
            firstFlip = null;

            if (cards[row1][col1] === cards[row][col]) {
                // Match!
                matched[row1][col1] = true;
                matched[row][col] = true;
                updateCell(row1, col1);
                updateCell(row, col);

                const totalCells = matched.flat().filter(Boolean).length;
                if (totalCells === size * size) {
                    setTimeout(() => {
                        messageDiv.classList.add('win');
                        messageDiv.innerHTML =
                            `<span style="background:linear-gradient(90deg,#f9a825,#f06292,#7c4dff);` +
                            `-webkit-background-clip:text;-webkit-text-fill-color:transparent;` +
                            `background-clip:text;">🎉 恭喜成功！共用了 ${moveCount} 步！</span>`;
                    }, 300);
                }
            } else {
                // Mismatch — lock board then flip back
                lockBoard = true;
                setTimeout(() => {
                    flipped[row1][col1] = false;
                    flipped[row][col] = false;
                    updateCell(row1, col1);
                    updateCell(row, col);
                    lockBoard = false;
                }, 1000);
            }
        }
    }

    function updateCell(row, col) {
        const cell = gameContainer.children[row * size + col];
        const cardFront = cell.querySelector('.card-front');

        if (flipped[row][col] || matched[row][col]) {
            cardFront.textContent = cards[row][col] === '__free__' ? '⭐' : cards[row][col];
            cell.classList.add('flipped');
        } else {
            cardFront.textContent = '';
            cell.classList.remove('flipped');
        }

        if (matched[row][col]) {
            cell.classList.add('matched');
        } else {
            cell.classList.remove('matched');
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
