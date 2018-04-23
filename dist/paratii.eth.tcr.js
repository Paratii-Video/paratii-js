'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiEthTcr = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _utils = require('./utils.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Token Curated Registry functionalities.
 * Work in progress: this class does not yet implement all TCR functionality
 * @param  {ParatiiEth} context ParatiiEth instance
 * @property {ParatiiEth} eth ParatiiEth instance
 * @example let paratii = new Paratii()
 * paratii.eth.tcr // this is an instance of ParatiiEthTcr
 */
var ParatiiEthTcr = exports.ParatiiEthTcr = function () {
  function ParatiiEthTcr(context) {
    (0, _classCallCheck3.default)(this, ParatiiEthTcr);

    this.eth = context;
  }

  /**
   * get TCR contract instance.
   * @return {Promise} The TCR Contract instance.
   * @example let contract = await paratii.eth.tcr.getTcrContract()
   */


  (0, _createClass3.default)(ParatiiEthTcr, [{
    key: 'getTcrContract',
    value: function getTcrContract() {
      var contract;
      return _regenerator2.default.async(function getTcrContract$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _regenerator2.default.awrap(this.eth.getContract('TcrRegistry'));

            case 2:
              contract = _context.sent;

              if (!(contract.options.address === '0x0')) {
                _context.next = 5;
                break;
              }

              throw Error('There is no TCR contract known in the registry');

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
     * get parametrizer contract instance.
     * @return {Promise} The parametrizer Contract instance.
     * @example let contract = await paratii.eth.tcr.getParametrizerContract()
     */

  }, {
    key: 'getParametrizerContract',
    value: function getParametrizerContract() {
      var contract;
      return _regenerator2.default.async(function getParametrizerContract$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _regenerator2.default.awrap(this.eth.getContract('TcrParameterizer'));

            case 2:
              contract = _context2.sent;

              if (!(contract.options.address === '0x0')) {
                _context2.next = 5;
                break;
              }

              throw Error('There is no Parametrizer contract known in the registry');

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
     * get the minimum amount required to stake a video.
     * @return {integer} amount required, in PTI base units
     * @todo return amount as bignumber.js Object
     * @example let minDeposit = await paratii.eth.tcr.getMinDeposit()
     */

  }, {
    key: 'getMinDeposit',
    value: function getMinDeposit() {
      return _regenerator2.default.async(function getMinDeposit$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              return _context3.abrupt('return', this.get('minDeposit'));

            case 1:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this);
    }

    /**
     * check if video is already whitelisted. note that this returns false
     * till the video is actually whitelisted. use appWasMade in case you want
     * to check whether the video is in application process.
     * @param  {string}  videoId id of the video
     * @return {boolean}         true if video is whitelisted, false otherwise
     * @example let isWhitelisted = await paratii.eth.tcr.isWhitelisted('some-video-id')
     */

  }, {
    key: 'isWhitelisted',
    value: function isWhitelisted(videoId) {
      var contract, videoIdBytes, isWhitelisted;
      return _regenerator2.default.async(function isWhitelisted$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 2:
              contract = _context4.sent;
              videoIdBytes = this.eth.web3.utils.fromAscii(videoId);
              _context4.next = 6;
              return _regenerator2.default.awrap(contract.methods.isWhitelisted(videoIdBytes).call());

            case 6:
              isWhitelisted = _context4.sent;
              return _context4.abrupt('return', isWhitelisted);

            case 8:
            case 'end':
              return _context4.stop();
          }
        }
      }, null, this);
    }

    /**
     * check whether a video started the application process
     * @param  {string}  videoId id of the video
     * @return {boolean}  true if video started the application process, false otherwise
     * @example let appWasMade = await paratii.eth.tcr.appWasMade('some-video-id')
     */

  }, {
    key: 'appWasMade',
    value: function appWasMade(videoId) {
      var contract, videoIdBytes, appWasMade;
      return _regenerator2.default.async(function appWasMade$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 2:
              contract = _context5.sent;
              videoIdBytes = this.eth.web3.utils.fromAscii(videoId);
              _context5.next = 6;
              return _regenerator2.default.awrap(contract.methods.appWasMade(videoIdBytes).call());

            case 6:
              appWasMade = _context5.sent;
              return _context5.abrupt('return', appWasMade);

            case 8:
            case 'end':
              return _context5.stop();
          }
        }
      }, null, this);
    }

    /**
     * Start the application process.
     * One of the preconditions for apploication is the client approve that the TCR contract can   amount first before actually
     * transfer the stake. If this sounds unfamliar to you, use {@link ParatiiEthTcr#checkEligiblityAndApply} instead.
     * @param  {string} videoId id of the video
     * @param  {integer}  amountToStake number of tokens to stake. must >= minDeposit
     * @param  {string} data optional data for the application
     * @return {boolean}  returns true if the  application is successful
     * @example paratii.eth.tcr.apply('some-video-id', 3e18)
     */

  }, {
    key: 'apply',
    value: function apply(videoId, amountToStake, data) {
      var minDeposit, contract, amountInHex, videoIdBytes, tx, vId;
      return _regenerator2.default.async(function apply$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              // solidity wants a string anyway
              if (data == null) {
                data = '';
              }
              // FIXME: it is more efficient if we first call "apply", and check for preconditions only after this failed
              _context6.next = 3;
              return _regenerator2.default.awrap(this.getMinDeposit());

            case 3:
              minDeposit = _context6.sent;

              if (!this.eth.web3.utils.toBN(amountToStake).lt(minDeposit)) {
                _context6.next = 6;
                break;
              }

              throw new Error('amount to stake ' + amountToStake + ' is less than minDeposit ' + minDeposit.toString());

            case 6:
              _context6.next = 8;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 8:
              contract = _context6.sent;

              // let amountInWei = this.eth.web3.utils.toWei(amountToStake.toString())
              amountInHex = this.eth.web3.utils.toHex(amountToStake.toString());
              // console.log('amountInHex: ', amountInHex)

              videoIdBytes = this.eth.web3.utils.fromAscii(videoId);
              tx = void 0;
              _context6.prev = 12;
              _context6.next = 15;
              return _regenerator2.default.awrap(contract.methods.apply(videoIdBytes, amountInHex, data).send());

            case 15:
              tx = _context6.sent;
              _context6.next = 21;
              break;

            case 18:
              _context6.prev = 18;
              _context6.t0 = _context6['catch'](12);
              throw _context6.t0;

            case 21:
              vId = void 0;

              vId = (0, _utils.getInfoFromLogs)(tx, '_Application', 'listingHash', 1);

              if (!vId) {
                _context6.next = 27;
                break;
              }

              return _context6.abrupt('return', true);

            case 27:
              return _context6.abrupt('return', false);

            case 28:
            case 'end':
              return _context6.stop();
          }
        }
      }, null, this, [[12, 18]]);
    }

    /**
     * Stake amountToStake on video with id videoId
     * does a number of separate steps:
     * - check preconditions for staking
     * - approve that the TCR contract can transfer amountToStake tokens
     * - apply to the TCR
     * @param  {string}  videoId       id of the video
     * @param  {integer}  amountToStake amount (in base units) of tokens to stake
     * @return {Promise}  returns true if the application was successful, false otherwise
     * event.
     * @example let result = await paratii.eth.tcr.checkEligiblityAndApply('some-video-id', 31415926)
     */
    // FIXME: better naming

  }, {
    key: 'checkEligiblityAndApply',
    value: function checkEligiblityAndApply(videoId, amountToStake) {
      var minDeposit, isWhitelisted, appWasMade, token, tcrPlaceholder, tx2, allowance, result;
      return _regenerator2.default.async(function checkEligiblityAndApply$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return _regenerator2.default.awrap(this.getMinDeposit());

            case 2:
              minDeposit = _context7.sent;

              if (!this.eth.web3.utils.toBN(amountToStake).lt(minDeposit)) {
                _context7.next = 5;
                break;
              }

              throw new Error('amount to stake ' + amountToStake + ' is less than minDeposit ' + minDeposit.toString());

            case 5:
              _context7.next = 7;
              return _regenerator2.default.awrap(this.isWhitelisted(videoId));

            case 7:
              isWhitelisted = _context7.sent;

              if (!isWhitelisted) {
                _context7.next = 10;
                break;
              }

              throw new Error('video ' + videoId + ' is already whitelisted');

            case 10:
              _context7.next = 12;
              return _regenerator2.default.awrap(this.appWasMade(videoId));

            case 12:
              appWasMade = _context7.sent;

              if (!appWasMade) {
                _context7.next = 15;
                break;
              }

              throw new Error('video ' + videoId + ' already applied and awaiting decision');

            case 15:
              _context7.next = 17;
              return _regenerator2.default.awrap(this.eth.getContract('ParatiiToken'));

            case 17:
              token = _context7.sent;
              _context7.next = 20;
              return _regenerator2.default.awrap(this.eth.getContract('TcrPlaceholder'));

            case 20:
              tcrPlaceholder = _context7.sent;
              _context7.next = 23;
              return _regenerator2.default.awrap(token.methods.approve(tcrPlaceholder.options.address, amountToStake).send());

            case 23:
              tx2 = _context7.sent;

              if (tx2) {
                _context7.next = 26;
                break;
              }

              throw new Error('checkEligiblityAndApply Error ', tx2);

            case 26:
              _context7.next = 28;
              return _regenerator2.default.awrap(token.methods.allowance(this.eth.getAccount(), tcrPlaceholder.options.address).call());

            case 28:
              allowance = _context7.sent;

              if (allowance.toString() !== amountToStake.toString()) {
                console.warn('allowance ' + allowance.toString() + ' != ' + amountToStake.toString());
              }

              _context7.next = 32;
              return _regenerator2.default.awrap(this.apply(videoId, amountToStake));

            case 32:
              result = _context7.sent;
              return _context7.abrupt('return', result);

            case 34:
            case 'end':
              return _context7.stop();
          }
        }
      }, null, this);
    }

    /**
     * remove the video given by videoId from the listing (and returns the stake to the staker)
     * @param videoId {string} video identifier
     * @return information about the transaction
     * @example let tx = await paratii.eth.tcr.exit('some-video-id')
     */

  }, {
    key: 'exit',
    value: function exit(videoId) {
      var contract;
      return _regenerator2.default.async(function exit$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 2:
              contract = _context8.sent;
              return _context8.abrupt('return', contract.methods.exit(videoId).send());

            case 4:
            case 'end':
              return _context8.stop();
          }
        }
      }, null, this);
    }

    // new functions for the real tcr

  }, {
    key: 'get',
    value: function get(param) {
      var contract, value;
      return _regenerator2.default.async(function get$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 2;
              return _regenerator2.default.awrap(this.getParametrizerContract());

            case 2:
              contract = _context9.sent;
              _context9.next = 5;
              return _regenerator2.default.awrap(contract.methods.get(param).call());

            case 5:
              value = _context9.sent;
              return _context9.abrupt('return', value);

            case 7:
            case 'end':
              return _context9.stop();
          }
        }
      }, null, this);
    }
  }]);
  return ParatiiEthTcr;
}();