import { GameState, updateGameState, getGameState, handleGameStep } from './gameState.js';
let matchedTitles = [];
let gameState = getGameState(function(step) {return step;});

// Listener for when the extension icon is clicked
chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
        checkTabUrl(tab);
    }
});

/**
 * Checks the URL of the active tab and compares it with the linked URLs.
 * @param {Object} tab - The active tab object.
 */
async function checkTabUrl(tab) {

    chrome.storage.local.get('matchedTitles', async function(data) {
        let activeUrl = tab.url;
        let linkedUrls = [];
        let titleToCheck;

        if (matchedTitles.length === 0) {
            chrome.storage.local.get('start', async function(data) {
                if (data && data.start) {
                    let parsedData = JSON.parse(data.start);
                    titleToCheck = parsedData.normalizedtitle;
                    matchedTitles.push(titleToCheck);   
                } else {
                    console.log("No data found in local storage.");
                }
            });
        } else {
            titleToCheck = matchedTitles[matchedTitles.length - 1];
            linkedUrls = await getLinkedUrls(titleToCheck);
            compareUrls(activeUrl, linkedUrls);    
        }

        chrome.storage.local.set({ 'matchedTitles': JSON.stringify(matchedTitles) });
    });
}

/**
 * Fetches the linked URLs for a given Wikipedia page title.
 * @param {string} title - The Wikipedia page title.
 * @returns {Promise<Array<string>>} - A promise that resolves to an array of linked URLs.
 */
async function getLinkedUrls(title) {
    let linkedUrls = [];
    let url = `https://en.wikipedia.org/w/api.php?action=query&titles=${title}&prop=links&format=json&pllimit=max`;
    let continueToken = null;

    try {
        do {
            let fetchUrl = url;
            if (continueToken) {
                fetchUrl += `&plcontinue=${continueToken}`;
            }

            let response = await fetch(fetchUrl);
            let result = await response.json();
            let pages = result.query.pages;

            for (let pageId in pages) {
                let links = pages[pageId].links;
                if (links) {
                    links.forEach(link => {
                        linkedUrls.push(link.title);
                    });
                }
            }

            continueToken = result.continue ? result.continue.plcontinue : null;
        } while (continueToken);

        return linkedUrls;
    } catch (error) {
        console.error("Error fetching linked URLs:", error);
        return [];
    }
}

/**
 * Compares the active URL with the linked URLs and updates the matched titles.
 * @param {string} activeUrl - The URL of the active tab.
 * @param {Array<string>} linkedUrls - The array of linked URLs.
 * @param {string} titleToCheck - The title to check against the linked URLs.
 */
function compareUrls(activeUrl, linkedUrls) {

    chrome.storage.local.get('end', function(data) {
        gameState = GameState.GAME_OVER;
        linkedUrls.forEach(linkedUrl => {
            if (activeUrl === `https://en.wikipedia.org/wiki/${linkedUrl.replace(/ /g, '_')}`) {
                matchedTitles.push(linkedUrl);
                gameState = GameState.PLAYING;
                updateGameState(gameState);
                console.log("Match found! Title added to the list:", linkedUrl);
                console.log(matchedTitles)
            }
        });

        if (data && data.end) {
            if (matchedTitles[matchedTitles.length - 1] === JSON.parse(data.end).normalizedtitle) {
                gameState = GameState.WIN;
                matchedTitles = [];
                console.log("You won! Game over.");
            } else if ((gameState !== GameState.PLAYING)) {
                gameState = GameState.GAME_OVER;
                matchedTitles = [];
                console.log("Game over! No match found.");
                console.log(matchedTitles);
            }
        }

        chrome.storage.local.set({ 'matchedTitles': JSON.stringify(matchedTitles) });
        updateGameState(gameState);
    });
}