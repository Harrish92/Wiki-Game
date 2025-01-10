import 'dotenv/config'

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
        .then(console.log).catch(console.error);
}

getFeaturedArticles();
