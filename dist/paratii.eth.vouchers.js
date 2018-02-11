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
    key: 'test',
    value: function test() {
      return _regenerator2.default.async(function test$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              throw Error('test error message');

            case 1:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'redeem',
    value: function redeem(voucherCode) {
      var contract, voucherBytes, thisVoucher, thisVoucherClaimant, thisVoucherAmount, vouchersContractBalance, tx, claimant;
      return _regenerator2.default.async(function redeem$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return _regenerator2.default.awrap(this.getVouchersContract());

            case 2:
              contract = _context4.sent;
              _context4.next = 5;
              return _regenerator2.default.awrap(contract.methods.hashVoucher(voucherCode).call());

            case 5:
              voucherBytes = _context4.sent;
              _context4.next = 8;
              return _regenerator2.default.awrap(contract.methods.vouchers(voucherBytes).call());

            case 8:
              thisVoucher = _context4.sent;
              thisVoucherClaimant = thisVoucher[0].toString();
              thisVoucherAmount = Number(thisVoucher[1]);
              _context4.t0 = Number;
              _context4.next = 14;
              return _regenerator2.default.awrap(this.eth.balanceOf(contract.options.address, 'PTI'));

            case 14:
              _context4.t1 = _context4.sent;
              vouchersContractBalance = (0, _context4.t0)(_context4.t1);

              if (!(thisVoucherClaimant !== _utils.NULL_ADDRESS)) {
                _context4.next = 18;
                break;
              }

              throw Error('This voucher was already used');

            case 18:
              if (!(thisVoucherAmount > vouchersContractBalance)) {
                _context4.next = 20;
                break;
              }

              throw Error('The Vouchers contract doesn\'t have enough PTI to redeem the voucher');

            case 20:
              if (!(thisVoucherAmount === Number(0))) {
                _context4.next = 22;
                break;
              }

              throw Error('This voucher doesn\'t exist');

            case 22:
              _context4.prev = 22;
              _context4.next = 25;
              return _regenerator2.default.awrap(contract.methods.redeem(voucherCode).send());

            case 25:
              tx = _context4.sent;
              claimant = (0, _utils.getInfoFromLogs)(tx, 'LogRedeemVoucher', '_claimant', 1);

              if (!(claimant === this.eth.config.account.address)) {
                _context4.next = 31;
                break;
              }

              return _context4.abrupt('return', true);

            case 31:
              return _context4.abrupt('return', false);

            case 32:
              _context4.next = 37;
              break;

            case 34:
              _context4.prev = 34;
              _context4.t2 = _context4['catch'](22);
              throw Error('An unknown error occurred');

            case 37:
            case 'end':
              return _context4.stop();
          }
        }
      }, null, this, [[22, 34]]);
    }
  }]);
  return ParatiiEthVouchers;
}();