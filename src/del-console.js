module.exports = function (source) {
    // 使用正则表达式替换 console 语句
    const result = source.replace(/console\.log\([^)]*\);?\s*/g, '');
    return result;
};
  