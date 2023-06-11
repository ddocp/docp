"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNavigation = void 0;
const path_1 = __importDefault(require("path"));
const glob_1 = __importDefault(require("glob"));
const webpack_merge_1 = require("webpack-merge");
function isNavigation(type) {
    return type === "_sidebar" /* NavigationType._sidebar */ || type === "_navbar" /* NavigationType._navbar */;
}
exports.isNavigation = isNavigation;
const baseConfig = {
    target: ['web', 'es5'],
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue', '.md'],
    },
    module: {
        rules: [{
                test: /\.(md)$/,
                loader: path_1.default.resolve(__dirname, './docpMarkdownLoader.js')
            }]
    },
    output: {
        chunkLoadingGlobal: 'webpackJsonp'
    },
    watchOptions: {
        aggregateTimeout: 200
    }
};
class Model {
    constructor(userConfig, extraConfig = {}) {
        this.port = 3000;
        this.name = undefined;
        this.name = userConfig.name;
        this.config = (0, webpack_merge_1.merge)(baseConfig, this.formatUserConfig(userConfig), extraConfig);
    }
    toConfig() {
        return this.config;
    }
    toWebpackConfig() {
        // @ts-ignore
        const _a = this.toConfig(), { inputFileSystem, outputFileSystem, watch, port, markedOptions, name, config, webapp } = _a, webpackConfig = __rest(_a, ["inputFileSystem", "outputFileSystem", "watch", "port", "markedOptions", "name", "config", "webapp"]);
        return webpackConfig;
    }
    getWebapp() {
        return require(this.config.webapp);
    }
    formatUserConfig(options) {
        const result = Object.assign({}, options);
        if (typeof options.entry !== 'string') {
            result.entry = './*.md';
        }
        const entry = this.docDir2Path(result.entry);
        result.entry = this.namingEntry(entry);
        if (!options.output || typeof options.output === 'string') {
            result.output = {
                path: path_1.default.resolve(process.cwd(), options.output || './dist'),
                filename: '[name].js',
            };
        }
        if (typeof options.port !== 'number') {
            result.port = this.port;
        }
        result.markedOptions = options.markedOptions || this.markedOptions;
        result.webapp = options.webapp || '@docp/webapp';
        return result;
    }
    docDir2Path(entry) {
        function parse(dir) {
            // /a/b/*.md
            if (glob_1.default.hasMagic(dir)) {
                return glob_1.default.sync(dir);
            }
            // /a/b/c.md
            if (path_1.default.extname(dir) !== '') {
                return dir;
            }
            else {
                // /a/b
                return glob_1.default.sync(path_1.default.join(dir, '*.md'));
            }
        }
        // glob pattens
        return parse(entry);
    }
    namingEntry(entry) {
        const result = {};
        if (typeof entry === 'string') {
            entry = [entry];
        }
        entry.forEach(i => {
            // entry name not support dot, 'name.test.md' -> 'name_test.md'
            // FIXME Conflict with name_test.md
            const filename = path_1.default.basename(i, '.md').split('.').join('_');
            result[filename] = i;
        });
        return result;
    }
}
exports.default = Model;
//# sourceMappingURL=Model.js.map