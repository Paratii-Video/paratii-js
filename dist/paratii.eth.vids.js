'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiEthVids = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _utils = require('./utils.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var joi = require('joi');
/**
 * The eth.vids namespace contains functions to interact with the video registration on the blockchain.
 * @class paratii.eth.vids
 */

var ParatiiEthVids = exports.ParatiiEthVids = function () {
  function ParatiiEthVids(context) {
    (0, _classCallCheck3.default)(this, ParatiiEthVids);

    // context is a ParatiiEth instance
    this.eth = context;
  }
  /**
   * Get the contract instance of the videos contract
   * @return {Promise} Object representing the contract
   * @example let contract = await paratii.eth.vids.getVideoRegistry()
   * @memberof paratii.eth.vids
   */


  (0, _createClass3.default)(ParatiiEthVids, [{
    key: 'getVideoRegistry',
    value: function getVideoRegistry() {
      var contract;
      return _regenerator2.default.async(function getVideoRegistry$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _regenerator2.default.awrap(this.eth.getContract('Videos'));

            case 2:
              contract = _context.sent;

              if (!(contract.options.address === '0x0')) {
                _context.next = 5;
                break;
              }

              throw Error('There is not Videos contract known in the registry');

            case 5:
              return _context.abrupt('return', contract);

            case 6:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }
    /**
     * Get the contract instance of the likes contract
     * @return {Promise} Object representing the contract
     * @example let contract = await paratii.eth.vids.getLikesContract()
     * @memberof paratii.eth.vids
     */

  }, {
    key: 'getLikesContract',
    value: function getLikesContract() {
      var contract;
      return _regenerator2.default.async(function getLikesContract$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _regenerator2.default.awrap(this.eth.getContract('Likes'));

            case 2:
              contract = _context2.sent;

              if (!(contract.options.address === '0x0')) {
                _context2.next = 5;
                break;
              }

              throw Error('There is not Likes contract known in the registry');

            case 5:
              return _context2.abrupt('return', contract);

            case 6:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }
    /**
     * Get the contract instance of the views contract
     * @return {Promise} Object representing the contract
     * @example let contract = await paratii.eth.vids.getViewsContract()
     * @memberof paratii.eth.vids
     */

  }, {
    key: 'getViewsContract',
    value: function getViewsContract() {
      var contract;
      return _regenerator2.default.async(function getViewsContract$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return _regenerator2.default.awrap(this.eth.getContract('Views'));

            case 2:
              contract = _context3.sent;

              if (!(contract.options.address === '0x0')) {
                _context3.next = 5;
                break;
              }

              throw Error('There is not Views contract known in the registry');

            case 5:
              return _context3.abrupt('return', contract);

            case 6:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this);
    }
    /**
     * Creates a random id
     * @return {String} id created
     * @example let id = paratii.eth.vids.makeId()
     * @memberof paratii.eth.vids
     */

  }, {
    key: 'makeId',
    value: function makeId() {
      // create a fresh ID
      return (0, _utils.makeId)();
    }
    /**
     * Record the video on the blockchain
     * @param  {Object}  options   data about the video
     * @param  {Number}  [retry=1] optional, default = 1
     * @return {Promise}           the video id
     * @example let videoId = await paratii.eth.vids.create({
     *                                    id: 'some-id',
     *                                    price: 20,
     *                                    owner: 'some-address',
     *                                    ipfsHash: 'some-hash'
     *                          })
     * @memberof paratii.eth.vids
     */

  }, {
    key: 'create',
    value: function create(options) {
      var retry = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      var schema, result, validatedOptions, msg, contract, tx, videoId;
      return _regenerator2.default.async(function create$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              schema = joi.object({
                id: joi.string(),
                owner: joi.string().required(),
                price: joi.any().default(0),
                ipfsHashOrig: joi.string().empty('').default(''),
                ipfsHash: joi.string().empty('').default(''),
                ipfsData: joi.string().default('')
              });
              result = joi.validate(options, schema);

              if (!result.error) {
                _context4.next = 4;
                break;
              }

              throw result.error;

            case 4:
              validatedOptions = result.value;


              if (!validatedOptions.id) {
                validatedOptions.id = this.makeId();
              }

              if (this.eth.web3.utils.isAddress(validatedOptions.owner)) {
                _context4.next = 9;
                break;
              }

              msg = 'The owner argument should be a valid address, not ' + validatedOptions.owner;
              throw Error(msg);

            case 9:
              _context4.next = 11;
              return _regenerator2.default.awrap(this.getVideoRegistry());

            case 11:
              contract = _context4.sent;
              _context4.prev = 12;
              _context4.next = 15;
              return _regenerator2.default.awrap(contract.methods.create(validatedOptions.id, validatedOptions.owner, validatedOptions.price, validatedOptions.ipfsHashOrig, validatedOptions.ipfsHash, validatedOptions.ipfsData).send());

            case 15:
              tx = _context4.sent;
              videoId = (0, _utils.getInfoFromLogs)(tx, 'LogCreateVideo', 'videoId');
              return _context4.abrupt('return', videoId);

            case 20:
              _context4.prev = 20;
              _context4.t0 = _context4['catch'](12);

              if (!(/Transaction nonce is too low./.exec(_context4.t0.message) && retry > 0)) {
                _context4.next = 24;
                break;
              }

              return _context4.abrupt('return', this.create(options, retry - 1));

            case 24:
              if (!(/There is another transaction with same nonce in the queue./.exec(_context4.t0.message) && retry > 0)) {
                _context4.next = 26;
                break;
              }

              return _context4.abrupt('return', this.create(options, retry - 1));

            case 26:
              if (!/Transaction with the same hash was already imported./.exec(_context4.t0.message)) {
                _context4.next = 28;
                break;
              }

              return _context4.abrupt('return', validatedOptions.id);

            case 28:
              throw _context4.t0;

            case 29:
            case 'end':
              return _context4.stop();
          }
        }
      }, null, this, [[12, 20]]);
    }
    /**
     * get data about the video
     * @param  {String}  videoId univocal video id
     * @return {Promise}         data about the video
     * @example let video = eth.vids.get('0x12345')
     * @memberof paratii.eth.vids
     */

  }, {
    key: 'get',
    value: function get(videoId) {
      var contract, videoInfo, result;
      return _regenerator2.default.async(function get$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return _regenerator2.default.awrap(this.getVideoRegistry());

            case 2:
              contract = _context5.sent;
              _context5.next = 5;
              return _regenerator2.default.awrap(contract.methods.get(videoId).call());

            case 5:
              videoInfo = _context5.sent;
              result = {
                id: videoId,
                owner: videoInfo[0],
                price: videoInfo[1],
                ipfsHashOrig: videoInfo[2],
                ipfsHash: videoInfo[3],
                ipfsData: videoInfo[4]
              };

              if (!(result.owner === _utils.NULL_ADDRESS)) {
                _context5.next = 9;
                break;
              }

              throw Error('No video with id \'' + videoId + '\' was registered');

            case 9:
              return _context5.abrupt('return', result);

            case 10:
            case 'end':
              return _context5.stop();
          }
        }
      }, null, this);
    }
    /**
     * record a like/dislike to the video on the blockchain
     * TODO RIVEDI I TIPI
     * @param  {Object}  options data about the video to like
     * @param {String} options.videoId univocal video id
     * @param {Boolean} options.liked true/false
     * @return {Promise}         transaction recording the like
     * @example await paratii.eth.vids.sendLike({ videoId: 'some-id', liked: true })
     * @example await paratii.eth.vids.sendLike({ videoId: 'some-id', liked: false })
     * @memberof paratii.eth.vids
     */

  }, {
    key: 'sendLike',
    value: function sendLike(options) {
      var schema, result, error, msg, contract, contract2, videoInfo, _msg, tx;

      return _regenerator2.default.async(function sendLike$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              schema = joi.object({
                videoId: joi.string().required(),
                liked: joi.bool().required()
              });
              result = joi.validate(options, schema);
              error = result.error;

              if (!error) {
                _context6.next = 5;
                break;
              }

              throw error;

            case 5:
              options = result.value;

              if (!(options.liked !== true && options.liked !== false)) {
                _context6.next = 9;
                break;
              }

              msg = 'The liked argument should be a boolean';
              throw Error(msg);

            case 9:
              _context6.next = 11;
              return _regenerator2.default.awrap(this.getVideoRegistry());

            case 11:
              contract = _context6.sent;
              _context6.next = 14;
              return _regenerator2.default.awrap(this.getLikesContract());

            case 14:
              contract2 = _context6.sent;
              _context6.next = 17;
              return _regenerator2.default.awrap(contract.methods.get(options.videoId).call());

            case 17:
              videoInfo = _context6.sent;

              if (!(videoInfo[0] === _utils.NULL_ADDRESS)) {
                _context6.next = 21;
                break;
              }

              _msg = 'Video with ID \'' + options.videoId + '\' doesn\'t exist';
              throw Error(_msg);

            case 21:
              _context6.next = 23;
              return _regenerator2.default.awrap(contract2.methods.likeVideo(options.videoId, options.liked).send());

            case 23:
              tx = _context6.sent;
              return _context6.abrupt('return', tx);

            case 25:
            case 'end':
              return _context6.stop();
          }
        }
      }, null, this);
    }
    /**
     * record a views to the video on the blockchain
     * @param  {Object}  options data about the video and the viewer
     * @param {String} options.viewer address of the viewer
     * @param {String} options.videoId univocal video identifier
     * @param {String} options.ipfsData ipfs multihash
     * @return {Promise}         transaction recording the view
     * @example await paratii.eth.vids.view({viewer:'some-user-id',videoId: 'some-video-id'})
     * @memberof paratii.eth.vids
     */

  }, {
    key: 'view',
    value: function view(options) {
      var schema, result, error, contract, tx;
      return _regenerator2.default.async(function view$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              schema = joi.object({
                viewer: joi.string().required(),
                videoId: joi.string().required(),
                ipfsData: joi.string().default(null)
              });
              result = joi.validate(options, schema);
              error = result.error;

              if (!error) {
                _context7.next = 5;
                break;
              }

              throw error;

            case 5:
              options = result.value;

              _context7.next = 8;
              return _regenerator2.default.awrap(this.getViewsContract());

            case 8:
              contract = _context7.sent;
              _context7.next = 11;
              return _regenerator2.default.awrap(contract.methods.create(options.viewer, options.videoId, options.ipfsData).send());

            case 11:
              tx = _context7.sent;
              return _context7.abrupt('return', tx);

            case 13:
            case 'end':
              return _context7.stop();
          }
        }
      }, null, this);
    }
    /**
     * Check if the viewer has already viewed the video
     * @param  {Object}  options data about the video and the viewer
     * @param {String} options.viewer viewer address
     * @param {String} options.videoId  univocal video identifier
     * @return {Promise}         true if the current user already viewed the video, false otherwise
     * @example let result = await paratii.eth.vids.userViewedVideo({viewer:'some-user-id',videoId: 'some-video-id'})
     * @memberof paratii.eth.vids
     */

  }, {
    key: 'userViewedVideo',
    value: function userViewedVideo(options) {
      var schema, result, error, contract;
      return _regenerator2.default.async(function userViewedVideo$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              schema = joi.object({
                viewer: joi.string().required(),
                videoId: joi.string().required()
              });
              result = joi.validate(options, schema);
              error = result.error;

              if (!error) {
                _context8.next = 5;
                break;
              }

              throw error;

            case 5:
              options = result.value;

              _context8.next = 8;
              return _regenerator2.default.awrap(this.getViewsContract());

            case 8:
              contract = _context8.sent;
              return _context8.abrupt('return', contract.methods.userViewedVideo(options.viewer, options.videoId).call());

            case 10:
            case 'end':
              return _context8.stop();
          }
        }
      }, null, this);
    }
    /**
     * Writes a like for the video on the blockchain (contract Likes), and negates a dislike for the video, if it exists.
     * @param  {String}  videoId univocal video identifier
     * @return {Promise}          transaction recording the like
     * @example let result = paratii.eth.vids.like('some-id')
     * @memberof paratii.eth.vids
     */

  }, {
    key: 'like',
    value: function like(videoId) {
      return _regenerator2.default.async(function like$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 2;
              return _regenerator2.default.awrap(this.sendLike({ videoId: videoId, liked: true }));

            case 2:
            case 'end':
              return _context9.stop();
          }
        }
      }, null, this);
    }
    /**
     * Writes a dislike for the video on the blockchain (contract Likes), and negates a like for the video, if it exists.
     * @param  {String}  videoId univocal video identifier
     * @return {Promise}          transaction recording the dislike
     * @example let result = paratii.eth.vids.dislike('some-id')
     * @memberof paratii.eth.vids
     */

  }, {
    key: 'dislike',
    value: function dislike(videoId) {
      return _regenerator2.default.async(function dislike$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              _context10.next = 2;
              return _regenerator2.default.awrap(this.sendLike({ videoId: videoId, liked: false }));

            case 2:
            case 'end':
              return _context10.stop();
          }
        }
      }, null, this);
    }
    /**
     * Check if the current user has already liked the video
     * @param  {String}  videoId univocal video identifier
     * @return {Promise}          true if the current user already liked the video, false otherwise
     * @example let result = paratii.eth.vids.doesLike('some-id')
     * @memberof paratii.eth.vids
     */

  }, {
    key: 'doesLike',
    value: function doesLike(videoId) {
      var contract, address, likeInfo;
      return _regenerator2.default.async(function doesLike$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              _context11.next = 2;
              return _regenerator2.default.awrap(this.getLikesContract());

            case 2:
              contract = _context11.sent;
              address = this.eth.getAccount();
              _context11.next = 6;
              return _regenerator2.default.awrap(contract.methods.userLikesVideo(address, videoId).call());

            case 6:
              likeInfo = _context11.sent;
              return _context11.abrupt('return', likeInfo);

            case 8:
            case 'end':
              return _context11.stop();
          }
        }
      }, null, this);
    }
    /**
     * Check if the current user has already disliked the video.
     * @param  {String}  videoId univocal video identifier
     * @return {Promise}          true if the current user already disliked the video, false otherwise
     * @example let result = paratii.eth.vids.doesDislike('some-id')
     * @memberof paratii.eth.vids
     */

  }, {
    key: 'doesDislike',
    value: function doesDislike(videoId) {
      var contract, address, likeInfo;
      return _regenerator2.default.async(function doesDislike$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              _context12.next = 2;
              return _regenerator2.default.awrap(this.getLikesContract());

            case 2:
              contract = _context12.sent;
              address = this.eth.getAccount();
              _context12.next = 6;
              return _regenerator2.default.awrap(contract.methods.userDislikesVideo(address, videoId).call());

            case 6:
              likeInfo = _context12.sent;
              return _context12.abrupt('return', likeInfo);

            case 8:
            case 'end':
              return _context12.stop();
          }
        }
      }, null, this);
    }
    /**
     * Update the information on the video.
     *  Only the account that has registered the video, or the owner of the contract, can update the information.
     * @param  {String}  videoId      univocal video identifier
     * @param  {Object}  options      key value pairs of properties and new values e.g. ({title: 'another-title'})
     * @return {Promise}              Updated video informations
     * @example paratii.eth.vids.update('some-video-id', {title: 'another-title'})
     * @memberof paratii.eth.vids
     */

  }, {
    key: 'update',
    value: function update(videoId, options) {
      var data, key;
      return _regenerator2.default.async(function update$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              options.id = videoId;
              _context13.next = 3;
              return _regenerator2.default.awrap(this.get(videoId));

            case 3:
              data = _context13.sent;

              for (key in options) {
                data[key] = options[key];
              }
              _context13.next = 7;
              return _regenerator2.default.awrap(this.create(data, 'updating'));

            case 7:
              return _context13.abrupt('return', data);

            case 8:
            case 'end':
              return _context13.stop();
          }
        }
      }, null, this);
    }
    /**
     * delete the video from the blockchain
     * @param  {String}  videoId univocal video identifier
     * @return {Promise}         transaction recording the remove action
     * @example let tx = paratii.eth.vids.delete('some-id')
     */

  }, {
    key: 'delete',
    value: function _delete(videoId) {
      var contract, tx;
      return _regenerator2.default.async(function _delete$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              _context14.next = 2;
              return _regenerator2.default.awrap(this.getVideoRegistry());

            case 2:
              contract = _context14.sent;
              _context14.next = 5;
              return _regenerator2.default.awrap(contract.methods.remove(videoId).send());

            case 5:
              tx = _context14.sent;
              return _context14.abrupt('return', tx);

            case 7:
            case 'end':
              return _context14.stop();
          }
        }
      }, null, this);
    }
  }]);
  return ParatiiEthVids;
}();