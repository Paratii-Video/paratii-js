'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiEthUsers = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dopts = require('default-options');

var ParatiiEthUsers = exports.ParatiiEthUsers = function () {
  function ParatiiEthUsers(context) {
    (0, _classCallCheck3.default)(this, ParatiiEthUsers);

    // context is a ParatiiEth instance
    this.eth = context;
  }

  (0, _createClass3.default)(ParatiiEthUsers, [{
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
              return _context3.abrupt('return', this.eth.getContract('Users'));

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
      var defaults, msg, contract;
      return _regenerator2.default.async(function create$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              defaults = {
                id: String,
                name: String,
                email: String,
                ipfsHash: String
              };

              if (this.eth.web3.utils.isAddress(options.id)) {
                _context4.next = 4;
                break;
              }

              msg = 'The"id" argument should be a valid address, not ' + options.id;
              throw Error(msg);

            case 4:
              options = dopts(options, defaults);
              _context4.next = 7;
              return _regenerator2.default.awrap(this.getRegistry());

            case 7:
              contract = _context4.sent;

              contract.setProvider(this.eth.config.provider);
              _context4.next = 11;
              return _regenerator2.default.awrap(this.fixMethodAndSend(contract.methods.registerUser(options.id, options.name, options.email, options.ipfsHash)));

            case 11:
              return _context4.abrupt('return', options.id);

            case 12:
            case 'end':
              return _context4.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'get',
    value: function get(userId) {
      var contract, userInfo, result;
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
              return _regenerator2.default.awrap(this.fixMethodAndCall(contract.methods.getUserInfo(userId)));

            case 6:
              userInfo = _context5.sent;
              result = {
                id: userId,
                name: userInfo[0],
                email: userInfo[1],
                ipfsHash: userInfo[2]
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
    value: function update(userId, options) {
      var data, key;
      return _regenerator2.default.async(function update$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              options.id = userId;
              _context6.next = 3;
              return _regenerator2.default.awrap(this.get(userId));

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
    value: function _delete(userId) {
      var contract, tx;
      return _regenerator2.default.async(function _delete$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return _regenerator2.default.awrap(this.getRegistry());

            case 2:
              contract = _context7.sent;
              tx = this.fixMethodAndSend(contract.methods.unregisterUser(userId));
              return _context7.abrupt('return', tx);

            case 5:
            case 'end':
              return _context7.stop();
          }
        }
      }, null, this);
    }
  }]);
  return ParatiiEthUsers;
}();