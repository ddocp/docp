"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const webpack_1 = require("webpack");
const lodash_debounce_1 = __importDefault(require("lodash.debounce"));
const EntryDependency_1 = __importDefault(require("webpack/lib/dependencies/EntryDependency"));
class WebpackBuild {
    constructor(config) {
        const { inputFileSystem, outputFileSystem } = config.toConfig();
        this.buildConfig = config.toWebpackConfig();
        this.compiler = (0, webpack_1.webpack)(this.buildConfig);
        // @ts-ignore
        this.compiler.docpConfig = config;
        this.compiler.inputFileSystem = inputFileSystem;
        this.compiler.outputFileSystem = outputFileSystem;
    }
    runWatch(callback) {
        var _a;
        // watch rootPath
        this.watchEntryChange((type) => {
            if (type === 'rename') {
                (0, lodash_debounce_1.default)(function () {
                    // debounce 1s
                    watching.invalidate();
                }, 1000)();
            }
            else {
                watching.invalidate();
            }
        });
        const watching = this.compiler.watch({
            ignored: (_a = this.buildConfig.output) === null || _a === void 0 ? void 0 : _a.path
        }, callback);
        return watching;
    }
    run(callback) {
        this.compiler.run(callback);
        return this.compiler;
    }
    watchEntryChange(afterChangeHandler) {
        const addedEntryList = [];
        const removedEntryList = [];
        // add extra entry
        const options = this.compiler.options;
        const rootPath = options.context || process.cwd();
        this.compiler.hooks.make.tapAsync('AddEntry', (compilation, callback) => {
            if (addedEntryList.length === 0 && removedEntryList.length === 0) {
                return callback();
            }
            addedEntryList.forEach(entry => {
                const entryName = path_1.default.parse(entry).name;
                // ignore existed entries, why _sidebar always in addedEntryList?
                if (compilation.entries.get(entryName)) {
                    return callback();
                }
                const dep = WebpackBuild.createDependency(entry, options);
                compilation.addEntry(rootPath, dep, entryName, err => {
                    callback(err);
                });
            });
            removedEntryList.forEach(entry => {
                const entryName = path_1.default.parse(entry).name;
                compilation.entries.delete(entryName);
                callback();
            });
        });
        fs_1.default.watch(rootPath, { recursive: true }, (eventType, filename) => {
            if (filename === null || path_1.default.extname(filename) !== '.md') {
                return;
            }
            if (eventType !== 'rename') {
                afterChangeHandler(eventType);
                return;
            }
            const file = path_1.default.resolve(rootPath, filename);
            const removeFlag = removedEntryList.indexOf(filename);
            const addFlag = addedEntryList.indexOf(filename);
            if (fs_1.default.existsSync(file)) {
                // remove delete flag if exists
                if (removeFlag > -1) {
                    removedEntryList.splice(removeFlag, 1);
                }
                if (addFlag === -1) {
                    addedEntryList.push(filename);
                }
            }
            else {
                // remove
                if (removeFlag === -1) {
                    removedEntryList.push(filename);
                }
                if (addFlag > -1) {
                    addedEntryList.splice(addFlag, 1);
                }
            }
            afterChangeHandler(eventType);
        });
    }
    static createDependency(entry, options) {
        const dep = new EntryDependency_1.default(entry);
        dep.loc = { name: typeof options === "object" ? options.name : options };
        return dep;
    }
}
exports.default = WebpackBuild;
//# sourceMappingURL=WebpackBuilder.js.map