'use strict';

require('babel-polyfill');
require('babel-register')({
  'presets': ['es2015'],
  'plugins': ['syntax-async-functions', 'transform-regenerator', 'transform-es2015-modules-commonjs']
});

module.exports.Paratii = require('./paratii.js').Paratii;