const WebpackRunner = require('./WebpackRunner')
const { webappConfigFile } = require('./const')
const CreateWorkspace = require('./creator/CreateWorkspace')

module.exports = class Main {
  constructor(docpCompiler) {
    const docpConfig = docpCompiler.docpConfig.toConfig()
    let isRunning = false
    docpCompiler.hooks.done.tap('DocpCompiled', async ({ compilation }) => {
      // run once
      if (isRunning) {
        return
      }
      isRunning = true
      const { pageMode, ...userConfig } = this.getUserConfig()
      const workspace = new CreateWorkspace(docpConfig, userConfig)
      const docpAssetsPath = compilation.outputOptions.path
      const docpAssets = compilation.assets
      let webpackConfig = null
      if (pageMode === 'multiple') {
        webpackConfig = await workspace.buildMPAProject(docpAssetsPath, docpAssets)
      } else {
        webpackConfig = await workspace.buildSPAProject(docpAssetsPath, docpAssets)
      }
      const runner = new WebpackRunner(webpackConfig, docpConfig)
      runner.run(() => { })
    })
  }

  getUserConfig() {
    try {
      return require(webappConfigFile)
    } catch {
      return {}
    }
  }
}
