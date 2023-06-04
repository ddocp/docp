const OS = require('os')
const { marked } = require('marked')
const strip = require('strip-indent')
const style = require('./style')

module.exports = function Main(code, docpConfig) {

  const contentReg = /<TabItem[^>]*>([\s\S]*?)<\/TabItem>/g;
  const firstLineReg = /<TabItem.*$/m
  const nameReg = /name=(?:"|')([^"']*)(?:"|')/
  const infoStringReg = /infoString=(?:"|')([^"']*)(?:"|')/
  const matches = code.matchAll(contentReg);
  const tabItems = []
  for (const match of matches) {
    const original = match[0]
    const firstLine = original.match(firstLineReg)?.[0] || ''
    const infoString = firstLine.match(infoStringReg)?.[1] || 'javascript'
    const name = firstLine.match(nameReg)?.[1] || ''
    const content = match[1];
    tabItems.push({ name, infoString, content })
  }

  const tabBar = [`<div style='${style.tabBarStyle}'>`]
  const tabPane = [`<div class="tab_pane" style="${style.tabPane}">`]
  tabItems.forEach((item, index) => {
    const formatted = strip(item.content).replace(/^\s+/, '')
    const value = marked.parse('```' + item.infoString + OS.EOL + formatted + OS.EOL + '```')
    const itemStyle = index === 0 ? style.tabActiveStyle : style.tabItemStyle
    const contentStyle = index === 0 ? style.contentActiveStyle : style.contentStyle
    tabBar.push(`<div class='tab_item' style='${itemStyle}'>${item.name}</div>`)
    tabPane.push(`<div class='tab_content' style='${contentStyle}'>${value}</div>`)
  })
  tabBar.push('</div>')
  tabPane.push('</div>')

  return `
    var result = \`${tabBar.join(OS.EOL)} ${tabPane.join(OS.EOL)}\`
    var container = document.querySelector('#' + $CONTAINER_ID)
    if (container) {
      container.innerHTML = result
      container.addEventListener('click', function(e) {
        var tabs = container.querySelectorAll('.tab_item')
        var contents = container.querySelectorAll('.tab_content')
        var target = e.target
        if (!target.classList.contains('tab_item')) {
          return
        }
        for (var i=0; i<tabs.length; i++) {
          if (tabs[i] === target) {
            target.setAttribute('style', "${style.tabActiveStyle}")
            contents[i].setAttribute('style', "${style.contentActiveStyle}")
          } else {
            tabs[i].setAttribute('style', "${style.tabItemStyle}")
            contents[i].setAttribute('style', "${style.contentStyle}")
          }
        }
      })
    }
  `
}
