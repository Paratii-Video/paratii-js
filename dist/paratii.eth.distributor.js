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
     * Function for generate a signature
     * @param  {number} amount the amount to sign
     * @param  {string} salt the bytes32 salt to sign
     * @param  {string} reason the reason why to sign
     * @param  {string} address the address that sign
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
      var schema, result, error, contract, isUsed, sig, hash, account, distributorOwner, tx;
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
              error = result.error;

              if (!error) {
                _context3.next = 5;
                break;
              }

              throw error;

            case 5:
              options = result.value;

              // TODO: implement type and missing value check
              _context3.next = 8;
              return _regenerator2.default.awrap(this.getPTIDistributeContract());

            case 8:
              contract = _context3.sent;
              _context3.next = 11;
              return _regenerator2.default.awrap(contract.methods.isUsed(options.salt).call());

            case 11:
              isUsed = _context3.sent;

              if (!isUsed) {
                _context3.next = 14;
                break;
              }

              throw new Error('salt ' + options.salt + ' is already used ' + isUsed);

            case 14:
              sig = ethUtil.toRpcSig(this.eth.web3.utils.hexToNumber(options.v), Buffer.from(options.r), Buffer.from(options.s));
              hash = this.eth.web3.utils.soliditySha3('' + options.amount, '' + options.salt, '' + options.reason);

              // when talking to a parity node, this call will only work if 'personal' is enabled in [rpc]

              _context3.next = 18;
              return _regenerator2.default.awrap(this.eth.web3.eth.personal.ecRecover(hash, sig));

            case 18:
              account = _context3.sent;
              _context3.next = 21;
              return _regenerator2.default.awrap(contract.methods.owner().call());

            case 21:
              distributorOwner = _context3.sent;

              if (!(account !== distributorOwner)) {
                _context3.next = 24;
                break;
              }

              throw new Error('Sig Mismatch acc: ' + account + ' != ' + distributorOwner);

            case 24:
              _context3.next = 26;
              return _regenerator2.default.awrap(contract.methods.distribute(options.address, options.amount, options.salt, options.reason, options.v, options.r, options.s).send());

            case 26:
              tx = _context3.sent;
              return _context3.abrupt('return', tx);

            case 28:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }]);
  return ParatiiEthPTIDistributor;
}();