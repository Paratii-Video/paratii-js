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

var joi = require('joi');
/**
 * Functions for redeeming vouchers
 * @class paratii.eth.vouchers
 */

var ParatiiEthVouchers = exports.ParatiiEthVouchers = function () {
  function ParatiiEthVouchers(context) {
    (0, _classCallCheck3.default)(this, ParatiiEthVouchers);

    // context is a ParatiiEth instance
    this.eth = context;
  }
  /**
   * Get the contract instance of the vouchers contract
   * @return {Promise} Object representing the contract
   * @example let contract = await paratii.eth.vids.getVouchersContract()
   * @memberof paratii.eth.vouchers
  */


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
    /**
     * Function for creating a voucher. Can only be called by the owner of the contract.
     * @param  {Object}  options data about the voucher
     * @param {String} options.voucherCode unique string associated to this voucher
     * @param {Number} options.amount amount of PTI in wei of this voucher
     * @return {Promise}         the voucher id
     * @example await paratii.eth.vouchers.create({ voucherCode: 'some-id', amount: 10 })
     * @memberof paratii.eth.vouchers
     */

  }, {
    key: 'create',
    value: function create(options) {
      var schema, result, error, msg, _msg, _msg2, _msg3, contract, hashedVoucher, tx, voucherId;

      return _regenerator2.default.async(function create$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              schema = joi.object({
                voucherCode: joi.string(),
                amount: joi.number()
              });
              result = joi.validate(options, schema);
              error = result.error;

              if (!error) {
                _context2.next = 5;
                break;
              }

              throw error;

            case 5:
              options = result.value;

              if (!(options.voucherCode === null)) {
                _context2.next = 9;
                break;
              }

              msg = 'Voucher Code argument must not be null';
              throw Error(msg);

            case 9:
              if (!(typeof options.voucherCode !== 'string')) {
                _context2.next = 12;
                break;
              }

              _msg = 'Voucher Code argument needs to be a string';
              throw Error(_msg);

            case 12:
              if (!(typeof options.amount !== 'number')) {
                _context2.next = 15;
                break;
              }

              _msg2 = 'Amount argument needs to be a number';
              throw Error(_msg2);

            case 15:
              if (!(options.amount === 0)) {
                _context2.next = 18;
                break;
              }

              _msg3 = 'Amount needs to be greater than zero';
              throw Error(_msg3);

            case 18:
              _context2.next = 20;
              return _regenerator2.default.awrap(this.getVouchersContract());

            case 20:
              contract = _context2.sent;
              _context2.next = 23;
              return _regenerator2.default.awrap(contract.methods.hashVoucher(options.voucherCode).call());

            case 23:
              hashedVoucher = _context2.sent;
              _context2.next = 26;
              return _regenerator2.default.awrap(contract.methods.create(hashedVoucher, options.amount).send());

            case 26:
              tx = _context2.sent;
              voucherId = (0, _utils.getInfoFromLogs)(tx, 'LogCreateVoucher', '_hashedVoucher');
              return _context2.abrupt('return', voucherId);

            case 29:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }
    /**
     * throws a test error
     * @memberof paratii.eth.vouchers
     */

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

    /**
     * Generates a given number of vouchers with unique IDs, and the given amount, and returns an array of objects.
     * @param  {Number}  number number of voucher to create
     * @param  {Number}  amount amount of every voucher
     * @return {Promise}        Object containing every voucher created
     * @example let vouchers = await paratii.eth.vouchers.createVouchers(10, 10)
     * @memberof paratii.eth.vouchers
     */

  }, {
    key: 'createVouchers',
    value: function createVouchers(number, amount) {
      var i, vouchers, code, voucher;
      return _regenerator2.default.async(function createVouchers$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              i = void 0;
              vouchers = [];
              i = 0;

            case 3:
              if (!(i < number)) {
                _context4.next = 12;
                break;
              }

              code = (0, _utils.makeId)();
              voucher = { voucherCode: code, amount: amount };
              _context4.next = 8;
              return _regenerator2.default.awrap(this.create(voucher));

            case 8:
              vouchers.push(voucher);

            case 9:
              i++;
              _context4.next = 3;
              break;

            case 12:
              return _context4.abrupt('return', vouchers);

            case 13:
            case 'end':
              return _context4.stop();
          }
        }
      }, null, this);
    }
    /**
     * Function for redeeming a voucher to the current account's address.
     * @param  {String}  voucherCode univocal voucher code
     * @return {Promise}             true if everything goes well, otherwise throws an error
     * @example await paratii.eth.vouchers.redeem('some-code')
     * @memberof paratii.eth.vouchers
     */

  }, {
    key: 'redeem',
    value: function redeem(voucherCode) {
      var contract, voucherBytes, thisVoucher, thisVoucherClaimant, thisVoucherAmount, vouchersContractBalance, tx, claimant, amount;
      return _regenerator2.default.async(function redeem$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return _regenerator2.default.awrap(this.getVouchersContract());

            case 2:
              contract = _context5.sent;
              _context5.next = 5;
              return _regenerator2.default.awrap(contract.methods.hashVoucher(voucherCode).call());

            case 5:
              voucherBytes = _context5.sent;
              _context5.next = 8;
              return _regenerator2.default.awrap(contract.methods.vouchers(voucherBytes).call());

            case 8:
              thisVoucher = _context5.sent;
              thisVoucherClaimant = thisVoucher[0].toString();
              thisVoucherAmount = Number(thisVoucher[1]);
              _context5.t0 = Number;
              _context5.next = 14;
              return _regenerator2.default.awrap(this.eth.balanceOf(contract.options.address, 'PTI'));

            case 14:
              _context5.t1 = _context5.sent;
              vouchersContractBalance = (0, _context5.t0)(_context5.t1);

              if (!(thisVoucherClaimant !== _utils.NULL_ADDRESS)) {
                _context5.next = 18;
                break;
              }

              throw Error('This voucher was already used');

            case 18:
              if (!(thisVoucherAmount > vouchersContractBalance)) {
                _context5.next = 20;
                break;
              }

              throw Error('The Vouchers contract doesn\'t have enough PTI to redeem the voucher');

            case 20:
              if (!(thisVoucherAmount === Number(0))) {
                _context5.next = 22;
                break;
              }

              throw Error('This voucher doesn\'t exist');

            case 22:
              _context5.prev = 22;
              _context5.next = 25;
              return _regenerator2.default.awrap(contract.methods.redeem(voucherCode).send());

            case 25:
              tx = _context5.sent;
              claimant = (0, _utils.getInfoFromLogs)(tx, 'LogRedeemVoucher', '_claimant', 1);
              amount = (0, _utils.getInfoFromLogs)(tx, 'LogRedeemVoucher', '_amount', 1);

              if (!(claimant === this.eth.getAccount())) {
                _context5.next = 32;
                break;
              }

              return _context5.abrupt('return', amount);

            case 32:
              return _context5.abrupt('return', false);

            case 33:
              _context5.next = 38;
              break;

            case 35:
              _context5.prev = 35;
              _context5.t2 = _context5['catch'](22);
              throw Error('An unknown error occurred');

            case 38:
            case 'end':
              return _context5.stop();
          }
        }
      }, null, this, [[22, 35]]);
    }
  }]);
  return ParatiiEthVouchers;
}();