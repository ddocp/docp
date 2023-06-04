import fs from 'fs/promises'
import path from 'path'
import inquirer from 'inquirer'
import WebpackBuild from './WebpackBuilder'
import { log, multipleFS } from './utils'
import Model from './Model'
import getDefaultConfig from './template/configuration'
import { input, output, override } from './template/inquires'
import { IDocpConfig } from 'global/types'

export default class Service {

  public async init() {
    const docpConfigPath = path.resolve(process.cwd(), 'docp.config.js')
    const stat = await fs.stat(docpConfigPath)
    const prompts = [input, output]
    if (stat.isFile()) {
      prompts.unshift(override)
    }
    const answer = await inquirer.prompt(prompts)
    if (!answer.override) {
      process.exit(0)
    }
    await fs.writeFile(docpConfigPath, getDefaultConfig(answer))
    log.success('[success] docp.config.js created!')
  }

  public async serve(options: any) {
    const config = this.getDocpConfig(options, 'serve')
    const build = new WebpackBuild(config)
    const watching = build.runWatch((err: { toString: () => any }, stats: { hasErrors: () => any; toString: () => string }) => {
      if (err || stats.hasErrors()) {
        log.error(err?.toString() || stats.toString())
        return
      }
      log.info(stats.toString())
    })
    const Webapp = config.getWebapp()
    new Webapp(watching.compiler)
  }

  public build(options: any) {
    const config = this.getDocpConfig(options, 'build')
    const build = new WebpackBuild(config)
    const compiler = build.run((err: { toString: () => any }, stats: { hasErrors: () => any; toString: () => string }) => {
      if (err || stats.hasErrors()) {
        log.error(err?.toString() || stats.toString())
        return
      }
      log.info(stats.toString())
    })
    const Webapp = config.getWebapp()
    new Webapp(compiler)
  }

  private getDocpConfig(options: { config?: any }, mode: string) {
    const { virtualFS, mixedFS, realFS } = multipleFS
    let userConfig = {}
    try {
      userConfig = require(options.config)
    } catch (_err) {
      userConfig = options
    }
    const config: IDocpConfig = new Model(userConfig, {
      mode: mode === 'serve' ? 'development' : 'production',
      watch: mode === 'serve',
      inputFileSystem: mixedFS,
      outputFileSystem: mode === 'serve' ? virtualFS : realFS
    })
    return config
  }

}
