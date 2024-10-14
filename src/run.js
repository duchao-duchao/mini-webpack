const Webpack = require('./mini-webpack.js');
const config = require('./webpack.config.js');

const compiler = new Webpack(config);
compiler.run();
