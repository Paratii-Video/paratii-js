'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiCoreVids = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dopts = require('default-options');

/**
 * ParatiiCoreVids
 *
 */

var ParatiiCoreVids = exports.ParatiiCoreVids = function () {
  function ParatiiCoreVids(config) {
    (0, _classCallCheck3.default)(this, ParatiiCoreVids);

    var defaults = {
      'db.provider': null
    };
    var options = dopts(config, defaults, { allowUnknown: true });
    this.config = options;
    this.paratii = this.config.paratii;
  }

  (0, _createClass3.default)(ParatiiCoreVids, [{
    key: 'create',
    value: function create(options) {
      var defaults;
      return _regenerator2.default.async(function create$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              defaults = {
                id: String,
                owner: String,
                price: Number,
                title: String,
                file: String
              };


              options = dopts(options, defaults);
              _context.next = 4;
              return _regenerator2.default.awrap(this.paratii.ipfs.add({
                title: options.title
              }));

            case 4:
              _context.next = 6;
              return _regenerator2.default.awrap(this.paratii.eth.vids.create({
                id: options.id,
                owner: options.owner,
                price: options.price,
                ipfsHash: ''
              }));

            case 6:
              return _context.abrupt('return', options.id);

            case 7:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }
  }]);
  return ParatiiCoreVids;
}();