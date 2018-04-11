/* global File, ArrayBuffer */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiIPFSLocal = undefined;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

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

var _events = require('events');

var _utils = require('./utils.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var pull = require('pull-stream');
var pullFilereader = require('pull-filereader');
var toPull = require('stream-to-pull-stream');
var fs = require('fs');
var path = require('path');

var _require = require('async'),
    eachSeries = _require.eachSeries,
    nextTick = _require.nextTick;

var once = require('once');

/**
 * IPFS UPLOADER : Paratii IPFS uploader interface.
 * @extends EventEmitter
 * @param {ParatiiIPFSUploaderSchema} opts
 */

var ParatiiIPFSLocal = exports.ParatiiIPFSLocal = function (_EventEmitter) {
  (0, _inherits3.default)(ParatiiIPFSLocal, _EventEmitter);

  /**
  * @typedef {Array} ParatiiIPFSUploaderSchema
  * @property {?ipfsSchema} ipfs
  * @property {?Object} ParatiiIPFS
  */
  function ParatiiIPFSLocal(config) {
    (0, _classCallCheck3.default)(this, ParatiiIPFSLocal);

    // const schema = joi.object({
    //   ipfs: ipfsSchema,
    //   paratiiIPFS: joi.object().optional()
    // //   onReadyHook: joi.array().ordered().default([]),
    // //   protocol: joi.string().default(null),
    // })
    // const result = joi.validate(opts, schema, {allowUnknown: true})
    // if (result.error) throw result.error
    // this.config = result.value
    var _this = (0, _possibleConstructorReturn3.default)(this, (ParatiiIPFSLocal.__proto__ || (0, _getPrototypeOf2.default)(ParatiiIPFSLocal)).call(this));

    _this.config = config;
    _this._ipfs = _this.config.ipfsInstance;
    return _this;
  }

  /**
   * uploads a single file to *local* IPFS node
   * @param {File} file HTML5 File Object.
   * @returns {EventEmitter} checkout the upload function below for details.
   * @example let uploaderEv = paratiiIPFS.uploader.add(files)
    */


  (0, _createClass3.default)(ParatiiIPFSLocal, [{
    key: 'add',
    value: function add(file) {
      var _this2 = this;

      var p = new _utils.PromiseEventEmitter(function (resolve, reject) {
        // return new Promise((resolve, reject) => {
        var files = void 0;
        if (Array.isArray(file)) {
          files = file;
        } else {
          files = [file];
        }

        var result = [];
        for (var i = 0; i < files.length; i++) {
          // check if File is actually available or not.
          // if not it means we're not in the browser land.
          if (typeof File !== 'undefined') {
            if (files[i] instanceof File) {
              result.push(_this2.html5FileToPull(files[i]));
            } else {
              result.push(_this2.fsFileToPull(files[i]));
            }
          } else {
            result.push(_this2.fsFileToPull(files[i]));
          }
        }
        var ev = _this2.upload(result, _this2);
        ev.on('done', function (hashedFiles) {
          return resolve(hashedFiles);
        });
        ev.on('error', function (err) {
          return reject(err);
        });
      });
      return p;
    }

    /**
     * upload an Array of files as is to the local IPFS node
     * @param  {Array} files    HTML5 File Object Array.
     * @return {EventEmitter} returns EventEmitter with the following events:
     *    - 'start': uploader started.
     *    - 'progress': (chunkLength, progressPercent)
     *    - 'fileReady': (file) triggered when a file is uploaded locally.
     *    - 'done': (files) triggered when the uploader is done locally.
     *    - 'error': (err) triggered whenever an error occurs.
     * @example ?
     */

  }, {
    key: 'upload',
    value: function upload(files, ev) {
      var _this3 = this;

      var meta = {}; // holds File metadata.
      if (!ev) {
        ev = new _events.EventEmitter();
      }

      this._ipfs.start().then(function () {
        // trigger onStart callback
        ev.emit('start');
        if (files && files[0] && files[0].size > _this3.config.ipfs.maxFileSize) {
          ev.emit('error', 'file size is larger than the allowed ' + _this3.config.ipfs.maxFileSize / 1024 / 1024 + 'MB');
          return;
        }

        pull(pull.values(files), pull.through(function (file) {
          _this3._ipfs.log('Adding ', file);
          meta.fileSize = file.size;
          meta.total = 0;
        }), pull.asyncMap(function (file, cb) {
          return pull(pull.values([{
            path: file.name,
            // content: pullFilereader(file)
            content: pull(file._pullStream, pull.through(function (chunk) {
              return ev.emit('progress2', chunk.length, Math.floor((meta.total += chunk.length) * 1.0 / meta.fileSize * 100));
            }))
          }]), _this3._ipfs._node.files.addPullStream({ chunkerOptions: { maxChunkSize: _this3.config.ipfs.chunkSize } }), // default size 262144
          pull.collect(function (err, res) {
            if (err) {
              return ev.emit('error', err);
            }

            var hashedFile = res[0];
            _this3._ipfs.log('Adding %s finished as %s, size: %s', hashedFile.path, hashedFile.hash, hashedFile.size);

            if (file._html5File) {
              _this3.xhrUpload(file, hashedFile, ev);
            } else {
              ev.emit('fileReady', hashedFile);
            }

            cb(null, hashedFile);
          }));
        }), pull.collect(function (err, hashedFiles) {
          if (err) {
            ev.emit('error', err);
          }
          _this3._ipfs.log('uploader is DONE');
          ev.emit('done', hashedFiles);
        }));
      });

      return ev;
    }

    /**
     * upload an entire directory to IPFS
     * @param  {string}   dirPath path to directory
     * @return {Promise}           returns the {multihash, path, size} for the uploaded folder.
     * @example ?
     */

  }, {
    key: 'addDirectory',
    value: function addDirectory(dirPath) {
      var _this4 = this;

      return new _promise2.default(function (resolve, reject) {
        // cb = once(cb)
        var resp = null;
        // this._ipfs.log('adding ', dirPath, ' to IPFS')

        var addStream = _this4._ipfs._node.files.addReadableStream();
        addStream.on('data', function (file) {
          // this._ipfs.log('dirPath ', dirPath)
          // this._ipfs.log('file Added ', file)
          if (file.path === dirPath) {
            // this._ipfs.log('this is the hash to return ')
            resp = file;
            nextTick(function () {
              return resolve(resp);
            });
          }
        });

        addStream.on('end', function () {
          // this._ipfs.log('addStream ended')
          // nextTick(() => cb(null, resp))
        });

        fs.readdir(dirPath, function (err, files) {
          if (err) return reject(err);
          eachSeries(files, function (file, next) {
            next = once(next);
            try {
              _this4._ipfs.log('reading file ', file);
              var rStream = fs.createReadStream(path.join(dirPath, file));
              rStream.on('error', function (err) {
                if (err) {
                  _this4._ipfs.error('rStream Error ', err);
                  return next();
                }
              });
              if (rStream) {
                addStream.write({
                  path: path.join(dirPath, file),
                  content: rStream
                });
              }
            } catch (e) {
              if (e) {
                _this4._ipfs.error('createReadStream Error: ', e);
              }
            } finally {}
            // next()
            nextTick(function () {
              return next();
            });
          }, function (err) {
            if (err) return reject(err);
            // addStream.destroy()
            addStream.end();
          });
        });
      });
    }
    /**
     * get file from ipfs
     * @param  {string}  hash ipfs multihash of the file
     * @return {Promise}      the file (path,content)
     * @example
     * let result = await paratiiIPFS.add(fileStream)
     * let hash = result[0].hash
     * let fileContent = await paratiiIPFS.get(hash)
     */

  }, {
    key: 'get',
    value: function get(hash) {
      var ipfs;
      return _regenerator2.default.async(function get$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _regenerator2.default.awrap(this._ipfs.getIPFSInstance());

            case 2:
              ipfs = _context.sent;
              return _context.abrupt('return', ipfs.files.get(hash));

            case 4:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }

    /**
    * gets a JSON object stored in IPFS
    * @param  {string}  multihash ipfs multihash of the object
    * @return {Promise}           requested Object
    * @example let jsonObj = await paratii.ipfs.getJSON('some-multihash')
    */

  }, {
    key: 'getJSON',
    value: function getJSON(multihash) {
      var ipfs, node;
      return _regenerator2.default.async(function getJSON$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _regenerator2.default.awrap(this._ipfs.getIPFSInstance());

            case 2:
              ipfs = _context2.sent;
              node = void 0;
              _context2.prev = 4;
              _context2.next = 7;
              return _regenerator2.default.awrap(ipfs.files.cat(multihash));

            case 7:
              node = _context2.sent;
              _context2.next = 14;
              break;

            case 10:
              _context2.prev = 10;
              _context2.t0 = _context2['catch'](4);

              if (!_context2.t0) {
                _context2.next = 14;
                break;
              }

              throw _context2.t0;

            case 14:
              return _context2.abrupt('return', JSON.parse(node.toString()));

            case 15:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this, [[4, 10]]);
    }

    /**
     * adds a data Object to the IPFS local instance
     * @param  {Object}  data JSON object to store
     * @return {Promise} promise that resolves as the ipfs multihash
     * @example let result = await paratii.ipfs.local.addJSON(data)
     */

  }, {
    key: 'addJSON',
    value: function addJSON(data) {
      var ipfs, obj, node;
      return _regenerator2.default.async(function addJSON$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return _regenerator2.default.awrap(this._ipfs.getIPFSInstance());

            case 2:
              ipfs = _context3.sent;
              obj = {
                Data: Buffer.from((0, _stringify2.default)(data)),
                Links: []
              };
              node = void 0;
              _context3.prev = 5;
              _context3.next = 8;
              return _regenerator2.default.awrap(ipfs.files.add(obj.Data));

            case 8:
              node = _context3.sent;
              _context3.next = 15;
              break;

            case 11:
              _context3.prev = 11;
              _context3.t0 = _context3['catch'](5);

              if (!_context3.t0) {
                _context3.next = 15;
                break;
              }

              throw _context3.t0;

            case 15:
              return _context3.abrupt('return', node[0].hash);

            case 16:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this, [[5, 11]]);
    }

    /**
     * returns a generic File Object with a Pull Stream from an HTML5 File
     * @param  {File} file  HTML5 File Object
     * @return {Object}      generic file object.
     * @example ?
      */

  }, {
    key: 'html5FileToPull',
    value: function html5FileToPull(file) {
      return {
        name: file.name,
        size: file.size,
        path: file.path,
        _html5File: file,
        _pullStream: pullFilereader(file)
      };
    }

    /**
     * returns a generic file Object from a file path
     * @param  {string} filePath Path to file.
     * @return {Object} generic file object.
     * @example ?
      */

  }, {
    key: 'fsFileToPull',
    value: function fsFileToPull(filePath) {
      var stats = fs.statSync(filePath);
      if (stats) {
        return {
          name: path.basename(filePath),
          size: stats.size,
          _pullStream: toPull(fs.createReadStream(filePath))
        };
      } else {
        return null;
      }
    }

    /**
     * log messages on the console if verbose is set
     * @param  {string} msg text to log
     * @example
     * paratii.ipfs.log("some-text")
     */

  }, {
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
  }]);
  return ParatiiIPFSLocal;
}(_events.EventEmitter);