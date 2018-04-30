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
     * get the period over which applicants wait to be whitelisted
     * @return {integer} length of the apply stage in seconds
     * @example let applyStageLen = await paratii.eth.tcr.getApplyStageLen()
     */

  }, {
    key: 'getApplyStageLen',
    value: function getApplyStageLen() {
      return _regenerator2.default.async(function getApplyStageLen$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              return _context4.abrupt('return', this.get('applyStageLen'));

            case 1:
            case 'end':
              return _context4.stop();
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
      return _regenerator2.default.async(function getDispensationPct$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              return _context5.abrupt('return', this.get('dispensationPct'));

            case 1:
            case 'end':
              return _context5.stop();
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
      return _regenerator2.default.async(function getCommitStageLen$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              return _context6.abrupt('return', this.get('commitStageLen'));

            case 1:
            case 'end':
              return _context6.stop();
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
      return _regenerator2.default.async(function getRevealStageLen$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              return _context7.abrupt('return', this.get('revealStageLen'));

            case 1:
            case 'end':
              return _context7.stop();
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
      return _regenerator2.default.async(function getVoteQuorum$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              return _context8.abrupt('return', this.get('voteQuorum'));

            case 1:
            case 'end':
              return _context8.stop();
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
      return _regenerator2.default.async(function getpMinDeposit$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              return _context9.abrupt('return', this.get('pMinDeposit'));

            case 1:
            case 'end':
              return _context9.stop();
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
      return _regenerator2.default.async(function getpApplyStageLen$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              return _context10.abrupt('return', this.get('pApplyStageLen'));

            case 1:
            case 'end':
              return _context10.stop();
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
      return _regenerator2.default.async(function getpDispensationPct$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              return _context11.abrupt('return', this.get('pDispensationPct'));

            case 1:
            case 'end':
              return _context11.stop();
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
      return _regenerator2.default.async(function getpCommitStageLen$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              return _context12.abrupt('return', this.get('pCommitStageLen'));

            case 1:
            case 'end':
              return _context12.stop();
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
      return _regenerator2.default.async(function getpRevealStageLen$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              return _context13.abrupt('return', this.get('pRevealStageLen'));

            case 1:
            case 'end':
              return _context13.stop();
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
      return _regenerator2.default.async(function getpVoteQuorum$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              return _context14.abrupt('return', this.get('pVoteQuorum'));

            case 1:
            case 'end':
              return _context14.stop();
          }
        }
      }, null, this);
    }

    /**
     * get the value of the param passed on the Parametrizer contract
     * @param  {String}  param name of the param
     * @return {Promise}       that resolves in the value of the parameter
     * @example  let minDeposit = await paratii.eth.tcr.get('minDeposit')
     * @private
     */

  }, {
    key: 'get',
    value: function get(param) {
      var contract, value;
      return _regenerator2.default.async(function get$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              _context15.next = 2;
              return _regenerator2.default.awrap(this.getParametrizerContract());

            case 2:
              contract = _context15.sent;
              _context15.next = 5;
              return _regenerator2.default.awrap(contract.methods.get(param).call());

            case 5:
              value = _context15.sent;
              return _context15.abrupt('return', value);

            case 7:
            case 'end':
              return _context15.stop();
          }
        }
      }, null, this);
    }

    // ---------------------------------------------------------------------------

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
      return _regenerator2.default.async(function isWhitelisted$(_context16) {
        while (1) {
          switch (_context16.prev = _context16.next) {
            case 0:
              _context16.next = 2;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 2:
              contract = _context16.sent;
              hash = this.getHash(videoId);
              _context16.next = 6;
              return _regenerator2.default.awrap(contract.methods.isWhitelisted(hash).call());

            case 6:
              isWhitelisted = _context16.sent;
              return _context16.abrupt('return', isWhitelisted);

            case 8:
            case 'end':
              return _context16.stop();
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
      return _regenerator2.default.async(function canBeWhitelisted$(_context17) {
        while (1) {
          switch (_context17.prev = _context17.next) {
            case 0:
              hash = this.getHash(videoId);
              _context17.next = 3;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 3:
              tcrRegistry = _context17.sent;
              _context17.next = 6;
              return _regenerator2.default.awrap(tcrRegistry.methods.canBeWhitelisted(hash).call());

            case 6:
              canBeWhitelisted = _context17.sent;
              return _context17.abrupt('return', canBeWhitelisted);

            case 8:
            case 'end':
              return _context17.stop();
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
      return _regenerator2.default.async(function appWasMade$(_context18) {
        while (1) {
          switch (_context18.prev = _context18.next) {
            case 0:
              _context18.next = 2;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 2:
              contract = _context18.sent;
              hash = this.getHash(videoId);
              _context18.next = 6;
              return _regenerator2.default.awrap(contract.methods.appWasMade(hash).call());

            case 6:
              appWasMade = _context18.sent;
              return _context18.abrupt('return', appWasMade);

            case 8:
            case 'end':
              return _context18.stop();
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
      return _regenerator2.default.async(function voterReward$(_context19) {
        while (1) {
          switch (_context19.prev = _context19.next) {
            case 0:
              _context19.next = 2;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 2:
              tcrRegistry = _context19.sent;
              _context19.next = 5;
              return _regenerator2.default.awrap(tcrRegistry.methods.voterReward(voterAddress, challengeID, salt).call());

            case 5:
              voterReward = _context19.sent;
              return _context19.abrupt('return', voterReward);

            case 7:
            case 'end':
              return _context19.stop();
          }
        }
      }, null, this);
    }

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
      return _regenerator2.default.async(function apply$(_context20) {
        while (1) {
          switch (_context20.prev = _context20.next) {
            case 0:
              // tcr contract wants a string anyway
              if (data == null) {
                data = '';
              }

              _context20.next = 3;
              return _regenerator2.default.awrap(this.getMinDeposit());

            case 3:
              minDeposit = _context20.sent;
              _context20.next = 6;
              return _regenerator2.default.awrap(this.isWhitelisted(videoId));

            case 6:
              isWhitelisted = _context20.sent;

              if (!isWhitelisted) {
                _context20.next = 9;
                break;
              }

              throw new Error('The video is already whitelisted');

            case 9:
              _context20.next = 11;
              return _regenerator2.default.awrap(this.appWasMade(videoId));

            case 11:
              appWasMade = _context20.sent;

              if (!appWasMade) {
                _context20.next = 14;
                break;
              }

              throw new Error('The video has already applied for the whitelist');

            case 14:
              if (!this.eth.web3.utils.toBN(amountToStake).lt(minDeposit)) {
                _context20.next = 16;
                break;
              }

              throw new Error('amount to stake ' + amountToStake + ' is less than minDeposit ' + minDeposit.toString());

            case 16:
              _context20.next = 18;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 18:
              contract = _context20.sent;

              // let amountInWei = this.eth.web3.utils.toWei(amountToStake.toString())
              amountInHex = this.eth.web3.utils.toHex(amountToStake.toString());
              // console.log('amountInHex: ', amountInHex)

              hash = this.getHash(videoId);
              tx = void 0;
              _context20.prev = 22;
              _context20.next = 25;
              return _regenerator2.default.awrap(contract.methods.apply(hash, amountInHex, data).send());

            case 25:
              tx = _context20.sent;
              _context20.next = 31;
              break;

            case 28:
              _context20.prev = 28;
              _context20.t0 = _context20['catch'](22);
              throw _context20.t0;

            case 31:
              vId = void 0;

              vId = (0, _utils.getInfoFromLogs)(tx, '_Application', 'listingHash', 1);

              if (!vId) {
                _context20.next = 37;
                break;
              }

              return _context20.abrupt('return', true);

            case 37:
              return _context20.abrupt('return', false);

            case 38:
            case 'end':
              return _context20.stop();
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
      return _regenerator2.default.async(function checkEligiblityAndApply$(_context21) {
        while (1) {
          switch (_context21.prev = _context21.next) {
            case 0:
              _context21.next = 2;
              return _regenerator2.default.awrap(this.getMinDeposit());

            case 2:
              minDeposit = _context21.sent;

              if (!this.eth.web3.utils.toBN(amountToStake).lt(minDeposit)) {
                _context21.next = 5;
                break;
              }

              throw new Error('amount to stake ' + amountToStake + ' is less than minDeposit ' + minDeposit.toString());

            case 5:
              _context21.next = 7;
              return _regenerator2.default.awrap(this.isWhitelisted(videoId));

            case 7:
              isWhitelisted = _context21.sent;

              if (!isWhitelisted) {
                _context21.next = 10;
                break;
              }

              throw new Error('video ' + videoId + ' is already whitelisted');

            case 10:
              _context21.next = 12;
              return _regenerator2.default.awrap(this.appWasMade(videoId));

            case 12:
              appWasMade = _context21.sent;

              if (!appWasMade) {
                _context21.next = 15;
                break;
              }

              throw new Error('video ' + videoId + ' already applied and awaiting decision');

            case 15:
              _context21.next = 17;
              return _regenerator2.default.awrap(this.eth.getContract('ParatiiToken'));

            case 17:
              token = _context21.sent;
              _context21.next = 20;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 20:
              tcr = _context21.sent;
              _context21.next = 23;
              return _regenerator2.default.awrap(token.methods.approve(tcr.options.address, amountToStake).send());

            case 23:
              tx2 = _context21.sent;

              if (tx2) {
                _context21.next = 26;
                break;
              }

              throw new Error('checkEligiblityAndApply Error ', tx2);

            case 26:
              _context21.next = 28;
              return _regenerator2.default.awrap(token.methods.allowance(this.eth.getAccount(), tcr.options.address).call());

            case 28:
              allowance = _context21.sent;

              if (allowance.toString() !== amountToStake.toString()) {
                console.warn('allowance ' + allowance.toString() + ' != ' + amountToStake.toString());
              }

              _context21.next = 32;
              return _regenerator2.default.awrap(this.apply(videoId, amountToStake));

            case 32:
              result = _context21.sent;
              return _context21.abrupt('return', result);

            case 34:
            case 'end':
              return _context21.stop();
          }
        }
      }, null, this);
    }

    /**
     * get the listing of that videoId
     * @param  {String}  videoId id of the video
     * @return {Promise}        that resolves in the listings
     * @example let listing = await paratii.eth.tcr.getListing('video-id')
     */

  }, {
    key: 'getListing',
    value: function getListing(videoId) {
      var contract, hash, listing;
      return _regenerator2.default.async(function getListing$(_context22) {
        while (1) {
          switch (_context22.prev = _context22.next) {
            case 0:
              _context22.next = 2;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 2:
              contract = _context22.sent;
              hash = this.getHash(videoId);
              _context22.next = 6;
              return _regenerator2.default.awrap(contract.methods.listings(hash).call());

            case 6:
              listing = _context22.sent;

              if (!(listing.owner === '0x0000000000000000000000000000000000000000')) {
                _context22.next = 9;
                break;
              }

              throw Error('Listing with videoId ' + videoId + ' doesn\'t exists');

            case 9:
              return _context22.abrupt('return', listing);

            case 10:
            case 'end':
              return _context22.stop();
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
      return _regenerator2.default.async(function getChallenge$(_context23) {
        while (1) {
          switch (_context23.prev = _context23.next) {
            case 0:
              _context23.next = 2;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 2:
              contract = _context23.sent;
              _context23.next = 5;
              return _regenerator2.default.awrap(contract.methods.challenges(challengeId).call());

            case 5:
              challenge = _context23.sent;

              if (!(challenge.challenger === '0x0000000000000000000000000000000000000000')) {
                _context23.next = 8;
                break;
              }

              throw Error('Challenge with challengeId ' + challengeId + ' doesn\'t exists');

            case 8:
              return _context23.abrupt('return', challenge);

            case 9:
            case 'end':
              return _context23.stop();
          }
        }
      }, null, this);
    }

    /**
     * get the hash of the video Id to be inserted in the TCR contract
     * @param  {String} videoId univocal id of the video
     * @return {String}         sha3 of the id
     * @private
     */

  }, {
    key: 'getHash',
    value: function getHash(videoId) {
      return this.eth.web3.utils.soliditySha3(videoId);
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
      var isWhitelisted, listing, sender, challenge, contract, hash;
      return _regenerator2.default.async(function exit$(_context24) {
        while (1) {
          switch (_context24.prev = _context24.next) {
            case 0:
              _context24.next = 2;
              return _regenerator2.default.awrap(this.isWhitelisted(videoId));

            case 2:
              isWhitelisted = _context24.sent;

              if (isWhitelisted) {
                _context24.next = 5;
                break;
              }

              throw new Error('The video must be whitelisted in order to exit');

            case 5:
              listing = this.getListing(videoId);
              sender = this.eth.getAccount();

              if (!(sender !== listing.owner)) {
                _context24.next = 9;
                break;
              }

              throw new Error('You must be the owner of the listing to exit the whitelist');

            case 9:
              if (!(listing.challengeID !== 0)) {
                _context24.next = 13;
                break;
              }

              challenge = this.getChallenge(listing.challengeID);

              if (!(challenge.resolved !== 1)) {
                _context24.next = 13;
                break;
              }

              throw new Error('You can\'t exit during a challenge');

            case 13:
              _context24.next = 15;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 15:
              contract = _context24.sent;
              hash = this.getHash(videoId);
              return _context24.abrupt('return', contract.methods.exit(hash).send());

            case 18:
            case 'end':
              return _context24.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'startChallenge',
    value: function startChallenge(videoId, _data) {
      var tcrRegistry, hash, minDeposit, balance, allowance, appWasMade, isWhitelisted, listing, pollID;
      return _regenerator2.default.async(function startChallenge$(_context25) {
        while (1) {
          switch (_context25.prev = _context25.next) {
            case 0:
              if (!_data) {
                _data = '';
              }

              _context25.next = 3;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 3:
              tcrRegistry = _context25.sent;
              hash = this.getAndStoreHash(videoId);

              // 1. check if challenger has enough minDeposit and approved the
              // contract to spend that

              _context25.next = 7;
              return _regenerator2.default.awrap(this.getMinDeposit());

            case 7:
              minDeposit = _context25.sent;
              _context25.next = 10;
              return _regenerator2.default.awrap(this.eth.balanceOf(this.eth.config.account.address));

            case 10:
              balance = _context25.sent;
              _context25.next = 13;
              return _regenerator2.default.awrap(this.eth.allowance(this.eth.getAccount, tcrRegistry.options.address));

            case 13:
              allowance = _context25.sent;

              if (!allowance.lt(minDeposit)) {
                _context25.next = 16;
                break;
              }

              throw new Error('allowance ' + allowance.toString() + ' is less than ' + minDeposit.toString());

            case 16:
              if (!balance.lt(minDeposit)) {
                _context25.next = 18;
                break;
              }

              throw new Error('balance ' + balance.toString() + ' is less than ' + minDeposit.toString());

            case 18:
              _context25.next = 20;
              return _regenerator2.default.awrap(this.appWasMade(videoId));

            case 20:
              appWasMade = _context25.sent;
              _context25.next = 23;
              return _regenerator2.default.awrap(this.isWhitelisted(videoId));

            case 23:
              isWhitelisted = _context25.sent;

              if (!(!appWasMade && !isWhitelisted)) {
                _context25.next = 26;
                break;
              }

              throw new Error('video ' + videoId + ' has no application or is not whitelisted');

            case 26:
              _context25.next = 28;
              return _regenerator2.default.awrap(this.getListing(videoId));

            case 28:
              listing = _context25.sent;

              if (!(listing.challengeID !== 0)) {
                _context25.next = 31;
                break;
              }

              throw new Error('challenge for ' + videoId + ' already exist. challengeID ' + listing.challengeID);

            case 31:
              _context25.next = 33;
              return _regenerator2.default.awrap(tcrRegistry.methods.challenge(hash, _data).send());

            case 33:
              pollID = _context25.sent;

              if (pollID) {
                _context25.next = 36;
                break;
              }

              throw new Error('starting Challenge ' + videoId + ' failed!!');

            case 36:
              return _context25.abrupt('return', pollID);

            case 37:
            case 'end':
              return _context25.stop();
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
      return _regenerator2.default.async(function updateStatus$(_context26) {
        while (1) {
          switch (_context26.prev = _context26.next) {
            case 0:
              hash = this.getAndStoreHash(videoId);
              _context26.next = 3;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 3:
              tcrRegistry = _context26.sent;
              _context26.next = 6;
              return _regenerator2.default.awrap(tcrRegistry.methods.updateStatus(hash).send());

            case 6:
              tx = _context26.sent;
              return _context26.abrupt('return', tx);

            case 8:
            case 'end':
              return _context26.stop();
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
      return _regenerator2.default.async(function claimReward$(_context27) {
        while (1) {
          switch (_context27.prev = _context27.next) {
            case 0:
              _context27.next = 2;
              return _regenerator2.default.awrap(this.getTcrContract());

            case 2:
              tcrRegistry = _context27.sent;
              _context27.next = 5;
              return _regenerator2.default.awrap(this.getListing(videoId));

            case 5:
              listing = _context27.sent;
              challengeID = listing.challengeID;

              // Ensure the voter has not already claimed tokens and challenge results have been processed

              _context27.next = 9;
              return _regenerator2.default.awrap(this.getChallenge(challengeID));

            case 9:
              challenge = _context27.sent;

              if (!(challenge.tokenClaims[this.eth.getAccount()] !== false)) {
                _context27.next = 12;
                break;
              }

              throw new Error('Account ' + this.eth.getAccount() + ' has already claimed reward. for video ' + videoId);

            case 12:
              if (!(challenge.resolved !== true)) {
                _context27.next = 14;
                break;
              }

              throw new Error('Challenge ' + challengeID + ' (videoId: ' + videoId + ') hasn\'t been resolved');

            case 14:
              _context27.next = 16;
              return _regenerator2.default.awrap(tcrRegistry.methods.claimReward(this.eth.web3.utils.toHex(challengeID.toString()), salt).send());

            case 16:
              tx = _context27.sent;
              return _context27.abrupt('return', tx);

            case 18:
            case 'end':
              return _context27.stop();
          }
        }
      }, null, this);
    }

    // --------------------[voting functions]-------------------------------------

  }, {
    key: 'commitVote',
    value: function commitVote(vote, amount) {
      return _regenerator2.default.async(function commitVote$(_context28) {
        while (1) {
          switch (_context28.prev = _context28.next) {
            case 0:
            case 'end':
              return _context28.stop();
          }
        }
      }, null, this);
    }

    // ---------------------------[ utils ]---------------------------------------

  }, {
    key: 'getAndStoreHash',
    value: function getAndStoreHash(videoId) {
      var hash = this.getHash(videoId);
      if (window && window.localStorage) {
        window.localStorage.setItem(HASH_TO_KEY_PREFIX + hash.toString(), videoId);
      } else {
        console.warn('localStorage isn\'t available. TODO: levelDB integration.');
      }

      return hash;
    }
  }, {
    key: 'storeSalt',
    value: function storeSalt(videoId, salt) {
      if (window && window.localStorage) {
        window.localStorage.setItem(SALT_KEY_PREFIX + videoId, salt);
      } else {
        console.warn('localStorage isn\'t available. TODO: levelDB integration.');
      }
    }
  }, {
    key: 'getSalt',
    value: function getSalt(videoId) {
      if (window && window.localStorage) {
        return window.localStorage.getItem(SALT_KEY_PREFIX + videoId);
      } else {
        console.warn('localStorage isn\'t available. TODO: levelDB integration.');
      }
    }
  }, {
    key: 'hashToId',
    value: function hashToId(hash) {
      if (window && window.localStorage) {
        return window.localStorage.getItem(HASH_TO_KEY_PREFIX + hash.toString());
      } else {
        console.warn('localStorage isn\'t available. TODO: levelDB integration.');
      }
    }
  }]);
  return ParatiiEthTcr;
}();