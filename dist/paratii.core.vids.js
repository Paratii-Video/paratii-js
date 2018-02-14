'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiCoreVids = undefined;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

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
    //
    // this._defaults = {
    //   id: undefined, // must be a string
    //   owner: String, // must be a string
    //   price: 0, // must be a number, optional, default is 0
    //   title: String, // must be a string
    //   descripton: undefined, // must be a string, optional
    //   file: null, // must be string, optional
    //   ipfsHash: '' // must be a string, optional, default is ''
    // }
  }

  (0, _createClass3.default)(ParatiiCoreVids, [{
    key: 'like',
    value: function like(videoId) {
      return this.paratii.eth.vids.like(videoId);
    }
  }, {
    key: 'dislike',
    value: function dislike(videoId) {
      return this.paratii.eth.vids.dislike(videoId);
    }
  }, {
    key: 'doesLike',
    value: function doesLike(videoId) {
      return this.paratii.eth.vids.doesLike(videoId);
    }
  }, {
    key: 'hasViewedVideo',
    value: function hasViewedVideo(viewer, videoId) {
      return this.paratii.eth.vids.userViewedVideo({ viewer: viewer, videoId: videoId });
    }
  }, {
    key: 'doesDislike',
    value: function doesDislike(videoId) {
      return this.paratii.eth.vids.doesDislike(videoId);
    }
  }, {
    key: 'create',
    value: function create(options) {
      var defaults, hash;
      return _regenerator2.default.async(function create$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              defaults = {
                id: null, // optional, a string
                owner: undefined, // must be a string
                price: 0, // must be a number, optional, default is 0
                title: undefined, // must be a string
                description: null, // must be a string, optional
                file: null, // must be string, optional
                ipfsHashOrig: '', // must be a string, optional, default is ''
                ipfsHash: '' // must be a string, optional, default is ''
              };


              options = dopts(options, defaults);

              if (options.id === null) {
                options.id = this.paratii.eth.vids.makeId();
              }

              _context.next = 5;
              return _regenerator2.default.awrap(this.paratii.ipfs.addJSON({
                title: options.title,
                description: options.description
              }));

            case 5:
              hash = _context.sent;


              options.ipfsData = hash;
              _context.next = 9;
              return _regenerator2.default.awrap(this.paratii.eth.vids.create({
                id: options.id,
                owner: options.owner,
                price: options.price,
                ipfsHashOrig: options.ipfsHashOrig,
                ipfsHash: options.ipfsHash,
                ipfsData: options.ipfsData
              }));

            case 9:
              return _context.abrupt('return', options);

            case 10:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'update',
    value: function update(videoId, options) {
      var defaults, data, key;
      return _regenerator2.default.async(function update$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              defaults = {
                description: null,
                owner: null, // must be a string, optional
                price: null, // must be a number, optional, default is 0
                title: null, // must be a string, optional
                file: null, // must be string, optional
                ipfsHashOrig: '', // must be a string, optional, default is ''
                ipfsHash: null // must be a string, optional, default is ''
              };

              options = dopts(options, defaults);

              _context2.next = 4;
              return _regenerator2.default.awrap(this.get(videoId));

            case 4:
              data = _context2.sent;

              delete data['ipfsData'];
              for (key in options) {
                if (options[key] !== null) {
                  data[key] = options[key];
                }
              }

              _context2.next = 9;
              return _regenerator2.default.awrap(this.create(data));

            case 9:
              return _context2.abrupt('return', data);

            case 10:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'view',
    value: function view(options) {
      var keysForBlockchain, optionsKeys, optionsBlockchain, optionsIpfs, hash;
      return _regenerator2.default.async(function view$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              keysForBlockchain = ['viewer', 'videoId'];
              optionsKeys = (0, _keys2.default)(options);
              optionsBlockchain = {};
              optionsIpfs = {};

              optionsKeys.forEach(function (key) {
                if (keysForBlockchain.includes(key)) {
                  optionsBlockchain[key] = options[key];
                } else {
                  optionsIpfs[key] = options[key];
                }
              });
              _context3.next = 7;
              return _regenerator2.default.awrap(this.paratii.ipfs.addJSON(optionsIpfs));

            case 7:
              hash = _context3.sent;

              optionsBlockchain['ipfsData'] = hash;
              return _context3.abrupt('return', this.paratii.eth.vids.view(optionsBlockchain));

            case 10:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'get',
    value: function get(videoId) {
      return _regenerator2.default.async(function get$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              return _context4.abrupt('return', this.paratii.db.vids.get(videoId));

            case 1:
            case 'end':
              return _context4.stop();
          }
        }
      }, null, this);
    }
  }]);
  return ParatiiCoreVids;
}();