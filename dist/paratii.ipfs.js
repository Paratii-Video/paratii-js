'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiIPFS = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _schemas = require('./schemas.js');

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

var _events = require('events');

var _paratiiIpfsRemote = require('./paratii.ipfs.remote.js');

var _paratiiIpfsLocal = require('./paratii.ipfs.local.js');

var _paratiiTranscoder = require('./paratii.transcoder.js');

var _paratiiIpfsUploaderOld = require('./paratii.ipfs.uploader.old.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

global.Buffer = global.Buffer || require('buffer').Buffer;

/**
 * Contains functions to interact with the IPFS instance.
 * @param {ParatiiIPFSSchema} config configuration object to initialize Paratii object
 */
/* global ArrayBuffer */
// import Protocol from 'paratii-protocol'

var ParatiiIPFS = exports.ParatiiIPFS = function (_EventEmitter) {
  (0, _inherits3.default)(ParatiiIPFS, _EventEmitter);

  /**
  * @typedef {Array} ParatiiIPFSSchema
  * @property {?ipfsSchema} ipfs
  * @property {?accountSchema} account
  * @property {?boolean} verbose
  */
  function ParatiiIPFS(config) {
    (0, _classCallCheck3.default)(this, ParatiiIPFS);

    var _this = (0, _possibleConstructorReturn3.default)(this, (ParatiiIPFS.__proto__ || (0, _getPrototypeOf2.default)(ParatiiIPFS)).call(this));

    var schema = _joi2.default.object({
      ipfs: _schemas.ipfsSchema,
      account: _schemas.accountSchema,
      verbose: _joi2.default.bool().default(true)
    });

    var result = _joi2.default.validate(config, schema, { allowUnknown: true });
    if (result.error) throw result.error;
    _this.config = config;
    _this.config.ipfs = result.value.ipfs;
    _this.config.account = result.value.account;
    _this.config.ipfsInstance = _this;
    _this.local = new _paratiiIpfsLocal.ParatiiIPFSLocal(config);
    _this.remote = new _paratiiIpfsRemote.ParatiiIPFSRemote({ ipfs: _this.config.ipfs, paratiiIPFS: _this });
    _this.transcoder = new _paratiiTranscoder.ParatiiTranscoder({ ipfs: _this.config.ipfs, paratiiIPFS: _this });
    _this.uploader = new _paratiiIpfsUploaderOld.Uploader({ ipfs: _this.config.ipfs, paratiiIPFS: _this });
    return _this;
  }
  /**
   * log messages on the console if verbose is set
   * @param  {string} msg text to log
   * @example
   * paratii.ipfs.log("some-text")
   */


  (0, _createClass3.default)(ParatiiIPFS, [{
    key: 'log',
    value: function log() {
      if (this.config.verbose) {
        var _console;

        (_console = console).log.apply(_console, arguments);
      }
    }
    /**
     * log warns on the console if verbose is set
     * @param  {string} msg warn text
     * @example
     * paratii.ipfs.warn("some-text")
     */

  }, {
    key: 'warn',
    value: function warn() {
      if (this.config.verbose) {
        var _console2;

        (_console2 = console).warn.apply(_console2, arguments);
      }
    }
    /**
    * log errors on the console if verbose is set
    * @param  {string} msg error message
    * @example
    * paratii.ipfs.error("some-text")
    */

  }, {
    key: 'error',
    value: function error() {
      if (this.config.verbose) {
        var _console3;

        (_console3 = console).error.apply(_console3, arguments);
      }
    }

    /**
     * add a JSON to local IPFS instance, sends a message to paratii.config.ipfs.remoteIPFSNode to pin the mesage
     * @param  {object}  data JSON object to store
     * @return {Promise} resolves in the hash of the added file, after confirmation from the remove node
     * @example let hash = await paratii.ipfs.addAndPinJSON(data)
     */

  }, {
    key: 'addAndPinJSON',
    value: function addAndPinJSON(data) {
      var _this2 = this;

      var hash, pinFile, pinEv;
      return _regenerator2.default.async(function addAndPinJSON$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _regenerator2.default.awrap(this.addJSON(data));

            case 2:
              hash = _context.sent;

              pinFile = function pinFile() {
                var pinEv = _this2.remote.pinFile(hash, { author: _this2.config.account.address });
                pinEv.on('pin:error', function (err) {
                  console.warn('pin:error:', hash, ' : ', err);
                  pinEv.removeAllListeners();
                });
                pinEv.on('pin:done', function (hash) {
                  _this2.log('pin:done:', hash);
                  pinEv.removeAllListeners();
                });
                return pinEv;
              };

              pinEv = pinFile();


              pinEv.on('pin:error', function (err) {
                console.warn('pin:error:', hash, ' : ', err);
                console.log('trying again');
                pinEv = pinFile();
              });

              return _context.abrupt('return', hash);

            case 7:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }
  }]);
  return ParatiiIPFS;
}(_events.EventEmitter);