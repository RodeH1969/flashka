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
const shareBtn = document.getElementById('share-btn');
const restartBtn = document.getElementById('restart-btn');

let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let attempts = 0;
let maxAttempts = 24;
let gameOver = false;

// Get gameId from URL query parameter (e.g., ?gameId=04/06/25)
const urlParams = new URLSearchParams(window.location.search);
const gameId = urlParams.get('gameId') || 'default';

// Seed the random number generator with gameId
Math.seedrandom(gameId);

function initGame() {
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
    const score = won ? `${attempts}/24` : 'Unsolved/24';
    let resultText = `Your score: ${score}\n`;
    let scoreEmoji = '';

    if (!won) {
        resultText += '🔹 Unsolved in 24 = Better luck tomorrow 🙃';
        scoreEmoji = '🙃';
    } else if (attempts === 10) {
        resultText += '🔹 10 = Perfect 🎯';
        scoreEmoji = '🎯';
    } else if (attempts >= 11 && attempts <= 14) {
        resultText += '🔹 11–14 = Genius 🧠';
        scoreEmoji = '🧠';
    } else if (attempts >= 15 && attempts <= 18) {
        resultText += '🔹 15–18 = Strong 💪';
        scoreEmoji = '💪';
    } else if (attempts >= 19 && attempts <= 21) {
        resultText += '🔹 19–21 = Good 👍';
        scoreEmoji = '👍';
    } else if (attempts >= 22 && attempts <= 23) {
        resultText += '🔹 22–23 = Well Done 🌟';
        scoreEmoji = '🌟';
    } else if (attempts === 24) {
        resultText += '🔹 24 = Completed 🏆';
        scoreEmoji = '🏆';
    }

    resultMessage.textContent = resultText;

    const message = `FLASHKA – GAME OVER 🔚\nYour score: ${score} ${scoreEmoji}\n\n🔹 10 = Perfect 🎯\n🔹 11–14 = Genius 🧠\n🔹 15–18 = Strong 💪\n🔹 19–21 = Good 👍\n🔹 22–23 = Well Done 🌟\n🔹 24 = Completed 🏆\n🔹 Unsolved in 24 = Better luck tomorrow 🙃\nGame ID: ${gameId}`;
    const smsLink = `sms:+61459754708?body=${encodeURIComponent(message)}`;
    shareBtn.setAttribute('data-sms-link', smsLink);
}

shareBtn.addEventListener('click', () => {
    const smsLink = shareBtn.getAttribute('data-sms-link');
    window.location.href = smsLink;
});

restartBtn.addEventListener('click', initGame);

initGame();