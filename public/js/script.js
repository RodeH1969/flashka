console.log('Script loaded');

const images = [
    '/image_1.png',
    '/image_2.png',
    '/image_3.png',
    '/image_4.png',
    '/image_5.png',
    '/image_6.png',
    '/image_7.png',
    '/image_8.png',
    '/image_9.png',
    '/image_10.png'
];

console.log('Images array defined:', images);

const gameBoard = document.getElementById('game-board');
const attemptsDisplay = document.getElementById('attempts');
const attemptsLeftDisplay = document.getElementById('attempts-left');
const result = document.getElementById('result');
const shareBtn = document.getElementById('share-btn');

console.log('Initial DOM elements retrieved:');
console.log('gameBoard:', gameBoard);
console.log('attemptsDisplay:', attemptsDisplay);
console.log('attemptsLeftDisplay:', attemptsLeftDisplay);
console.log('result:', result);
console.log('shareBtn:', shareBtn);

if (!shareBtn) {
    console.error('shareBtn is null, cannot attach event listener');
}

let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let attempts = 0;
let maxAttempts = 29;
let gameOver = false;
let playCount = 0;

// Get gameId from URL query parameter (e.g., ?gameId=04/06/25)
const urlParams = new URLSearchParams(window.location.search);
let gameId = urlParams.get('gameId');
if (!gameId) {
    // Set default gameId to current date if not provided
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    gameId = `${day}/${month}/${year}`;
}
console.log('Game ID:', gameId);

// Seed the random number generator with gameId
Math.seedrandom(gameId);
console.log('Math.seedrandom initialized');

// Save game state to sessionStorage
function saveGameState() {
    const state = {
        cards: cards.map(card => ({
            image: card.dataset.image,
            flipped: card.classList.contains('flipped'),
            matched: card.classList.contains('matched')
        })),
        flippedCards: flippedCards.map(card => cards.indexOf(card)),
        matchedPairs,
        attempts,
        gameOver,
        playCount
    };
    sessionStorage.setItem('flashkaGameState', JSON.stringify(state));
    console.log('Game state saved:', state);
}

// Load game state from sessionStorage
function loadGameState() {
    const savedState = sessionStorage.getItem('flashkaGameState');
    if (savedState) {
        const state = JSON.parse(savedState);
        console.log('Loaded game state:', state);

        // Restore game state
        matchedPairs = state.matchedPairs;
        attempts = state.attempts;
        gameOver = state.gameOver;
        playCount = state.playCount;

        // Rebuild cards
        gameBoard.innerHTML = '';
        cards = state.cards.map((cardData, index) => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.image = cardData.image;
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front"></div>
                    <div class="card-back"><img src="${cardData.image}" alt="Card"></div>
                </div>
            `;
            const img = card.querySelector('img');
            img.onerror = () => console.error(`Failed to load image for card ${index}: ${cardData.image}`);
            img.onload = () => console.log(`Successfully loaded image for card ${index}: ${cardData.image}`);
            card.addEventListener('click', () => flipCard(card));
            if (cardData.flipped) card.classList.add('flipped');
            if (cardData.matched) card.classList.add('matched');
            gameBoard.appendChild(card);
            return card;
        });

        // Restore flippedCards
        flippedCards = state.flippedCards.map(index => cards[index]);

        // Update UI
        attemptsDisplay.textContent = attempts;
        attemptsLeftDisplay.textContent = maxAttempts - attempts;
        result.style.display = gameOver ? 'block' : 'none';
        if (gameOver) {
            endGame(matchedPairs === images.length); // Re-run endGame to restore result UI
        }
    } else {
        console.log('No saved game state, initializing new game');
        initGame();
    }
}

function initGame() {
    playCount++;
    console.log('Initializing game, playCount:', playCount);
    console.log('Game board element:', gameBoard);
    const cardImages = [...images, ...images];
    console.log('Card images array length:', cardImages.length);
    cardImages.sort(() => Math.random() - 0.5);

    for (let i = 0; i < cardImages.length; i++) {
        for (let j = i + 1; j < cardImages.length; j++) {
            if (cardImages[i] === cardImages[j] && Math.abs(i - j) === 1) {
                const k = Math.floor(Math.random() * cardImages.length);
                [cardImages[j], cardImages[k]] = [cardImages[k], cardImages[j]];
            }
        }
    }

    if (!gameBoard) {
        console.error('gameBoard is null, cannot proceed with rendering cards');
        return;
    }

    gameBoard.innerHTML = '';
    console.log('Cleared game board');
    cards = cardImages.map((src, index) => {
        console.log(`Creating card ${index} with src: ${src}`);
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.image = src;
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front"></div>
                <div class="card-back"><img src="${src}" alt="Card"></div>
            </div>
        `;
        const img = card.querySelector('img');
        img.onerror = () => console.error(`Failed to load image for card ${index}: ${src}`);
        img.onload = () => console.log(`Successfully loaded image for card ${index}: ${src}`);
        card.addEventListener('click', () => flipCard(card));
        gameBoard.appendChild(card);
        return card;
    });
    console.log('Cards created and appended:', cards.length);

    if (!attemptsDisplay || !attemptsLeftDisplay) {
        console.error('attemptsDisplay or attemptsLeftDisplay is null');
        return;
    }

    flippedCards = [];
    matchedPairs = 0;
    attempts = 0;
    gameOver = false;
    attemptsDisplay.textContent = attempts;
    attemptsLeftDisplay.textContent = maxAttempts;
    if (result) {
        result.style.display = 'none';
    }
    saveGameState();
    console.log('Game initialized successfully');
}

