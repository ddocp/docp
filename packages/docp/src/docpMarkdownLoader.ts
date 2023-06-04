import path from 'path'
import util from 'util'
import parser from 'node-html-parser'
import markdownParser from './markdownParser'
import { isNavigation } from './Model'
import { writeFileSync, multipleFS } from './utils'

export default function (source) {
  const filename = path.basename(this.resourcePath, '.md')
  if (isNavigation(filename)) {
    return parseNavigation(filename, source)
  }
  const docpConfig = this._compiler.docpConfig
  const { htmlString, resourceList } = markdownParser(source, docpConfig)
  const exeResourceList: string[] = []
  const outputPath = this._compilation.outputOptions.path
  resourceList.forEach((resource, index) => {
    // output resource to outputPath
    const exeResourcePath = path.resolve(outputPath, filename + '.' + index + '.js')
    exeResourceList.push(exeResourcePath)
    writeFileSync(multipleFS.virtualFS, exeResourcePath, resource)
  })
  return `
    window.$docp_content = \`${htmlString}\`
    window.$docp_func = function() {
      ${exeResourceList.map(path => `require("${path}")`)}
    }
  `
}

/**
 * parse navigation elements like <a>
 * @param type
 * @param source
 * @returns
 */
function parseNavigation(type: string, source) {
  const { htmlString } = markdownParser(source)
  const html = parser(htmlString)
  const root = html.querySelector('ul') // get first ul element as root element
  // @ts-ignore
  const navData = NavigationDOM2Array(root)
  // nav max depth is 4
  return `window.$docp${type} = ${util.inspect(navData, { depth: 4 })}`
}


function NavigationDOM2Array(node) {
  /**
   *
   * nodeList struct：
   * ul
   *  li
   *    a or OTHER TAG
   *  li
   *    a
   *    ul
   *      li
   */

  // 节点必须是Element
  if (node?.nodeType !== 1) {
    return null;
  }

  const nodeList = node.childNodes.filter(i => i.nodeType === 1)

  let result: any[] = []
  let current = {}
  for (let i = 0; i < nodeList.length; i++) {
    if (nodeList[i].tagName === 'A') {
      // @ts-ignore
      current.href = nodeList[i].getAttribute('href')?.replace('.md', '')
      // @ts-ignore
      current.value = nodeList[i].textContent
    } else if (nodeList[i].tagName === 'UL') {
      // @ts-ignore
      current.children = NavigationDOM2Array(nodeList[i])
    } else if (nodeList[i].tagName === 'LI') {
      // @ts-ignore
      result.push(NavigationDOM2Array(nodeList[i]))
    } else {
      const element = parser(nodeList[i])
      // element a was wrapped by other tags
      const a = element.getElementsByTagName('a')[0]
      if (a) {
        // @ts-ignore
        current.href = a.getAttribute('href')?.replace('.md', '')
        // @ts-ignore
        current.value = a.textContent
      } else {
        // @ts-ignore
        current.value = nodeList[i].textContent
      }
    }
  }
  // HACK 处理A+UL在同层级问题
  // @ts-ignore
  if (Object.keys(current).length > 0) {
    return current
  }
  return result
}
