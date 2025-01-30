// gameState.js
export const GameState = {
    IDLE: 'Idle',
    PLAYING: 'Playing',
    WIN: 'Win',
    GAME_OVER: 'Game Over'
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
            callback(null);
        }
    });
}