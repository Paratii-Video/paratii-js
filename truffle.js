require('babel-polyfill')
require('babel-register')({
  'presets': ['es2015'],
  'plugins': ['syntax-async-functions', 'transform-regenerator']
})
