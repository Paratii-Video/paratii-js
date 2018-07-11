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

//
//
//
// WE FAKE THE DB RESPONSE WITH THE FIXTURES, UNTIL THE DB IS READY
var USE_FIXTURES = true;

var _require = require('../test/data/fixtures.js'),
    votesResponse = _require.votesResponse,
    votesponseForVideoId = _require.votesponseForVideoId;

var joi = require('joi');

var fetch = require('isomorphic-fetch');

/**
 * ParatiiDbUsers contains functionalities regarding the videos to interact with the Paratii Blockchain Index
 * @param {Object} config object to initialize Paratii object
 */

var ParatiiDbTcrVotes = exports.ParatiiDbTcrVotes = function () {
  function ParatiiDbTcrVotes(config) {
    (0, _classCallCheck3.default)(this, ParatiiDbTcrVotes);

    this.config = config;
    this.api = 'tcr/challenges/';
  }
  /**
   * Get informatino about any currently active challenge
   * @param  {string}  videoId id of the video
   * @return {Promise}         data about the video
   * @example await paratii.db.vids.get('some-video-id')
   */


  (0, _createClass3.default)(ParatiiDbTcrVotes, [{
    key: 'get',
    value: function get(videoId) {
      var response;
      return _regenerator2.default.async(function get$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _regenerator2.default.awrap(this.search({ videoId: videoId }));

            case 2:
              response = _context.sent;

              if (!(response.total === 0)) {
                _context.next = 7;
                break;
              }

              throw Error('Did not find a challenge for video with id ' + videoId);

            case 7:
              if (!(response.total > 1)) {
                _context.next = 9;
                break;
              }

              throw Error('Something unexpected occurred: found ' + response.total + ' challenges for video with id ' + videoId);

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
                'videoId': joi.string().empty(),
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

              if (!USE_FIXTURES) {
                _context2.next = 15;
                break;
              }

              if (!(parsedOptions.value && parsedOptions.value.videoId)) {
                _context2.next = 14;
                break;
              }

              return _context2.abrupt('return', votesponseForVideoId);

            case 14:
              return _context2.abrupt('return', votesResponse);

            case 15:
              _context2.next = 17;
              return _regenerator2.default.awrap(fetch(url, { method: 'get' }));

            case 17:
              response = _context2.sent;
              return _context2.abrupt('return', response.json());

            case 19:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }]);
  return ParatiiDbTcrVotes;
}();