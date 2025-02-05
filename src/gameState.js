// gameState.js
export const GameState = {
    IDLE: 'Idle',
    SELECTION: 'Selection',
    PLAYING: 'Playing',
    NEXT: 'Next',
    WIN: 'Win',
    GAME_OVER: 'Game Over',
    ERROR: 'Error',
};

// Function to update the game state
export function updateGameState(state) {
    if (Object.values(GameState).includes(state)) {
        chrome.storage.local.set({ 'gameState': state }, function() {
            console.log('Game state updated to:', state);
        });
    } else {
        console.error('Invalid game state:', state);
    }
}

// Function to retrieve the current game state
export function getGameState(callback) {
    chrome.storage.local.get('gameState', function(data) {
        if (data && data.gameState) {
            callback(data.gameState);
        } else {
            callback(GameState.IDLE);
        }
    });
}

// Function to handle game steps
export function handleGameStep() {
    let findElement = document.getElementById("find");
    const startBtn = document.getElementById("startBtn");
    getGameState(function(step) {
        switch (step) {
            case GameState.IDLE:
                console.log('Game is idle...');
                findElement.innerText = "";
                startBtn.disabled = true;
                break;
            case GameState.SELECTION:
                chrome.storage.local.get('end', function(data) {
                    if (data && data.end) {
                        let end = JSON.parse(data.end);
                        findElement.innerHTML = `find: <strong>${end.normalizedtitle}<strong>`;
                        startBtn.disabled = false;
                    }
                });
                break;
            case GameState.PLAYING:
                chrome.storage.local.get('end', function(data) {
                    if (data && data.end) {
                        let end = JSON.parse(data.end);
                        findElement.innerHTML = `find: <strong>${end.normalizedtitle}<strong>`;
                        startBtn.disabled = true;
                    }
                });
                break;
            case GameState.NEXT:
                console.log('Next step...');
                break;
            case GameState.GAME_OVER:
                console.log('Game over!');
                break;
            case GameState.WIN:
                console.log('You won!');
                break;
            case GameState.ERROR:
                console.error('An error occurred!');
                findElement.innerText = "Error fetching article";
                startBtn.disabled = true;
                break;
            default:
                console.error('Unknown game step:', step);
                break;
        }
    });
}