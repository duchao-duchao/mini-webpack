const path = require('path');
const ExamplePlugin = require('./ExamplePlugin.js');

module.exports = {
  entry: './index.js', // 入口文件
  output: {
    path: path.resolve(__dirname, '../dist/bundle.js'), // 输出文件路径
  },
  plugins: [
    new ExamplePlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: path.resolve(__dirname, './del-console.js'), // 自定义加载器
      },
    ],
  },
};
