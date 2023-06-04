const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js'
  },
  mode: 'development',
  context: path.resolve(__dirname),
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cwd: __dirname,
            presets: [
              ['@babel/preset-env'],
              ['@babel/preset-react']
            ]
          }
        },
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  ['postcss-preset-env', {}],
                  ['autoprefixer', {}]
                ]
              },
            },
          }
        ],
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public', 'index.html'),
      publicPath: './',
    })
  ],
  devServer: {
    static: [{
      directory: path.join(__dirname, 'public'),
      publicPath: '/'
    }],
    client: {
      overlay: false,
    }
  }
}
