'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiDbTcrVotes = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var joi = require('joi');

var fetch = require('isomorphic-fetch');

/**
 * ParatiiDbTcrVotes contains functionalities regarding the videos to interact with the Paratii Blockchain Index
 * @param {Object} config object to initialize Paratii object
 */

var ParatiiDbTcrVotes = exports.ParatiiDbTcrVotes = function () {
  function ParatiiDbTcrVotes(config) {
    (0, _classCallCheck3.default)(this, ParatiiDbTcrVotes);

    this.config = config;
    this.api = 'votes/';
  }
  /**
   * Get information about this particular vote
   * @param  {string}  pollID id of the challenge
   * @param  {string}  voter address of the user that has submitted the vote
   * @return {Promise<Object>}         data about the video
   * @example await paratii.db.vids.get('some-video-id')
   */


  (0, _createClass3.default)(ParatiiDbTcrVotes, [{
    key: 'get',
    value: function get(pollID, voter) {
      var response;
      return _regenerator2.default.async(function get$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _regenerator2.default.awrap(this.search({ pollID: pollID, voter: voter }));

            case 2:
              response = _context.sent;

              if (!(response.total === 0)) {
                _context.next = 7;
                break;
              }

              return _context.abrupt('return', null);

            case 7:
              if (!(response.total > 1)) {
                _context.next = 9;
                break;
              }

              throw Error('Something unexpected occurred: found ' + response.total + ' votes challenge ' + pollID + ' and account ' + voter + ' (expected 0 or 1)');

            case 9:
              return _context.abrupt('return', response.results[0]);

            case 10:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }

    /**
     *  Search for challenges Search for challenges Search for challenges Search for challenges
     */

  }, {
    key: 'search',
    value: function search(options) {
      var schema, parsedOptions, error, queryString, keyword, url, response;
      return _regenerator2.default.async(function search$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              schema = joi.object({
                'pollID': joi.string().empty(),
                'voter': joi.string().empty(),
                'offset': joi.number().integer().empty(),
                'limit': joi.number().integer().empty()
              });
              parsedOptions = joi.validate(options, schema);
              error = parsedOptions.error;

              if (!error) {
                _context2.next = 5;
                break;
              }

              throw error;

            case 5:
              queryString = '';

              for (keyword in options) {
                queryString += keyword + '=' + parsedOptions.value[keyword];
                queryString += '&';
              }
              if (queryString !== '') {
                queryString = queryString.slice(0, -1); // remove the last &
                queryString = '?' + queryString;
              }
              url = this.config.db.provider + this.api + queryString;
              _context2.next = 11;
              return _regenerator2.default.awrap(fetch(url, { method: 'get' }));

            case 11:
              response = _context2.sent;
              return _context2.abrupt('return', response.json());

            case 13:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }]);
  return ParatiiDbTcrVotes;
}();