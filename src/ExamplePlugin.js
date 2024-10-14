class ExamplePlugin {
    apply(compiler) {
      compiler.hooks = compiler.hooks || {};
      compiler.hooks.done = () => {
        console.log('Webpack build is done!');
      };
    }
}  
module.exports = ExamplePlugin;
  