const newGameBtn = document.getElementById('new-game-btn');
const gameLink = document.getElementById('game-link');
const gameUrl = document.getElementById('game-url');

newGameBtn.addEventListener('click', () => {
    // Use current timestamp as gameId
    const gameId = Date.now().toString();
    // Construct the game URL with gameId
    const url = `${window.location.origin}?gameId=${gameId}`;
    gameUrl.href = url;
    gameUrl.textContent = url;
    gameLink.style.display = 'block';
});