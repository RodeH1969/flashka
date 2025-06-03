const newGameBtn = document.getElementById('new-game-btn');
const gameLink = document.getElementById('game-link');
const gameUrl = document.getElementById('game-url');

newGameBtn.addEventListener('click', () => {
    // Generate gameId in format day/month/year (e.g., 04/06/25)
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = String(now.getFullYear()).slice(-2); // Last 2 digits of year
    const gameId = `${day}/${month}/${year}`;
    // Construct the game URL with gameId
    const url = `${window.location.origin}?gameId=${gameId}`;
    gameUrl.href = url;
    gameUrl.textContent = url;
    gameLink.style.display = 'block';
});