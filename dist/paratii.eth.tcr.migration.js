'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiEthTcrMigration = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ParatiiEthTcrMigration = exports.ParatiiEthTcrMigration = function () {
  function ParatiiEthTcrMigration(opts) {
    (0, _classCallCheck3.default)(this, ParatiiEthTcrMigration);

    // TODO: make this more modular by creating this.currentTcr , this.newTcr
    this.eth = opts;
  }

  (0, _createClass3.default)(ParatiiEthTcrMigration, [{
    key: 'eligibleForMigration',
    value: function eligibleForMigration(videoId) {
      var didMigrate, inPlaceholder;
      return _regenerator2.default.async(function eligibleForMigration$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _regenerator2.default.awrap(this._didMigrate(videoId));

            case 2:
              didMigrate = _context.sent;

              if (!didMigrate) {
                _context.next = 7;
                break;
              }

              return _context.abrupt('return', false);

            case 7:
              _context.next = 9;
              return _regenerator2.default.awrap(this._inTcrPlaceholder(videoId));

            case 9:
              inPlaceholder = _context.sent;

              if (!inPlaceholder) {
                _context.next = 12;
                break;
              }

              return _context.abrupt('return', true);

            case 12:
              return _context.abrupt('return', false);

            case 13:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: '_didMigrate',
    value: function _didMigrate(videoId) {
      var inTcr;
      return _regenerator2.default.async(function _didMigrate$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _regenerator2.default.awrap(this._inTcrRegistry(videoId));

            case 2:
              inTcr = _context2.sent;

              if (!inTcr) {
                _context2.next = 5;
                break;
              }

              return _context2.abrupt('return', true);

            case 5:
              return _context2.abrupt('return', false);

            case 6:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: '_inTcrPlaceholder',
    value: function _inTcrPlaceholder(videoId) {
      var isWhitelisted;
      return _regenerator2.default.async(function _inTcrPlaceholder$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return _regenerator2.default.awrap(this.eth.tcrPlaceholder.isWhitelisted(videoId));

            case 2:
              isWhitelisted = _context3.sent;

              if (!isWhitelisted) {
                _context3.next = 7;
                break;
              }

              return _context3.abrupt('return', true);

            case 7:
              return _context3.abrupt('return', false);

            case 8:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: '_inTcrRegistry',
    value: function _inTcrRegistry(videoId) {
      var isWhitelisted;
      return _regenerator2.default.async(function _inTcrRegistry$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return _regenerator2.default.awrap(this.eth.tcr.isWhitelisted(videoId));

            case 2:
              isWhitelisted = _context4.sent;

              if (!isWhitelisted) {
                _context4.next = 7;
                break;
              }

              return _context4.abrupt('return', true);

            case 7:
              return _context4.abrupt('return', false);

            case 8:
            case 'end':
              return _context4.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'migrate',
    value: function migrate(videoId) {
      return _regenerator2.default.async(function migrate$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
            case 'end':
              return _context5.stop();
          }
        }
      }, null, this);
    }
  }]);
  return ParatiiEthTcrMigration;
}();