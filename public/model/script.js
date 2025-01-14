require('dotenv/config')

// Get today's featured article from English Wikipedia

async function getFeaturedArticles() {
    let today = new Date();
    let year = today.getFullYear();
    let month = String(today.getMonth() + 1).padStart(2,'0');
    let day = String(today.getDate()).padStart(2,'0');
    let url = `https://api.wikimedia.org/feed/v1/wikipedia/en/featured/${year}/${month}/${day}`;

    let response = await fetch( url,
        {
            headers: {
                'Authorization': process.env.ACCESS_TOKEN,
                'Api-User-Agent': "Test"
            }
        }
    );

    response.json()
        .then(function(result) {
            const obj = JSON.parse(JSON.stringify(result));

            let begin = Math.floor(Math.random() * obj.mostread.articles.length);
            let end = Math.floor(Math.random() * obj.mostread.articles.length);

            console.log(obj.mostread.articles[begin].normalizedtitle);
            console.log(obj.mostread.articles[end].normalizedtitle);

        }).catch(console.error);
    
}

getFeaturedArticles();
