'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiEthVids = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _utils = require('./utils.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dopts = require('default-options');

var ParatiiEthVids = exports.ParatiiEthVids = function () {
  function ParatiiEthVids(context) {
    (0, _classCallCheck3.default)(this, ParatiiEthVids);

    // context is a ParatiiEth instance
    this.eth = context;
  }

  (0, _createClass3.default)(ParatiiEthVids, [{
    key: 'fixMethodAndSend',
    value: function fixMethodAndSend(method, opts) {
      var rawTransaction, tx;
      return _regenerator2.default.async(function fixMethodAndSend$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _regenerator2.default.awrap(method);

            case 2:
              rawTransaction = _context.sent;

              rawTransaction._ethAccounts = this.eth.web3.eth.accounts;
              // wait for receipt let nonce increment
              _context.next = 6;
              return _regenerator2.default.awrap(rawTransaction.send(opts));

            case 6:
              tx = _context.sent;
              return _context.abrupt('return', tx);

            case 8:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'fixMethodAndCall',
    value: function fixMethodAndCall(method) {
      var rawTransaction, result;
      return _regenerator2.default.async(function fixMethodAndCall$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _regenerator2.default.awrap(method);

            case 2:
              rawTransaction = _context2.sent;

              rawTransaction._ethAccounts = this.eth.web3.eth.accounts;
              // wait for receipt let nonce increment
              _context2.next = 6;
              return _regenerator2.default.awrap(rawTransaction.call());

            case 6:
              result = _context2.sent;
              return _context2.abrupt('return', result);

            case 8:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'getRegistry',
    value: function getRegistry() {
      return _regenerator2.default.async(function getRegistry$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              return _context3.abrupt('return', this.eth.getContract('Videos'));

            case 1:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'create',
    value: function create(options) {
      var defaults, msg, contract, tx, videoId;
      return _regenerator2.default.async(function create$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              defaults = {
                id: String,
                owner: String,
                price: Number,
                ipfsHash: String,
                ipfsData: String
              };

              if (this.eth.web3.utils.isAddress(options.owner)) {
                _context4.next = 4;
                break;
              }

              msg = 'The owner argument should be a valid address, not ' + options.owner;
              throw Error(msg);

            case 4:
              options = dopts(options, defaults);
              _context4.next = 7;
              return _regenerator2.default.awrap(this.getRegistry());

            case 7:
              contract = _context4.sent;

              contract.setProvider(this.eth.config.provider);
              _context4.next = 11;
              return _regenerator2.default.awrap(this.fixMethodAndSend(contract.methods.create(options.id, options.owner, options.price, options.ipfsHash, options.ipfsData)));

            case 11:
              tx = _context4.sent;
              videoId = (0, _utils.getInfoFromLogs)(tx, 'LogCreateVideo', 'videoId');
              return _context4.abrupt('return', videoId);

            case 14:
            case 'end':
              return _context4.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'get',
    value: function get(videoId) {
      var contract, videoInfo, result;
      return _regenerator2.default.async(function get$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return _regenerator2.default.awrap(this.getRegistry());

            case 2:
              contract = _context5.sent;

              contract.setProvider(this.eth.config.provider);
              _context5.next = 6;
              return _regenerator2.default.awrap(this.fixMethodAndCall(contract.methods.get(videoId)));

            case 6:
              videoInfo = _context5.sent;
              result = {
                id: videoId,
                owner: videoInfo[0],
                price: videoInfo[1],
                ipfsHash: videoInfo[2],
                ipfsData: videoInfo[3]
              };
              return _context5.abrupt('return', result);

            case 9:
            case 'end':
              return _context5.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'update',
    value: function update(videoId, options) {
      var data, key;
      return _regenerator2.default.async(function update$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              options.id = videoId;
              _context6.next = 3;
              return _regenerator2.default.awrap(this.get(videoId));

            case 3:
              data = _context6.sent;

              for (key in options) {
                data[key] = options[key];
              }
              _context6.next = 7;
              return _regenerator2.default.awrap(this.create(data));

            case 7:
              return _context6.abrupt('return', data);

            case 8:
            case 'end':
              return _context6.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'delete',
    value: function _delete(videoId) {
      var contract, tx;
      return _regenerator2.default.async(function _delete$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return _regenerator2.default.awrap(this.getRegistry());

            case 2:
              contract = _context7.sent;

              contract.setProvider(this.eth.config.provider);
              _context7.next = 6;
              return _regenerator2.default.awrap(this.fixMethodAndSend(contract.methods.remove(videoId)));

            case 6:
              tx = _context7.sent;
              return _context7.abrupt('return', tx);

            case 8:
            case 'end':
              return _context7.stop();
          }
        }
      }, null, this);
    }
  }]);
  return ParatiiEthVids;
}();