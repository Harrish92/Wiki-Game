import { GameState, updateGameState, getGameState, handleGameStep } from './gameState.js';
let matchedTitles = [];
let gameState = getGameState(function(step) {return step;});

chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
        checkTabUrl(tab);
    }
});

async function checkTabUrl(tab) {
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
}

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

function compareUrls(activeUrl, linkedUrls) {
    linkedUrls.forEach(linkedUrl => {
        if (activeUrl === `https://en.wikipedia.org/wiki/${linkedUrl.replace(/ /g, '_')}`) {
            matchedTitles.push(linkedUrl);
            gameState = GameState.NEXT;
            updateGameState(gameState);
            console.log("Match found! Title added to the list:", linkedUrl);
            console.log(matchedTitles)
        }
    });

    chrome.storage.local.get('end', function(data) {
        if (data && data.end) {
            console.log(JSON.parse(data.end).normalizedtitle);
            if (matchedTitles[matchedTitles.length - 1] === JSON.parse(data.end).normalizedtitle) {
                gameState = GameState.WIN;
                matchedTitles = [];
                console.log("You won! Game over.");
            } else if ((gameState !== GameState.NEXT) && (gameState !== GameState.WIN)) {
                gameState = GameState.GAME_OVER;
                matchedTitles = [];
                console.log("Game over! No match found.");
            } else {
                gameState = GameState.PLAYING;
            }
        }
        updateGameState(gameState);
    });
}