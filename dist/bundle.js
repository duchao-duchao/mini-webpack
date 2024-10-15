
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

        require('./index.js');
      })({
        './index.js': function (require, module, exports) {
          "use strict";

var _base = _interopRequireDefault(require("./base.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
        }
      ,
        './base.js': function (require, module, exports) {
          "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var base = 'base';
var _default = exports["default"] = base;
        }
      });
    