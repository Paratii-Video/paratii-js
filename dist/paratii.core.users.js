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
   * @typedef {Array} userSchema
   * @property {string} id the Ethereum address of the user
   * @property {string=} name
   * @property {string=} email
   */

  /**
   * Creates a user, fields id, name and email go to the smart contract Users, other fields are stored on IPFS.
   * @param  {userSchema}  options information about the video ( id, name, email ... )
   * @return {Promise}         the id of the newly created user
   * @example let userData = {
   *                    id: '0x12456....',
   *                    name: 'Humbert Humbert',
   *                    email: 'humbert@humbert.ru',
   *                    ipfsData: 'some-hash'
   *              }
   *   let result = await paratii.eth.users.create(userData)
   *  })
   */


  (0, _createClass3.default)(ParatiiUsers, [{
    key: 'create',
    value: function create(options) {
      var paratii, keysForBlockchain, optionsKeys, optionsBlockchain, optionsIpfs, hash;
      return _regenerator2.default.async(function create$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              // FIXME: do some joi validation here
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
              _context.next = 8;
              return _regenerator2.default.awrap(paratii.ipfs.local.addJSON(optionsIpfs));

            case 8:
              hash = _context.sent;

              optionsBlockchain['ipfsData'] = hash;
              // FIXME: add error handling if call to db fails.

              if (!(options.email !== undefined)) {
                _context.next = 13;
                break;
              }

              _context.next = 13;
              return _regenerator2.default.awrap(paratii.db.users.setEmail(options.id, options.email));

            case 13:
              return _context.abrupt('return', paratii.eth.users.create(optionsBlockchain));

            case 14:
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
      var data, userId;
      return _regenerator2.default.async(function upsert$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              data = null;
              userId = '';

              if (!options.id) {
                _context2.next = 7;
                break;
              }

              userId = options.id;
              _context2.next = 6;
              return _regenerator2.default.awrap(this.get(userId));

            case 6:
              data = _context2.sent;

            case 7:
              if (data) {
                _context2.next = 11;
                break;
              }

              return _context2.abrupt('return', this.create(options));

            case 11:
              delete options.id;
              return _context2.abrupt('return', this.update(userId, options, data));

            case 13:
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
      var schema, result, error, data, key;
      return _regenerator2.default.async(function update$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              schema = joi.object({
                name: joi.string().default(null).empty(''),
                email: joi.string().default(null).empty('')
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

              _context3.next = 8;
              return _regenerator2.default.awrap(this.get(userId));

            case 8:
              data = _context3.sent;

              for (key in options) {
                if (options[key] !== null) {
                  data[key] = options[key];
                }
              }

              data['id'] = userId;

              _context3.next = 13;
              return _regenerator2.default.awrap(this.create(data));

            case 13:
              return _context3.abrupt('return', data);

            case 14:
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
              oldAccount = this.config.paratii.getAccount();
              _context4.next = 4;
              return _regenerator2.default.awrap(paratii.vids.search({ owner: oldAccount }));

            case 4:
              search = _context4.sent;
              vids = search && search.results;
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
              return _regenerator2.default.awrap(paratii.eth.tcr.didVideoApply(videoId));

            case 22:
              didVideoApply = _context4.sent;

              if (!didVideoApply) {
                _context4.next = 26;
                break;
              }

              _context4.next = 26;
              return _regenerator2.default.awrap(paratii.eth.tcr.exit(videoId));

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