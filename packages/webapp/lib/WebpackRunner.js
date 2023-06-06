const path = require('path')
const os = require('os')
const webpack = require('webpack')
const DevServer = require('webpack-dev-server')

module.exports = class WebpackRunner {

  compiler
  devServerOptions

  constructor(webpackConfig, docpConfig) {
    const { inputFileSystem, outputFileSystem, output, port = 8080 } = docpConfig
    const onBeforeSetupMiddleware = ({ app }) => {
      app.get('/static/*', (req, res) => {
        const url = req.url
        try {
          // decode URL path
          const filename = decodeURIComponent(path.basename(url))
          const file = path.resolve(output.path, filename)
          const stream = inputFileSystem.createReadStream(file)
          stream.pipe(res);
        } catch (_err) {
          res.status(404).send('URL not found: ' + req.url)
        }
      })
    }
    this.devServerOptions = { ...webpackConfig.devServer, onBeforeSetupMiddleware, port }
    // override webapp output path
    this.compiler = webpack(webpackConfig)
    if (inputFileSystem) {
      this.compiler.inputFileSystem = inputFileSystem
    }
    if (outputFileSystem) {
      this.compiler.outputFileSystem = outputFileSystem
    }
    this.compiler.docpConfig = docpConfig
  }

  run(callback) {
    const { watch } = this.compiler.docpConfig
    if (watch === false) {
      this.compiler.run(callback)
    } else {
      const server = new DevServer(this.devServerOptions, this.compiler)
      server.startCallback(callback)
    }
  }

  // add watchEntryChange
}
