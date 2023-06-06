const fse = require('fs-extra')
const CopyPlugin = require("copy-webpack-plugin")
const { merge } = require('webpack-merge')
const TerserPlugin = require('terser-webpack-plugin')
const { templatePath, htmlPluginPath, rootPath, virtualPath } = require("../const")
const CreateMPA = require('./CreateMPA')
const CreateSPA = require('./CreateSPA')

module.exports = class CreateWorkspace {

  docpConfig
  userConfig

  constructor(docpConfig, userConfig) {
    this.docpConfig = docpConfig
    this.userConfig = userConfig
  }

  async buildSPAProject(docpAssetsPath, docpAssets) {
    await fse.copy(templatePath, virtualPath)
    const app = new CreateSPA(this.docpConfig, docpAssetsPath, docpAssets)
    await app.generateApp()
    await app.generateIndex()
    const htmlPlugins = app.getHTMLPluginConfig()
    return this.toSPAConfig(htmlPlugins)
  }

  async buildMPAProject(docpAssetsPath, docpAssets) {
    await fse.copy(templatePath, virtualPath)
    const app = new CreateMPA(this.docpConfig, docpAssetsPath, docpAssets)
    await app.generateApp()
    await app.generateIndexList()
    const entryConfig = app.getEntryConfig()
    const htmlPlugins = app.getHTMLPluginConfig()
    return this.toMPAConfig(entryConfig, htmlPlugins)
  }

  toSPAConfig(htmlPlugins) {
    const entry = virtualPath + '/index.js'
    const defaultConfig = this.getDefaultConfig(entry, htmlPlugins)
    return merge(defaultConfig, this.userConfig)
  }

  toMPAConfig(entry, htmlPlugins) {
    const defaultConfig = this.getDefaultConfig(entry, htmlPlugins)
    return merge(defaultConfig, this.userConfig)
  }

  // private
  getDefaultConfig(entry, htmlPlugins) {
    const { output, watch, mode } = this.docpConfig
    return {
      entry,
      output: output,
      context: rootPath,
      module: {
        rules: [
          {
            test: /\.(js)$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                cwd: rootPath,
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
                        content: [
                          virtualPath + '/**/*.{html,js}',
                          virtualPath + '/*.{html,js}',
                        ],
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
        ...htmlPlugins,
        new CopyPlugin({
          patterns: [{ from: htmlPluginPath, to: output.path, globOptions: { ignore: [htmlPluginPath + '/*.html'] } }],
        }),
      ],
      mode: mode,
      optimization: {
        minimize: mode === 'production',
        minimizer: mode === 'production' ? [new TerserPlugin({
          terserOptions: {
            format: {
              comments: false,
            },
          },
          extractComments: false,
        })] : [],
      },
      watch: watch,
      // hide logs such as "Project is running at https://.../", override by real route
      // hide webpack-dev-server logs on webpack5. https://webpack.js.org/configuration/other-options/#level
      // infrastructureLogging: {
      //   level: 'error',
      // },
      devServer: {
        static: [{
          directory: htmlPluginPath,
          publicPath: '/'
        }],
        client: {
          overlay: false,
          // browser client logging setting
          // logging: 'none'
        }
      }
    }
  }

}
