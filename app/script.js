/*
    get_random.js

    MediaWiki API Demos
    Demo of `Random` module: Get request to list 5 random pages.

    MIT License
*/

function get_random(){
    var url = "https://en.wikipedia.org/w/api.php"; 

    var params = {
        action: "query",
        format: "json",
        list: "random",
        rnlimit: "2",
        rnnamespace : "0"
    };
    
    url = url + "?origin=*";
    Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});
    
    fetch(url)
        .then(function(response){return response.json();})
        .then(function(response) {
            var randoms = response.query.random;
            for (var r in randoms) {
                console.log(randoms[r].title);
            }
            document.getElementById("start").textContent = randoms[0].title;
            document.getElementById("end").textContent = randoms[1].title;
        })
        .catch(function(error){console.log(error);})
}

get_random();
document.getElementById("change").onclick = get_random;