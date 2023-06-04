module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'jest',
    'prettier'
  ],
  extends: [
    'eslint:recommended',
    'standard',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/ban-ts-comment': 0,
    '@typescript-eslint/camelcase': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/indent': [2, 2],
    '@typescript-eslint/interface-name-prefix': 0,
    '@typescript-eslint/member-delimiter-style': [1, { multiline: { delimiter: 'none' }, singleline: { delimiter: 'comma' } }],
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-namespace': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/no-this-alias': 0,
    '@typescript-eslint/no-unused-vars': [1, { argsIgnorePattern: '^_', args: 'after-used' }],
    '@typescript-eslint/no-use-before-define': [1, { functions: false, classes: false }],
    '@typescript-eslint/no-var-requires': 0,
    camelcase: 0,
    indent: 'off',
    'no-debugger': 0,
    'no-prototype-builtins': 0,
    'no-unused-expressions': 0,
    'no-unused-vars': 'off',
    'no-use-before-define': 0,
    'no-empty': 1,
    'prefer-spread': 0,
    'prefer-rest-params': 0,
    quotes: [2, 'single', { avoidEscape: true, allowTemplateLiterals: true }],
    semi: [2, 'never'],
    'standard/no-callback-literal': 0
  },
  env: {
    'jest/globals': true,
    browser: true,
    node: true,
    es6: true
  },
  globals: {
    testRule: 'readonly',
    wx: 'readonly',
    qq: 'readonly',
    tt: 'readonly',
    swan: 'readonly',
    my: 'readonly',
    getCurrentPages: 'readonly',
    getApp: 'readonly',
    requirePlugin: 'readonly',
    jd: 'readonly',
    ks: 'readonly',
    LOCATION_APIKEY: 'readonly'
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
  }
}
