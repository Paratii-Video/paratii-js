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

var joi = require('joi');
/**
 * The eth.user namespace contains functions to interact with the video registration on the blockchain.

 */

var ParatiiEthUsers = exports.ParatiiEthUsers = function () {
  function ParatiiEthUsers(context) {
    (0, _classCallCheck3.default)(this, ParatiiEthUsers);

    // context is a ParatiiEth instance
    this.eth = context;
  }
  /**
   * Get the contract instance of the user contract
   * @return {Promise}  Object representing the contract
    */


  (0, _createClass3.default)(ParatiiEthUsers, [{
    key: 'getRegistry',
    value: function getRegistry() {
      return _regenerator2.default.async(function getRegistry$(_context) {
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
    /**
     * Creates a user
     * @param  {Object}  options information about the user
     * @param {string} options.id valid address
     * @param {string} options.name name of the user
     * @param {string} options.email email of the user
     * @param {string} options.ipfsData ipfs hash
     * @return {Promise}         the id of the newly created user
     * @example let userData = {
     *                    id: 'some-id',
     *                    name: 'Humbert Humbert',
     *                    email: 'humbert@humbert.ru',
     *                    ipfsData: 'some-hash'
     *              }
     *         let result = await paratii.eth.users.create(userData)
      */

  }, {
    key: 'create',
    value: function create(options) {
      var schema, msg, result, error, contract;
      return _regenerator2.default.async(function create$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              schema = joi.object({
                id: joi.string(),
                name: joi.string(),
                email: joi.string(),
                ipfsData: joi.string()
              });

              if (this.eth.web3.utils.isAddress(options.id)) {
                _context2.next = 4;
                break;
              }

              msg = 'The "id" argument should be a valid address, not ' + options.id;
              throw Error(msg);

            case 4:
              result = joi.validate(options, schema);
              error = result.error;

              if (!error) {
                _context2.next = 8;
                break;
              }

              throw error;

            case 8:
              options = result.value;

              _context2.next = 11;
              return _regenerator2.default.awrap(this.getRegistry());

            case 11:
              contract = _context2.sent;
              _context2.next = 14;
              return _regenerator2.default.awrap(contract.methods.create(options.id, options.name, options.email, options.ipfsData).send());

            case 14:
              return _context2.abrupt('return', options.id);

            case 15:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }
    /**
     * Get a users details from the blockchain
     * @param  {string}  userId valid address
     * @return {Promise}        information about the user
     * @example user = await paratii.eth.users.get('some-id')
      */

  }, {
    key: 'get',
    value: function get(userId) {
      var contract, userInfo, result;
      return _regenerator2.default.async(function get$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return _regenerator2.default.awrap(this.getRegistry());

            case 2:
              contract = _context3.sent;
              _context3.next = 5;
              return _regenerator2.default.awrap(contract.methods.get(userId).call());

            case 5:
              userInfo = _context3.sent;
              result = {
                id: userId,
                name: userInfo[0],
                email: userInfo[1],
                ipfsData: userInfo[2]
              };
              return _context3.abrupt('return', result);

            case 8:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this);
    }
    /**
     * Updates a user details on the blockchain.
     * @param  {string}  userId  valid address
     * @param  {Object}  options information to update. Left-out data is kept the same.
     * @return {Promise}         updated data
     * @example await paratii.eth.users.update('some-id', {ipfsData: 'new-hash'})
      */

  }, {
    key: 'update',
    value: function update(userId, options) {
      var data, key;
      return _regenerator2.default.async(function update$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              options.id = userId;
              _context4.next = 3;
              return _regenerator2.default.awrap(this.get(userId));

            case 3:
              data = _context4.sent;

              for (key in options) {
                data[key] = options[key];
              }
              _context4.next = 7;
              return _regenerator2.default.awrap(this.create(data));

            case 7:
              return _context4.abrupt('return', data);

            case 8:
            case 'end':
              return _context4.stop();
          }
        }
      }, null, this);
    }
    /**
     * Deletes a user from the blockchain. Can only be called by the contract owner or the user him/her-self
     * @param  {string}  userId valid address
     * @return {Promise}        blockchain transaction
     * @example await paratii.eth.users.delete('some-id')
      */

  }, {
    key: 'delete',
    value: function _delete(userId) {
      var contract, tx;
      return _regenerator2.default.async(function _delete$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return _regenerator2.default.awrap(this.getRegistry());

            case 2:
              contract = _context5.sent;
              tx = contract.methods.remove(userId).send();
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