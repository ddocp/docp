"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const marked_1 = require("marked");
const nanoid_1 = require("nanoid");
const minimist_1 = __importDefault(require("minimist"));
const utils_1 = require("./utils");
const codeRenderer = (docpConfig, callback) => {
    const renderer = new marked_1.Renderer();
    const originalRendererCode = renderer.code.bind(renderer);
    const originalRendererImage = renderer.image.bind(renderer);
    // override code renderer
    renderer.code = (code, infoString, escaped) => {
        var _a, _b;
        const args = (_b = (_a = code.match(/^\/\/\s*.*/)) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.split(' ');
        const playable = args === null || args === void 0 ? void 0 : args.find(i => i === 'play');
        const plugins = args === null || args === void 0 ? void 0 : args.find(i => i.startsWith('--plugins'));
        let sourceCode = '';
        if (plugins) {
            sourceCode = applyCodePlugins(args, code, docpConfig);
        }
        if (playable) {
            sourceCode = sourceCode || code;
        }
        if (sourceCode) {
            const nanoid = (0, nanoid_1.customAlphabet)('abcdefghijklmnopqrstuvwxyz', 10);
            const containerId = nanoid(5);
            /**
             * include like:
             * var e = $CONTAINER_ID   (whitespace、EOF)
             * console.log($CONTAINER_ID)
             * exclude like:
             * $CONTAINER_ID_OTHER
             * $CONTAINER_ID2
             */
            const reg = /\$CONTAINER_ID(?=\W)/g;
            sourceCode = sourceCode.replace(reg, `'${containerId}'`);
            callback(sourceCode);
            return `<div id="${containerId}" class="docp_playground"></div>`;
        }
        if (!infoString) {
            infoString = 'javascript';
        }
        // support prismjs line-numbers plugin
        return originalRendererCode(code, infoString, escaped).replaceAll('<pre>', '<pre class="line-numbers">');
    };
    renderer.image = (href, title, text) => {
        const img = originalRendererImage(href, title, text);
        // insert onload hook
        const tokens = img.split(' ');
        let extraAttr = 'class="loaded"';
        if (tokens.find(i => i.indexOf('onload') === -1)) {
            extraAttr = 'onload="this.classList.add(\'loaded\');"';
        }
        const last = tokens.pop();
        tokens.push(extraAttr);
        tokens.push(last);
        return tokens.join(' ');
    };
    return renderer;
};
function default_1(source, docpConfig = {}) {
    const resourceList = [];
    // TODO renderer 可定制
    const markedOptions = Object.assign(Object.assign({ breaks: true, gfm: true }, docpConfig.markedOptions), { renderer: codeRenderer(docpConfig, resource => {
            resourceList.push(resource);
        }) });
    marked_1.marked.use(markedOptions);
    // Encode characters such as "`", "$"
    const htmlString = marked_1.marked.parse(source)
        .replace(/`/g, '\\`')
        .replace(/\$/g, '\\$');
    return { htmlString, resourceList };
}
exports.default = default_1;
function applyCodePlugins(args, sourceCode, docpConfig) {
    const { plugins } = (0, minimist_1.default)(args);
    const pluginList = plugins.split(',') || [];
    let _sourceCode = sourceCode;
    for (let i = 0; i < pluginList.length; i++) {
        try {
            // TODO 写死测试
            const plugin = require('@docp/tab-code');
            _sourceCode = plugin(_sourceCode, docpConfig);
        }
        catch (e) {
            utils_1.log.warn(`${pluginList[i]} not exist`);
        }
    }
    return _sourceCode;
}
//# sourceMappingURL=markdownParser.js.map