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

var _schemas = require('./schemas.js');

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Utilities to create and manipulate information about the videos on the blockchain.
 * @param {Object} config configuration object to initialize Paratii object
 * @class paratii.core.vids
 */
var ParatiiCoreVids = exports.ParatiiCoreVids = function () {
  function ParatiiCoreVids(config) {
    (0, _classCallCheck3.default)(this, ParatiiCoreVids);

    // const schema = joi.object({
    //   'db.provider': joi.string().default(null)
    // }).unknown()
    //
    // const result = joi.validate(config, schema)
    // const error = result.error
    // if (error) throw error
    // let options = result.value

    this.config = config;
    this.paratii = this.config.paratii;
  }
  /**
   * Writes a like for the video on the blockchain (contract Likes), and negates a dislike for the video, if it exists.
   * @param  {String} videoId univocal video identifier
   * @return {Object}         information about the transaction recording the like
   * @example paratii.core.vids.like('some-video-id')
   * @memberof paratii.core.vids
   */


  (0, _createClass3.default)(ParatiiCoreVids, [{
    key: 'like',
    value: function like(videoId) {
      return this.paratii.eth.vids.like(videoId);
    }
    /**
     * Writes a dislike for the video on the blockchain (contract Likes), and negates a like for the video, if it exists.
     * @param  {String} videoId univocal video identifier
     * @return {Object}         information about the transaction recording the dislike
     * @example paratii.core.vids.dislike('some-video-id')
     * @memberof paratii.core.vids
     */

  }, {
    key: 'dislike',
    value: function dislike(videoId) {
      return this.paratii.eth.vids.dislike(videoId);
    }
    /**
     * Check if the current user has already liked the video
     * @param  {String} videoId univocal video identifier
     * @return {Boolean}         true if the current user already liked the video, false otherwise
     * @example paratii.core.vids.doesLike('some-video-id')
     * @memberof paratii.core.vids
     */

  }, {
    key: 'doesLike',
    value: function doesLike(videoId) {
      return this.paratii.eth.vids.doesLike(videoId);
    }
    /**
     * Check if the viewer has already viewed the video
     * @param  {String}  viewer  viewer address
     * @param  {String}  videoId univocal video identifier
     * @return {Boolean}         true if the current user already viewed the video, false otherwise
     * @example paratii.core.vids.hasViewedVideo('some-user-id','some-video-id')
     * @memberof paratii.core.vids
     */

  }, {
    key: 'hasViewedVideo',
    value: function hasViewedVideo(viewer, videoId) {
      return this.paratii.eth.vids.userViewedVideo({ viewer: viewer, videoId: videoId });
    }
    /**
     * Check if the current user has already disliked the video
     * @param  {String} videoId univocal video identifier
     * @return {Boolean}         true if the current user already disliked the video, false otherwise
     * @example paratii.core.vids.doesDislike('some-video-id')
     * @memberof paratii.core.vids
    */

  }, {
    key: 'doesDislike',
    value: function doesDislike(videoId) {
      return this.paratii.eth.vids.doesDislike(videoId);
    }
    /**
     * This call will register the video on the blockchain, add its metadata to IPFS, upload file to IPFS, and transcode it
     * @param  {Object}  options information about the video ( id, title, FilePath ... )
     * @return {Promise}         information about the video ( id, owner, ipfsHash ... )
     * @example paratii.core.vids.create({
     *  id: 'some-video-id',
     *  owner: 'some-user-id',
     *  title: 'some Title',
     *  author: 'Steven Spielberg',
     *  duration: '2h 32m',
     *  description: 'A long description',
     *  price: 0,
     *  file: 'test/data/some-file.txt'
     * })
     * @memberof paratii.core.vids
     */

  }, {
    key: 'create',
    value: function create() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var validation, hash;
      return _regenerator2.default.async(function create$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              validation = _joi2.default.validate(options, _schemas.videoSchema);

              if (!validation.error) {
                _context.next = 3;
                break;
              }

              throw validation.error;

            case 3:
              options = validation.value;

              if (options.id === null) {
                options.id = this.paratii.eth.vids.makeId();
              }

              _context.next = 7;
              return _regenerator2.default.awrap(this.paratii.ipfs.addAndPinJSON({
                author: options.author,
                description: options.description,
                duration: options.duration,
                filename: options.filename,
                filesize: options.filesize,
                free: options.free,
                storageStatus: options.storageStatus,
                title: options.title,
                transcodingStatus: options.transcodingStatus,
                uploadStatus: options.uploadStatus,
                thumbnails: options.thumbnails
              }));

            case 7:
              hash = _context.sent;


              options.ipfsData = hash;

              _context.next = 11;
              return _regenerator2.default.awrap(this.paratii.eth.vids.create({
                id: options.id,
                owner: options.owner,
                price: options.price,
                ipfsHashOrig: options.ipfsHashOrig,
                ipfsHash: options.ipfsHash,
                ipfsData: options.ipfsData
              }));

            case 11:
              return _context.abrupt('return', options);

            case 12:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }
    /**
     * Update the information on the video.
     *  Only the account that has registered the video, or the owner of the contract, can update the information.
     * @param  {String}  videoId      univocal video identifier
     * @param  {Object}  options      key value pairs of properties and new values e.g. ({title: 'another-title'})
     * @param  {Object}  dataToUpdate optional. old data of the video. If not passed to the method, it will fetch the data itself using the videoId
     * @return {Promise}              Updated video informations
     * @example paratii.core.vids.update('some-video-id', {title: 'another-title'})
     * @memberof paratii.core.vids
     */

  }, {
    key: 'update',
    value: function update(videoId, options, dataToUpdate) {
      var data, elements, dataToSave;
      return _regenerator2.default.async(function update$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              data = void 0;

              if (!dataToUpdate) {
                _context2.next = 5;
                break;
              }

              data = dataToUpdate;
              _context2.next = 8;
              break;

            case 5:
              _context2.next = 7;
              return _regenerator2.default.awrap(this.get(videoId));

            case 7:
              data = _context2.sent;

            case 8:
              if (!(data === null)) {
                _context2.next = 10;
                break;
              }

              throw new Error('No video with id ' + videoId + ' to update');

            case 10:

              // FIXME: missing the validate invociation

              elements = _schemas.videoSchema._inner.children;
              dataToSave = {};


              elements.forEach(function (name) {
                var key = name.key;
                if (options[key] !== undefined) {
                  dataToSave[key] = options[key];
                } else {
                  dataToSave[key] = data[key];
                }
              });
              _context2.next = 15;
              return _regenerator2.default.awrap(this.create(dataToSave));

            case 15:
              return _context2.abrupt('return', dataToSave);

            case 16:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }
    /**
     * Update the information of the video the video already exists, otherwise it creates it
     * @param  {Object}  options video informations
     * @return {Promise}         updated/new video informations
     * @example
     * paratii.core.vids.upsert({ id: 'some-video-id', owner: 'some-user-id', title: 'videoTitle'}) //insert a new video
     * @memberof paratii.core.vids
     */

  }, {
    key: 'upsert',
    value: function upsert(options) {
      var data;
      return _regenerator2.default.async(function upsert$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              data = null;

              if (!options.id) {
                _context3.next = 5;
                break;
              }

              _context3.next = 4;
              return _regenerator2.default.awrap(this.get(options.id));

            case 4:
              data = _context3.sent;

            case 5:
              if (data) {
                _context3.next = 9;
                break;
              }

              return _context3.abrupt('return', this.create(options));

            case 9:
              return _context3.abrupt('return', this.update(options.id, options, data));

            case 10:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this);
    }

    /**
     * Register a view on the blockchain
     * @param  {Object}  options should contain keys viewer (address of the viewer) and videoId (univocal video identifier)
     * @return {Promise}         information about the transaction recording the view
     * @example paratii.core.vids.view({viewer:'some-user-id',videoId: 'some-video-id'})
     * @memberof paratii.core.vids
     */

  }, {
    key: 'view',
    value: function view(options) {
      var keysForBlockchain, optionsKeys, optionsBlockchain, optionsIpfs, hash;
      return _regenerator2.default.async(function view$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
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
              _context4.next = 7;
              return _regenerator2.default.awrap(this.paratii.ipfs.addJSON(optionsIpfs));

            case 7:
              hash = _context4.sent;

              optionsBlockchain['ipfsData'] = hash;
              return _context4.abrupt('return', this.paratii.eth.vids.view(optionsBlockchain));

            case 10:
            case 'end':
              return _context4.stop();
          }
        }
      }, null, this);
    }
    /**
     * Get the data of the video identified by videoId
     * @param  {String}  videoId univocal video identifier
     * @return {Promise}         data about the video
     * @example paratii.core.vids.get('some-video-id')
     * @memberof paratii.core.vids
     */

  }, {
    key: 'get',
    value: function get(videoId) {
      return _regenerator2.default.async(function get$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              return _context5.abrupt('return', this.paratii.db.vids.get(videoId));

            case 1:
            case 'end':
              return _context5.stop();
          }
        }
      }, null, this);
    }
    /**
     * Get the data of the video
     * @param  {Object} options data about the video and (optional) owner i.e {'keyword':'titleOfTheVideo'}
     * @return {Promise}        data about the video
     * @example paratii.core.vids.search({keyword : 'titleOftheVideo'})
     * the keyword value can be one from the following list
     * - video title
     * - description
     * - owner
     * - uploader.name
     * - uploader.address
     * - tags
     * @memberof paratii.core.vids
     */

  }, {
    key: 'search',
    value: function search(options) {
      return this.paratii.db.vids.search(options);
    }
  }]);
  return ParatiiCoreVids;
}();