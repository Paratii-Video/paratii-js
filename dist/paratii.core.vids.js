'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var dopts = require('default-options');

/**
 * ParatiiCoreVids
 *
 */

var ParatiiCoreVids = exports.ParatiiCoreVids = function () {
  function ParatiiCoreVids(config) {
    _classCallCheck(this, ParatiiCoreVids);

    var defaults = {
      'db.provider': null
    };
    var options = dopts(config, defaults, { allowUnknown: true });
    this.config = options;
  }

  _createClass(ParatiiCoreVids, [{
    key: 'create',
    value: function create(options) {
      var defaults;
      return regeneratorRuntime.async(function create$(_context) {
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
              return regeneratorRuntime.awrap(this.config.paratii.eth.vids.create({
                id: options.id,
                owner: options.owner,
                price: options.price
              }));

            case 4:
              return _context.abrupt('return', options.id);

            case 5:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }
  }]);

  return ParatiiCoreVids;
}();