function flipCard(card) {
    console.log('Flipping card:', card);
    if (gameOver || flippedCards.includes(card) || flippedCards.length >= 2 || card.classList.contains('matched')) {
        console.log('Cannot flip card: game over or invalid state');
        return;
    }

    card.classList.add('flipped');
    flippedCards.push(card);
    saveGameState();

    if (flippedCards.length === 2) {
        attempts++;
        attemptsDisplay.textContent = attempts;
        attemptsLeftDisplay.textContent = maxAttempts - attempts;
        saveGameState();
        checkMatch();
    }
}

function checkMatch() {
    console.log('Checking match, flippedCards:', flippedCards);
    const [card1, card2] = flippedCards;
    if (card1.dataset.image === card2.dataset.image) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;
        flippedCards = [];
        saveGameState();
        if (matchedPairs === images.length) {
            endGame(true);
        }
    } else {
        setTimeout(() => {
            if (!gameOver) {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
                saveGameState();
            }
        }, 1000);
    }

    if (attempts >= maxAttempts && matchedPairs < images.length) {
        endGame(false);
    }
}

function endGame(won) {
    console.log('Entering endGame, won:', won);
    gameOver = true;

    if (!result) {
        console.error('result element is null');
        return;
    }
    console.log('Setting result display to block');
    result.style.display = 'block';
    console.log('Result div display style after setting:', result.style.display);
    console.log('Result div computed style:', window.getComputedStyle(result).display);

    // Delay DOM manipulations to ensure the result div is rendered
    setTimeout(() => {
        console.log('Delayed DOM manipulations in endGame');

        // Requery DOM elements
        const resultMessage = document.getElementById('result-message');
        const timesPlayedDisplay = document.getElementById('times-played');
        const shareBtn = document.getElementById('share-btn');
        const restartBtn = document.getElementById('restart-btn');
        const gameOverBox = document.getElementById('game-over-box');

        console.log('Requeried DOM elements in endGame:');
        console.log('result:', result);
        console.log('resultMessage:', resultMessage);
        console.log('timesPlayedDisplay:', timesPlayedDisplay);
        console.log('shareBtn:', shareBtn);
        console.log('restartBtn:', restartBtn);
        console.log('gameOverBox:', gameOverBox);

        const score = won ? `${attempts}/29` : 'Unsolved/29';
        let resultText = `Your score: ${score}\n`;
        let scoreEmoji = '';
        let resultLine = '';

        console.log('Calculating score and result line');
        if (!won) {
            resultLine = '🔹 Unsolved in 29 = Better luck tomorrow 🙃';
            scoreEmoji = '🙃';
        } else if (attempts >= 10 && attempts <= 15) {
            resultLine = '🔹 10–15 = Genius 🧠';
            scoreEmoji = '🧠';
        } else if (attempts >= 16 && attempts <= 19) {
            resultLine = '🔹 16–19 = Elite 💪';
            scoreEmoji = '💪';
        } else if (attempts >= 20 && attempts <= 24) {
            resultLine = '🔹 20–24 = Strong 👍';
            scoreEmoji = '👍';
        } else if (attempts >= 25 && attempts <= 29) {
            resultLine = '🔹 25–29 = Good 🌟';
            scoreEmoji = '🌟';
        }

        resultText += resultLine;
        console.log('Setting result message:', resultText);
        if (resultMessage) {
            resultMessage.textContent = resultText;
        } else {
            console.warn('resultMessage element is null, proceeding anyway');
        }

        console.log('Setting times played display');
        if (timesPlayedDisplay) {
            timesPlayedDisplay.innerHTML = `Times played: <span style="color: red; font-weight: bold;">${playCount}</span>`;
        } else {
            console.warn('timesPlayedDisplay element is null, proceeding anyway');
        }

        const prizeMessage = "1st to score <19 and SMS officials wins $20 Dan's card 🍾";
        const timesPlayedMessage = `Times played: ${playCount}`;
        const message = `FLASHKA – GAME OVER 🔚\nYour score: ${score} ${scoreEmoji}\n${timesPlayedMessage}\n**${prizeMessage}**\n\n🔹 10–15 = Genius 🧠\n🔹 16–19 = Elite 💪\n🔹 20–24 = Strong 👍\n🔹 25–29 = Good 🌟\n🔹 Unsolved in 29 = Better luck tomorrow 🙃\nGame ID: ${gameId}`;
        console.log('SMS message constructed:', message);

        console.log('Setting data-sms-link on shareBtn');
        if (shareBtn) {
            shareBtn.setAttribute('data-sms-link', `sms:+61459754708?body=${encodeURIComponent(message)}`);
        } else {
            console.warn('shareBtn element is null, proceeding anyway');
        }

        console.log('Setting game over box content');
        if (gameOverBox) {
            gameOverBox.innerHTML = message
                .replace(prizeMessage, `<span class="prize-message">${prizeMessage}</span>`)
                .replace(timesPlayedMessage, `Times played: <span style="color: red; font-weight: bold;">${playCount}</span>`);
        } else {
            console.warn('gameOverBox element is null, proceeding anyway');
        }

        // Attach restartBtn event listener
        console.log('Attaching event listener to restartBtn in endGame');
        if (restartBtn) {
            console.log('restartBtn found, computed display:', window.getComputedStyle(restartBtn).display);
            restartBtn.addEventListener('click', () => {
                console.log('Restart button clicked');
                sessionStorage.removeItem('flashkaGameState'); // Clear saved state
                initGame();
            });
        } else {
            console.warn('restartBtn is still null after requery in endGame');
        }

        saveGameState();
        console.log('Delayed endGame completed successfully');
    }, 100);

    console.log('endGame scheduled successfully');
}

console.log('Loading game state');
loadGameState();

console.log('Attaching event listener to shareBtn');
if (shareBtn) {
    shareBtn.addEventListener('click', () => {
        console.log('Share button clicked');
        const smsLink = shareBtn.getAttribute('data-sms-link');
        console.log('SMS link:', smsLink);
        if (smsLink) {
            window.location.href = smsLink;
        } else {
            console.error('data-sms-link attribute not set on shareBtn');
        }
    });
}

console.log('Script completed');