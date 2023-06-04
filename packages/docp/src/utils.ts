import path from 'path'
import fs from 'fs'
import { ufs } from 'unionfs'
import { fs as vfs } from 'memfs'
import colors from 'colors'
import type { FileSystem } from 'global/types'

function colorLog(level, ...args: string[]) {
  const type = {
    'info': colors.cyan,
    'success': colors.green,
    'warn': colors.yellow,
    'error': colors.red
  }
  const color = type[level]
  console.log(args.map(i => color(i)).join(' '))
}

export const log = {
  info: (...args: string[]): void => colorLog('info', ...args),
  success: (...args: string[]): void => colorLog('success', ...args),
  warn: (...args: string[]): void => colorLog('warn', ...args),
  error: (...args: string[]): void => colorLog('error', ...args),
}

export const isNpmPkg: (name: string) => boolean = name => !(/^(\.|\/)/.test(name))


export const writeFileSync = (fs: FileSystem, filePath: string, content: Buffer | string) => {
  const fileDir = path.dirname(filePath)
  if (!fs.existsSync(fileDir)) {
    fs.mkdirSync(fileDir, { recursive: true })
  }
  fs.writeFileSync(filePath, content)
}

export const copyAcrossMultiFSSync = (inputFileSystem: FileSystem, outputFileSystem: FileSystem, src: string, dest: string) => {
  const copyFileSync = (inFile: string, outPath) => {
    const data = inputFileSystem.readFileSync(inFile)
    const filename = path.basename(inFile)
    const output = path.join(outPath, filename)
    writeFileSync(outputFileSystem, output, data)
  }
  function listFile(src, dest) {
    const list = inputFileSystem.readdirSync(src)
    list.forEach(item => {
      const fullSrcPath = path.join(src, item)
      const stats = inputFileSystem.statSync(fullSrcPath)
      if (stats.isDirectory()) {
        const fullDestPath = path.join(dest, item)
        listFile(fullSrcPath, fullDestPath)
      } else {
        copyFileSync(fullSrcPath, dest)
      }
    });
  }
  listFile(src, dest)
}

export const multipleFS = {
  realFS: fs,
  virtualFS: vfs,
  // @ts-ignore
  mixedFS: ufs.use(fs).use(vfs)
}

