const path = require('path')
const process = require('process')

module.exports = {
  rootPath: path.resolve(__dirname, '../'),
  virtualPath: path.resolve(__dirname, '../.src'),
  htmlPluginPath: path.resolve(__dirname, '../public'),
  webappConfigFile: path.resolve(process.cwd(), 'webapp.config.js'),
  templatePath: path.resolve(__dirname, './template'),
}
