# Docp

`Docp` is used to convert markdown files into web pages. Additionally, `Docp` is capable of executing code within the markdown file.

### Installation

```shell
npm i docp -g
```

### Usage

`Docp` will scan the current directory for markdown files. Execute `docp serve` to start a local server for previewing generated web pages.

```shell
docp serve
```

Execute `docp build` to output the web pages to a specified directory. You can deploy them in a suitable location.

```shell
docp build
```

**Options:**

| Option   | Description                                  | Default Value                           |
| -------- | -------------------------------------------- | --------------------------------------- |
| --entry  | Specify the directory of markdown            | Current directory                       |
| --output | Specify the output directory for build       | dist in the current directory           |
| --port   | Specify the port number for the local server | 3000                                    |
| --config | Specify the configuration file for Docp      | docp.config.js in the current directory |

### Using Configuration File

The configuration file for `Docp` is `docp.config.js`. The configuration file can simplify the call and achieve advanced features. There will be a dedicated article to introduce it later.

### Executable Code

By default, `Docp` can execute Javascript code in the code block of markdown, just add the `// play` tag at the top of the code block.

```javascript
// play
// Open the console and you can see "Hello World" is outputted.
console.log("hello world");
```

**Drawing UI**

`Docp` has a built-in macro: `$CONTAINER_ID`. It facilitates users to obtain the corresponding DOM element and draw UI.

```javascript
// play
var container = document.querySelector('#' + $CONTAINER_ID) // Get the canvas.
var btn = document.createElement('button')
btn.innerText = 'click me'
btn.style = 'border: 1px solid red; padding: 4px;'
btn.addEventListener('click', () => {
  alert('hello world')
})
container.appendChild(btn) // By adding btn to the DOM, the button can be dynamically created.
```

**Using React/Vue**

In theory, any application framework that can be compiled into Javascript can be used, but you need to do some configuration. There will be a dedicated article to introduce it later.
