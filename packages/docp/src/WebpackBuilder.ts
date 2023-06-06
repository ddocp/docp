import fs from 'fs'
import path from 'path'
import { Compiler, Watching, webpack } from 'webpack'
import debounce from 'lodash.debounce'
import EntryDependency from 'webpack/lib/dependencies/EntryDependency'
import { IDocpConfig } from 'global/types'

export default class WebpackBuild {

  private compiler: Compiler
  private buildConfig

  constructor(config: IDocpConfig) {
    const { inputFileSystem, outputFileSystem } = config.toConfig()
    this.buildConfig = config.toWebpackConfig()
    this.compiler = webpack(this.buildConfig)
    // @ts-ignore
    this.compiler.docpConfig = config
    this.compiler.inputFileSystem = inputFileSystem
    this.compiler.outputFileSystem = outputFileSystem
  }

  public runWatch(callback): Watching {
    // watch rootPath
    this.watchEntryChange((type) => {
      if (type === 'rename') {
        debounce(function () {
          // debounce 1s
          watching.invalidate()
        }, 1000)()
      } else {
        watching.invalidate()
      }
    })

    const watching = this.compiler.watch({
      ignored: this.buildConfig.output?.path
    }, callback)

    return watching
  }

  public run(callback): Compiler {
    this.compiler.run(callback)
    return this.compiler
  }

  private watchEntryChange(afterChangeHandler) {
    const addedEntryList: string[] = []
    const removedEntryList: string[] = []
    // add extra entry
    const options = this.compiler.options
    const rootPath = options.context || process.cwd()
    this.compiler.hooks.make.tapAsync('AddEntry', (compilation, callback) => {
      if (addedEntryList.length === 0 && removedEntryList.length === 0) {
        return callback()
      }
      addedEntryList.forEach(entry => {
        const entryName = path.parse(entry).name
        // ignore existed entries, why _sidebar always in addedEntryList?
        if (compilation.entries.get(entryName)) {
          return callback()
        }
        const dep = WebpackBuild.createDependency(entry, options)
        compilation.addEntry(rootPath, dep, entryName, err => {
          callback(err)
        })
      })
      removedEntryList.forEach(entry => {
        const entryName = path.parse(entry).name
        compilation.entries.delete(entryName)
        callback()
      })
    })
    fs.watch(rootPath, { recursive: true }, (eventType, filename) => {
      if (filename === null || path.extname(filename) !== '.md') {
        return
      }
      if (eventType !== 'rename') {
        afterChangeHandler(eventType)
        return
      }
      const file = path.resolve(rootPath, filename)
      const removeFlag = removedEntryList.indexOf(filename)
      const addFlag = addedEntryList.indexOf(filename)
      if (fs.existsSync(file)) {
        // remove delete flag if exists
        if (removeFlag > -1) {
          removedEntryList.splice(removeFlag, 1)
        }
        if (addFlag === -1) {
          addedEntryList.push(filename)
        }
      } else {
        // remove
        if (removeFlag === -1) {
          removedEntryList.push(filename)
        }
        if (addFlag > -1) {
          addedEntryList.splice(addFlag, 1)
        }
      }
      afterChangeHandler(eventType)
    })
  }

  private static createDependency(entry, options) {
    const dep = new EntryDependency(entry)
    dep.loc = { name: typeof options === "object" ? options.name : options }
    return dep
  }
}
