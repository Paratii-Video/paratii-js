'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiDbUsers = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fetch = require('isomorphic-fetch');
/**
 * ParatiiDbUsers contains functionalities regarding the users to interact with the Paratii Blockchain Index
 * @param {Object} config object to initialize Paratii object
 */

var ParatiiDbUsers = exports.ParatiiDbUsers = function () {
  function ParatiiDbUsers(config) {
    (0, _classCallCheck3.default)(this, ParatiiDbUsers);

    this.config = config;
    this.apiUsers = 'users/';
    this.apiVideos = '/videos';
  }

  /**
   * retrieve data about the user
   * @param  {string}  userId user univocal id
   * @return {Promise}        data about the user
   * @example await paratii.db.users.get('some-user-id')
   */


  (0, _createClass3.default)(ParatiiDbUsers, [{
    key: 'get',
    value: function get(userId) {
      var users;
      return _regenerator2.default.async(function get$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _regenerator2.default.awrap(fetch(this.config.db.provider + this.apiUsers + userId, {
                method: 'get'
              }).then(function (response) {
                return response.json();
              }));

            case 2:
              users = _context.sent;
              return _context.abrupt('return', users);

            case 4:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }
    /**
     * save the email of a user in the database
     *
     * @param  {string}  userId user univocal id
     * @param  {string}  email user email
     * @return {Promise}        data about the user
     * @example await paratii.db.users.setEmail('some-user-id', 'some@email.com')
     */

  }, {
    key: 'setEmail',
    value: function setEmail(userId, email) {
      var paratii, signer, signature, body, response;
      return _regenerator2.default.async(function setEmail$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              paratii = this.config.paratii;
              signer = paratii.getAccount();
              _context2.next = 4;
              return _regenerator2.default.awrap(paratii.eth.distributor.signMessage(email));

            case 4:
              signature = _context2.sent;
              body = 'email=' + email + '&signedEmail=' + signature + '&whosigned=' + signer;
              _context2.next = 8;
              return _regenerator2.default.awrap(fetch(this.config.db.provider + this.apiUsers + userId, {
                method: 'POST',
                body: body
              }));

            case 8:
              response = _context2.sent;
              return _context2.abrupt('return', response.json());

            case 10:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }

    /**
     * get information about all the videos of the user
     * @param  {string}  userId univocal user identifier
     * @return {Promise}        Collection of all the videos of the user
     * @example await paratii.db.users.videos('some-user-id')
     */

  }, {
    key: 'videos',
    value: function videos(userId) {
      var users;
      return _regenerator2.default.async(function videos$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return _regenerator2.default.awrap(fetch(this.config.db.provider + this.apiVersion + this.apiUsers + userId + this.apiVideos, {
                method: 'get'
              }).then(function (response) {
                return response.json();
              }));

            case 2:
              users = _context3.sent;
              return _context3.abrupt('return', users);

            case 4:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }]);
  return ParatiiDbUsers;
}();