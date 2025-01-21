let responseElement;

document.addEventListener("DOMContentLoaded", function () {
    const fetchBtn = document.getElementById("fetchBtn");
    responseElement = document.getElementById("find");
    fetchBtn.addEventListener("click", async function () {
        const completion = await getFeaturedArticles();
        responseElement.innerText = completion;
    });
});

// Get today's featured article from English Wikipedia
async function getFeaturedArticles() {
    let today = new Date();
    let year = today.getFullYear();
    let month = String(today.getMonth() + 1).padStart(2, '0');
    let day = String(today.getDate()).padStart(2, '0');
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
        return obj.mostread.articles[num].normalizedtitle;

    } catch (error) {
        console.error(error);
        return "Error fetching article";
    }
}