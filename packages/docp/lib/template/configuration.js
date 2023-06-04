"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const js_beautify_1 = __importDefault(require("js-beautify"));
function default_1(config) {
    const { entry, output } = config;
    const tpl = `
    const path = require('path')
    module.exports = {
      entry: '${entry}',
      output: path.resolve(__dirname, '${output}'),
      port: 3000
    }
  `;
    return (0, js_beautify_1.default)(tpl, { indent_size: 2, space_in_empty_paren: true });
}
exports.default = default_1;
//# sourceMappingURL=configuration.js.map