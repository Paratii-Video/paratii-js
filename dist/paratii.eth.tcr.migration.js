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
    key: 'getMigrationStatuss',
    value: function getMigrationStatuss(address) {
      var _this = this;

      var vids, ids, idArray;
      return _regenerator2.default.async(function getMigrationStatuss$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _regenerator2.default.awrap(this.eth.config.paratii.vids.search({ owner: address }));

            case 2:
              vids = _context2.sent;
              ids = {};

              if (vids) {
                console.log('all vids:', vids.results);
              }

              idArray = vids.results.map(function (vid) {
                return vid.id;
              });

              idArray.forEach(function _callee(id) {
                return _regenerator2.default.async(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _context.next = 2;
                        return _regenerator2.default.awrap(_this.eligibleForMigration(id));

                      case 2:
                        ids[id] = _context.sent;

                      case 3:
                      case 'end':
                        return _context.stop();
                    }
                  }
                }, null, _this);
              });
              return _context2.abrupt('return', ids);

            case 8:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'eligibleForMigration',
    value: function eligibleForMigration(videoId) {
      var didMigrate, inPlaceholder;
      return _regenerator2.default.async(function eligibleForMigration$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return _regenerator2.default.awrap(this._didMigrate(videoId));

            case 2:
              didMigrate = _context3.sent;

              if (!didMigrate) {
                _context3.next = 7;
                break;
              }

              return _context3.abrupt('return', false);

            case 7:
              _context3.next = 9;
              return _regenerator2.default.awrap(this._inTcrPlaceholder(videoId));

            case 9:
              inPlaceholder = _context3.sent;

              if (!inPlaceholder) {
                _context3.next = 12;
                break;
              }

              return _context3.abrupt('return', true);

            case 12:
              return _context3.abrupt('return', false);

            case 13:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: '_didMigrate',
    value: function _didMigrate(videoId) {
      var inTcr;
      return _regenerator2.default.async(function _didMigrate$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return _regenerator2.default.awrap(this._inTcrRegistry(videoId));

            case 2:
              inTcr = _context4.sent;

              if (!inTcr) {
                _context4.next = 5;
                break;
              }

              return _context4.abrupt('return', true);

            case 5:
              return _context4.abrupt('return', false);

            case 6:
            case 'end':
              return _context4.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: '_inTcrPlaceholder',
    value: function _inTcrPlaceholder(videoId) {
      var appWasMade;
      return _regenerator2.default.async(function _inTcrPlaceholder$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return _regenerator2.default.awrap(this.eth.tcrPlaceholder.didVideoApply(videoId));

            case 2:
              appWasMade = _context5.sent;

              if (!appWasMade) {
                _context5.next = 7;
                break;
              }

              return _context5.abrupt('return', true);

            case 7:
              return _context5.abrupt('return', false);

            case 8:
            case 'end':
              return _context5.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: '_inTcrRegistry',
    value: function _inTcrRegistry(videoId) {
      var isWhitelisted;
      return _regenerator2.default.async(function _inTcrRegistry$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return _regenerator2.default.awrap(this.eth.tcr.isWhitelisted(videoId));

            case 2:
              isWhitelisted = _context6.sent;

              if (!isWhitelisted) {
                _context6.next = 7;
                break;
              }

              return _context6.abrupt('return', true);

            case 7:
              return _context6.abrupt('return', false);

            case 8:
            case 'end':
              return _context6.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'migrate',
    value: function migrate(videoId) {
      var minDeposit, hash, placeHolderContract, listing, isWhitelisted, exitTx, applyTx, updateStatus, _applyTx;

      return _regenerator2.default.async(function migrate$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return _regenerator2.default.awrap(this.eth.tcr.getMinDeposit());

            case 2:
              minDeposit = _context7.sent;
              hash = this.eth.tcr.getHash(videoId);
              _context7.next = 6;
              return _regenerator2.default.awrap(this.eth.tcrPlaceholder.getTcrContract());

            case 6:
              placeHolderContract = _context7.sent;
              _context7.next = 9;
              return _regenerator2.default.awrap(placeHolderContract.methods.listings(hash).call());

            case 9:
              listing = _context7.sent;

              if (!listing) {
                _context7.next = 41;
                break;
              }

              _context7.next = 13;
              return _regenerator2.default.awrap(this.eth.tcrPlaceholder.isWhitelisted(videoId));

            case 13:
              isWhitelisted = _context7.sent;

              if (!isWhitelisted) {
                _context7.next = 28;
                break;
              }

              _context7.next = 17;
              return _regenerator2.default.awrap(this.eth.tcrPlaceholder.exit(videoId));

            case 17:
              exitTx = _context7.sent;

              if (!exitTx) {
                _context7.next = 25;
                break;
              }

              _context7.next = 21;
              return _regenerator2.default.awrap(this.eth.tcr.checkEligiblityAndApply(videoId, this.eth.web3.utils.toWei(minDeposit.toString())));

            case 21:
              applyTx = _context7.sent;
              return _context7.abrupt('return', applyTx);

            case 25:
              throw new Error('Video ' + videoId + ' is whitelisted but can\'t exit placeHolderContract');

            case 26:
              _context7.next = 39;
              break;

            case 28:
              _context7.next = 30;
              return _regenerator2.default.awrap(this.eth.tcrPlaceholder.updateStatus(videoId));

            case 30:
              updateStatus = _context7.sent;

              if (!(updateStatus && updateStatus.events && updateStatus.events._NewVideoWhitelisted)) {
                _context7.next = 38;
                break;
              }

              _context7.next = 34;
              return _regenerator2.default.awrap(this.eth.tcr.checkEligiblityAndApply(videoId, this.eth.web3.utils.toWei(minDeposit.toString())));

            case 34:
              _applyTx = _context7.sent;
              return _context7.abrupt('return', _applyTx);

            case 38:
              throw new Error('Video ' + videoId + ' is still in applying process');

            case 39:
              _context7.next = 42;
              break;

            case 41:
              throw new Error('listing is null');

            case 42:
            case 'end':
              return _context7.stop();
          }
        }
      }, null, this);
    }
  }]);
  return ParatiiEthTcrMigration;
}();