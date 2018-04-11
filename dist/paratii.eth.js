'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiEth = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _utils = require('./utils.js');

var _paratiiEthVids = require('./paratii.eth.vids.js');

var _paratiiEthUsers = require('./paratii.eth.users.js');

var _paratiiEthEvents = require('./paratii.eth.events.js');

var _paratiiEthVouchers = require('./paratii.eth.vouchers.js');

var _paratiiEthTcr = require('./paratii.eth.tcr.js');

var _paratiiEthWallet = require('./paratii.eth.wallet.js');

var _schemas = require('./schemas.js');

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Web3 = require('web3');
// const joi = require('joi')
/**
 * contains functions to interact with the Ethereum blockchain and the Paratii contracts deployed there.
 * @param {ParatiiEthSchema} config configuration object to initialize Paratii object
 * @property {ParatiiCoreVids} vids operations on videos
 * @property {ParatiiCoreUsers} users operations on users
 * @property {ParatiiEthEvents} events manage subscriptions to Ethereum events
 * @property {ParatiiEthVouchers} vouchers Functions for redeeming vouchers
 * @property {ParatiiEthTcr} tcr TCR functionality
*/

var ParatiiEth = exports.ParatiiEth = function () {
  /**
  * @typedef {Array} ParatiiEthSchema
  * @property {?accountSchema} account
  * @property {?ethSchema} eth
  */
  function ParatiiEth(config) {
    (0, _classCallCheck3.default)(this, ParatiiEth);

    var schema = _joi2.default.object({
      account: _schemas.accountSchema,
      eth: _schemas.ethSchema
      //   web3: joi.any().default(null)
    });
    var result = _joi2.default.validate(config, schema, { allowUnknown: true });
    if (result.error) throw result.error;
    config.eth = result.value.eth;
    config.account = result.value.account;
    if (config.eth.provider.match(/(localhost|127\.0\.0\.1)/g)) {
      config.eth.isTestNet = true;
    } else {
      config.eth.isTestNet = false;
    }

    if (config.web3) {
      this.web3 = config.web3;
    } else {
      this.web3 = new Web3();
      if (config.eth.provider.substring(0, 2) === 'ws') {
        this.web3.setProvider(new this.web3.providers.WebsocketProvider(config.eth.provider));
      } else {
        this.web3.setProvider(new this.web3.providers.HttpProvider(config.eth.provider));
      }
    }
    this.config = config;

    this.wallet = (0, _paratiiEthWallet.patchWallet)(this.web3.eth.accounts.wallet, this.config);
    this.setAccount(this.config.account.address, this.config.account.privateKey, this.config.account.mnemonic);

    this.contracts = {};
    this.contracts.ParatiiToken = this.requireContract('ParatiiToken');
    this.contracts.Avatar = this.requireContract('Avatar');
    this.contracts.Registry = this.requireContract('Registry');
    this.contracts.SendEther = this.requireContract('SendEther');
    this.contracts.Users = this.requireContract('Users');
    this.contracts.Videos = this.requireContract('Videos');
    this.contracts.Store = this.requireContract('Store');
    this.contracts.Likes = this.requireContract('Likes');
    this.contracts.Views = this.requireContract('Views');
    this.contracts.Vouchers = this.requireContract('Vouchers');
    this.contracts.TcrPlaceholder = this.requireContract('TcrPlaceholder');

    this.vids = new _paratiiEthVids.ParatiiEthVids(this);
    this.users = new _paratiiEthUsers.ParatiiEthUsers(this);
    this.events = new _paratiiEthEvents.ParatiiEthEvents(this);
    this.vouchers = new _paratiiEthVouchers.ParatiiEthVouchers(this);
    this.tcr = new _paratiiEthTcr.ParatiiEthTcr(this);
  }
  /**
   * creates an account using the private key or, if not present, using the mnemonic
   * @param {string} address    public address
   * @param {string} privateKey private key related to the previous public address
   * @param {string} mnemonic   mnemonic related to the previous public address
   * @example paratii.eth.setAccount('some-address','some-private-key')
   * @example paratii.eth.setAccount('some-address','some-mnemonic')
   */


  (0, _createClass3.default)(ParatiiEth, [{
    key: 'setAccount',
    value: function setAccount(address, privateKey, mnemonic) {
      var wallet = this.web3.eth.accounts.wallet;
      this.config.account.address = address;
      this.config.account.privateKey = privateKey;
      this.web3.eth.testAccount = address;
      if (privateKey) {
        var account = wallet.add(privateKey);
        if (account.address !== address) {
          throw Error('Private Key and Account address are not compatible!');
        }
        this.config.account.address = address;
        this.config.account.privateKey = privateKey;
      } else if (mnemonic) {
        wallet.create(1, mnemonic);
        if (address && wallet[0].address !== address) {
          throw Error('Mnemonic ' + mnemonic + ' and account address ' + address + ' are not compatible!');
        }
        this.config.account.address = wallet[0].address;
        this.config.account.privateKey = wallet[0].privateKey;
      }
    }

    /**
     * Get the contract instance specified
     * @param {string} name the name of the token
     * @return {Promise} Object representing the contract
     * @example paratii.eth.getContract('ParatiiToken')
     */

  }, {
    key: 'getContract',
    value: function getContract(name) {
      var contract, address;
      return _regenerator2.default.async(function getContract$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              contract = this.contracts[name];

              if (contract) {
                _context.next = 3;
                break;
              }

              throw Error('No contract with name "' + name + '" is known');

            case 3:
              if (contract.options.address) {
                _context.next = 8;
                break;
              }

              _context.next = 6;
              return _regenerator2.default.awrap(this.getContractAddress(name));

            case 6:
              address = _context.sent;

              if (address && address !== '0x0') {
                contract.options.address = address;
              }

            case 8:
              if (!contract.methods.constructor._ethAccounts) {
                contract.methods.constructor._ethAccounts = this.web3.eth.accounts;
              }
              contract.options.from = this.config.account.address;

              return _context.abrupt('return', contract);

            case 11:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }
    /**
     * creates the javascript contract object from the json file
     * @param  {string} contractName name of the contract
     * @return {string}              Contract Object
     * @example paratii.eth.requireContract('ParatiiToken')
     */

  }, {
    key: 'requireContract',
    value: function requireContract(contractName) {
      var artifact = require('paratii-contracts/build/contracts/' + contractName + '.json');
      var from = this.config.account.address;

      var contract = new this.web3.eth.Contract(artifact.abi, {
        from: from,
        gas: this.web3.utils.toHex(4e6),
        data: artifact.bytecode
      });
      // contract.setProvider(this.web3.currentProvider, this.web3.eth.accounts)
      return contract;
    }
    /**
     * deploys contract on the blockchain
     * @param  {string}  name name of the contract
     * @param  {Object}  args configuration for the contract (strings or numbers). It is allowed to pass more than one parameter
     * @return {Promise}      the deployed contract
     * @example paratii.eth.deployContract('ParatiiToken')
     */

  }, {
    key: 'deployContract',
    value: function deployContract(name) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var msg, contract, deployedContract;
      return _regenerator2.default.async(function deployContract$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (this.config.account.address) {
                _context2.next = 3;
                break;
              }

              msg = 'You need an Ethereum account to write information to the blockchain - you can use .setAccount(address, [privateKey]) or specify it when creating the object';
              throw Error(msg);

            case 3:
              _context2.next = 5;
              return _regenerator2.default.awrap(this.getContract(name));

            case 5:
              contract = _context2.sent;
              _context2.next = 8;
              return _regenerator2.default.awrap(contract.deploy({ arguments: args }).send());

            case 8:
              deployedContract = _context2.sent;

              deployedContract.setProvider(this.web3.currentProvider, this.web3.eth.accounts);
              this.contracts[name] = deployedContract;
              return _context2.abrupt('return', deployedContract);

            case 12:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }

    /**
     * deploy all the contracts on the blockchain
     * @return {Promise} all the paratii contracts
     * @example let contracts = await paratii.eth.deployContracts()
     * @example let likes = await this.deployContract('Likes', paratiiRegistryAddress)
     */

  }, {
    key: 'deployContracts',
    value: function deployContracts() {
      var paratiiRegistry, paratiiRegistryAddress, paratiiAvatar, paratiiToken, sendEther, userRegistry, videoRegistry, videoStore, likes, views, vouchers, tcrPlaceholder;
      return _regenerator2.default.async(function deployContracts$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return _regenerator2.default.awrap(this.deployContract('Registry'));

            case 2:
              paratiiRegistry = _context3.sent;
              paratiiRegistryAddress = paratiiRegistry.options.address;
              _context3.next = 6;
              return _regenerator2.default.awrap(this.setRegistryAddress(paratiiRegistry.options.address));

            case 6:
              _context3.next = 8;
              return _regenerator2.default.awrap(this.deployContract('Avatar', paratiiRegistryAddress));

            case 8:
              paratiiAvatar = _context3.sent;
              _context3.next = 11;
              return _regenerator2.default.awrap(this.deployContract('ParatiiToken'));

            case 11:
              paratiiToken = _context3.sent;
              _context3.next = 14;
              return _regenerator2.default.awrap(this.deployContract('SendEther'));

            case 14:
              sendEther = _context3.sent;
              _context3.next = 17;
              return _regenerator2.default.awrap(this.deployContract('Users', paratiiRegistryAddress));

            case 17:
              userRegistry = _context3.sent;
              _context3.next = 20;
              return _regenerator2.default.awrap(this.deployContract('Videos', paratiiRegistryAddress));

            case 20:
              videoRegistry = _context3.sent;
              _context3.next = 23;
              return _regenerator2.default.awrap(this.deployContract('Store', paratiiRegistryAddress));

            case 23:
              videoStore = _context3.sent;
              _context3.next = 26;
              return _regenerator2.default.awrap(this.deployContract('Likes', paratiiRegistryAddress));

            case 26:
              likes = _context3.sent;
              _context3.next = 29;
              return _regenerator2.default.awrap(this.deployContract('Views', paratiiRegistryAddress));

            case 29:
              views = _context3.sent;
              _context3.next = 32;
              return _regenerator2.default.awrap(this.deployContract('Vouchers', paratiiRegistryAddress));

            case 32:
              vouchers = _context3.sent;
              _context3.next = 35;
              return _regenerator2.default.awrap(this.deployContract('TcrPlaceholder', paratiiRegistryAddress, paratiiToken.options.address, this.web3.utils.toWei('5'), 100));

            case 35:
              tcrPlaceholder = _context3.sent;
              _context3.next = 38;
              return _regenerator2.default.awrap(this.getContract('Registry'));

            case 38:
              paratiiRegistry = _context3.sent;
              _context3.next = 41;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerAddress('Avatar', paratiiAvatar.options.address).send());

            case 41:
              _context3.next = 43;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerAddress('ParatiiToken', paratiiToken.options.address).send());

            case 43:
              _context3.next = 45;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerAddress('SendEther', sendEther.options.address).send());

            case 45:
              _context3.next = 47;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerAddress('Videos', videoRegistry.options.address).send());

            case 47:
              _context3.next = 49;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerAddress('Store', videoStore.options.address).send());

            case 49:
              _context3.next = 51;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerAddress('Users', userRegistry.options.address).send());

            case 51:
              _context3.next = 53;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerAddress('Likes', likes.options.address).send());

            case 53:
              _context3.next = 55;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerAddress('Views', views.options.address).send());

            case 55:
              _context3.next = 57;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerAddress('Vouchers', vouchers.options.address).send());

            case 57:
              _context3.next = 59;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerAddress('TcrPlaceholder', tcrPlaceholder.options.address).send());

            case 59:
              _context3.next = 61;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerUint('VideoRedistributionPoolShare', this.web3.utils.toWei('0.3')));

            case 61:
              _context3.next = 63;
              return _regenerator2.default.awrap(paratiiAvatar.methods.addToWhitelist(videoStore.address));

            case 63:

              this.contracts = {
                Avatar: paratiiAvatar,
                Registry: paratiiRegistry,
                ParatiiToken: paratiiToken,
                SendEther: sendEther,
                Users: userRegistry,
                Videos: videoRegistry,
                Likes: likes,
                Views: views,
                Vouchers: vouchers,
                Store: videoStore,
                TcrPlaceholder: tcrPlaceholder

                // await this.setContractsProvider()

              };this.setRegistryAddress(paratiiRegistryAddress);

              return _context3.abrupt('return', this.contracts);

            case 66:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this);
    }

    /**
     * Set the provider on all the contracts
     * @example paratii.eth.setContractsProvider()
     * @private
     */

  }, {
    key: 'setContractsProvider',
    value: function setContractsProvider() {
      var key;
      return _regenerator2.default.async(function setContractsProvider$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              for (key in this.contracts) {
                this.contracts[key].setProvider(this.web3.currentProvider, this.web3.eth.accounts);
              }

            case 1:
            case 'end':
              return _context4.stop();
          }
        }
      }, null, this);
    }
    /**
     * return all the contracts
     * @return {Promise} all the contracts
     * @example let contracts = await paratii.eth.getContracts()
     */

  }, {
    key: 'getContracts',
    value: function getContracts() {
      var name, contract, address;
      return _regenerator2.default.async(function getContracts$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.t0 = _regenerator2.default.keys(this.contracts);

            case 1:
              if ((_context5.t1 = _context5.t0()).done) {
                _context5.next = 11;
                break;
              }

              name = _context5.t1.value;
              contract = this.contracts[name];

              if (contract.options.address) {
                _context5.next = 9;
                break;
              }

              _context5.next = 7;
              return _regenerator2.default.awrap(this.getContractAddress(name));

            case 7:
              address = _context5.sent;

              if (address && address !== '0x0') {
                contract.options.address = address;
              }

            case 9:
              _context5.next = 1;
              break;

            case 11:
              return _context5.abrupt('return', this.contracts);

            case 12:
            case 'end':
              return _context5.stop();
          }
        }
      }, null, this);
    }
    /**
     * get the address of the contract on the blockchain
     * @param  {string}  name name of the contract
     * @return {Promise}      Contract address on the blockchain (String)
     * @example paratii.eth.getContractAddress('ParatiiToken')
     */

  }, {
    key: 'getContractAddress',
    value: function getContractAddress(name) {
      var registryAddress, registry, address;
      return _regenerator2.default.async(function getContractAddress$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              registryAddress = this.getRegistryAddress();

              if (!(name === 'Registry')) {
                _context6.next = 3;
                break;
              }

              return _context6.abrupt('return', registryAddress);

            case 3:
              if (registryAddress) {
                _context6.next = 5;
                break;
              }

              throw Error('No registry address configured');

            case 5:
              _context6.prev = 5;
              _context6.next = 8;
              return _regenerator2.default.awrap(this.getContract('Registry'));

            case 8:
              registry = _context6.sent;

              if (registry) {
                _context6.next = 11;
                break;
              }

              throw Error('No registry contract!');

            case 11:
              _context6.next = 13;
              return _regenerator2.default.awrap(registry.methods.getContract(name).call());

            case 13:
              address = _context6.sent;
              return _context6.abrupt('return', address);

            case 17:
              _context6.prev = 17;
              _context6.t0 = _context6['catch'](5);

              if (!(_context6.t0.message === 'Couldn\'t decode address from ABI: 0x')) {
                _context6.next = 23;
                break;
              }

              throw Error('The registry address is not correct');

            case 23:
              throw _context6.t0;

            case 24:
            case 'end':
              return _context6.stop();
          }
        }
      }, null, this, [[5, 17]]);
    }

    /**
     * get the address of the Registry contract on the blockchain
     * @return {string} address on the blockchain
     * @example let registryAddress = paratii.eth.getRegistryAddress()
     */

  }, {
    key: 'getRegistryAddress',
    value: function getRegistryAddress() {
      return this.config.eth.registryAddress;
    }
    /**
     * set the address of the Registry contract on the blockchain
     * @param {string} registryAddress new address
     * @example await paratii.eth.setRegistryAddress('some-address')
     */

  }, {
    key: 'setRegistryAddress',
    value: function setRegistryAddress(registryAddress) {
      this.config.eth.registryAddress = registryAddress;
      for (var name in this.contracts) {
        var contract = this.contracts[name];
        contract.options.address = undefined;
      }
    }
    /**
    * When called with a second argument, returns the balance of that Token.<br>
    * When called without a second argument, returns information about all relevant balances.
    * @param  {string}  address ethereum address
    * @param  {?string}  symbol  symbol of the token (ETH,PTI)
    * @return {Promise}         information about balances of that address
    * @example paratii.eth.balanceOf('some-address', 'ETH') // returns the ETH balance of the given address
    * @example paratii.eth.balanceOf('some-address', 'PTI') // returns the PTI balance of the given address
    * @example paratii.eth.balanceOf('some-address') // returns both the PTI and the ETH balance of the given address
    */

  }, {
    key: 'balanceOf',
    value: function balanceOf(address, symbol) {
      var balance, balances, contract;
      return _regenerator2.default.async(function balanceOf$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              balance = void 0;
              balances = {};

              if (!(symbol && !['PTI', 'ETH'].includes(symbol))) {
                _context7.next = 4;
                break;
              }

              throw Error('Unknown symbol "' + symbol + '", must be one of "ETH", "PTI"');

            case 4:
              if (!(!symbol || symbol === 'ETH')) {
                _context7.next = 9;
                break;
              }

              _context7.next = 7;
              return _regenerator2.default.awrap(this.web3.eth.getBalance(address));

            case 7:
              balance = _context7.sent;

              balances.ETH = balance;

            case 9:
              if (!(!symbol || symbol === 'PTI')) {
                _context7.next = 17;
                break;
              }

              _context7.next = 12;
              return _regenerator2.default.awrap(this.getContract('ParatiiToken'));

            case 12:
              contract = _context7.sent;
              _context7.next = 15;
              return _regenerator2.default.awrap(contract.methods.balanceOf(address).call());

            case 15:
              balance = _context7.sent;

              balances.PTI = balance;

            case 17:
              if (!symbol) {
                _context7.next = 21;
                break;
              }

              return _context7.abrupt('return', balance);

            case 21:
              return _context7.abrupt('return', balances);

            case 22:
            case 'end':
              return _context7.stop();
          }
        }
      }, null, this);
    }
    /**
     * send ETH from current account to beneficiary
     * @param  {string}  beneficiary ETH address
     * @param  {number}  amount      amount of ETH to be sent
     * @param  {?string}  description  description of the transaction (will be written in the blockchain)
     * @return {Promise}             information about the transaction recording the transfer
     * @example return paratii.eth._transferETH('some-address', 20, 'an-optional-description')
     * @private
     */

  }, {
    key: '_transferETH',
    value: function _transferETH(beneficiary, amount, description) {
      var contract, from;
      return _regenerator2.default.async(function _transferETH$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return _regenerator2.default.awrap(this.getContract('SendEther'));

            case 2:
              contract = _context8.sent;

              if (!(!contract.options || !contract.options.address)) {
                _context8.next = 5;
                break;
              }

              throw Error('No SendEther contract known - please run paratii.diagnose()');

            case 5:
              from = this.config.account.address;

              if (from) {
                _context8.next = 8;
                break;
              }

              throw Error('No account set! Cannot send transactions');

            case 8:

              if (!description) {
                description = '';
              }
              from = (0, _utils.add0x)(from);
              beneficiary = (0, _utils.add0x)(beneficiary);

              _context8.prev = 11;
              _context8.next = 14;
              return _regenerator2.default.awrap(contract.methods.transfer(beneficiary, description).send({ value: amount }));

            case 14:
              return _context8.abrupt('return', _context8.sent);

            case 17:
              _context8.prev = 17;
              _context8.t0 = _context8['catch'](11);
              throw _context8.t0;

            case 20:
            case 'end':
              return _context8.stop();
          }
        }
      }, null, this, [[11, 17]]);
    }
    /**
     * send PTI from current account to beneficiary
     * @param  {string}  beneficiary ETH address
     * @param  {number}  amount      amount of PTI to be sent
     * @return {Promise}             information about the transaction recording the transfer
     * @example return paratii.eth._transferPTI('some-address', 20)
     * @private
     */

  }, {
    key: '_transferPTI',
    value: function _transferPTI(beneficiary, amount) {
      var contract, from, result;
      return _regenerator2.default.async(function _transferPTI$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 2;
              return _regenerator2.default.awrap(this.getContract('ParatiiToken'));

            case 2:
              contract = _context9.sent;

              if (!(!contract.options || !contract.options.address)) {
                _context9.next = 5;
                break;
              }

              throw Error('No ParatiiToken contract known - please run paratii.diagnose()');

            case 5:
              from = this.config.account.address;

              if (from) {
                _context9.next = 8;
                break;
              }

              throw Error('No account set! Cannot send transactions');

            case 8:
              from = (0, _utils.add0x)(from);
              beneficiary = (0, _utils.add0x)(beneficiary);

              _context9.next = 12;
              return _regenerator2.default.awrap(contract.methods.transfer(beneficiary, amount).send());

            case 12:
              result = _context9.sent;
              return _context9.abrupt('return', result);

            case 14:
            case 'end':
              return _context9.stop();
          }
        }
      }, null, this);
    }
    /**
     * Use this to send ETH or PTI from paratii.config.address
     * @param  {string}  beneficiary ETH address
     * @param  {number}  amount      amount of ETH/PTI to be sent
     * @param  {string}  symbol      symbol of the token to send (ETH,PTI)
     * @param  {?string}  description description to be inserted in the blockchain
     * @return {Promise}             information about the transaction recording the transfer
     * @example let result = await paratii.eth.transfer('some-address', 20, 'ETH', 'thanks for all the fish')
     */

  }, {
    key: 'transfer',
    value: function transfer(beneficiary, amount, symbol, description) {
      return _regenerator2.default.async(function transfer$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              if (!(symbol === 'ETH')) {
                _context10.next = 4;
                break;
              }

              return _context10.abrupt('return', this._transferETH(beneficiary, amount, description));

            case 4:
              if (!(symbol === 'PTI')) {
                _context10.next = 6;
                break;
              }

              return _context10.abrupt('return', this._transferPTI(beneficiary, amount));

            case 6:
            case 'end':
              return _context10.stop();
          }
        }
      }, null, this);
    }
  }]);
  return ParatiiEth;
}();