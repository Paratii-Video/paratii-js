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
    key: 'getVideoRegistry',
    value: function getVideoRegistry() {
      var contract;
      return _regenerator2.default.async(function getVideoRegistry$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _regenerator2.default.awrap(this.eth.getContract('Videos'));

            case 2:
              contract = _context.sent;

              if (!(contract.options.address === '0x0')) {
                _context.next = 5;
                break;
              }

              throw Error('There is not Videos contract known in the registry');

            case 5:
              return _context.abrupt('return', contract);

            case 6:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'makeId',
    value: function makeId() {
      // create a fresh ID
      return (0, _utils.makeId)();
    }
  }, {
    key: 'create',
    value: function create(options, type) {
      var defaults, msg, contract, tx, videoId;
      return _regenerator2.default.async(function create$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              defaults = {
                id: null,
                owner: undefined,
                price: 0,
                ipfsHashOrig: '',
                ipfsHash: '',
                ipfsData: ''
              };

              options = dopts(options, defaults);

              if (options.id === null) {
                options.id = this.makeId();
              }

              if (this.eth.web3.utils.isAddress(options.owner)) {
                _context2.next = 6;
                break;
              }

              msg = 'The owner argument should be a valid address, not ' + options.owner;
              throw Error(msg);

            case 6:
              _context2.next = 8;
              return _regenerator2.default.awrap(this.getVideoRegistry());

            case 8:
              contract = _context2.sent;
              _context2.next = 11;
              return _regenerator2.default.awrap(contract.methods.create(options.id, options.owner, options.price, options.ipfsHashOrig, options.ipfsHash, options.ipfsData).send());

            case 11:
              tx = _context2.sent;
              videoId = (0, _utils.getInfoFromLogs)(tx, 'LogCreateVideo', 'videoId');
              return _context2.abrupt('return', videoId);

            case 14:
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
      return _regenerator2.default.async(function get$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return _regenerator2.default.awrap(this.getVideoRegistry());

            case 2:
              contract = _context3.sent;
              _context3.next = 5;
              return _regenerator2.default.awrap(contract.methods.get(videoId).call());

            case 5:
              videoInfo = _context3.sent;
              result = {
                id: videoId,
                owner: videoInfo[0],
                price: videoInfo[1],
                ipfsHashOrig: videoInfo[2],
                ipfsHash: videoInfo[3],
                ipfsData: videoInfo[4]
              };

              if (!(result.owner === _utils.NULL_ADDRESS)) {
                _context3.next = 9;
                break;
              }

              throw Error('No video with id \'' + videoId + '\' was registered');

            case 9:
              return _context3.abrupt('return', result);

            case 10:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'update',
    value: function update(videoId, options) {
      var data, key;
      return _regenerator2.default.async(function update$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              options.id = videoId;
              _context4.next = 3;
              return _regenerator2.default.awrap(this.get(videoId));

            case 3:
              data = _context4.sent;

              for (key in options) {
                data[key] = options[key];
              }
              _context4.next = 7;
              return _regenerator2.default.awrap(this.create(data, 'updating'));

            case 7:
              return _context4.abrupt('return', data);

            case 8:
            case 'end':
              return _context4.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'delete',
    value: function _delete(videoId) {
      var contract, tx;
      return _regenerator2.default.async(function _delete$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return _regenerator2.default.awrap(this.getVideoRegistry());

            case 2:
              contract = _context5.sent;
              _context5.next = 5;
              return _regenerator2.default.awrap(contract.methods.remove(videoId).send());

            case 5:
              tx = _context5.sent;
              return _context5.abrupt('return', tx);

            case 7:
            case 'end':
              return _context5.stop();
          }
        }
      }, null, this);
    }
  }]);
  return ParatiiEthVids;
}();