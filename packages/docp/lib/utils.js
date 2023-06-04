"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multipleFS = exports.copyAcrossMultiFSSync = exports.writeFileSync = exports.isNpmPkg = exports.log = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const unionfs_1 = require("unionfs");
const memfs_1 = require("memfs");
const colors_1 = __importDefault(require("colors"));
function colorLog(level, ...args) {
    const type = {
        'info': colors_1.default.cyan,
        'success': colors_1.default.green,
        'warn': colors_1.default.yellow,
        'error': colors_1.default.red
    };
    const color = type[level];
    console.log(args.map(i => color(i)).join(' '));
}
exports.log = {
    info: (...args) => colorLog('info', ...args),
    success: (...args) => colorLog('success', ...args),
    warn: (...args) => colorLog('warn', ...args),
    error: (...args) => colorLog('error', ...args),
};
const isNpmPkg = name => !(/^(\.|\/)/.test(name));
exports.isNpmPkg = isNpmPkg;
const writeFileSync = (fs, filePath, content) => {
    const fileDir = path_1.default.dirname(filePath);
    if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
    }
    fs.writeFileSync(filePath, content);
};
exports.writeFileSync = writeFileSync;
const copyAcrossMultiFSSync = (inputFileSystem, outputFileSystem, src, dest) => {
    const copyFileSync = (inFile, outPath) => {
        const data = inputFileSystem.readFileSync(inFile);
        const filename = path_1.default.basename(inFile);
        const output = path_1.default.join(outPath, filename);
        (0, exports.writeFileSync)(outputFileSystem, output, data);
    };
    function listFile(src, dest) {
        const list = inputFileSystem.readdirSync(src);
        list.forEach(item => {
            const fullSrcPath = path_1.default.join(src, item);
            const stats = inputFileSystem.statSync(fullSrcPath);
            if (stats.isDirectory()) {
                const fullDestPath = path_1.default.join(dest, item);
                listFile(fullSrcPath, fullDestPath);
            }
            else {
                copyFileSync(fullSrcPath, dest);
            }
        });
    }
    listFile(src, dest);
};
exports.copyAcrossMultiFSSync = copyAcrossMultiFSSync;
exports.multipleFS = {
    realFS: fs_1.default,
    virtualFS: memfs_1.fs,
    // @ts-ignore
    mixedFS: unionfs_1.ufs.use(fs_1.default).use(memfs_1.fs)
};
//# sourceMappingURL=utils.js.map