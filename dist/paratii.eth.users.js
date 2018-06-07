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

var _schemas = require('./schemas.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var joi = require('joi');
/**
 * The eth.user namespace contains functions to interact with the video registration on the blockchain.
 * @param {Object} context ParatiiEth instance
 * @property {ParatiiEth} eth ParatiiEth instance
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
   * @example let usersContract =  await paratii.eth.users.getRegistry()
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
     * Register the data of this user.
     * @param  {ethUserSchema}  options information about the user ( id, name ... )
     * @return {Promise}         information about the user ( id, name, ... )
     * @example await paratii.eth.users.create({
     *  id: 'some-video-id',
     *  name: 'some-nickname',
     *  ipfsData: 'ipfsHash',
     * })
     */

  }, {
    key: 'create',
    value: function create(options) {
      var msg, result, error, contract;
      return _regenerator2.default.async(function create$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (this.eth.web3.utils.isAddress(options.id)) {
                _context2.next = 3;
                break;
              }

              msg = 'The "id" argument should be a valid address, not ' + options.id;
              throw Error(msg);

            case 3:
              result = joi.validate(options, _schemas.ethUserSchema);
              error = result.error;

              if (!error) {
                _context2.next = 7;
                break;
              }

              throw error;

            case 7:
              options = result.value;
              _context2.next = 10;
              return _regenerator2.default.awrap(this.getRegistry());

            case 10:
              contract = _context2.sent;
              _context2.next = 13;
              return _regenerator2.default.awrap(contract.methods.create(options.id, options.name, options.ipfsData).send());

            case 13:
              return _context2.abrupt('return', options.id);

            case 14:
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
     * See {@link ParatiiCoreUsers#get}
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
                ipfsData: userInfo[1]
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
     * See {@link ParatiiCoreUsers#update}
     */

  }, {
    key: 'update',
    value: function update(userId, options) {
      var result, error, data, key;
      return _regenerator2.default.async(function update$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              options.id = userId;
              result = joi.validate(options, _schemas.ethUserSchema);
              error = result.error;

              if (!error) {
                _context4.next = 5;
                break;
              }

              throw error;

            case 5:
              _context4.next = 7;
              return _regenerator2.default.awrap(this.get(userId));

            case 7:
              data = _context4.sent;

              for (key in options) {
                data[key] = options[key];
              }
              _context4.next = 11;
              return _regenerator2.default.awrap(this.create(data));

            case 11:
              return _context4.abrupt('return', data);

            case 12:
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