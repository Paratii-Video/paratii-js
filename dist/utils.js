'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.add0x = add0x;
exports.getInfoFromLogs = getInfoFromLogs;
exports.makeId = makeId;
var assert = require('assert');
var NULL_ADDRESS = exports.NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

function add0x(input) {
  if (typeof input !== 'string') {
    return input;
  } else if (input.length < 2 || input.slice(0, 2) !== '0x') {
    return '0x' + input;
  }
  return input;
}

function getInfoFromLogs(tx, eventName, arg) {
  var index = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

  // use this as follows:
  //    getInfoFromLogs(tx, 'LogRegisterVideo', 'videoId',  0)
  // tx.events look like this:
  //
  //  events:
  // { LogRegisterVideo:
  //    { logIndex: 0,
  //      transactionIndex: 0,
  //      transactionHash: '0xe7a3ba74915a5de07a7b43ebc16fcd2556e31a6e27a1771a70b85b05546ae8bd',
  //      blockHash: '0x8d56ab2c2f424555d2cf7b48d30023d18ba3ece372c0da5220c1a521e266e613',
  //      blockNumber: 3720,
  //      address: '0xCc478840004288c18a6BaA51Bbf95AbF58A653C4',
  //      type: 'mined',
  //      id: 'log_52a925c3',
  //      returnValues: [Object],
  //      event: 'LogRegisterVideo',
  //      signature: '0x19a6411db3231a980d3d18e397c33cd812f3754bc383db69ce3f7bf8287233b1',
  //      raw: [Object] } } }
  var log = tx.events[eventName];
  if (!log) {
    var msg = 'There is no event logged with eventName ' + eventName;
    throw Error(msg);
  }
  assert(log.logIndex === index);
  return log.returnValues[arg];
}

function makeId() {
  var LENGTH = 12;
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var text = '';

  for (var i = 0; i < LENGTH; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return text;
}