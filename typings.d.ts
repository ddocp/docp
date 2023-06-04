declare interface AnyObject {
  [key: string]: any;
}

declare module "global/types" {
  import type fs from 'fs'
  import type { IFs } from 'memfs'
  import type { Configuration } from 'webpack'

  export type FileSystem = typeof fs | IFs

  interface Webapp {}

  export interface IDocpConfig {
    port?: number,
    entry?: string | EntryObject,
    output?: string | any
    markedOptions?: AnyObject
    webapp?: string
    outputFileSystem?: FileSystem
    inputFileSystem?: FileSystem
    mode?: 'development' | 'none' | 'production',
    module?: AnyObject
    toConfig: () => AnyObject
    toWebpackConfig: () => AnyObject
    getWebapp: () => Any
  }
}


