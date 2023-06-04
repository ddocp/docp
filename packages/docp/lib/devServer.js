"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const webpack_1 = __importDefault(require("webpack"));
const webpack_dev_server_1 = __importDefault(require("webpack-dev-server"));
class DevServer {
    constructor(docpConfig, devServerConfig) {
        const { inputFileSystem, outputFileSystem, output, port = 8080 } = docpConfig.toConfig();
        const onBeforeSetupMiddleware = ({ app }) => {
            app.get('/static/*', (req, res) => {
                const url = req.url;
                try {
                    // decode URL path
                    const filename = decodeURIComponent(path_1.default.basename(url));
                    const file = path_1.default.resolve(output.path, filename);
                    const stream = inputFileSystem.createReadStream(file);
                    stream.pipe(res);
                }
                catch (_err) {
                    res.status(404).send('URL not found: ' + req.url);
                }
            });
        };
        const devServerOptions = Object.assign(Object.assign({}, devServerConfig.devServer), { onBeforeSetupMiddleware, port });
        // override webapp output path
        devServerConfig.output.path = output.path;
        const compiler = (0, webpack_1.default)(devServerConfig);
        if (inputFileSystem) {
            compiler.inputFileSystem = inputFileSystem;
        }
        if (outputFileSystem) {
            compiler.outputFileSystem = outputFileSystem;
        }
        const server = new webpack_dev_server_1.default(devServerOptions, compiler);
        console.log('Starting server...');
        server.startCallback(() => {
            console.log(`Successfully started server on http://localhost:${port}`);
        });
    }
}
exports.default = DevServer;
//# sourceMappingURL=DevServer.js.map