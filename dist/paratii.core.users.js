'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiCoreUsers = undefined;

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
 * @param {Object} config configuration object to initialize Paratii object
 */

var ParatiiCoreUsers = exports.ParatiiCoreUsers = function () {
  function ParatiiCoreUsers(config) {
    (0, _classCallCheck3.default)(this, ParatiiCoreUsers);

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
   * Creates a user, fields id, name and email go to the smart contract Users, other fields are stored on IPFS.
   * @param  {userSchema}  options information about the video ( id, name, email ... )
   * @return {Promise}         the id of the newly created user
   * @example
   *            paratii.users.create({
   *              id: 'some-user-id',
   *              name: 'A user name',
   *              email: 'some@email.com',
   *              ...
   *             })
    */
  // FIXME: do some joi validation here


  (0, _createClass3.default)(ParatiiCoreUsers, [{
    key: 'create',
    value: function create(options) {
      var keysForBlockchain, optionsKeys, optionsBlockchain, optionsIpfs, hash;
      return _regenerator2.default.async(function create$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              keysForBlockchain = ['id', 'name', 'email'];
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
              _context.next = 7;
              return _regenerator2.default.awrap(this.config.paratii.ipfs.local.addJSON(optionsIpfs));

            case 7:
              hash = _context.sent;

              optionsBlockchain['ipfsData'] = hash;
              return _context.abrupt('return', this.config.paratii.eth.users.create(optionsBlockchain));

            case 10:
            case 'end':
              return _context.stop();
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
     * @param  {Object}  options updated data i.e. { name: 'A new user name' }
     * @return {Promise}         updated data about the user
     * @example paratii.users.update('some-user-id', {name: 'A new user name'})
      */

  }, {
    key: 'update',
    value: function update(userId, options) {
      var schema, result, error, data, key;
      return _regenerator2.default.async(function update$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              schema = joi.object({
                name: joi.string().default(null),
                email: joi.string().default(null)
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

              _context2.next = 8;
              return _regenerator2.default.awrap(this.get(userId));

            case 8:
              data = _context2.sent;

              for (key in options) {
                if (options[key] !== null) {
                  data[key] = options[key];
                }
              }

              data['id'] = userId;

              _context2.next = 13;
              return _regenerator2.default.awrap(this.create(data));

            case 13:
              return _context2.abrupt('return', data);

            case 14:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }

    /**
     * migrate all contract data for  paratii.config.account to a new account
     * @param newAccount Address of new account
     * @async
     */

  }, {
    key: 'migrateAccount',
    value: function migrateAccount(newAccount) {
      var paratii, oldAccount, vids, i, vid, videoId, didVideoApply, ptiBalance;
      return _regenerator2.default.async(function migrateAccount$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              // migrate the videos
              paratii = this.config.paratii;
              oldAccount = this.config.account.address;
              _context3.next = 4;
              return _regenerator2.default.awrap(paratii.vids.search({ owner: oldAccount }));

            case 4:
              vids = _context3.sent;
              _context3.t0 = _regenerator2.default.keys(vids);

            case 6:
              if ((_context3.t1 = _context3.t0()).done) {
                _context3.next = 20;
                break;
              }

              i = _context3.t1.value;
              vid = vids[i];
              videoId = vid.id || vid._id;
              _context3.next = 12;
              return _regenerator2.default.awrap(paratii.vids.update(videoId, { owner: newAccount }));

            case 12:
              _context3.next = 14;
              return _regenerator2.default.awrap(paratii.eth.tcr.didVideoApply(vid.id));

            case 14:
              didVideoApply = _context3.sent;

              if (!didVideoApply) {
                _context3.next = 18;
                break;
              }

              _context3.next = 18;
              return _regenerator2.default.awrap(paratii.eth.tcr.exit(videoId));

            case 18:
              _context3.next = 6;
              break;

            case 20:
              _context3.next = 22;
              return _regenerator2.default.awrap(paratii.eth.balanceOf(oldAccount, 'PTI'));

            case 22:
              ptiBalance = _context3.sent;
              _context3.next = 25;
              return _regenerator2.default.awrap(paratii.eth.transfer(newAccount, ptiBalance, 'PTI'));

            case 25:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }]);
  return ParatiiCoreUsers;
}();