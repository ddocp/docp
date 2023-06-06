const os = require('os')
const path = require('path')
const fsp = require('fs/promises')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { isNavigation } = require('docp/lib/model')
const { htmlPluginPath, virtualPath } = require("../const")

module.exports = class CreateSPA {

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
      import { APP_SPA } from './APP_Generator'
      export default APP_SPA
    `
    await fsp.writeFile(path.join(virtualPath, 'App.js'), tpl)
  }

  async generateIndex() {
    const navList = Object.keys(this.docpAssets).filter(key => key.startsWith('_navbar') || key.startsWith('_sidebar'))
    const importNavString = navList.length > 0 ? navList.map(key => `import '${path.resolve(this.docpAssetsPath, key)}'`).join(os.EOL) : ''
    const tpl = `
    import React from 'react'
    import ReactDOM from 'react-dom/client'
    import { RouterProvider } from 'react-router-dom'
    import { createHashRouter } from 'react-router-dom'
    import App from './App'
    import './index.css'
    ${importNavString}

    const root = ReactDOM.createRoot(document.getElementById('root'))
    const config = ${this.getRouterString()}
    const router = createHashRouter(config)
    root.render(
      <React.StrictMode>
        <RouterProvider router={router} />
      </React.StrictMode>
    )
    `
    await fsp.writeFile(path.join(virtualPath, 'index.js'), tpl)
  }

  getRouterString() {
    const configSlot = []
    for (let i in this.docpAssets) {
      const filename = i.split('.')[0]
      if (isNavigation(filename)) {
        continue
      }
      // copy routerList to output path
      configSlot.push(`{
        path: '${filename}',
        element: <App src='/static/${i}' title=${this.docpConfig.name ? '\'' + this.docpConfig.name + '\'' : '{' + undefined + '}'} />
      }`)
    }
    return '[' + configSlot.join(',') + ']'
  }

  getHTMLPluginConfig() {
    return [new HtmlWebpackPlugin({
      template: htmlPluginPath + '/index.html',
      publicPath: './',
      name: this.docpConfig.name
    })]
  }

}
