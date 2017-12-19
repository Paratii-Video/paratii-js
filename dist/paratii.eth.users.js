'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var dopts = require('default-options');

var ParatiiEthUsers = exports.ParatiiEthUsers = function () {
  function ParatiiEthUsers(context) {
    _classCallCheck(this, ParatiiEthUsers);

    // context is a ParatiiEth instance
    this.eth = context;
  }

  _createClass(ParatiiEthUsers, [{
    key: 'getRegistry',
    value: function getRegistry() {
      return regeneratorRuntime.async(function getRegistry$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt('return', this.eth.getContract('Users'));

            case 1:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'create',
    value: function create(options) {
      var defaults, msg, contract;
      return regeneratorRuntime.async(function create$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              defaults = {
                id: String,
                name: String,
                email: String,
                ipfsHash: String
              };

              if (this.eth.web3.utils.isAddress(options.id)) {
                _context2.next = 4;
                break;
              }

              msg = 'The"id" argument should be a valid address, not ' + options.id;
              throw Error(msg);

            case 4:
              options = dopts(options, defaults);
              _context2.next = 7;
              return regeneratorRuntime.awrap(this.getRegistry());

            case 7:
              contract = _context2.sent;
              _context2.next = 10;
              return regeneratorRuntime.awrap(contract.methods.registerUser(options.id, options.name, options.email, options.ipfsHash).send());

            case 10:
              return _context2.abrupt('return', options.id);

            case 11:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'get',
    value: function get(userId) {
      var contract, userInfo, result;
      return regeneratorRuntime.async(function get$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return regeneratorRuntime.awrap(this.getRegistry());

            case 2:
              contract = _context3.sent;
              _context3.next = 5;
              return regeneratorRuntime.awrap(contract.methods.getUserInfo(userId).call());

            case 5:
              userInfo = _context3.sent;
              result = {
                id: userId,
                name: userInfo[0],
                email: userInfo[1],
                ipfsHash: userInfo[2]
              };
              return _context3.abrupt('return', result);

            case 8:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'update',
    value: function update(userId, options) {
      var data, key;
      return regeneratorRuntime.async(function update$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              options.id = userId;
              _context4.next = 3;
              return regeneratorRuntime.awrap(this.get(userId));

            case 3:
              data = _context4.sent;

              for (key in options) {
                data[key] = options[key];
              }
              _context4.next = 7;
              return regeneratorRuntime.awrap(this.create(data));

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
    value: function _delete(userId) {
      var contract, tx;
      return regeneratorRuntime.async(function _delete$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return regeneratorRuntime.awrap(this.getRegistry());

            case 2:
              contract = _context5.sent;
              tx = contract.methods.unregisterUser(userId).send();
              return _context5.abrupt('return', tx);

            case 5:
            case 'end':
              return _context5.stop();
          }
        }
      }, null, this);
    }
  }]);

  return ParatiiEthUsers;
}();