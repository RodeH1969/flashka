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

const gameBoard = document.getElementById('game-board');
const attemptsDisplay = document.getElementById('attempts');
const attemptsLeftDisplay = document.getElementById('attempts-left');
const result = document.getElementById('result');
const resultMessage = document.getElementById('result-message');
const timesPlayedDisplay = document.getElementById('times-played');
const shareBtn = document.getElementById('share-btn');
const restartBtn = document.getElementById('restart-btn');
const gameOverBox = document.getElementById('game-over-box');

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

function initGame() {
    playCount++;
    const cardImages = [...images, ...images];
    cardImages.sort(() => Math.random() - 0.5);

    for (let i = 0; i < cardImages.length; i++) {
        for (let j = i + 1; j < cardImages.length; j++) {
            if (cardImages[i] === cardImages[j] && Math.abs(i - j) === 1) {
                const k = Math.floor(Math.random() * cardImages.length);
                [cardImages[j], cardImages[k]] = [cardImages[k], cardImages[j]];
            }
        }
    }

    gameBoard.innerHTML = '';
    cards = cardImages.map((src, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.image = src;
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front"></div>
                <div class="card-back"><img src="${src}" alt="Card"></div>
            </div>
        `;
        card.addEventListener('click', () => flipCard(card));
        gameBoard.appendChild(card);
        return card;
    });

    flippedCards = [];
    matchedPairs = 0;
    attempts = 0;
    gameOver = false;
    attemptsDisplay.textContent = attempts;
    attemptsLeftDisplay.textContent = maxAttempts;
    result.style.display = 'none';
    timesPlayedDisplay.textContent = '';
}

function flipCard(card) {
    if (gameOver || flippedCards.includes(card) || flippedCards.length >= 2 || card.classList.contains('matched')) {
        return;
    }

    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        attempts++;
        attemptsDisplay.textContent = attempts;
        attemptsLeftDisplay.textContent = maxAttempts - attempts;
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    if (card1.dataset.image === card2.dataset.image) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;
        flippedCards = [];
        if (matchedPairs === images.length) {
            endGame(true);
        }
    } else {
        setTimeout(() => {
            if (!gameOver) {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
            }
        }, 1000);
    }

    if (attempts >= maxAttempts && matchedPairs < images.length) {
        endGame(false);
    }
}

function endGame(won) {
    gameOver = true;
    result.style.display = 'block';
    const score = won ? `${attempts}/29` : 'Unsolved/29';
    let resultText = `Your score: ${score}\n`;
    let scoreEmoji = '';
    let resultLine = '';

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
    resultMessage.textContent = resultText;

    // Display times played with the number in red and bold
    timesPlayedDisplay.innerHTML = `Times played: <span style="color: red; font-weight: bold;">${playCount}</span>`;

    const prizeMessage = "1st to score <19 and SMS officials wins $20 Dan's card 🍾";
    const timesPlayedMessage = `Times played: ${playCount}`;
    const message = `FLASHKA – GAME OVER 🔚\nYour score: ${score} ${scoreEmoji}\n${timesPlayedMessage}\n**${prizeMessage}**\n\n🔹 10–15 = Genius 🧠\n🔹 16–19 = Elite 💪\n🔹 20–24 = Strong 👍\n🔹 25–29 = Good 🌟\n🔹 Unsolved in 29 = Better luck tomorrow 🙃\nGame ID: ${gameId}`;
    const smsLink = `sms:+61459754708?body=${encodeURIComponent(message)}`;
    shareBtn.setAttribute('data-sms-link', smsLink);

    // Display the message in the game over box with HTML for styling
    gameOverBox.innerHTML = message
        .replace(prizeMessage, `<span class="prize-message">${prizeMessage}</span>`)
        .replace(timesPlayedMessage, `Times played: <span style="color: red; font-weight: bold;">${playCount}</span>`);
}

shareBtn.addEventListener('click', () => {
    const smsLink = shareBtn.getAttribute('data-sms-link');
    window.location.href = smsLink;
});

restartBtn.addEventListener('click', initGame);

initGame();