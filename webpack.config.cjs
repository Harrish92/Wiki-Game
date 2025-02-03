const Dotenv = require('dotenv-webpack');

module.exports = {
    entry: {
        scripts: './src/script.js'
    },
    plugins: [
        new Dotenv()
    ]
};