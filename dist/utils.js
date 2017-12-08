'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.add0x = add0x;
function add0x(input) {
  if (typeof input !== 'string') {
    return input;
  } else if (input.length < 2 || input.slice(0, 2) !== '0x') {
    return '0x' + input;
  }
  return input;
}