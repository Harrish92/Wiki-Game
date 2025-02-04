const Dotenv = require('dotenv-webpack');

module.exports = {
    entry: {
        scripts: './src/script.js',
        background: './src/background.js'
    },
    plugins: [
        new Dotenv()
    ]
};