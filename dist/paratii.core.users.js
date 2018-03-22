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
 * ParatiiCoreUsers
 *
 */

var ParatiiCoreUsers = exports.ParatiiCoreUsers = function () {
  function ParatiiCoreUsers(config) {
    (0, _classCallCheck3.default)(this, ParatiiCoreUsers);

    var schema = joi.object({
      'db.provider': joi.string().default(null)
    }).unknown();

    var result = joi.validate(config, schema);
    var error = result.error;
    if (error) throw error;
    this.config = result.value;
    this.paratii = this.config.paratii;
  }
  /**
   * [create description]
   * @param  {[type]}  options [description]
   * @return {Promise}         [description]
   */


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
              return _regenerator2.default.awrap(this.paratii.ipfs.addJSON(optionsIpfs));

            case 7:
              hash = _context.sent;

              optionsBlockchain['ipfsData'] = hash;
              return _context.abrupt('return', this.paratii.eth.users.create(optionsBlockchain));

            case 10:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'get',
    value: function get(id) {
      return this.paratii.db.users.get(id);
    }
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
  }]);
  return ParatiiCoreUsers;
}();