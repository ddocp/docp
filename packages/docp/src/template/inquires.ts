import colors from 'colors'

export const input = {
  type: 'input',
  name: 'entry',
  message: colors.white('entry point of documents:'),
  default: './*.md'
}

export const output = {
  type: 'input',
  name: 'output',
  message: colors.white('output directory for compiled files:'),
  default: './dist'
}

export const override = {
  type: 'confirm',
  name: 'override',
  message: colors.white('docp.config.js already exists, overwrite?'),
  default: 'N'
}

