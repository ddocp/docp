const os = require('os')
const WebpackRunner = require('./WebpackRunner')
const { webappConfigFile } = require('./const')
const CreateWorkspace = require('./creator/CreateWorkspace')
const { isNavigation } = require('docp/lib/Model')

module.exports = class Main {

  docpConfig

  constructor(docpCompiler) {
    this.docpConfig = docpCompiler.docpConfig.toConfig()
    let isRunning = false
    docpCompiler.hooks.afterDone.tap('DocpCompiled', async (result) => {
      // run once
      if (isRunning) {
        return
      }
      isRunning = true
      const docpCompilation = result.compilation
      const { pageMode, ...userConfig } = this.getUserConfig()
      const workspace = new CreateWorkspace(this.docpConfig, userConfig)
      const docpAssetsPath = docpCompilation.outputOptions.path
      const docpAssets = docpCompilation.assets
      let webpackConfig = null
      if (pageMode === 'multiple') {
        webpackConfig = await workspace.buildMPAProject(docpAssetsPath, docpAssets)
      } else {
        webpackConfig = await workspace.buildSPAProject(docpAssetsPath, docpAssets)
      }
      const webappRunner = new WebpackRunner(webpackConfig, this.docpConfig)
      webappRunner.run(() => {
        this.afterWebappRunHandler(webappRunner.compiler)
      })
    })
  }

  getUserConfig() {
    try {
      return require(webappConfigFile)
    } catch {
      return {}
    }
  }

  afterWebappRunHandler(compiler) {
    const { watch, port, entry } = this.docpConfig
    if (watch !== true) {
      return
    }
    const { pageMode } = this.getUserConfig()
    const logger = compiler.getInfrastructureLogger('docp-webapp-logger');
    const websites = ['Pages at:']
    Object.keys(entry).forEach(i => {
      if (isNavigation(i)) {
        return;
      }
      const host = 'http://127.0.0.1:' + port + '/'
      const path = pageMode === 'multiple' ? (i + '.html') : ('#/' + i)
      websites.push(host + path)
    })
    console.log('')
    logger.info(websites.join(os.EOL));
  }
}
