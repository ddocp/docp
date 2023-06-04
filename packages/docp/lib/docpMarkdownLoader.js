"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const util_1 = __importDefault(require("util"));
const node_html_parser_1 = __importDefault(require("node-html-parser"));
const markdownParser_1 = __importDefault(require("./markdownParser"));
const Model_1 = require("./Model");
const utils_1 = require("./utils");
function default_1(source) {
    const filename = path_1.default.basename(this.resourcePath, '.md');
    if ((0, Model_1.isNavigation)(filename)) {
        return parseNavigation(filename, source);
    }
    const docpConfig = this._compiler.docpConfig;
    const { htmlString, resourceList } = (0, markdownParser_1.default)(source, docpConfig);
    const exeResourceList = [];
    const outputPath = this._compilation.outputOptions.path;
    resourceList.forEach((resource, index) => {
        // output resource to outputPath
        const exeResourcePath = path_1.default.resolve(outputPath, filename + '.' + index + '.js');
        exeResourceList.push(exeResourcePath);
        (0, utils_1.writeFileSync)(utils_1.multipleFS.virtualFS, exeResourcePath, resource);
    });
    return `
    window.$docp_content = \`${htmlString}\`
    window.$docp_func = function() {
      ${exeResourceList.map(path => `require("${path}")`)}
    }
  `;
}
exports.default = default_1;
/**
 * parse navigation elements like <a>
 * @param type
 * @param source
 * @returns
 */
function parseNavigation(type, source) {
    const { htmlString } = (0, markdownParser_1.default)(source);
    const html = (0, node_html_parser_1.default)(htmlString);
    const root = html.querySelector('ul'); // get first ul element as root element
    // @ts-ignore
    const navData = NavigationDOM2Array(root);
    // nav max depth is 4
    return `window.$docp${type} = ${util_1.default.inspect(navData, { depth: 4 })}`;
}
function NavigationDOM2Array(node) {
    /**
     *
     * nodeList struct：
     * ul
     *  li
     *    a or OTHER TAG
     *  li
     *    a
     *    ul
     *      li
     */
    var _a, _b;
    // 节点必须是Element
    if ((node === null || node === void 0 ? void 0 : node.nodeType) !== 1) {
        return null;
    }
    const nodeList = node.childNodes.filter(i => i.nodeType === 1);
    let result = [];
    let current = {};
    for (let i = 0; i < nodeList.length; i++) {
        if (nodeList[i].tagName === 'A') {
            // @ts-ignore
            current.href = (_a = nodeList[i].getAttribute('href')) === null || _a === void 0 ? void 0 : _a.replace('.md', '');
            // @ts-ignore
            current.value = nodeList[i].textContent;
        }
        else if (nodeList[i].tagName === 'UL') {
            // @ts-ignore
            current.children = NavigationDOM2Array(nodeList[i]);
        }
        else if (nodeList[i].tagName === 'LI') {
            // @ts-ignore
            result.push(NavigationDOM2Array(nodeList[i]));
        }
        else {
            const element = (0, node_html_parser_1.default)(nodeList[i]);
            // element a was wrapped by other tags
            const a = element.getElementsByTagName('a')[0];
            if (a) {
                // @ts-ignore
                current.href = (_b = a.getAttribute('href')) === null || _b === void 0 ? void 0 : _b.replace('.md', '');
                // @ts-ignore
                current.value = a.textContent;
            }
            else {
                // @ts-ignore
                current.value = nodeList[i].textContent;
            }
        }
    }
    // HACK 处理A+UL在同层级问题
    // @ts-ignore
    if (Object.keys(current).length > 0) {
        return current;
    }
    return result;
}
//# sourceMappingURL=docpMarkdownLoader.js.map