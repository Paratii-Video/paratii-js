// var webpack = require('webpack')
var path = require('path')

var srcDir = path.resolve(__dirname, 'lib')
var jsDir = srcDir
// var stylesDir = srcDir + '/styles';
var buildDir = path.resolve(__dirname, 'dist')

// var prod = process.env.NODE_ENV === 'production'

var config = {
  entry: jsDir + '/paratii.js',
  output: {
    path: buildDir,
    filename: 'bundle.js',
    library: 'paratii-lib',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    alias: {
      fs: 'browserify-fs'
      // styles: stylesDir,
    }
  },
  node: {
    fs: 'empty',
    child_process: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  target: 'web',
  module: {
    loaders: [{
      test: /\.js$/,
      include: [
        srcDir
      ],
      exclude: [
        /node_modules/
      ],
      loader: 'babel-loader',
      options: {
        presets: ['es2015'],
        plugins: ['syntax-async-functions', 'transform-regenerator']
      }
    }]
  }
}

module.exports = config
