import path from 'path'
import glob from 'glob'
import { merge } from 'webpack-merge'
import { Configuration, EntryObject } from 'webpack/types'
import type { IDocpConfig } from 'global/types'

export function isNavigation(type) {
  const enum NavigationType {
    _sidebar = '_sidebar',
    _navbar = '_navbar'
  }
  return type === NavigationType._sidebar || type === NavigationType._navbar
}


const baseConfig = {
  target: ['web', 'es5'],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue', '.md'],
  },
  module: {
    rules: [{
      test: /\.(md)$/,
      loader: path.resolve(__dirname, './docpMarkdownLoader.js')
    }]
  },
  output: {
    chunkLoadingGlobal: 'webpackJsonp'
  },
  watchOptions: {
    aggregateTimeout: 200
  }
}

export default class Model implements IDocpConfig {

  port = 3000
  name: string | undefined = undefined
  markedOptions
  config

  constructor(userConfig: AnyObject, extraConfig: AnyObject = {}) {
    this.name = userConfig.name
    this.config = merge(baseConfig, this.formatUserConfig(userConfig), extraConfig)
  }

  toConfig(): Configuration {
    return this.config
  }

  toWebpackConfig(): Configuration {
    // @ts-ignore
    const { inputFileSystem, outputFileSystem, watch, port, markedOptions, name, config, webapp, ...webpackConfig } = this.toConfig()
    return webpackConfig
  }

  getWebapp() {
    return require((this.config as any).webapp)
  }

  private formatUserConfig(options): IDocpConfig {
    const result: IDocpConfig = { ...options }
    if (typeof options.entry !== 'string') {
      result.entry = './*.md'
    }
    const entry = this.docDir2Path(result.entry!)
    result.entry = this.namingEntry(entry)
    if (!options.output || typeof options.output === 'string') {
      result.output = {
        path: path.resolve(process.cwd(), options.output || './dist'),
        filename: '[name].js',
      }
    }
    if (typeof options.port !== 'number') {
      result.port = this.port
    }
    result.markedOptions = options.markedOptions || this.markedOptions
    result.webapp = options.webapp || '@docp/webapp'
    return result
  }

  private docDir2Path(entry: string): string[] {
    function parse(dir: string) {
      // /a/b/*.md
      if (glob.hasMagic(dir)) {
        return glob.sync(dir)
      }
      // /a/b/c.md
      if (path.extname(dir) !== '') {
        return dir
      } else {
        // /a/b
        return glob.sync(path.join(dir, '*.md'))
      }
    }
    // glob pattens
    return parse(entry)
  }

  private namingEntry(entry: string[] | string) {
    const result: EntryObject = {}
    if (typeof entry === 'string') {
      entry = [entry]
    }
    entry.forEach(i => {
      // entry name not support dot, 'name.test.md' -> 'name_test.md'
      // FIXME Conflict with name_test.md
      const filename = path.basename(i, '.md').split('.').join('_')
      result[filename] = i
    })
    return result
  }
}
