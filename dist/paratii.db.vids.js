'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiDbVids = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * ParatiiDb contains a functionality to interact with the Paratii Blockchain Index
 *
 */

var fetch = require('isomorphic-fetch');

var ParatiiDbVids = exports.ParatiiDbVids = function () {
  function ParatiiDbVids(config) {
    (0, _classCallCheck3.default)(this, ParatiiDbVids);

    this.config = config;
    this.apiVersion = '/api/v1/';
    this.apiVideos = 'videos/';
  }

  (0, _createClass3.default)(ParatiiDbVids, [{
    key: 'get',
    value: function get(videoId) {
      var videos;
      return _regenerator2.default.async(function get$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              videos = fetch(this.config['db.provider'] + this.apiVersion + this.apiVideos + videoId, {
                method: 'get'
              }).then(function (response) {
                return response.json();
              });
              return _context.abrupt('return', videos);

            case 2:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'search',
    value: function search() {
      var videos;
      return _regenerator2.default.async(function search$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              videos = fetch(this.config['db.provider'] + this.apiVersion + this.apiVideos, {
                method: 'get'
              }).then(function (response) {
                return response.json();
              });
              return _context2.abrupt('return', videos);

            case 2:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }]);
  return ParatiiDbVids;
}();