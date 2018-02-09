'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiEthVouchers = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _utils = require('./utils.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dopts = require('default-options');

var ParatiiEthVouchers = exports.ParatiiEthVouchers = function () {
  function ParatiiEthVouchers(context) {
    (0, _classCallCheck3.default)(this, ParatiiEthVouchers);

    // context is a ParatiiEth instance
    this.eth = context;
  }

  (0, _createClass3.default)(ParatiiEthVouchers, [{
    key: 'getVouchersContract',
    value: function getVouchersContract() {
      var contract;
      return _regenerator2.default.async(function getVouchersContract$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _regenerator2.default.awrap(this.eth.getContract('Vouchers'));

            case 2:
              contract = _context.sent;

              if (!(contract.options.address === '0x0')) {
                _context.next = 5;
                break;
              }

              throw Error('There is not Vouchers contract known in the registry');

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
    key: 'create',
    value: function create(options) {
      var defaults, msg, _msg, _msg2, _msg3, contract, hashedVoucher, tx, voucherId;

      return _regenerator2.default.async(function create$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              defaults = {
                voucherCode: undefined,
                amount: undefined
              };

              options = dopts(options, defaults);

              if (!(options.voucherCode === null)) {
                _context2.next = 5;
                break;
              }

              msg = 'Voucher Code argument must not be null';
              throw Error(msg);

            case 5:
              if (!(typeof options.voucherCode !== 'string')) {
                _context2.next = 8;
                break;
              }

              _msg = 'Voucher Code argument needs to be a string';
              throw Error(_msg);

            case 8:
              if (!(typeof options.amount !== 'number')) {
                _context2.next = 11;
                break;
              }

              _msg2 = 'Amount argument needs to be a number';
              throw Error(_msg2);

            case 11:
              if (!(options.amount === 0)) {
                _context2.next = 14;
                break;
              }

              _msg3 = 'Amount needs to be greater than zero';
              throw Error(_msg3);

            case 14:
              _context2.next = 16;
              return _regenerator2.default.awrap(this.getVouchersContract());

            case 16:
              contract = _context2.sent;
              _context2.next = 19;
              return _regenerator2.default.awrap(contract.methods.hashVoucher(options.voucherCode).call());

            case 19:
              hashedVoucher = _context2.sent;
              _context2.next = 22;
              return _regenerator2.default.awrap(contract.methods.create(hashedVoucher, options.amount).send());

            case 22:
              tx = _context2.sent;
              voucherId = (0, _utils.getInfoFromLogs)(tx, 'LogCreateVoucher', '_hashedVoucher');
              return _context2.abrupt('return', voucherId);

            case 25:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'redeem',
    value: function redeem(voucherCode) {
      var contract, tx, claimant;
      return _regenerator2.default.async(function redeem$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return _regenerator2.default.awrap(this.getVouchersContract());

            case 2:
              contract = _context3.sent;
              _context3.next = 5;
              return _regenerator2.default.awrap(contract.methods.redeem(voucherCode).send());

            case 5:
              tx = _context3.sent;
              _context3.prev = 6;
              claimant = (0, _utils.getInfoFromLogs)(tx, 'LogRedeemVoucher', '_claimant');

              if (!(claimant === this.eth.config.accounts.address)) {
                _context3.next = 12;
                break;
              }

              return _context3.abrupt('return', true);

            case 12:
              return _context3.abrupt('return', false);

            case 13:
              _context3.next = 18;
              break;

            case 15:
              _context3.prev = 15;
              _context3.t0 = _context3['catch'](6);
              return _context3.abrupt('return', false);

            case 18:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this, [[6, 15]]);
    }
  }]);
  return ParatiiEthVouchers;
}();