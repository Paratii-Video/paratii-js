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

var _bignumber = require('bignumber.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var HASH_TO_KEY_PREFIX = 'HASH_KEY_';
var SALT_KEY_PREFIX = 'SALT_KEY_';

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

  // -----------------------
  // CONTRACT GETTERS
  // -----------------------

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
     * get PLCRVoting contract instance.
     * @return {Promise} The PLCRVoting Contract instance.
     * @example let contract = await paratii.eth.tcr.getPLCRVotingContract()
     */

  }, {
    key: 'getPLCRVotingContract',
    value: function getPLCRVotingContract() {
      var contract;
      return _regenerator2.default.async(function getPLCRVotingContract$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return _regenerator2.default.awrap(this.eth.getContract('TcrPLCRVoting'));

            case 2:
              contract = _context3.sent;

              if (!(contract.options.address === '0x0')) {
                _context3.next = 5;
                break;
              }

              throw Error('There is no PLCRVoting contract known in the registry');

            case 5:
              return _context3.abrupt('return', contract);

            case 6:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this);
    }

    // -----------------------
    // TCR FUNCTION
    // -----------------------

    /**
     * Start the application process.
     * One of the preconditions for application is the client approve that the TCR contract can amount first before actually
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
      var minDeposit, isWhitelisted, appWasMade, contract, amountInHex, hash, tx, vId;
      return _regenerator2.default.async(function apply$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              // tcr contract wants a string anyway
              if (data == null) {
                data = '';
              }

              _context4.next = 3;
              return _regenerator2.default.awrap(this.getMinDeposit());

            case 3:
              minDeposit = _context4.sent;
              _context4.next = 6;
              return _regenerator2.default.awrap(this.isWhitelisted(videoId));

            case 6:
              isWhitelisted = _context4.sent;

              if (!isWhitelisted) {
                _context4.next = 9;
                break;
              }

              throw new Error('The video is already whitelisted');

            case 9:
              _context4.next = 11;
              return _regenerator2.default.awrap(this.appWasMade(videoId));

            case 11:
              appWasMade = _context4.sent;

              if (!appWasMade) {
                _context4.next = 14;
                break;
              }

              throw new Error('The video has already applied for the whitelist');

            case 14:
              if (!this.eth.web3.utils.toBN(amountToStake).lt(minDeposit)) {
                _context4.next = 16;
                break;
              }

              throw new Error('amount to stake ' + amountToStake + ' is less than minDeposit ' + minDeposit.toString());

            case 16:
              _context4.next = 18;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 18:
              contract = _context4.sent;

              // let amountInWei = this.eth.web3.utils.toWei(amountToStake.toString())
              amountInHex = this.eth.web3.utils.toHex(amountToStake.toString());
              // console.log('amountInHex: ', amountInHex)

              hash = this.getHash(videoId);
              tx = void 0;
              _context4.prev = 22;
              _context4.next = 25;
              return _regenerator2.default.awrap(contract.methods.apply(hash, amountInHex, data).send());

            case 25:
              tx = _context4.sent;
              _context4.next = 31;
              break;

            case 28:
              _context4.prev = 28;
              _context4.t0 = _context4['catch'](22);
              throw _context4.t0;

            case 31:
              vId = void 0;

              vId = (0, _utils.getInfoFromLogs)(tx, '_Application', 'listingHash', 1);

              if (!vId) {
                _context4.next = 37;
                break;
              }

              return _context4.abrupt('return', true);

            case 37:
              return _context4.abrupt('return', false);

            case 38:
            case 'end':
              return _context4.stop();
          }
        }
      }, null, this, [[22, 28]]);
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
      var minDeposit, isWhitelisted, appWasMade, token, tcr, tx2, allowance, result;
      return _regenerator2.default.async(function checkEligiblityAndApply$(_context5) {
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
              return _regenerator2.default.awrap(this.isWhitelisted(videoId));

            case 7:
              isWhitelisted = _context5.sent;

              if (!isWhitelisted) {
                _context5.next = 10;
                break;
              }

              throw new Error('video ' + videoId + ' is already whitelisted');

            case 10:
              _context5.next = 12;
              return _regenerator2.default.awrap(this.appWasMade(videoId));

            case 12:
              appWasMade = _context5.sent;

              if (!appWasMade) {
                _context5.next = 15;
                break;
              }

              throw new Error('video ' + videoId + ' already applied and awaiting decision');

            case 15:
              _context5.next = 17;
              return _regenerator2.default.awrap(this.eth.getContract('ParatiiToken'));

            case 17:
              token = _context5.sent;
              _context5.next = 20;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 20:
              tcr = _context5.sent;
              _context5.next = 23;
              return _regenerator2.default.awrap(token.methods.approve(tcr.options.address, amountToStake).send());

            case 23:
              tx2 = _context5.sent;

              if (tx2) {
                _context5.next = 26;
                break;
              }

              throw new Error('checkEligiblityAndApply Error ', tx2);

            case 26:
              _context5.next = 28;
              return _regenerator2.default.awrap(token.methods.allowance(this.eth.getAccount(), tcr.options.address).call());

            case 28:
              allowance = _context5.sent;

              if (allowance.toString() !== amountToStake.toString()) {
                console.warn('allowance ' + allowance.toString() + ' != ' + amountToStake.toString());
              }

              _context5.next = 32;
              return _regenerator2.default.awrap(this.apply(videoId, amountToStake));

            case 32:
              result = _context5.sent;
              return _context5.abrupt('return', result);

            case 34:
            case 'end':
              return _context5.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'approveAndDeposit',
    value: function approveAndDeposit(videoId, amount) {
      var tcrRegistry, approved, depositTx;
      return _regenerator2.default.async(function approveAndDeposit$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 2:
              tcrRegistry = _context6.sent;
              _context6.next = 5;
              return _regenerator2.default.awrap(this.eth.approve(tcrRegistry.options.address, amount));

            case 5:
              approved = _context6.sent;

              if (approved) {
                _context6.next = 8;
                break;
              }

              throw new Error('error in the approvation phase');

            case 8:
              _context6.next = 10;
              return _regenerator2.default.awrap(this.deposit(videoId, amount));

            case 10:
              depositTx = _context6.sent;
              return _context6.abrupt('return', depositTx);

            case 12:
            case 'end':
              return _context6.stop();
          }
        }
      }, null, this);
    }
    /**
     * Allows the owner of a listingHash to increase their unstaked deposit.
     * @param  {string}  videoId id of the video
     * @param  {number}  amount  amount in bignumber format.
     * @return {Promise}         the deposit tx
     */

  }, {
    key: 'deposit',
    value: function deposit(videoId, amount) {
      var hash, listing, tcrRegistry, allowancen, allowance, tx;
      return _regenerator2.default.async(function deposit$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              // check if user is the listing owner.
              hash = this.getAndStoreHash(videoId);
              _context7.next = 3;
              return _regenerator2.default.awrap(this.getListing(videoId));

            case 3:
              listing = _context7.sent;

              if (!(listing.owner !== this.eth.getAccount())) {
                _context7.next = 6;
                break;
              }

              throw new Error('Can\'t deposit tokens to video ' + videoId + ' because ' + this.eth.getAccount() + ' isn\'t the owner.');

            case 6:
              _context7.next = 8;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 8:
              tcrRegistry = _context7.sent;
              _context7.next = 11;
              return _regenerator2.default.awrap(this.eth.allowance(this.eth.getAccount(), tcrRegistry.options.address));

            case 11:
              allowancen = _context7.sent;
              allowance = new _bignumber.BigNumber(allowancen);

              if (!allowance.lt(amount)) {
                _context7.next = 15;
                break;
              }

              throw new Error('tcrRegistry doesn\'t have enough allowance (' + allowance.toString() + ') to deposit ' + amount.toString());

            case 15:
              _context7.next = 17;
              return _regenerator2.default.awrap(tcrRegistry.methods.deposit(hash, amount).send());

            case 17:
              tx = _context7.sent;
              return _context7.abrupt('return', tx);

            case 19:
            case 'end':
              return _context7.stop();
          }
        }
      }, null, this);
    }

    /**
     * Allows the owner of a listingHash to decrease their unstaked deposit.
     * @param  {string}  videoId id of the video
     * @param  {number}  amount  amount to withdraw.
     * @return {Promise}         withdraw tx.
     */

  }, {
    key: 'withdraw',
    value: function withdraw(videoId, amount) {
      var tcrRegistry, hash, listing, unstakedDeposit, minDeposit, tx;
      return _regenerator2.default.async(function withdraw$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 2:
              tcrRegistry = _context8.sent;
              hash = this.getAndStoreHash(videoId);
              _context8.next = 6;
              return _regenerator2.default.awrap(this.getListing(videoId));

            case 6:
              listing = _context8.sent;

              if (!(listing.owner !== this.eth.getAccount())) {
                _context8.next = 9;
                break;
              }

              throw new Error('Can\'t deposit tokens to video ' + videoId + ' because ' + this.eth.getAccount() + ' isn\'t the owner.');

            case 9:
              unstakedDeposit = new _bignumber.BigNumber(listing.unstakedDeposit);

              if (!unstakedDeposit.lt(amount)) {
                _context8.next = 12;
                break;
              }

              throw new Error('unstakedDeposit ' + unstakedDeposit.toString() + ' is less than amount ' + amount.toString());

            case 12:
              _context8.next = 14;
              return _regenerator2.default.awrap(this.getMinDeposit());

            case 14:
              minDeposit = _context8.sent;

              if (!unstakedDeposit.minus(amount).lt(minDeposit)) {
                _context8.next = 17;
                break;
              }

              throw new Error('can\'t withdraw amount (' + amount.toString() + ') from ' + unstakedDeposit.toString() + ' since it\'d be under ' + minDeposit.toString());

            case 17:
              _context8.next = 19;
              return _regenerator2.default.awrap(tcrRegistry.methods.withdraw(hash, amount).send());

            case 19:
              tx = _context8.sent;
              return _context8.abrupt('return', tx);

            case 21:
            case 'end':
              return _context8.stop();
          }
        }
      }, null, this);
    }

    /**
     * remove the video given by videoId from the listing (and returns the stake to the staker)
     * @param {string} videoId video identifier
     * @return information about the transaction
     * @example let tx = await paratii.eth.tcr.exit('some-video-id')
     */

  }, {
    key: 'exit',
    value: function exit(videoId) {
      var isWhitelisted, listing, sender, challenge, contract, hash;
      return _regenerator2.default.async(function exit$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 2;
              return _regenerator2.default.awrap(this.isWhitelisted(videoId));

            case 2:
              isWhitelisted = _context9.sent;

              if (isWhitelisted) {
                _context9.next = 5;
                break;
              }

              throw new Error('The video must be whitelisted in order to exit');

            case 5:
              _context9.next = 7;
              return _regenerator2.default.awrap(this.getListing(videoId));

            case 7:
              listing = _context9.sent;
              sender = this.eth.getAccount();

              if (!(sender !== listing.owner)) {
                _context9.next = 11;
                break;
              }

              throw new Error('You must be the owner of the listing to exit the whitelist');

            case 11:
              if (!(parseInt(listing.challengeID) !== 0)) {
                _context9.next = 17;
                break;
              }

              _context9.next = 14;
              return _regenerator2.default.awrap(this.getChallenge(listing.challengeID));

            case 14:
              challenge = _context9.sent;

              if (!(parseInt(challenge.resolved) !== 1)) {
                _context9.next = 17;
                break;
              }

              throw new Error('You can\'t exit during a challenge');

            case 17:
              _context9.next = 19;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 19:
              contract = _context9.sent;
              hash = this.getHash(videoId);
              return _context9.abrupt('return', contract.methods.exit(hash).send());

            case 22:
            case 'end':
              return _context9.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'approveAndStartChallenge',
    value: function approveAndStartChallenge(videoId, _data) {
      var listing, unstakedDeposit, tcrRegistry, result;
      return _regenerator2.default.async(function approveAndStartChallenge$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              _context10.next = 2;
              return _regenerator2.default.awrap(this.getListing(videoId));

            case 2:
              listing = _context10.sent;
              unstakedDeposit = listing.unstakedDeposit;
              _context10.next = 6;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 6:
              tcrRegistry = _context10.sent;
              _context10.next = 9;
              return _regenerator2.default.awrap(this.eth.approve(tcrRegistry.options.address, unstakedDeposit));

            case 9:
              _context10.next = 11;
              return _regenerator2.default.awrap(this.startChallenge(videoId, _data));

            case 11:
              result = _context10.sent;
              return _context10.abrupt('return', result);

            case 13:
            case 'end':
              return _context10.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'startChallenge',
    value: function startChallenge(videoId, _data) {
      var tcrRegistry, hash, minDepositn, balancen, allowancen, allowance, balance, minDeposit, appWasMade, isWhitelisted, listing, pollID;
      return _regenerator2.default.async(function startChallenge$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              if (!_data) {
                _data = '';
              }

              _context11.next = 3;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 3:
              tcrRegistry = _context11.sent;
              hash = this.getAndStoreHash(videoId);

              // 1. check if challenger has enough minDeposit and approved the
              // contract to spend that

              _context11.next = 7;
              return _regenerator2.default.awrap(this.getMinDeposit());

            case 7:
              minDepositn = _context11.sent;
              _context11.next = 10;
              return _regenerator2.default.awrap(this.eth.balanceOf(this.eth.config.account.address, 'PTI'));

            case 10:
              balancen = _context11.sent;
              _context11.next = 13;
              return _regenerator2.default.awrap(this.eth.allowance(this.eth.getAccount(), tcrRegistry.options.address));

            case 13:
              allowancen = _context11.sent;
              allowance = new _bignumber.BigNumber(allowancen);
              balance = new _bignumber.BigNumber(balancen);
              minDeposit = new _bignumber.BigNumber(minDepositn);

              if (!allowance.lt(minDeposit)) {
                _context11.next = 19;
                break;
              }

              throw new Error('allowance ' + allowance.toString() + ' is less than ' + minDeposit.toString());

            case 19:
              if (!balance.lt(minDeposit)) {
                _context11.next = 21;
                break;
              }

              throw new Error('balance ' + balance.toString() + ' is less than ' + minDeposit.toString());

            case 21:
              _context11.next = 23;
              return _regenerator2.default.awrap(this.appWasMade(videoId));

            case 23:
              appWasMade = _context11.sent;
              _context11.next = 26;
              return _regenerator2.default.awrap(this.isWhitelisted(videoId));

            case 26:
              isWhitelisted = _context11.sent;

              if (!(!appWasMade && !isWhitelisted)) {
                _context11.next = 29;
                break;
              }

              throw new Error('video ' + videoId + ' has no application or is not whitelisted');

            case 29:
              _context11.next = 31;
              return _regenerator2.default.awrap(this.getListing(videoId));

            case 31:
              listing = _context11.sent;

              if (!(parseInt(listing.challengeID) !== 0)) {
                _context11.next = 34;
                break;
              }

              throw new Error('challenge for ' + videoId + ' already exist. challengeID ' + listing.challengeID);

            case 34:
              _context11.next = 36;
              return _regenerator2.default.awrap(tcrRegistry.methods.challenge(hash, _data).send());

            case 36:
              pollID = _context11.sent;

              if (pollID) {
                _context11.next = 39;
                break;
              }

              throw new Error('starting Challenge ' + videoId + ' failed!!');

            case 39:
              return _context11.abrupt('return', pollID);

            case 40:
            case 'end':
              return _context11.stop();
          }
        }
      }, null, this);
    }

    /**
     * Updates a listingHash's status from 'application' to 'listing' or resolves
     * a challenge if one exists.
     * this is required to be able to use claimReward.
     * @param  {string}  videoId id of the video
     * @return {Promise}         tx of the updateStatus
     */

  }, {
    key: 'updateStatus',
    value: function updateStatus(videoId) {
      var hash, tcrRegistry, tx;
      return _regenerator2.default.async(function updateStatus$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              hash = this.getAndStoreHash(videoId);
              _context12.next = 3;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 3:
              tcrRegistry = _context12.sent;
              _context12.next = 6;
              return _regenerator2.default.awrap(tcrRegistry.methods.updateStatus(hash).send());

            case 6:
              tx = _context12.sent;
              return _context12.abrupt('return', tx);

            case 8:
            case 'end':
              return _context12.stop();
          }
        }
      }, null, this);
    }

    /**
     * claim reward. nuff said.
     * @param  {string}  videoId id of the video.
     * @param  {string}  salt    salt used in that vote.
     * @return {Promise}         the claimReward tx
     */

  }, {
    key: 'claimReward',
    value: function claimReward(videoId, salt) {
      var tcrRegistry, listing, challengeID, challenge, tx;
      return _regenerator2.default.async(function claimReward$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              _context13.next = 2;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 2:
              tcrRegistry = _context13.sent;
              _context13.next = 5;
              return _regenerator2.default.awrap(this.getListing(videoId));

            case 5:
              listing = _context13.sent;
              challengeID = listing.challengeID;

              // Ensure the voter has not already claimed tokens and challenge results have been processed

              _context13.next = 9;
              return _regenerator2.default.awrap(this.getChallenge(challengeID));

            case 9:
              challenge = _context13.sent;

              if (!(challenge.tokenClaims[this.eth.getAccount()] !== false)) {
                _context13.next = 12;
                break;
              }

              throw new Error('Account ' + this.eth.getAccount() + ' has already claimed reward. for video ' + videoId);

            case 12:
              if (!(challenge.resolved !== true)) {
                _context13.next = 14;
                break;
              }

              throw new Error('Challenge ' + challengeID + ' (videoId: ' + videoId + ') hasn\'t been resolved');

            case 14:
              _context13.next = 16;
              return _regenerator2.default.awrap(tcrRegistry.methods.claimReward(this.eth.web3.utils.toHex(challengeID.toString()), salt).send());

            case 16:
              tx = _context13.sent;
              return _context13.abrupt('return', tx);

            case 18:
            case 'end':
              return _context13.stop();
          }
        }
      }, null, this);
    }

    // -----------------------
    // VOTING FUNCTIONS
    // -----------------------

  }, {
    key: 'approveAndGetRightsAndCommitVote',
    value: function approveAndGetRightsAndCommitVote(videoId, vote, amountInWei) {
      var tcrPLCRVoting, listing, challengeExists, isCommitPeriodActive, approved, tx, commitVoteTx;
      return _regenerator2.default.async(function approveAndGetRightsAndCommitVote$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              _context14.next = 2;
              return _regenerator2.default.awrap(this.getPLCRVotingContract());

            case 2:
              tcrPLCRVoting = _context14.sent;
              _context14.next = 5;
              return _regenerator2.default.awrap(this.getListing(videoId));

            case 5:
              listing = _context14.sent;
              _context14.next = 8;
              return _regenerator2.default.awrap(this.challengeExists(videoId));

            case 8:
              challengeExists = _context14.sent;

              if (challengeExists) {
                _context14.next = 11;
                break;
              }

              throw new Error('Challenge ' + listing.challengeID + ' is finished');

            case 11:
              _context14.next = 13;
              return _regenerator2.default.awrap(this.commitPeriodActive(listing.challengeID));

            case 13:
              isCommitPeriodActive = _context14.sent;

              if (isCommitPeriodActive) {
                _context14.next = 16;
                break;
              }

              throw new Error('Commit period for Challenge ' + listing.challengeID + ' is finished');

            case 16:
              _context14.next = 18;
              return _regenerator2.default.awrap(this.eth.approve(tcrPLCRVoting.options.address, amountInWei));

            case 18:
              approved = _context14.sent;

              if (approved) {
                _context14.next = 21;
                break;
              }

              throw new Error('Token approvation failed');

            case 21:
              _context14.next = 23;
              return _regenerator2.default.awrap(this.requestVotingRights(amountInWei));

            case 23:
              tx = _context14.sent;

              if (tx.events._VotingRightsGranted) {
                _context14.next = 26;
                break;
              }

              throw new Error('Rights request failed');

            case 26:
              _context14.next = 28;
              return _regenerator2.default.awrap(this.commitVote(videoId, vote, amountInWei));

            case 28:
              commitVoteTx = _context14.sent;
              return _context14.abrupt('return', commitVoteTx);

            case 30:
            case 'end':
              return _context14.stop();
          }
        }
      }, null, this);
    }
    /**
     * Commits vote using hash of choice and secret salt to conceal vote until reveal
     * @param  {string}  videoId videoId
     * @param  {bignumber}  vote    1 = yes, 0 = no
     * @param  {bignumber}  amount  amount of tokens to vote with.
     * @return {Promise}         commitVote tx
     */

  }, {
    key: 'commitVote',
    value: function commitVote(videoId, vote, amountInWei) {
      var tcrPLCRVoting, amount, listing, pollID, isCommitPeriodActive, balancen, balance, hasVotingRights, salt, secretHash, prevNode, isValidPosition, tx;
      return _regenerator2.default.async(function commitVote$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              _context15.next = 2;
              return _regenerator2.default.awrap(this.eth.getContract('TcrPLCRVoting'));

            case 2:
              tcrPLCRVoting = _context15.sent;
              amount = new _bignumber.BigNumber(amountInWei);
              _context15.next = 6;
              return _regenerator2.default.awrap(this.getListing(videoId));

            case 6:
              listing = _context15.sent;

              if (listing) {
                _context15.next = 9;
                break;
              }

              throw new Error('Can\'t find listing for video ' + videoId);

            case 9:
              pollID = listing.challengeID;

              if (!(!pollID || parseInt(pollID) === 0)) {
                _context15.next = 12;
                break;
              }

              throw new Error('Video ' + videoId + ' isn\'t currently being challenged');

            case 12:
              _context15.next = 14;
              return _regenerator2.default.awrap(this.commitPeriodActive(pollID));

            case 14:
              isCommitPeriodActive = _context15.sent;

              if (isCommitPeriodActive) {
                _context15.next = 17;
                break;
              }

              throw new Error('The challenge is not in commit period');

            case 17:
              _context15.next = 19;
              return _regenerator2.default.awrap(this.eth.balanceOf(this.eth.getAccount(), 'PTI'));

            case 19:
              balancen = _context15.sent;
              balance = new _bignumber.BigNumber(balancen);

              if (!balance.lt(amount)) {
                _context15.next = 23;
                break;
              }

              throw new Error(this.eth.getAccount() + ' balance (' + balance.toString() + ') is insufficient (amount = ' + amount.toString() + ')');

            case 23:
              _context15.next = 25;
              return _regenerator2.default.awrap(this.hasVotingRights(amountInWei));

            case 25:
              hasVotingRights = _context15.sent;

              if (hasVotingRights) {
                _context15.next = 28;
                break;
              }

              throw new Error('You don\'t have enough voting rights');

            case 28:

              // generate salt and store it.
              salt = this.generateSalt(32);

              this.storeSalt(videoId, salt);
              secretHash = this.eth.web3.utils.soliditySha3(vote, salt);

              // get previous PollID

              _context15.next = 33;
              return _regenerator2.default.awrap(this.getLastNode(this.eth.getAccount()));

            case 33:
              prevNode = _context15.sent;
              _context15.next = 36;
              return _regenerator2.default.awrap(this.validPosition(prevNode, pollID, this.eth.getAccount(), amount));

            case 36:
              isValidPosition = _context15.sent;

              if (isValidPosition) {
                _context15.next = 39;
                break;
              }

              throw new Error('position is invalid');

            case 39:
              _context15.next = 41;
              return _regenerator2.default.awrap(tcrPLCRVoting.methods.commitVote(pollID, secretHash, amount, prevNode).send());

            case 41:
              tx = _context15.sent;
              return _context15.abrupt('return', tx);

            case 43:
            case 'end':
              return _context15.stop();
          }
        }
      }, null, this);
    }

    /**
     * Reveals vote with choice and secret salt used in generating commitHash to attribute committed tokens
     * @param  {BigNumber}  pollID     poll Id of the vote to reveal.
     * @param  {uint}  voteOption 1 for yes, 0 or other for no.
     * @param  {string}  salt       salt used when commiting the vote.
     * @return {Promise}            revealVote tx
     */

  }, {
    key: 'revealVote',
    value: function revealVote(pollID, voteOption, salt) {
      var tcrPLCRVoting, isRevealPeriodActive, didCommit, didReveal, secretHash, commitHash, tx;
      return _regenerator2.default.async(function revealVote$(_context16) {
        while (1) {
          switch (_context16.prev = _context16.next) {
            case 0:
              _context16.next = 2;
              return _regenerator2.default.awrap(this.eth.getContract('TcrPLCRVoting'));

            case 2:
              tcrPLCRVoting = _context16.sent;
              _context16.next = 5;
              return _regenerator2.default.awrap(this.revealPeriodActive(pollID));

            case 5:
              isRevealPeriodActive = _context16.sent;

              if (isRevealPeriodActive) {
                _context16.next = 8;
                break;
              }

              throw new Error('Reveal Period for poll ' + pollID.toString() + ' is not active');

            case 8:
              _context16.next = 10;
              return _regenerator2.default.awrap(this.didCommit(this.eth.getAccount(), pollID));

            case 10:
              didCommit = _context16.sent;

              if (didCommit) {
                _context16.next = 13;
                break;
              }

              throw new Error('user ' + this.eth.getAccount() + ' didn\'t commit to vote ' + pollID.toString());

            case 13:
              _context16.next = 15;
              return _regenerator2.default.awrap(this.didReveal(this.eth.getAccount(), pollID));

            case 15:
              didReveal = _context16.sent;

              if (!didReveal) {
                _context16.next = 18;
                break;
              }

              throw new Error('user ' + this.eth.getAccount() + ' already revealed vote ' + pollID.toString());

            case 18:
              secretHash = this.eth.web3.utils.soliditySha3(voteOption, salt);
              _context16.next = 21;
              return _regenerator2.default.awrap(this.getCommitHash(this.eth.getAccount(), pollID));

            case 21:
              commitHash = _context16.sent;

              if (!(commitHash !== secretHash)) {
                _context16.next = 24;
                break;
              }

              throw new Error('commitHash ' + commitHash + ' !== secretHash ' + secretHash);

            case 24:
              _context16.next = 26;
              return _regenerator2.default.awrap(tcrPLCRVoting.methods.revealVote(pollID, voteOption, salt).send());

            case 26:
              tx = _context16.sent;
              return _context16.abrupt('return', tx);

            case 28:
            case 'end':
              return _context16.stop();
          }
        }
      }, null, this);
    }

    /**
     * Loads amount ERC20 tokens into the voting contract for one-to-one voting rights
     * @param  {bignumber}  amount amount to deposit into voting contract.
     * @return {Promise}        `requestVotingRights` tx
     */

  }, {
    key: 'requestVotingRights',
    value: function requestVotingRights(amount) {
      var tcrPLCRVoting, balancen, balance, allowancen, allowance, tx;
      return _regenerator2.default.async(function requestVotingRights$(_context17) {
        while (1) {
          switch (_context17.prev = _context17.next) {
            case 0:
              _context17.next = 2;
              return _regenerator2.default.awrap(this.eth.getContract('TcrPLCRVoting'));

            case 2:
              tcrPLCRVoting = _context17.sent;
              _context17.next = 5;
              return _regenerator2.default.awrap(this.eth.balanceOf(this.eth.getAccount(), 'PTI'));

            case 5:
              balancen = _context17.sent;
              balance = new _bignumber.BigNumber(balancen);

              if (!balance.lt(amount)) {
                _context17.next = 9;
                break;
              }

              throw new Error(this.eth.getAccount() + ' balance (' + balance.toString() + ') is insufficient (amount = ' + amount.toString() + ')');

            case 9:
              _context17.next = 11;
              return _regenerator2.default.awrap(this.eth.allowance(this.eth.getAccount(), tcrPLCRVoting.options.address));

            case 11:
              allowancen = _context17.sent;
              allowance = new _bignumber.BigNumber(allowancen);

              if (!allowance.lt(amount)) {
                _context17.next = 15;
                break;
              }

              throw new Error('PLCRVoting Contract allowance (' + allowance.toString() + ') is < amount (' + amount.toString() + ')');

            case 15:
              _context17.next = 17;
              return _regenerator2.default.awrap(tcrPLCRVoting.methods.requestVotingRights(amount).send());

            case 17:
              tx = _context17.sent;
              return _context17.abrupt('return', tx);

            case 19:
            case 'end':
              return _context17.stop();
          }
        }
      }, null, this);
    }

    /**
     * Withdraw amount ERC20 tokens from the voting contract, revoking these voting rights
     * @param  {bignumber}  amount amount to withdraw
     * @return {Promise}        withdrawVotingRights tx
     */

  }, {
    key: 'withdrawVotingRights',
    value: function withdrawVotingRights(amount) {
      var tcrPLCRVoting, voterBalancen, lockedTokens, voterBalance, balanceAfter, tx;
      return _regenerator2.default.async(function withdrawVotingRights$(_context18) {
        while (1) {
          switch (_context18.prev = _context18.next) {
            case 0:
              _context18.next = 2;
              return _regenerator2.default.awrap(this.eth.getContract('TcrPLCRVoting'));

            case 2:
              tcrPLCRVoting = _context18.sent;
              _context18.next = 5;
              return _regenerator2.default.awrap(tcrPLCRVoting.methods.voteTokenBalance(this.eth.getAccount()).call());

            case 5:
              voterBalancen = _context18.sent;
              _context18.next = 8;
              return _regenerator2.default.awrap(this.getLockedTokens(this.eth.getAccount()));

            case 8:
              lockedTokens = _context18.sent;
              voterBalance = new _bignumber.BigNumber(voterBalancen);
              balanceAfter = voterBalance.minus(lockedTokens);

              if (!balanceAfter.lt(amount)) {
                _context18.next = 13;
                break;
              }

              throw new Error('unlocked balance ' + balanceAfter.toString() + ' is < amount ' + amount.toString());

            case 13:
              _context18.next = 15;
              return _regenerator2.default.awrap(tcrPLCRVoting.methods.withdrawVotingRights(amount).send());

            case 15:
              tx = _context18.sent;
              return _context18.abrupt('return', tx);

            case 17:
            case 'end':
              return _context18.stop();
          }
        }
      }, null, this);
    }

    /**
     * Unlocks tokens locked in unrevealed vote where poll has ended
     * @param  {uint}  pollID the pollID , aka challengeID
     * @return {Promise}        rescueTokens tx
     */

  }, {
    key: 'rescueTokens',
    value: function rescueTokens(pollID) {
      var tcrPLCRVoting, poll, isExpired, tx;
      return _regenerator2.default.async(function rescueTokens$(_context19) {
        while (1) {
          switch (_context19.prev = _context19.next) {
            case 0:
              _context19.next = 2;
              return _regenerator2.default.awrap(this.eth.getContract('TcrPLCRVoting'));

            case 2:
              tcrPLCRVoting = _context19.sent;
              _context19.next = 5;
              return _regenerator2.default.awrap(tcrPLCRVoting.methods.pollMap(pollID).call());

            case 5:
              poll = _context19.sent;
              _context19.next = 8;
              return _regenerator2.default.awrap(this.isExpired(poll.revealEndDate));

            case 8:
              isExpired = _context19.sent;

              if (isExpired) {
                _context19.next = 11;
                break;
              }

              throw new Error('poll ' + pollID.toString() + ' did not expire just yet.');

            case 11:
              _context19.next = 13;
              return _regenerator2.default.awrap(tcrPLCRVoting.methods.rescueTokens(pollID).send());

            case 13:
              tx = _context19.sent;
              return _context19.abrupt('return', tx);

            case 15:
            case 'end':
              return _context19.stop();
          }
        }
      }, null, this);
    }

    // -----------------------
    // TCR UTILS
    // -----------------------

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
      var contract, hash, isWhitelisted;
      return _regenerator2.default.async(function isWhitelisted$(_context20) {
        while (1) {
          switch (_context20.prev = _context20.next) {
            case 0:
              _context20.next = 2;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 2:
              contract = _context20.sent;
              hash = this.getHash(videoId);
              _context20.next = 6;
              return _regenerator2.default.awrap(contract.methods.isWhitelisted(hash).call());

            case 6:
              isWhitelisted = _context20.sent;
              return _context20.abrupt('return', isWhitelisted);

            case 8:
            case 'end':
              return _context20.stop();
          }
        }
      }, null, this);
    }

    /**
     * Determines whether the given videoId be whitelisted.
     * @param  {string}  videoId id of the video
     * @return {Promise}         true if it can be whitelisted.
     */

  }, {
    key: 'canBeWhitelisted',
    value: function canBeWhitelisted(videoId) {
      var hash, tcrRegistry, canBeWhitelisted;
      return _regenerator2.default.async(function canBeWhitelisted$(_context21) {
        while (1) {
          switch (_context21.prev = _context21.next) {
            case 0:
              hash = this.getHash(videoId);
              _context21.next = 3;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 3:
              tcrRegistry = _context21.sent;
              _context21.next = 6;
              return _regenerator2.default.awrap(tcrRegistry.methods.canBeWhitelisted(hash).call());

            case 6:
              canBeWhitelisted = _context21.sent;
              return _context21.abrupt('return', canBeWhitelisted);

            case 8:
            case 'end':
              return _context21.stop();
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
      var contract, hash, appWasMade;
      return _regenerator2.default.async(function appWasMade$(_context22) {
        while (1) {
          switch (_context22.prev = _context22.next) {
            case 0:
              _context22.next = 2;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 2:
              contract = _context22.sent;
              hash = this.getHash(videoId);
              _context22.next = 6;
              return _regenerator2.default.awrap(contract.methods.appWasMade(hash).call());

            case 6:
              appWasMade = _context22.sent;
              return _context22.abrupt('return', appWasMade);

            case 8:
            case 'end':
              return _context22.stop();
          }
        }
      }, null, this);
    }

    /**
     * checks whether the video has an unresolved challenge or not
     * @param  {string}  videoId id of the video
     * @return {Promise}        true if the video has an unresolved challenge, false otherwise
     * @example let challenge = await paratii.eth.tcr.challengeExists(1)
     */

  }, {
    key: 'challengeExists',
    value: function challengeExists(videoId) {
      var challenge, challengeID;
      return _regenerator2.default.async(function challengeExists$(_context23) {
        while (1) {
          switch (_context23.prev = _context23.next) {
            case 0:
              challenge = void 0;
              _context23.next = 3;
              return _regenerator2.default.awrap(this.getChallengeId(videoId));

            case 3:
              challengeID = _context23.sent;

              if (!(parseInt(challengeID) !== 0)) {
                _context23.next = 8;
                break;
              }

              _context23.next = 7;
              return _regenerator2.default.awrap(this.getChallenge(challengeID));

            case 7:
              challenge = _context23.sent;

            case 8:
              return _context23.abrupt('return', challengeID > 0 && !challenge.resolved);

            case 9:
            case 'end':
              return _context23.stop();
          }
        }
      }, null, this);
    }

    /**
    * Determines whether voting has concluded in a challenge for a given
    * videoId. Throws if no challenge exists.
    * @param  {string}  videoId univocal video id
    * @return {Promise}         true if voting has concluded,false otherwise
    */

  }, {
    key: 'challengeCanBeResolved',
    value: function challengeCanBeResolved(videoId) {
      var contract, result;
      return _regenerator2.default.async(function challengeCanBeResolved$(_context24) {
        while (1) {
          switch (_context24.prev = _context24.next) {
            case 0:
              _context24.next = 2;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 2:
              contract = _context24.sent;

              if (this.challengeExists(videoId)) {
                _context24.next = 5;
                break;
              }

              throw Error('No challenge is in progress for video with id = ' + videoId);

            case 5:
              _context24.next = 7;
              return _regenerator2.default.awrap(contract.methods.challengeCanBeResolved(this.getHash(videoId)).call());

            case 7:
              result = _context24.sent;
              return _context24.abrupt('return', result);

            case 9:
            case 'end':
              return _context24.stop();
          }
        }
      }, null, this);
    }
    /**
     * get the listing of that videoId
     * @param  {string}  videoId id of the video
     * @return {Promise}        that resolves in the listings
     * @example let listing = await paratii.eth.tcr.getListing('video-id')
     */

  }, {
    key: 'getListing',
    value: function getListing(videoId) {
      var contract, hash, listing;
      return _regenerator2.default.async(function getListing$(_context25) {
        while (1) {
          switch (_context25.prev = _context25.next) {
            case 0:
              _context25.next = 2;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 2:
              contract = _context25.sent;
              hash = this.getHash(videoId);
              _context25.next = 6;
              return _regenerator2.default.awrap(contract.methods.listings(hash).call());

            case 6:
              listing = _context25.sent;

              if (!(listing.owner === '0x0000000000000000000000000000000000000000')) {
                _context25.next = 9;
                break;
              }

              throw Error('Listing with videoId ' + videoId + ' doesn\'t exists');

            case 9:
              return _context25.abrupt('return', listing);

            case 10:
            case 'end':
              return _context25.stop();
          }
        }
      }, null, this);
    }

    /**
     * get the challenge of that challengeId
     * @param  {integer}  challengeId id of the challenge
     * @return {Promise}        that resolves in the challenge
     * @example let challenge = await paratii.eth.tcr.getChallenge(1)
     */

  }, {
    key: 'getChallenge',
    value: function getChallenge(challengeId) {
      var contract, challenge;
      return _regenerator2.default.async(function getChallenge$(_context26) {
        while (1) {
          switch (_context26.prev = _context26.next) {
            case 0:
              _context26.next = 2;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 2:
              contract = _context26.sent;
              _context26.next = 5;
              return _regenerator2.default.awrap(contract.methods.challenges(challengeId).call());

            case 5:
              challenge = _context26.sent;

              if (!(challenge.challenger === '0x0000000000000000000000000000000000000000')) {
                _context26.next = 8;
                break;
              }

              throw Error('Challenge with challengeId ' + challengeId + ' doesn\'t exists');

            case 8:
              return _context26.abrupt('return', challenge);

            case 9:
            case 'end':
              return _context26.stop();
          }
        }
      }, null, this);
    }

    /**
     * get the challenge Id of that video
     * @param  {string}  videoId univocal id of the video
     * @return {Promise}         id of the challenge of that video
     */

  }, {
    key: 'getChallengeId',
    value: function getChallengeId(videoId) {
      var listing;
      return _regenerator2.default.async(function getChallengeId$(_context27) {
        while (1) {
          switch (_context27.prev = _context27.next) {
            case 0:
              _context27.next = 2;
              return _regenerator2.default.awrap(this.getListing(videoId));

            case 2:
              listing = _context27.sent;
              return _context27.abrupt('return', listing.challengeID);

            case 4:
            case 'end':
              return _context27.stop();
          }
        }
      }, null, this);
    }

    /**
     * get the hash of the video Id to be inserted in the TCR contract
     * @param  {string} videoId univocal id of the video
     * @return {string}         sha3 of the id
     */

  }, {
    key: 'getHash',
    value: function getHash(videoId) {
      return this.eth.web3.utils.soliditySha3(videoId);
    }

    // -----------------------
    // VOTING UTILS
    // -----------------------

  }, {
    key: 'isExpired',
    value: function isExpired(deadline) {
      var tcrPLCRVoting, isExpired;
      return _regenerator2.default.async(function isExpired$(_context28) {
        while (1) {
          switch (_context28.prev = _context28.next) {
            case 0:
              _context28.next = 2;
              return _regenerator2.default.awrap(this.eth.getContract('TcrPLCRVoting'));

            case 2:
              tcrPLCRVoting = _context28.sent;
              _context28.next = 5;
              return _regenerator2.default.awrap(tcrPLCRVoting.methods.isExpired(deadline).call());

            case 5:
              isExpired = _context28.sent;
              return _context28.abrupt('return', isExpired);

            case 7:
            case 'end':
              return _context28.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'getLockedTokens',
    value: function getLockedTokens(voterAddress) {
      var tcrPLCRVoting, lockedTokens;
      return _regenerator2.default.async(function getLockedTokens$(_context29) {
        while (1) {
          switch (_context29.prev = _context29.next) {
            case 0:
              if (!voterAddress) {
                voterAddress = this.eth.getAccount();
              }
              _context29.next = 3;
              return _regenerator2.default.awrap(this.eth.getContract('TcrPLCRVoting'));

            case 3:
              tcrPLCRVoting = _context29.sent;
              _context29.next = 6;
              return _regenerator2.default.awrap(tcrPLCRVoting.methods.getLockedTokens(voterAddress).call());

            case 6:
              lockedTokens = _context29.sent;
              return _context29.abrupt('return', lockedTokens);

            case 8:
            case 'end':
              return _context29.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'commitPeriodActive',
    value: function commitPeriodActive(pollID) {
      var tcrPLCRVoting, isCommitPeriodActive;
      return _regenerator2.default.async(function commitPeriodActive$(_context30) {
        while (1) {
          switch (_context30.prev = _context30.next) {
            case 0:
              _context30.next = 2;
              return _regenerator2.default.awrap(this.eth.getContract('TcrPLCRVoting'));

            case 2:
              tcrPLCRVoting = _context30.sent;
              _context30.next = 5;
              return _regenerator2.default.awrap(tcrPLCRVoting.methods.commitPeriodActive(pollID).call());

            case 5:
              isCommitPeriodActive = _context30.sent;
              return _context30.abrupt('return', isCommitPeriodActive);

            case 7:
            case 'end':
              return _context30.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'revealPeriodActive',
    value: function revealPeriodActive(pollID) {
      var tcrPLCRVoting, isRevealPeriodActive;
      return _regenerator2.default.async(function revealPeriodActive$(_context31) {
        while (1) {
          switch (_context31.prev = _context31.next) {
            case 0:
              _context31.next = 2;
              return _regenerator2.default.awrap(this.eth.getContract('TcrPLCRVoting'));

            case 2:
              tcrPLCRVoting = _context31.sent;
              _context31.next = 5;
              return _regenerator2.default.awrap(tcrPLCRVoting.methods.revealPeriodActive(pollID).call());

            case 5:
              isRevealPeriodActive = _context31.sent;
              return _context31.abrupt('return', isRevealPeriodActive);

            case 7:
            case 'end':
              return _context31.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'didCommit',
    value: function didCommit(voterAddress, pollID) {
      var tcrPLCRVoting, didCommit;
      return _regenerator2.default.async(function didCommit$(_context32) {
        while (1) {
          switch (_context32.prev = _context32.next) {
            case 0:
              _context32.next = 2;
              return _regenerator2.default.awrap(this.eth.getContract('TcrPLCRVoting'));

            case 2:
              tcrPLCRVoting = _context32.sent;
              _context32.next = 5;
              return _regenerator2.default.awrap(tcrPLCRVoting.methods.didCommit(voterAddress, pollID).call());

            case 5:
              didCommit = _context32.sent;
              return _context32.abrupt('return', didCommit);

            case 7:
            case 'end':
              return _context32.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'didReveal',
    value: function didReveal(voterAddress, pollID) {
      var tcrPLCRVoting, didReveal;
      return _regenerator2.default.async(function didReveal$(_context33) {
        while (1) {
          switch (_context33.prev = _context33.next) {
            case 0:
              _context33.next = 2;
              return _regenerator2.default.awrap(this.eth.getContract('TcrPLCRVoting'));

            case 2:
              tcrPLCRVoting = _context33.sent;
              _context33.next = 5;
              return _regenerator2.default.awrap(tcrPLCRVoting.methods.didReveal(voterAddress, pollID).call());

            case 5:
              didReveal = _context33.sent;
              return _context33.abrupt('return', didReveal);

            case 7:
            case 'end':
              return _context33.stop();
          }
        }
      }, null, this);
    }

    /**
     * Calculates the provided voter's token reward for the given poll.
     * @param  {string}  voterAddress address of the voter
     * @param  {uint}  challengeID  challengeID ( in hex )
     * @param  {string}  salt         the salt used for that vote.
     * @return {Number}              returns the voterReward in BN format.
     */

  }, {
    key: 'voterReward',
    value: function voterReward(voterAddress, challengeID, salt) {
      var tcrRegistry, voterReward;
      return _regenerator2.default.async(function voterReward$(_context34) {
        while (1) {
          switch (_context34.prev = _context34.next) {
            case 0:
              _context34.next = 2;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 2:
              tcrRegistry = _context34.sent;
              _context34.next = 5;
              return _regenerator2.default.awrap(tcrRegistry.methods.voterReward(voterAddress, challengeID, salt).call());

            case 5:
              voterReward = _context34.sent;
              return _context34.abrupt('return', voterReward);

            case 7:
            case 'end':
              return _context34.stop();
          }
        }
      }, null, this);
    }

    /**
     * THIS COULD CAUSE PROBLEM IN PRODUCTION
     */

  }, {
    key: 'isInApplyStage',
    value: function isInApplyStage(videoId) {
      var listing, latestBlock;
      return _regenerator2.default.async(function isInApplyStage$(_context35) {
        while (1) {
          switch (_context35.prev = _context35.next) {
            case 0:
              _context35.next = 2;
              return _regenerator2.default.awrap(this.getListing(videoId));

            case 2:
              listing = _context35.sent;
              _context35.next = 5;
              return _regenerator2.default.awrap(this.eth.web3.eth.getBlock('latest'));

            case 5:
              latestBlock = _context35.sent;
              return _context35.abrupt('return', listing.applicationExpiry > latestBlock.timestamp);

            case 7:
            case 'end':
              return _context35.stop();
          }
        }
      }, null, this);
    }
    /**
     * Gets top element of sorted poll-linked-list
     * @param  {address}  voter the address of the voter
     * @return {Promise}       [description]
     */

  }, {
    key: 'getLastNode',
    value: function getLastNode(voter) {
      var tcrPLCRVoting, lastNode;
      return _regenerator2.default.async(function getLastNode$(_context36) {
        while (1) {
          switch (_context36.prev = _context36.next) {
            case 0:
              if (!voter) {
                voter = this.eth.getAccount();
              }
              _context36.next = 3;
              return _regenerator2.default.awrap(this.eth.getContract('TcrPLCRVoting'));

            case 3:
              tcrPLCRVoting = _context36.sent;
              _context36.next = 6;
              return _regenerator2.default.awrap(tcrPLCRVoting.methods.getLastNode(voter).call());

            case 6:
              lastNode = _context36.sent;
              return _context36.abrupt('return', lastNode);

            case 8:
            case 'end':
              return _context36.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'getCommitHash',
    value: function getCommitHash(voterAddress, pollID) {
      var tcrPLCRVoting, commitHash;
      return _regenerator2.default.async(function getCommitHash$(_context37) {
        while (1) {
          switch (_context37.prev = _context37.next) {
            case 0:
              _context37.next = 2;
              return _regenerator2.default.awrap(this.eth.getContract('TcrPLCRVoting'));

            case 2:
              tcrPLCRVoting = _context37.sent;
              _context37.next = 5;
              return _regenerator2.default.awrap(tcrPLCRVoting.methods.getCommitHash(voterAddress, pollID).call());

            case 5:
              commitHash = _context37.sent;
              return _context37.abrupt('return', commitHash);

            case 7:
            case 'end':
              return _context37.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'isPassed',
    value: function isPassed(pollID) {
      var tcrPLCRVoting, didPass;
      return _regenerator2.default.async(function isPassed$(_context38) {
        while (1) {
          switch (_context38.prev = _context38.next) {
            case 0:
              _context38.next = 2;
              return _regenerator2.default.awrap(this.eth.getContract('TcrPLCRVoting'));

            case 2:
              tcrPLCRVoting = _context38.sent;
              _context38.next = 5;
              return _regenerator2.default.awrap(tcrPLCRVoting.methods.isPassed(pollID).call());

            case 5:
              didPass = _context38.sent;
              return _context38.abrupt('return', didPass);

            case 7:
            case 'end':
              return _context38.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'getNumPassingTokens',
    value: function getNumPassingTokens(voterAddress, pollID, salt) {
      var tcrPLCRVoting, winnings;
      return _regenerator2.default.async(function getNumPassingTokens$(_context39) {
        while (1) {
          switch (_context39.prev = _context39.next) {
            case 0:
              _context39.next = 2;
              return _regenerator2.default.awrap(this.eth.getContract('TcrPLCRVoting'));

            case 2:
              tcrPLCRVoting = _context39.sent;
              _context39.next = 5;
              return _regenerator2.default.awrap(tcrPLCRVoting.methods.getNumPassingTokens(voterAddress, pollID, salt).call());

            case 5:
              winnings = _context39.sent;
              return _context39.abrupt('return', winnings);

            case 7:
            case 'end':
              return _context39.stop();
          }
        }
      }, null, this);
    }

    /**
     * Compares previous and next poll's committed tokens for sorting purposes
     * @param  {bignumber}  prevPollID uint of the previous PollID
     * @param  {BigNumber}  nextPollID uint of the next PollID
     * @param  {address}  voter      eth address of the voter
     * @param  {BigNumber}  amount     the amount to commit to the current vote.
     * @return {Promise}            returns true if both prev and next positions are valid.
     */

  }, {
    key: 'validPosition',
    value: function validPosition(prevPollID, nextPollID, voter, amount) {
      var prevNumTokens, nextNumTokens;
      return _regenerator2.default.async(function validPosition$(_context40) {
        while (1) {
          switch (_context40.prev = _context40.next) {
            case 0:
              _context40.next = 2;
              return _regenerator2.default.awrap(this.getNumTokens(voter, prevPollID));

            case 2:
              prevNumTokens = _context40.sent;

              if (!amount.lt(prevNumTokens)) {
                _context40.next = 5;
                break;
              }

              throw new Error('prev position is invalid, prevPollID: ' + prevPollID.toString() + ',\n      numTokens: ' + prevNumTokens.toString() + ',\n      amount: ' + amount.toString());

            case 5:
              _context40.next = 7;
              return _regenerator2.default.awrap(this.getNumTokens(voter, nextPollID));

            case 7:
              nextNumTokens = _context40.sent;

              if (!amount.lt(nextNumTokens)) {
                _context40.next = 10;
                break;
              }

              throw new Error('next position is invalid, nextPollID: ' + nextPollID.toString() + ',\n      numTokens: ' + nextNumTokens.toString() + ',\n      amount: ' + amount.toString());

            case 10:
              return _context40.abrupt('return', true);

            case 11:
            case 'end':
              return _context40.stop();
          }
        }
      }, null, this);
    }

    /**
     * Wrapper for getAttribute with attrName="numTokens"
     * @param  {address}  voterAddress eth voter address
     * @param  {BigNumber}  pollID       uint of the pollID
     * @return {Promise}              bignumber of commited tokens.
     */

  }, {
    key: 'getNumTokens',
    value: function getNumTokens(voterAddress, pollID) {
      var tcrPLCRVoting, numTokens;
      return _regenerator2.default.async(function getNumTokens$(_context41) {
        while (1) {
          switch (_context41.prev = _context41.next) {
            case 0:
              _context41.next = 2;
              return _regenerator2.default.awrap(this.eth.getContract('TcrPLCRVoting'));

            case 2:
              tcrPLCRVoting = _context41.sent;
              _context41.next = 5;
              return _regenerator2.default.awrap(tcrPLCRVoting.methods.getNumTokens(voterAddress, pollID).call());

            case 5:
              numTokens = _context41.sent;
              return _context41.abrupt('return', numTokens);

            case 7:
            case 'end':
              return _context41.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'hasVotingRights',
    value: function hasVotingRights(amount) {
      var PLCRVoting, numTokens;
      return _regenerator2.default.async(function hasVotingRights$(_context42) {
        while (1) {
          switch (_context42.prev = _context42.next) {
            case 0:
              _context42.next = 2;
              return _regenerator2.default.awrap(this.getPLCRVotingContract());

            case 2:
              PLCRVoting = _context42.sent;
              _context42.next = 5;
              return _regenerator2.default.awrap(PLCRVoting.methods.voteTokenBalance(this.eth.getAccount()).call());

            case 5:
              numTokens = _context42.sent;
              return _context42.abrupt('return', numTokens >= amount);

            case 7:
            case 'end':
              return _context42.stop();
          }
        }
      }, null, this);
    }

    // -----------------------
    // LOCALSTORAGE UTILS
    // -----------------------

    /**
     * utility function to get the right localStorage
     * @return {Object} localStorage
     */

  }, {
    key: 'getLocalStorage',
    value: function getLocalStorage() {
      var localStorage = void 0;

      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage = window.localStorage;
      } else {
        var LocalStorage = require('node-localstorage').LocalStorage;
        localStorage = new LocalStorage('./test/data/nodeLocalstorage');
      }

      return localStorage;
    }
  }, {
    key: 'clearNodeLocalStorage',
    value: function clearNodeLocalStorage() {
      var LocalStorage = require('node-localstorage').LocalStorage;
      var localStorage = new LocalStorage('./test/data/nodeLocalstorage');

      localStorage.clear();
    }

    /**
     * get the hash to be inserted in the tcr and save it in localStorage
     * @param  {string} videoId univocal id of the video
     * @return {string}         hash of the id
     */

  }, {
    key: 'getAndStoreHash',
    value: function getAndStoreHash(videoId) {
      var hash = this.getHash(videoId);
      var localStorage = this.getLocalStorage();

      localStorage.setItem(HASH_TO_KEY_PREFIX + hash.toString(), videoId);

      return hash;
    }

    /**
     * generates random salt
     * @param  {integer} size size of the generated salt (default 32)
     * @return {hex}      random salt (hexadecimal)
     */

  }, {
    key: 'generateSalt',
    value: function generateSalt(size) {
      if (!size) {
        size = 32;
      }

      return this.eth.web3.utils.randomHex(size);
    }

    /**
     * store salt
     * @param  {string} videoId univocal video id
     * @param  {hex} salt    hexadecimal salt
     */

  }, {
    key: 'storeSalt',
    value: function storeSalt(videoId, salt) {
      var localStorage = this.getLocalStorage();

      localStorage.setItem(SALT_KEY_PREFIX + videoId, salt);
    }

    /**
     * get the salt related to that videoId
     * @param  {string} videoId univocal videoId
     * @return {hex}          hexadecimal salt
     */

  }, {
    key: 'getSalt',
    value: function getSalt(videoId) {
      var localStorage = this.getLocalStorage();

      return localStorage.getItem(SALT_KEY_PREFIX + videoId);
    }

    /**
     * get the videoId related to that hash
     * @param  {string} hash hash of the videoId
     * @return {string}      the videoId
     */

  }, {
    key: 'hashToId',
    value: function hashToId(hash) {
      var localStorage = this.getLocalStorage();

      return localStorage.getItem(HASH_TO_KEY_PREFIX + hash.toString());
    }

    // -----------------------
    // TCR PARAMETERS GETTERS
    // -----------------------

    /**
     * get the minimum amount required to stake a video.
     * @return {integer} amount required, in PTI base units
     * @todo return amount as bignumber.js Object
     * @example let minDeposit = await paratii.eth.tcr.getMinDeposit()
     */

  }, {
    key: 'getMinDeposit',
    value: function getMinDeposit() {
      return _regenerator2.default.async(function getMinDeposit$(_context43) {
        while (1) {
          switch (_context43.prev = _context43.next) {
            case 0:
              return _context43.abrupt('return', this.get('minDeposit'));

            case 1:
            case 'end':
              return _context43.stop();
          }
        }
      }, null, this);
    }

    /**
     * get the period over which applicants wait to be whitelisted
     * @return {integer} length of the apply stage in seconds
     * @example let applyStageLen = await paratii.eth.tcr.getApplyStageLen()
     */

  }, {
    key: 'getApplyStageLen',
    value: function getApplyStageLen() {
      return _regenerator2.default.async(function getApplyStageLen$(_context44) {
        while (1) {
          switch (_context44.prev = _context44.next) {
            case 0:
              return _context44.abrupt('return', this.get('applyStageLen'));

            case 1:
            case 'end':
              return _context44.stop();
          }
        }
      }, null, this);
    }

    /**
     * get the percentage of losing party's deposit distributed to winning party
     * @return {integer} percentage of losing party's deposit distributed to winning party
     * @example let dispensationPct = await paratii.eth.tcr.getDispensationPct()
     */

  }, {
    key: 'getDispensationPct',
    value: function getDispensationPct() {
      return _regenerator2.default.async(function getDispensationPct$(_context45) {
        while (1) {
          switch (_context45.prev = _context45.next) {
            case 0:
              return _context45.abrupt('return', this.get('dispensationPct'));

            case 1:
            case 'end':
              return _context45.stop();
          }
        }
      }, null, this);
    }

    /**
     * get the length of commit period for voting
     * @return {integer} length of the commit stage in seconds
     * @example let applyCommitLen = await paratii.eth.tcr.getCommitStageLen()
     */

  }, {
    key: 'getCommitStageLen',
    value: function getCommitStageLen() {
      return _regenerator2.default.async(function getCommitStageLen$(_context46) {
        while (1) {
          switch (_context46.prev = _context46.next) {
            case 0:
              return _context46.abrupt('return', this.get('commitStageLen'));

            case 1:
            case 'end':
              return _context46.stop();
          }
        }
      }, null, this);
    }

    /**
     * get the length of reveal period for voting
     * @return {integer} length of the reveal stage in seconds
     * @example let applyRevealLen = await paratii.eth.tcr.getRevealStageLen()
     */

  }, {
    key: 'getRevealStageLen',
    value: function getRevealStageLen() {
      return _regenerator2.default.async(function getRevealStageLen$(_context47) {
        while (1) {
          switch (_context47.prev = _context47.next) {
            case 0:
              return _context47.abrupt('return', this.get('revealStageLen'));

            case 1:
            case 'end':
              return _context47.stop();
          }
        }
      }, null, this);
    }

    /**
     * get the type of majority out of 100 necessary for vote success
     * @return {integer} percentage needed for success
     * @example let voteQuorum = await paratii.eth.tcr.getVoteQuorum()
     */

  }, {
    key: 'getVoteQuorum',
    value: function getVoteQuorum() {
      return _regenerator2.default.async(function getVoteQuorum$(_context48) {
        while (1) {
          switch (_context48.prev = _context48.next) {
            case 0:
              return _context48.abrupt('return', this.get('voteQuorum'));

            case 1:
            case 'end':
              return _context48.stop();
          }
        }
      }, null, this);
    }

    // -----------------------
    // PARAMETRIZER PARAMETERS GETTERS
    // -----------------------

    /**
     * get the minimum deposit to propose a reparameterization
     * @return {integer} amount required, in PTI base units
     * @todo return amount as bignumber.js Object
     * @example let minpDeposit = await paratii.eth.tcr.getpMinDeposit()
     */

  }, {
    key: 'getpMinDeposit',
    value: function getpMinDeposit() {
      return _regenerator2.default.async(function getpMinDeposit$(_context49) {
        while (1) {
          switch (_context49.prev = _context49.next) {
            case 0:
              return _context49.abrupt('return', this.get('pMinDeposit'));

            case 1:
            case 'end':
              return _context49.stop();
          }
        }
      }, null, this);
    }

    /**
     * get the period over which reparmeterization proposals wait to be processed
     * @return {integer} length of the parametrizer apply stage in seconds
     * @example let pApplyStageLen = await paratii.eth.tcr.getpApplyStageLen()
     */

  }, {
    key: 'getpApplyStageLen',
    value: function getpApplyStageLen() {
      return _regenerator2.default.async(function getpApplyStageLen$(_context50) {
        while (1) {
          switch (_context50.prev = _context50.next) {
            case 0:
              return _context50.abrupt('return', this.get('pApplyStageLen'));

            case 1:
            case 'end':
              return _context50.stop();
          }
        }
      }, null, this);
    }

    /**
     * get the percentage of losing party's deposit distributed to winning party in parameterizer
     * @return {integer} percentage of losing party's deposit distributed to winning party
     * @example let pDispensationPct = await paratii.eth.tcr.getpDispensationPct()
     */

  }, {
    key: 'getpDispensationPct',
    value: function getpDispensationPct() {
      return _regenerator2.default.async(function getpDispensationPct$(_context51) {
        while (1) {
          switch (_context51.prev = _context51.next) {
            case 0:
              return _context51.abrupt('return', this.get('pDispensationPct'));

            case 1:
            case 'end':
              return _context51.stop();
          }
        }
      }, null, this);
    }

    /**
     * get the length of commit period for voting in parametrizer
     * @return {integer} length of the parametrizer commit stage in seconds
     * @example let pCommitStageLen = await paratii.eth.tcr.getpCommitStageLen()
     */

  }, {
    key: 'getpCommitStageLen',
    value: function getpCommitStageLen() {
      return _regenerator2.default.async(function getpCommitStageLen$(_context52) {
        while (1) {
          switch (_context52.prev = _context52.next) {
            case 0:
              return _context52.abrupt('return', this.get('pCommitStageLen'));

            case 1:
            case 'end':
              return _context52.stop();
          }
        }
      }, null, this);
    }

    /**
     * get the length of reveal period for voting in parametrizer
     * @return {integer} length of the parametrizer reveal stage in seconds
     * @example let pRevealStageLen = await paratii.eth.tcr.getpRevealStageLen()
     */

  }, {
    key: 'getpRevealStageLen',
    value: function getpRevealStageLen() {
      return _regenerator2.default.async(function getpRevealStageLen$(_context53) {
        while (1) {
          switch (_context53.prev = _context53.next) {
            case 0:
              return _context53.abrupt('return', this.get('pRevealStageLen'));

            case 1:
            case 'end':
              return _context53.stop();
          }
        }
      }, null, this);
    }

    /**
     * get the type of majority out of 100 necessary for vote success in parametrizer
     * @return {integer} percentage needed for success in parametrizer
     * @example let pVoteQuorum = await paratii.eth.tcr.getpVoteQuorum()
     */

  }, {
    key: 'getpVoteQuorum',
    value: function getpVoteQuorum() {
      return _regenerator2.default.async(function getpVoteQuorum$(_context54) {
        while (1) {
          switch (_context54.prev = _context54.next) {
            case 0:
              return _context54.abrupt('return', this.get('pVoteQuorum'));

            case 1:
            case 'end':
              return _context54.stop();
          }
        }
      }, null, this);
    }

    /**
     * get the value of the param passed on the Parametrizer contract
     * @param  {string}  param name of the param
     * @return {Promise}       that resolves in the value of the parameter
     * @example  let minDeposit = await paratii.eth.tcr.get('minDeposit')
     */

  }, {
    key: 'get',
    value: function get(param) {
      var contract, value;
      return _regenerator2.default.async(function get$(_context55) {
        while (1) {
          switch (_context55.prev = _context55.next) {
            case 0:
              _context55.next = 2;
              return _regenerator2.default.awrap(this.getParametrizerContract());

            case 2:
              contract = _context55.sent;
              _context55.next = 5;
              return _regenerator2.default.awrap(contract.methods.get(param).call());

            case 5:
              value = _context55.sent;
              return _context55.abrupt('return', value);

            case 7:
            case 'end':
              return _context55.stop();
          }
        }
      }, null, this);
    }
  }]);
  return ParatiiEthTcr;
}();