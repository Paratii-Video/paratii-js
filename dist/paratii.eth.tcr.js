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
 * TCR functionality
 * @param  {object} context ParatiiEth Instance
 * @return {TCR}      returns instances of Tcr
 * @class paratii.eth.tcr
 */
var ParatiiEthTcr = exports.ParatiiEthTcr = function () {
  function ParatiiEthTcr(context) {
    (0, _classCallCheck3.default)(this, ParatiiEthTcr);

    this.eth = context;
  }

  /**
   * get TCR contract instance.
   * @return {Promise} Contract instance.
   * @memberof paratii.eth.tcr
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
              return _regenerator2.default.awrap(this.eth.getContract('TcrPlaceholder'));

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
     * get the minimum amount required to stake a video.
     * @return {Float} amount required in PTI
     * @todo return amount as bignumber.js Object
     * @memberof paratii.eth.tcr
     */

  }, {
    key: 'getMinDeposit',
    value: function getMinDeposit() {
      var contract, minDeposit;
      return _regenerator2.default.async(function getMinDeposit$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 2:
              contract = _context2.sent;
              _context2.next = 5;
              return _regenerator2.default.awrap(contract.methods.getMinDeposit().call());

            case 5:
              minDeposit = _context2.sent;
              return _context2.abrupt('return', minDeposit);

            case 7:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }

    /**
     * check if video is already whitelisted or not. note that this returns false
     * till the video is actually whitelisted. use didVideoApply in case you want
     * to check whether the video is in application process.
     * @param  {string}  videoId videoId
     * @return {boolean}         is video whitelisted or not.
     * @memberof paratii.eth.tcr
     */

  }, {
    key: 'isWhitelisted',
    value: function isWhitelisted(videoId) {
      var contract, isWhitelisted;
      return _regenerator2.default.async(function isWhitelisted$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 2:
              contract = _context3.sent;
              _context3.next = 5;
              return _regenerator2.default.awrap(contract.methods.isWhitelisted(videoId).call());

            case 5:
              isWhitelisted = _context3.sent;
              return _context3.abrupt('return', isWhitelisted);

            case 7:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this);
    }

    /**
     * check whether a video started the application process or not yet.
     * @param  {string}  videoId videoId
     * @return {boolean}         did the video start the TCR process.
     * @memberof paratii.eth.tcr
     */

  }, {
    key: 'didVideoApply',
    value: function didVideoApply(videoId) {
      var contract, appWasMade;
      return _regenerator2.default.async(function didVideoApply$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 2:
              contract = _context4.sent;
              _context4.next = 5;
              return _regenerator2.default.awrap(contract.methods.appWasMade(videoId).call());

            case 5:
              appWasMade = _context4.sent;
              return _context4.abrupt('return', appWasMade);

            case 7:
            case 'end':
              return _context4.stop();
          }
        }
      }, null, this);
    }

    /**
     * start the application process.
     * NOTE that this require the client approves PTI amount first before actually
     * running this function, use `checkEligiblityAndApply` instead.
     * @param  {string}  videoId       videoId
     * @param  {Float}  amountToStake number of tokens to stake. must >= minDeposit
     * @return {boolean}               returns true if all is good, plus _Application
     * event.
     * @memberof paratii.eth.tcr
     */

  }, {
    key: 'apply',
    value: function apply(videoId, amountToStake) {
      var minDeposit, contract, amountInHex, tx, vId;
      return _regenerator2.default.async(function apply$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return _regenerator2.default.awrap(this.getMinDeposit());

            case 2:
              minDeposit = _context5.sent;

              if (!this.eth.web3.utils.toBN(amountToStake).lt(minDeposit)) {
                _context5.next = 5;
                break;
              }

              throw new Error('amount to stake ' + amountToStake + ' is less than minDeposit ' + minDeposit.toString());

            case 5:
              _context5.next = 7;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 7:
              contract = _context5.sent;

              // let amountInWei = this.eth.web3.utils.toWei(amountToStake.toString())
              amountInHex = this.eth.web3.utils.toHex(amountToStake.toString());
              // console.log('amountInHex: ', amountInHex)

              tx = void 0;
              _context5.prev = 10;
              _context5.next = 13;
              return _regenerator2.default.awrap(contract.methods.apply(videoId, amountInHex).send());

            case 13:
              tx = _context5.sent;
              _context5.next = 19;
              break;

            case 16:
              _context5.prev = 16;
              _context5.t0 = _context5['catch'](10);
              throw _context5.t0;

            case 19:
              // console.log('tx: ', tx)
              vId = void 0;

              try {
                vId = (0, _utils.getInfoFromLogs)(tx, '_Application', 'videoId', 1);
              } catch (e) {
                // FIXME: thsi error should be thrown
                if (e) {
                  console.log(tx);
                  // throw (e)
                  // return false
                }
              }

              // console.log('vId: ', vId)

              if (!vId) {
                _context5.next = 25;
                break;
              }

              return _context5.abrupt('return', true);

            case 25:
              return _context5.abrupt('return', false);

            case 26:
            case 'end':
              return _context5.stop();
          }
        }
      }, null, this, [[10, 16]]);
    }

    /**
     * Stake amountToStake on video with id videoId
     * does a number of separate steps:
     * - check preconditions for staking
     * - approve that the TCR contract can transfer amountToStake tokens
     * - apply to the TCR
     * @param  {strin}  videoId       [description]
     * @param  {number}  amountToStake [description]
     * @return {Promise}               [description]
     * @memberof paratii.eth.tcr
     */
    // FIXME: better naming

  }, {
    key: 'checkEligiblityAndApply',
    value: function checkEligiblityAndApply(videoId, amountToStake) {
      var minDeposit, isWhitelisted, appWasMade, token, tcrPlaceholder, tx2, allowance, result;
      return _regenerator2.default.async(function checkEligiblityAndApply$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return _regenerator2.default.awrap(this.getMinDeposit());

            case 2:
              minDeposit = _context6.sent;

              if (!this.eth.web3.utils.toBN(amountToStake).lt(minDeposit)) {
                _context6.next = 5;
                break;
              }

              throw new Error('amount to stake ' + amountToStake + ' is less than minDeposit ' + minDeposit.toString());

            case 5:
              _context6.next = 7;
              return _regenerator2.default.awrap(this.isWhitelisted(videoId));

            case 7:
              isWhitelisted = _context6.sent;

              if (!isWhitelisted) {
                _context6.next = 10;
                break;
              }

              throw new Error('video ' + videoId + ' is already whitelisted');

            case 10:
              _context6.next = 12;
              return _regenerator2.default.awrap(this.didVideoApply(videoId));

            case 12:
              appWasMade = _context6.sent;

              if (!appWasMade) {
                _context6.next = 15;
                break;
              }

              throw new Error('video ' + videoId + ' already applied and awaiting decision');

            case 15:
              _context6.next = 17;
              return _regenerator2.default.awrap(this.eth.getContract('ParatiiToken'));

            case 17:
              token = _context6.sent;
              _context6.next = 20;
              return _regenerator2.default.awrap(this.eth.getContract('TcrPlaceholder'));

            case 20:
              tcrPlaceholder = _context6.sent;
              _context6.next = 23;
              return _regenerator2.default.awrap(token.methods.approve(tcrPlaceholder.options.address, amountToStake).send());

            case 23:
              tx2 = _context6.sent;

              if (tx2) {
                _context6.next = 26;
                break;
              }

              throw new Error('checkEligiblityAndApply Error ', tx2);

            case 26:
              _context6.next = 28;
              return _regenerator2.default.awrap(token.methods.allowance(this.eth.getAccount(), tcrPlaceholder.options.address).call());

            case 28:
              allowance = _context6.sent;

              if (allowance.toString() !== amountToStake.toString()) {
                console.warn('allowance ' + allowance.toString() + ' != ' + amountToStake.toString());
              }

              _context6.next = 32;
              return _regenerator2.default.awrap(this.apply(videoId, amountToStake));

            case 32:
              result = _context6.sent;
              return _context6.abrupt('return', result);

            case 34:
            case 'end':
              return _context6.stop();
          }
        }
      }, null, this);
    }

    /**
     * remove the video given by videoId from the listing
     * @memberof paratii.eth.tcr
     */

  }, {
    key: 'exit',
    value: function exit(videoId) {
      var contract;
      return _regenerator2.default.async(function exit$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 2:
              contract = _context7.sent;
              return _context7.abrupt('return', contract.methods.exit(videoId).send());

            case 4:
            case 'end':
              return _context7.stop();
          }
        }
      }, null, this);
    }
  }]);
  return ParatiiEthTcr;
}();