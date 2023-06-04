"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const inquirer_1 = __importDefault(require("inquirer"));
const WebpackBuilder_1 = __importDefault(require("./WebpackBuilder"));
const utils_1 = require("./utils");
const Model_1 = __importDefault(require("./Model"));
const configuration_1 = __importDefault(require("./template/configuration"));
const inquires_1 = require("./template/inquires");
class Service {
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const docpConfigPath = path_1.default.resolve(process.cwd(), 'docp.config.js');
            const stat = yield promises_1.default.stat(docpConfigPath);
            const prompts = [inquires_1.input, inquires_1.output];
            if (stat.isFile()) {
                prompts.unshift(inquires_1.override);
            }
            const answer = yield inquirer_1.default.prompt(prompts);
            if (!answer.override) {
                process.exit(0);
            }
            yield promises_1.default.writeFile(docpConfigPath, (0, configuration_1.default)(answer));
            utils_1.log.success('[success] docp.config.js created!');
        });
    }
    serve(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = this.getDocpConfig(options, 'serve');
            const build = new WebpackBuilder_1.default(config);
            const watching = build.runWatch((err, stats) => {
                if (err || stats.hasErrors()) {
                    utils_1.log.error((err === null || err === void 0 ? void 0 : err.toString()) || stats.toString());
                    return;
                }
                utils_1.log.info(stats.toString());
            });
            const Webapp = config.getWebapp();
            new Webapp(watching.compiler);
        });
    }
    build(options) {
        const config = this.getDocpConfig(options, 'build');
        const build = new WebpackBuilder_1.default(config);
        const compiler = build.run((err, stats) => {
            if (err || stats.hasErrors()) {
                utils_1.log.error((err === null || err === void 0 ? void 0 : err.toString()) || stats.toString());
                return;
            }
            utils_1.log.info(stats.toString());
        });
        const Webapp = config.getWebapp();
        new Webapp(compiler);
    }
    getDocpConfig(options, mode) {
        const { virtualFS, mixedFS, realFS } = utils_1.multipleFS;
        let userConfig = {};
        try {
            userConfig = require(options.config);
        }
        catch (_err) {
            userConfig = options;
        }
        const config = new Model_1.default(userConfig, {
            mode: mode === 'serve' ? 'development' : 'production',
            watch: mode === 'serve',
            inputFileSystem: mixedFS,
            outputFileSystem: mode === 'serve' ? virtualFS : realFS
        });
        return config;
    }
}
exports.default = Service;
//# sourceMappingURL=Service.js.map