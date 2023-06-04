"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.override = exports.output = exports.input = void 0;
const colors_1 = __importDefault(require("colors"));
exports.input = {
    type: 'input',
    name: 'entry',
    message: colors_1.default.white('entry point of documents:'),
    default: './*.md'
};
exports.output = {
    type: 'input',
    name: 'output',
    message: colors_1.default.white('output directory for compiled files:'),
    default: './dist'
};
exports.override = {
    type: 'confirm',
    name: 'override',
    message: colors_1.default.white('docp.config.js already exists, overwrite?'),
    default: 'N'
};
//# sourceMappingURL=inquires.js.map