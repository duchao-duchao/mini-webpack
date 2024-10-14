const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const babel = require('@babel/core');

class Webpack {
  constructor(options) {
    this.entry = options.entry;          // 入口文件
    this.output = options.output;        // 输出配置
    this.plugins = options.plugins || []; // 插件
    this.loaders = options.module?.rules || []; // 加载器
    this.cache = {};                     // 模块缓存

    // 初始化插件
    this.initPlugins();
  }

  // 初始化插件
  initPlugins() {
    this.plugins.forEach(plugin => {
      if (typeof plugin.apply === 'function') {
        plugin.apply(this);
      }
    });
  }

  // 读取并解析文件
  readModule(filename) {
    const relativeFilename = './' + path.relative(process.cwd(), filename);

    if (this.cache[relativeFilename]) {
      return this.cache[relativeFilename];
    }

    let content = fs.readFileSync(filename, 'utf-8');

    // 应用 loaders
    for (const loader of this.loaders) {
      if (loader.test.test(filename)) {
        const loaderFn = require(loader.use);
        content = loaderFn(content);
      }
    }

    const ast = parser.parse(content, {
      sourceType: 'module',
    });

    const dependencies = [];

    // 遍历 AST 获取模块依赖
    traverse(ast, {
      ImportDeclaration({ node }) {
        dependencies.push(node.source.value);
      },
    });

    // 使用 Babel 转换代码
    const { code } = babel.transformFromAstSync(ast, null, {
      presets: ['@babel/preset-env'],
    });

    const moduleInfo = {
      filename: relativeFilename,  // 使用相对路径作为 filename
      dependencies,
      code,
    };

    // 缓存模块
    this.cache[relativeFilename] = moduleInfo;

    return moduleInfo;
  }

  // 构建依赖图
  buildDependencyGraph(entry) {
    const entryPath = path.resolve(entry);
    const entryModule = this.readModule(entryPath);
    const graph = [entryModule];

    for (const module of graph) {
      module.mapping = {};
      const dirname = path.dirname(module.filename);

      module.dependencies.forEach((relativePath) => {
        // 获取依赖模块的绝对路径
        const absolutePath = path.resolve(path.dirname(entryPath), dirname, relativePath);
        // 解析为相对于项目根目录的相对路径
        const childModule = this.readModule(absolutePath);
        const relativeChildPath = './' + path.relative(process.cwd(), absolutePath);

        module.mapping[relativePath] = relativeChildPath;

        graph.push(childModule);
      });
    }

    return graph;
  }

  // 打包
  bundle() {
    const graph = this.buildDependencyGraph(this.entry);

    const modules = graph.map(module => {
      return `
        '${module.filename}': function (require, module, exports) {
          ${module.code}
        }
      `;
    }).join(',');

    // 生成最终的打包文件
    const result = `
      (function(modules) {
        const cache = {};
        
        function require(filename) {
          if (cache[filename]) {
            return cache[filename].exports;
          }

          const module = cache[filename] = {
            exports: {}
          };

          modules[filename](require, module, module.exports);

          return module.exports;
        }

        require('./${path.relative(process.cwd(), this.entry)}');
      })({${modules}});
    `;

    // 输出到指定的文件
    fs.writeFileSync(path.resolve(this.output.path), result, 'utf-8');
  }

  // 运行打包过程
  run() {
    this.bundle();
  }
}

module.exports = Webpack;
