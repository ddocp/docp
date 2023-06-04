import { IDocpConfig } from 'global/types'
import { marked, Renderer } from 'marked'
import { customAlphabet } from 'nanoid'
import minimist from 'minimist'
import { log } from './utils'

const codeRenderer = (docpConfig, callback: (resource: string) => void) => {
  const renderer = new Renderer()
  const originalRendererCode = renderer.code.bind(renderer)
  const originalRendererImage = renderer.image.bind(renderer)
  // override code renderer
  renderer.code = (code, infoString, escaped) => {
    const args = code.match(/^\/\/\s*.*/)?.[0]?.split(' ')
    const playable = args?.find(i => i === 'play')
    const plugins = args?.find(i => i.startsWith('--plugins'))

    let sourceCode = ''
    if (plugins) {
      sourceCode = applyCodePlugins(args, code, docpConfig)
    }
    if (playable) {
      sourceCode = sourceCode || code
    }
    if (sourceCode) {
      const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 10)
      const containerId = nanoid(5)
      /**
       * include like:
       * var e = $CONTAINER_ID   (whitespace、EOF)
       * console.log($CONTAINER_ID)
       * exclude like:
       * $CONTAINER_ID_OTHER
       * $CONTAINER_ID2
       */
      const reg = /\$CONTAINER_ID(?=\W)/g
      sourceCode = sourceCode.replace(reg, `'${containerId}'`)
      callback(sourceCode)
      return `<div id="${containerId}" class="docp_playground"></div>`
    }
    if (!infoString) {
      infoString = 'javascript'
    }
    // support prismjs line-numbers plugin
    return originalRendererCode(code, infoString, escaped).replaceAll('<pre>', '<pre class="line-numbers">')
  }

  renderer.image = (href, title, text) => {
    const img = originalRendererImage(href, title, text)
    // insert onload hook
    const tokens = img.split(' ')
    let extraAttr = 'class="loaded"'
    if (tokens.find(i => i.indexOf('onload') === -1)) {
      extraAttr = 'onload="this.classList.add(\'loaded\');"'
    }
    const last = tokens.pop()
    tokens.push(extraAttr)
    tokens.push(last)
    return tokens.join(' ')
  }
  return renderer
}

export default function (source: string, docpConfig: IDocpConfig = {} as IDocpConfig) {
  const resourceList: string[] = []
  // TODO renderer 可定制
  const markedOptions = {
    breaks: true,
    gfm: true,
    ...docpConfig.markedOptions,
    renderer: codeRenderer(docpConfig, resource => {
      resourceList.push(resource)
    })
  }
  marked.use(markedOptions)
  // Encode characters such as "`", "$"
  const htmlString = marked.parse(source)
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$')
  return { htmlString, resourceList }
}

function applyCodePlugins(args, sourceCode, docpConfig) {
  const { plugins } = minimist(args)
  const pluginList = plugins.split(',') || []
  let _sourceCode = sourceCode
  for (let i = 0; i < pluginList.length; i++) {
    try {
      // TODO 写死测试
      const plugin = require('@docp/tab-code')
      _sourceCode = plugin(_sourceCode, docpConfig)
    } catch (e) {
      log.warn(`${pluginList[i]} not exist`)
    }
  }
  return _sourceCode
}
