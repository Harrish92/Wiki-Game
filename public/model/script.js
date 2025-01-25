let findElement = document.getElementById("find");
let responseElement = document.getElementById("end");
const fetchBtn = document.getElementById("fetchBtn");
const startBtn = document.getElementById("startBtn");


document.addEventListener("DOMContentLoaded", function () {

    chrome.storage.local.get('end', function (data) {
        if (data && data.end) {
            let parsedData = JSON.parse(data.end);
            findElement.innerText = "find: ";
            responseElement.innerText = `${parsedData.normalizedtitle}`;
            responseElement.href = `https://en.wikipedia.org/wiki/${parsedData.title}`;
            startBtn.disabled = false;
        } else {
            findElement.innerText = "";
            responseElement.innerText = "";
            responseElement.href = "";
            startBtn.disabled = true;
        }
    });

    fetchBtn.addEventListener("click", async function () {
        const end = await getFeaturedArticles();
        chrome.storage.local.clear();
        if (end === "Error fetching article") {
            findElement.innerText = "Error fetching article";
            responseElement.innerText = "";
            responseElement.href = "";
            startBtn.disabled = true;
        } else {
            findElement.innerText = "find: ";
            responseElement.innerText = `${end.normalizedtitle}`;
            responseElement.href = `https://en.wikipedia.org/wiki/${end.title}`;
            chrome.storage.local.set({ 'end': JSON.stringify(end) });
            startBtn.disabled = false;
        }
    });

    startBtn.addEventListener("click", async function () {
        let start;
        chrome.storage.local.get('start', async function(data) {
            if (data && data.start) {
                start = JSON.parse(data.start);
            } else {
                start = await getFeaturedArticles();
                chrome.storage.local.set({ 'start': JSON.stringify(start) });
            }
            window.open(`https://en.wikipedia.org/wiki/${start.title}`, "_blank");
        });
    });

});

// Get today's featured article from English Wikipedia
async function getFeaturedArticles() {

    let today = new Date();
    let year = today.getFullYear();
    let month = String(today.getMonth() + 1).padStart(2, '0');
    let day = String(today.getDate()).padStart(2, '0');
    let url = `https://api.wikimedia.org/feed/v1/wikipedia/en/featured/${year}/${month}/${day-1}`;

    try {
        let response = await fetch(url, {
            headers: {
                'Authorization': Process.env.ACCESS_TOKEN,
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