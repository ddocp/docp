# Docp

`Docp`用于将markdown文件转换成网页。并且，`Docp`还能够执行markdown中的代码。

### 安装

```shell
npm i docp -g
```

### 使用

`Docp`会扫描当前目录下的md文件，执行`docp serve`，即可在本地启动一个服务器，用于预览生成的网页。

```shell
docp serve
```

执行`docp build`，用于将网页输出到指定目录。你可以在合适的地方部署它们。

```shell
docp build
```

**参数：**

| 参数     | 用途                               | 默认值                     |
| -------- | ---------------------------------- | -------------------------- |
| --entry  | 指定markdown所在目录               | 当前目录                   |
| --output | 指定build时的产物输出目录          | 当前目录下dist             |
| --port   | 指定server时本地服务器使用的端口号 | 3000                       |
| --config | 指定docp的配置文件                 | 当前目录下的docp.config.js |

### 使用配置文件

`Docp`的配置文件是` docp.config.js`。配置文件可以简化调用，实现高级特性。后续会有专门的文章进行介绍。

### 可执行代码

默认情况下，`Docp`可以执行markdown代码块中的Javascript代码，只需在代码块顶部加入`// play`标识。

```javascript
// play
// 打开控制台，可以看到输出了Hello World
console.log("hello world");
```

**绘制UI**

`Docp`内置了一个宏：`$CONTAINER_ID`。便于用户获取对应的DOM元素并做UI绘制。

```javascript
// play
var container = document.querySelector('#' + $CONTAINER_ID) // 获取画布
var btn = document.createElement('button')
btn.innerText = 'click me'
btn.style = 'border: 1px solid red; padding: 4px;'
btn.addEventListener('click', () => {
  alert('hello world')
})
container.appendChild(btn) // 通过将btn加入DOM，实现按钮的动态创建
```

**使用React/Vue**

理论上任何被编译成Javascript的应用框架都可以使用，不过你需要做一些配置。后续会有专门的文章进行介绍。
