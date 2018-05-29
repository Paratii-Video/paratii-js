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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var joi = require('joi');
var ethUtil = require('ethereumjs-util');

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
     * Function to generate a signature
     * @param  {number} amount the amount to sign
     * @param  {string} salt the bytes32 salt to sign
     * @param  {string} reason the reason why to sign
     * @param  {string} address the address that signs
    */

  }, {
    key: 'generateSignature',
    value: function generateSignature(address, amount, salt, reason, owner) {
      var hash, signature, signatureData, sig;
      return _regenerator2.default.async(function generateSignature$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              hash = this.eth.web3.utils.soliditySha3('' + address, '' + amount, '' + salt, '' + reason);
              _context2.next = 3;
              return _regenerator2.default.awrap(this.eth.web3.eth.sign(hash, owner));

            case 3:
              signature = _context2.sent;
              signatureData = ethUtil.fromRpcSig(signature);
              sig = {};

              sig.v = ethUtil.bufferToHex(signatureData.v);
              sig.r = ethUtil.bufferToHex(signatureData.r);
              sig.s = ethUtil.bufferToHex(signatureData.s);
              return _context2.abrupt('return', sig);

            case 10:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }
    /**
     * Function for distributing pti. Can only be called by a valid owner signature.
     * @param  {Object}  options data about the amount and the signature
     * @param {string} options.address recipient address
     * @param {number} options.amount amount of PTI in wei of this distribution
     * @param {string} options.salt an bytes32 hash
     * @param {string} options.reason a reason for distribution
     * @param {string} options.v signature
     * @param {string} options.r signature
     * @param {string} options.s signature
      * @return {Promise}        none
     * @example asd
     */

  }, {
    key: 'distribute',
    value: function distribute(options) {
      var schema, result, contract, isUsed, hash, distributorOwner, account, tx;
      return _regenerator2.default.async(function distribute$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
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

              if (!result.error) {
                _context3.next = 4;
                break;
              }

              throw result.error;

            case 4:
              options = result.value;

              _context3.next = 7;
              return _regenerator2.default.awrap(this.getPTIDistributeContract());

            case 7:
              contract = _context3.sent;
              _context3.next = 10;
              return _regenerator2.default.awrap(contract.methods.isUsed(options.salt).call());

            case 10:
              isUsed = _context3.sent;

              if (!isUsed) {
                _context3.next = 13;
                break;
              }

              throw new Error('Salt ' + options.salt + ' is already used');

            case 13:
              hash = this.eth.web3.utils.soliditySha3(options.address, options.amount, options.salt, options.reason);
              _context3.next = 16;
              return _regenerator2.default.awrap(contract.methods.owner().call());

            case 16:
              distributorOwner = _context3.sent;
              _context3.next = 19;
              return _regenerator2.default.awrap(contract.methods.checkOwner(hash, options.v, options.r, options.s).call());

            case 19:
              account = _context3.sent;

              if (!(account !== distributorOwner)) {
                _context3.next = 22;
                break;
              }

              throw new Error('Signature does not correspond to owner of the contract (' + account + ' != ' + distributorOwner + ')');

            case 22:
              _context3.next = 24;
              return _regenerator2.default.awrap(contract.methods.distribute(options.address, options.amount, options.salt, options.reason, options.v, options.r, options.s).send());

            case 24:
              tx = _context3.sent;
              return _context3.abrupt('return', tx);

            case 26:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }]);
  return ParatiiEthPTIDistributor;
}();