import { GameState, updateGameState, getGameState, handleGameStep } from './gameState.js';


const fetchBtn = document.getElementById("fetchBtn");
const startBtn = document.getElementById("startBtn");

document.addEventListener("DOMContentLoaded", function () {
    handleGameStep();

    fetchBtn.addEventListener("click", async function () {
        chrome.storage.local.clear();
        const end = await getFeaturedArticles();
        if (end === "Error fetching article") {
            updateGameState(GameState.ERROR);
        } else {
            updateGameState(GameState.SELECTION);
            chrome.storage.local.set({ 'end': JSON.stringify(end) });
        }
        handleGameStep();
    });

    startBtn.addEventListener("click", async function () {
        let start;
        updateGameState(GameState.PLAYING);
        chrome.storage.local.get('end', function (data) {
            if (data && data.end) {
                let end = JSON.parse(data.end);
                while (start === undefined || start.title === end.title) {
                    start = getFeaturedArticles();
                }
            }
        });
        start = await getFeaturedArticles();
        chrome.storage.local.set({ 'start': JSON.stringify(start) });
        
        // Update the current tab with the new URL
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.update(tabs[0].id, { url: `https://en.wikipedia.org/wiki/${start.title}` });
        });

        handleGameStep();
    });
});

// Get today's featured article from English Wikipedia
async function getFeaturedArticles() {

    let today = new Date();
    let year = today.getFullYear();
    let month = String(today.getMonth() + 1).padStart(2, '0');
    let day = String(today.getDate() - 1).padStart(2, '0');
    let url = `https://api.wikimedia.org/feed/v1/wikipedia/en/featured/${year}/${month}/${day}`;

    try {
        let response = await fetch(url, {
            headers: {
                'Authorization': process.env.ACCESS_TOKEN,
                'Api-User-Agent': "Test"
            }
        });

        let result = await response.json();
        const obj = JSON.parse(JSON.stringify(result));
        let num = Math.floor(Math.random() * obj.mostread.articles.length);
        return obj.mostread.articles[num];

    } catch (error) {
        console.error(error);
        return "Error fetching article";
    }
}