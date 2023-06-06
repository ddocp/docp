const os = require('os')
const path = require('path')
const fsp = require('fs/promises')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { isNavigation } = require('docp/lib/model')
const { htmlPluginPath, virtualPath } = require("../const")

module.exports = class CreateMPA {

  docpConfig
  docpAssetsPath
  docpAssets

  constructor(docpConfig, docpAssetsPath, docpAssets) {
    this.docpConfig = docpConfig
    this.docpAssetsPath = docpAssetsPath
    this.docpAssets = docpAssets
  }

  async generateApp() {
    const tpl = `
      import { APP_MPA } from './APP_Generator'
      export default APP_MPA
    `
    await fsp.writeFile(path.join(virtualPath, 'App.js'), tpl)
  }

  async generateIndexList() {
    const navList = Object.keys(this.docpAssets).filter(key => key.startsWith('_navbar') || key.startsWith('_sidebar'))
    const importNavString = navList.length > 0 ? navList.map(key => `import '${path.resolve(this.docpAssetsPath, key)}'`).join(os.EOL) : ''
    for (let i in this.docpAssets) {
      const assetName = i.split('.')[0]
      if (isNavigation(assetName)) {
        continue
      }
      const entryString = this.getEntryString(`import '${path.resolve(this.docpAssetsPath, i)}'`, importNavString)
      await fsp.writeFile(path.join(virtualPath, assetName + '.js'), entryString)
    }
  }

  getEntryConfig() {
    const entry = {}
    for (let i in this.docpAssets) {
      const assetName = i.split('.')[0]
      if (isNavigation(assetName)) {
        continue
      }
      const outputPath = path.join(virtualPath, assetName + '.js')
      entry[assetName] = outputPath
    }
    return entry
  }

  getHTMLPluginConfig() {
    const htmlPlugins = []
    for (let i in this.docpAssets) {
      const assetName = i.split('.')[0]
      if (isNavigation(assetName)) {
        continue
      }
      htmlPlugins.push(new HtmlWebpackPlugin({
        inject: true,
        template: htmlPluginPath + '/index.html',
        publicPath: './',
        chunks: [assetName],
        filename: `${assetName}.html`,
        name: this.docpConfig.name
      }))
    }
    return htmlPlugins
  }

  getEntryString(dependedBundleString, dependedNavString) {
    return `
    import React from 'react'
    import ReactDOM from 'react-dom/client'
    import { RouterProvider, createHashRouter } from 'react-router-dom'
    import App from './App'
    // import sidebar&navbar
    ${dependedNavString}
    // import specified bundle
    ${dependedBundleString}
    import './index.css'

    const root = ReactDOM.createRoot(document.getElementById('root'))
    const config = [{
      path: '/',
      element: <App title='${this.docpConfig.name}' />
    }]
    const router = createHashRouter(config)
    root.render(
      <React.StrictMode>
        <RouterProvider router={router} />
      </React.StrictMode>
    )
    `
  }

}
