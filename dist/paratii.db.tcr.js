'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiDbTcr = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('./paratii.db.tcr.challenges.js'),
    ParatiiDbTcrChallenges = _require.ParatiiDbTcrChallenges;

var _require2 = require('./paratii.db.tcr.votes.js'),
    ParatiiDbTcrVotes = _require2.ParatiiDbTcrVotes;

/**
 * ParatiiDbUsers contains functionalities regarding the videos to interact with the Paratii Blockchain Index
 * @param {Object} config object to initialize Paratii object
 */


var ParatiiDbTcr = exports.ParatiiDbTcr = function ParatiiDbTcr(config) {
  (0, _classCallCheck3.default)(this, ParatiiDbTcr);

  this.config = config;
  this.api = 'tcr/';
  this.challenges = new ParatiiDbTcrChallenges(this.config);
  this.votes = new ParatiiDbTcrVotes(this.config);
};