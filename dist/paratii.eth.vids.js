'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiEthVids = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./utils.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var dopts = require('default-options');

var ParatiiEthVids = exports.ParatiiEthVids = function () {
  function ParatiiEthVids(context) {
    _classCallCheck(this, ParatiiEthVids);

    // context is a ParatiiEth instance
    this.eth = context;
  }

  _createClass(ParatiiEthVids, [{
    key: 'getRegistry',
    value: function getRegistry() {
      return regeneratorRuntime.async(function getRegistry$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt('return', this.eth.getContract('VideoRegistry'));

            case 1:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'register',
    value: function register(options) {
      var defaults, contract, tx, videoId;
      return regeneratorRuntime.async(function register$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              defaults = {
                id: String,
                owner: String,
                price: Number,
                ipfsHash: String
              };


              options = dopts(options, defaults);
              _context2.next = 4;
              return regeneratorRuntime.awrap(this.getRegistry());

            case 4:
              contract = _context2.sent;
              _context2.next = 7;
              return regeneratorRuntime.awrap(contract.methods.registerVideo(options.id, options.owner, options.price, options.ipfsHash).send());

            case 7:
              tx = _context2.sent;
              videoId = (0, _utils.getInfoFromLogs)(tx, 'LogRegisterVideo', 'videoId');
              return _context2.abrupt('return', videoId);

            case 10:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'get',
    value: function get(videoId) {
      var contract, videoInfo, result;
      return regeneratorRuntime.async(function get$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return regeneratorRuntime.awrap(this.getRegistry());

            case 2:
              contract = _context3.sent;
              _context3.next = 5;
              return regeneratorRuntime.awrap(contract.methods.getVideoInfo(videoId).call());

            case 5:
              videoInfo = _context3.sent;

              console.log(videoInfo);
              console.log(contract.abi);
              result = {
                id: videoId,
                owner: videoInfo[0],
                price: videoInfo[1],
                ipfsHash: videoInfo[2]
              };
              return _context3.abrupt('return', result);

            case 10:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }]);

  return ParatiiEthVids;
}();