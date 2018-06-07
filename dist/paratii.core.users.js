'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiUsers = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _schemas = require('./schemas.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var joi = require('joi');

/**
 * Utilities to create and manipulate information about the users on the blockchain.
 * @param {ParatiiConfigSchema} config configuration object to initialize Paratii object
 * @example let paratii = new Paratii()
 * paratii.users // <- this is an instance of ParatiiUsers
 */

var ParatiiUsers = exports.ParatiiUsers = function () {
  function ParatiiUsers(config) {
    (0, _classCallCheck3.default)(this, ParatiiUsers);

    // const schema = joi.object({
    //   'db.provider': joi.string().default(null)
    // }).unknown()
    //
    // const result = joi.validate(config, schema)
    // // const error = result.error
    // if (error) throw error
    this.config = config;
  }
  /**
   * Register the data of this user.
   * @param  {userSchema}  options information about the user ( id, name, email ... )
   * @return {Promise}         information about the user ( id, name, email ... )
   * @example await paratii.core.users.create({
   *  id: 'some-video-id',
   *  name: 'some-nickname',
   *  email: 'some@email.com',
   * })
   */


  (0, _createClass3.default)(ParatiiUsers, [{
    key: 'create',
    value: function create(options) {
      var result, paratii, keysForBlockchain, optionsKeys, optionsBlockchain, optionsIpfs, hash;
      return _regenerator2.default.async(function create$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              result = joi.validate(options, _schemas.userSchema, { allowUnknown: false });

              if (!result.error) {
                _context.next = 3;
                break;
              }

              throw result.error;

            case 3:
              paratii = this.config.paratii;
              keysForBlockchain = ['id', 'name'];
              optionsKeys = (0, _keys2.default)(options);
              optionsBlockchain = {};
              optionsIpfs = {};

              optionsKeys.forEach(function (key) {
                if (keysForBlockchain.includes(key)) {
                  optionsBlockchain[key] = options[key];
                } else {
                  optionsIpfs[key] = options[key];
                }
              });
              _context.next = 11;
              return _regenerator2.default.awrap(paratii.ipfs.local.addJSON(optionsIpfs));

            case 11:
              hash = _context.sent;

              optionsBlockchain['ipfsData'] = hash;
              // FIXME: add error handling if call to db fails.

              if (!(options.email !== undefined)) {
                _context.next = 16;
                break;
              }

              _context.next = 16;
              return _regenerator2.default.awrap(paratii.db.users.setEmail(options.id, options.email));

            case 16:
              return _context.abrupt('return', paratii.eth.users.create(optionsBlockchain));

            case 17:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }

    /**
     * Update the information of the user if the user already exists, otherwise it creates it
     * @param  {Object}  options user informations
     * @return {Promise}         updated/new user informations
     * @example let userData = {
     *                    id: '0x12456....',
     *                    name: 'Humbert Humbert',
     *                    email: 'humbert@humbert.ru',
     *                    ipfsData: 'some-hash'
     *              }
     *   let result = await paratii.eth.users.upsert(userData)
     *  })
     */

  }, {
    key: 'upsert',
    value: function upsert(options) {
      var result, data, userId;
      return _regenerator2.default.async(function upsert$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              result = joi.validate(options, _schemas.userSchema, { allowUnknown: false });

              if (!result.error) {
                _context2.next = 3;
                break;
              }

              throw result.error;

            case 3:
              data = null;
              userId = '';

              if (!options.id) {
                _context2.next = 10;
                break;
              }

              userId = options.id;
              _context2.next = 9;
              return _regenerator2.default.awrap(this.get(userId));

            case 9:
              data = _context2.sent;

            case 10:
              if (data) {
                _context2.next = 14;
                break;
              }

              return _context2.abrupt('return', this.create(options));

            case 14:
              delete options.id;
              return _context2.abrupt('return', this.update(userId, options, data));

            case 16:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }

    /**
     * retrieve data about the user
     * @param  {string} id user univocal id
     * @return {Object}    data about the user
     * @example paratii.users.get('some-user-id')
    */

  }, {
    key: 'get',
    value: function get(id) {
      return this.config.paratii.db.users.get(id);
    }
    /**
     * Updates a user's details. name and email are defined in the smart contract Users, other fields get written to IPFS.
     * @param  {string}  userId  user univocal id
     * @param  {UserSchema}  options updated data i.e. { name: 'A new user name' }
     * @return {Promise}         updated data about the user
     * @example let updatedData = await paratii.users.update('some-user-id', {name: 'A new user name'})
     */

  }, {
    key: 'update',
    value: function update(userId, options) {
      var data, key, result;
      return _regenerator2.default.async(function update$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return _regenerator2.default.awrap(this.get(userId));

            case 2:
              data = _context3.sent;

              for (key in options) {
                if (options[key] !== null) {
                  data[key] = options[key];
                }
              }

              data['id'] = userId;

              result = joi.validate(data, _schemas.userSchema, { allowUnknown: false });

              if (!result.error) {
                _context3.next = 8;
                break;
              }

              throw result.error;

            case 8:
              _context3.next = 10;
              return _regenerator2.default.awrap(this.create(data));

            case 10:
              return _context3.abrupt('return', data);

            case 11:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this);
    }

    /**
     * migrate all contract data for  paratii.config.account to a new account
     * @param newAccount Address of new account
     * @private
     */

  }, {
    key: 'migrateAccount',
    value: function migrateAccount(newAccount) {
      var paratii, oldAccount, search, vids, originalUserRecord, newUserRecord, i, vid, videoId, didVideoApply, ptiBalance;
      return _regenerator2.default.async(function migrateAccount$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              // migrate the videos
              paratii = this.config.paratii;
              oldAccount = this.config.account.address;
              _context4.next = 4;
              return _regenerator2.default.awrap(paratii.vids.search({ owner: oldAccount }));

            case 4:
              search = _context4.sent;
              vids = search.results;
              _context4.next = 8;
              return _regenerator2.default.awrap(paratii.eth.users.get(oldAccount));

            case 8:
              originalUserRecord = _context4.sent;
              newUserRecord = originalUserRecord;

              newUserRecord.id = newAccount;

              _context4.next = 13;
              return _regenerator2.default.awrap(paratii.eth.users.create(newUserRecord));

            case 13:
              if (!vids) {
                _context4.next = 29;
                break;
              }

              i = 0;

            case 15:
              if (!(i < vids.length)) {
                _context4.next = 29;
                break;
              }

              vid = vids[i];
              videoId = vid.id || vid._id;
              _context4.next = 20;
              return _regenerator2.default.awrap(paratii.vids.update(videoId, { owner: newAccount }));

            case 20:
              _context4.next = 22;
              return _regenerator2.default.awrap(paratii.eth.tcrPlaceholder.didVideoApply(videoId));

            case 22:
              didVideoApply = _context4.sent;

              if (!didVideoApply) {
                _context4.next = 26;
                break;
              }

              _context4.next = 26;
              return _regenerator2.default.awrap(paratii.eth.tcrPlaceholder.exit(videoId));

            case 26:
              i++;
              _context4.next = 15;
              break;

            case 29:
              _context4.next = 31;
              return _regenerator2.default.awrap(paratii.eth.balanceOf(oldAccount, 'PTI'));

            case 31:
              ptiBalance = _context4.sent;
              _context4.next = 34;
              return _regenerator2.default.awrap(paratii.eth.transfer(newAccount, ptiBalance, 'PTI'));

            case 34:
            case 'end':
              return _context4.stop();
          }
        }
      }, null, this);
    }
  }]);
  return ParatiiUsers;
}();