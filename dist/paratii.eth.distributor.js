'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiEthPTIDistributor = undefined;

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
 * Functions for distribute pti
 * @param  {Object} context ParatiiEth instance
 * @property {ParatiiEth} eth ParatiiEth instance
 */

var ParatiiEthPTIDistributor = exports.ParatiiEthPTIDistributor = function () {
  function ParatiiEthPTIDistributor(context) {
    (0, _classCallCheck3.default)(this, ParatiiEthPTIDistributor);

    // context is a ParatiiEth instance
    this.eth = context;
  }
  /**
   * Get the contract instance of the PTIDistributor contract
   * @return {Promise} Object representing the contract
   * @example let contract = await paratii.eth.distribute.getPTIDistributeContract()
  */


  (0, _createClass3.default)(ParatiiEthPTIDistributor, [{
    key: 'getPTIDistributeContract',
    value: function getPTIDistributeContract() {
      var contract;
      return _regenerator2.default.async(function getPTIDistributeContract$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _regenerator2.default.awrap(this.eth.getContract('PTIDistributor'));

            case 2:
              contract = _context.sent;

              if (!(contract.options.address === '0x0')) {
                _context.next = 5;
                break;
              }

              throw Error('There is not ptiDistributor contract known in the registry');

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
     * @param {string} options.voucherCode unique string associated to this voucher
     * @param {number} options.amount amount of PTI in wei of this voucher
     * @return {Promise}         the voucher id
     * @example await paratii.eth.distribute.distribute({ voucherCode: 'some-id', amount: 10 })
     */

  }, {
    key: 'distribute',
    value: function distribute(options) {
      var schema, result, error, contract, tx, recipient;
      return _regenerator2.default.async(function distribute$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              schema = joi.object({
                address: joi.string(),
                amount: joi.number(),
                salt: joi.string(),
                reason: joi.string(),
                v: joi.string(),
                r: joi.string(),
                s: joi.string()
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

              // TODO: implement type and missing value check

              _context2.next = 8;
              return _regenerator2.default.awrap(this.getPTIDistributeContract());

            case 8:
              contract = _context2.sent;
              _context2.next = 11;
              return _regenerator2.default.awrap(contract.methods.distribute(options.address, options.amount, options.salt, options.reason, options.v, options.r, options.s).call());

            case 11:
              tx = _context2.sent;
              recipient = (0, _utils.getInfoFromLogs)(tx, 'LogDistribute', '_toAddress');
              return _context2.abrupt('return', recipient);

            case 14:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }]);
  return ParatiiEthPTIDistributor;
}();