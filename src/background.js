let matchedTitles = [];

chrome.tabs.onActivated.addListener(async function(activeInfo) {
    let tab = await chrome.tabs.get(activeInfo.tabId);
    checkTabUrl(tab);
});

chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab) {
    if (changeInfo.url) {
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
                titleToCheck = parsedData.title;
                linkedUrls = await getLinkedUrls(titleToCheck);
                compareUrls(activeUrl, linkedUrls);    
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
            console.log("Match found! Title added to the list:", linkedUrl);
        }
    });
}