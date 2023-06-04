
import beautify from 'js-beautify'

export default function (config) {
  const { entry, output } = config
  const tpl = `
    const path = require('path')
    module.exports = {
      entry: '${entry}',
      output: path.resolve(__dirname, '${output}'),
      port: 3000
    }
  `
  return beautify(tpl, { indent_size: 2, space_in_empty_paren: true })
}
