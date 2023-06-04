"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const html_webpack_plugin_1 = __importDefault(require("html-webpack-plugin"));
exports.default = {
    entry: './src/index.js',
    output: {
        filename: 'main.js'
    },
    mode: 'development',
    context: path_1.default.resolve(__dirname),
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cwd: __dirname,
                        presets: [
                            ['@babel/preset-env'],
                            ['@babel/preset-react']
                        ]
                    }
                },
            },
            {
                test: /\.css$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    ['postcss-preset-env', {}],
                                    ['tailwindcss', {
                                            content: [path_1.default.resolve(__dirname, './src/**/*.{html,js}')],
                                            theme: {
                                                extend: {},
                                            },
                                            corePlugins: {
                                                preflight: false,
                                            },
                                            plugins: [require('daisyui')],
                                        }],
                                    ['autoprefixer', {}]
                                ]
                            },
                        },
                    }
                ],
            },
        ],
    },
    resolve: {
        extensions: ['*', '.js'],
    },
    plugins: [
        new html_webpack_plugin_1.default({
            template: path_1.default.resolve(__dirname, 'public', 'index.html'),
            publicPath: './',
        })
    ],
    devServer: {
        static: [{
                directory: path_1.default.join(__dirname, 'public'),
                publicPath: '/'
            }],
        client: {
            overlay: false,
        }
    }
};
//# sourceMappingURL=webpack-dev-server.config.js.map