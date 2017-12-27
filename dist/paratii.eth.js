'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiEth = undefined;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _utils = require('./utils.js');

var _paratiiEthVids = require('./paratii.eth.vids.js');

var _paratiiEthUsers = require('./paratii.eth.users.js');

var _paratiiEthWallet = require('./paratii.eth.wallet.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Web3 = require('web3');
var dopts = require('default-options');

var ParatiiEth = exports.ParatiiEth = function () {
  function ParatiiEth(config) {
    (0, _classCallCheck3.default)(this, ParatiiEth);

    var defaults = {
      provider: 'http://localhost:8545/rpc/',
      registryAddress: null,
      account: {
        address: null,
        privateKey: null
      },
      web3: null,
      isTestNet: false
    };
    var options = dopts(config, defaults, { allowUnknown: true });
    this.config = config;

    if (options.web3) {
      this.web3 = options.web3;
    } else {
      this.web3 = new Web3();
      this.web3.setProvider(new this.web3.providers.HttpProvider(options.provider));
    }

    this.contracts = {};
    this.contracts.ParatiiToken = this.requireContract('ParatiiToken');
    this.contracts.Avatar = this.requireContract('Avatar');
    this.contracts.Registry = this.requireContract('Registry');
    this.contracts.SendEther = this.requireContract('SendEther');
    this.contracts.Users = this.requireContract('Users');
    this.contracts.Videos = this.requireContract('Videos');
    this.contracts.Store = this.requireContract('Store');

    this.vids = new _paratiiEthVids.ParatiiEthVids(this);
    this.users = new _paratiiEthUsers.ParatiiEthUsers(this);

    this.wallet = (0, _paratiiEthWallet.patchWallet)(this.web3.eth.accounts.wallet);

    if (this.config.account.privateKey) {
      this.web3.eth.defaultAccount = this.config.account.address;
      this.web3.eth.accounts.wallet.add(this.config.account.privateKey);
    }
  }

  (0, _createClass3.default)(ParatiiEth, [{
    key: 'requireContract',
    value: function requireContract(contractName) {
      var artifact = require('paratii-contracts/build/contracts/' + contractName + '.json');
      var from = this.config.account.address;

      var contract = new this.web3.eth.Contract(artifact.abi, {
        from: from,
        gas: this.web3.utils.toHex(4e6),
        data: artifact.bytecode
      });
      contract.setProvider(this.web3.currentProvider);
      return contract;
    }
  }, {
    key: 'deployContract',
    value: function deployContract(name) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var msg, contract, deployedContract;
      return _regenerator2.default.async(function deployContract$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (this.config.account.address) {
                _context.next = 3;
                break;
              }

              msg = 'No Ethereum address was set - you can use .setAccount(address, [privateKey]) or specify it when creating the object';
              throw Error(msg);

            case 3:
              contract = this.contracts[name];
              _context.next = 6;
              return _regenerator2.default.awrap(contract.deploy({ arguments: args }).send());

            case 6:
              deployedContract = _context.sent;
              return _context.abrupt('return', deployedContract);

            case 8:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'sleep',
    value: function sleep(ms) {
      return _regenerator2.default.async(function sleep$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt('return', new _promise2.default(function (resolve) {
                return setTimeout(resolve, ms);
              }));

            case 1:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'fixMethodAndSend',
    value: function fixMethodAndSend(method, opts) {
      var rawTransaction;
      return _regenerator2.default.async(function fixMethodAndSend$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return _regenerator2.default.awrap(method);

            case 2:
              rawTransaction = _context3.sent;

              rawTransaction._ethAccounts = this.web3.eth.accounts;
              // wait for receipt let nonce increment
              _context3.next = 6;
              return _regenerator2.default.awrap(rawTransaction.send(opts));

            case 6:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'fixMethodAndCall',
    value: function fixMethodAndCall(method) {
      var rawTransaction, result;
      return _regenerator2.default.async(function fixMethodAndCall$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return _regenerator2.default.awrap(method);

            case 2:
              rawTransaction = _context4.sent;

              rawTransaction._ethAccounts = this.web3.eth.accounts;
              // wait for receipt let nonce increment
              _context4.next = 6;
              return _regenerator2.default.awrap(rawTransaction.call());

            case 6:
              result = _context4.sent;
              return _context4.abrupt('return', result);

            case 8:
            case 'end':
              return _context4.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'deployContracts',
    value: function deployContracts() {
      var paratiiRegistry, paratiiRegistryAddress, paratiiAvatar, paratiiToken, sendEther, userRegistry, videoRegistry, videoStore;
      return _regenerator2.default.async(function deployContracts$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return _regenerator2.default.awrap(this.deployContract('Registry'));

            case 2:
              paratiiRegistry = _context5.sent;
              paratiiRegistryAddress = paratiiRegistry.options.address;
              _context5.next = 6;
              return _regenerator2.default.awrap(this.setRegistryAddress(paratiiRegistry.options.address));

            case 6:
              _context5.next = 8;
              return _regenerator2.default.awrap(this.deployContract('Avatar', paratiiRegistryAddress));

            case 8:
              paratiiAvatar = _context5.sent;
              _context5.next = 11;
              return _regenerator2.default.awrap(this.deployContract('ParatiiToken'));

            case 11:
              paratiiToken = _context5.sent;
              _context5.next = 14;
              return _regenerator2.default.awrap(this.deployContract('SendEther'));

            case 14:
              sendEther = _context5.sent;
              _context5.next = 17;
              return _regenerator2.default.awrap(this.deployContract('Users', paratiiRegistryAddress));

            case 17:
              userRegistry = _context5.sent;
              _context5.next = 20;
              return _regenerator2.default.awrap(this.deployContract('Videos', paratiiRegistryAddress));

            case 20:
              videoRegistry = _context5.sent;
              _context5.next = 23;
              return _regenerator2.default.awrap(this.deployContract('Store', paratiiRegistryAddress));

            case 23:
              videoStore = _context5.sent;
              _context5.next = 26;
              return _regenerator2.default.awrap(this.getContract('Registry'));

            case 26:
              paratiiRegistry = _context5.sent;

              paratiiRegistry.setProvider(this.web3.currentProvider);
              paratiiAvatar.setProvider(this.web3.currentProvider);

              _context5.t0 = _regenerator2.default;
              _context5.t1 = this;
              _context5.next = 33;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerAddress('Avatar', paratiiAvatar.options.address));

            case 33:
              _context5.t2 = _context5.sent;
              _context5.t3 = _context5.t1.fixMethodAndSend.call(_context5.t1, _context5.t2);
              _context5.next = 37;
              return _context5.t0.awrap.call(_context5.t0, _context5.t3);

            case 37:
              _context5.t4 = _regenerator2.default;
              _context5.t5 = this;
              _context5.next = 41;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerAddress('ParatiiToken', paratiiToken.options.address));

            case 41:
              _context5.t6 = _context5.sent;
              _context5.t7 = _context5.t5.fixMethodAndSend.call(_context5.t5, _context5.t6);
              _context5.next = 45;
              return _context5.t4.awrap.call(_context5.t4, _context5.t7);

            case 45:
              _context5.t8 = _regenerator2.default;
              _context5.t9 = this;
              _context5.next = 49;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerAddress('SendEther', sendEther.options.address));

            case 49:
              _context5.t10 = _context5.sent;
              _context5.t11 = _context5.t9.fixMethodAndSend.call(_context5.t9, _context5.t10);
              _context5.next = 53;
              return _context5.t8.awrap.call(_context5.t8, _context5.t11);

            case 53:
              _context5.t12 = _regenerator2.default;
              _context5.t13 = this;
              _context5.next = 57;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerAddress('Videos', videoRegistry.options.address));

            case 57:
              _context5.t14 = _context5.sent;
              _context5.t15 = _context5.t13.fixMethodAndSend.call(_context5.t13, _context5.t14);
              _context5.next = 61;
              return _context5.t12.awrap.call(_context5.t12, _context5.t15);

            case 61:
              _context5.t16 = _regenerator2.default;
              _context5.t17 = this;
              _context5.next = 65;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerAddress('Store', videoStore.options.address));

            case 65:
              _context5.t18 = _context5.sent;
              _context5.t19 = _context5.t17.fixMethodAndSend.call(_context5.t17, _context5.t18);
              _context5.next = 69;
              return _context5.t16.awrap.call(_context5.t16, _context5.t19);

            case 69:
              _context5.t20 = _regenerator2.default;
              _context5.t21 = this;
              _context5.next = 73;
              return _regenerator2.default.awrap(paratiiRegistry.methods.registerAddress('Users', userRegistry.options.address));

            case 73:
              _context5.t22 = _context5.sent;
              _context5.t23 = _context5.t21.fixMethodAndSend.call(_context5.t21, _context5.t22);
              _context5.next = 77;
              return _context5.t20.awrap.call(_context5.t20, _context5.t23);

            case 77:
              _context5.next = 79;
              return _regenerator2.default.awrap(this.fixMethodAndSend(paratiiRegistry.methods.registerUint('VideoRedistributionPoolShare', this.web3.utils.toWei('0.3'))));

            case 79:
              _context5.next = 81;
              return _regenerator2.default.awrap(this.fixMethodAndSend(paratiiAvatar.methods.addToWhitelist(videoStore.address)));

            case 81:

              this.contracts = {
                Avatar: paratiiAvatar,
                Registry: paratiiRegistry,
                ParatiiToken: paratiiToken,
                SendEther: sendEther,
                Users: userRegistry,
                Videos: videoRegistry,
                Store: videoStore
              };
              this.config.registryAddress = paratiiRegistryAddress;

              return _context5.abrupt('return', this.contracts);

            case 84:
            case 'end':
              return _context5.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'getContracts',
    value: function getContracts() {
      var name, contract, address;
      return _regenerator2.default.async(function getContracts$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.t0 = _regenerator2.default.keys(this.contracts);

            case 1:
              if ((_context6.t1 = _context6.t0()).done) {
                _context6.next = 11;
                break;
              }

              name = _context6.t1.value;
              contract = this.contracts[name];

              if (contract.options.address) {
                _context6.next = 9;
                break;
              }

              _context6.next = 7;
              return _regenerator2.default.awrap(this.getContractAddress(name));

            case 7:
              address = _context6.sent;

              if (address && address !== '0x0') {
                contract.options.address = address;
              }

            case 9:
              _context6.next = 1;
              break;

            case 11:
              return _context6.abrupt('return', this.contracts);

            case 12:
            case 'end':
              return _context6.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'getContract',
    value: function getContract(name) {
      var contract, address;
      return _regenerator2.default.async(function getContract$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              contract = this.contracts[name];

              if (contract) {
                _context7.next = 3;
                break;
              }

              throw Error('No contract with name "' + name + '" is known');

            case 3:
              if (contract.options.address) {
                _context7.next = 8;
                break;
              }

              _context7.next = 6;
              return _regenerator2.default.awrap(this.getContractAddress(name));

            case 6:
              address = _context7.sent;

              if (address && address !== '0x0') {
                contract.options.address = address;
              }

            case 8:
              return _context7.abrupt('return', contract);

            case 9:
            case 'end':
              return _context7.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'getContractAddress',
    value: function getContractAddress(name) {
      var registryAddress, registry, address;
      return _regenerator2.default.async(function getContractAddress$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              registryAddress = this.getRegistryAddress();

              if (!(name === 'Registry')) {
                _context8.next = 3;
                break;
              }

              return _context8.abrupt('return', registryAddress);

            case 3:
              if (registryAddress) {
                _context8.next = 5;
                break;
              }

              throw Error('No registry address configured');

            case 5:
              _context8.prev = 5;
              _context8.next = 8;
              return _regenerator2.default.awrap(this.getContract('Registry'));

            case 8:
              registry = _context8.sent;

              if (registry) {
                _context8.next = 11;
                break;
              }

              throw Error('No registry contract!');

            case 11:
              _context8.next = 13;
              return _regenerator2.default.awrap(registry.methods.getContract(name).call());

            case 13:
              address = _context8.sent;
              return _context8.abrupt('return', address);

            case 17:
              _context8.prev = 17;
              _context8.t0 = _context8['catch'](5);

              console.log(_context8.t0);
              throw _context8.t0;

            case 21:
            case 'end':
              return _context8.stop();
          }
        }
      }, null, this, [[5, 17]]);
    }
  }, {
    key: 'getRegistryAddress',
    value: function getRegistryAddress() {
      return this.config.registryAddress;
    }
  }, {
    key: 'setRegistryAddress',
    value: function setRegistryAddress(registryAddress) {
      this.config.registryAddress = registryAddress;
    }
  }, {
    key: 'balanceOf',
    value: function balanceOf(address, symbol) {
      var balance, balances, contract;
      return _regenerator2.default.async(function balanceOf$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              balance = void 0;
              balances = {};

              // TODO: use default-options for argument type checking

              if (!(symbol && !['PTI', 'ETH'].includes(symbol))) {
                _context9.next = 4;
                break;
              }

              throw Error('Unknown symbol "' + symbol + '", must be one of "ETH", "PTI"');

            case 4:
              if (!(!symbol || symbol === 'ETH')) {
                _context9.next = 9;
                break;
              }

              _context9.next = 7;
              return _regenerator2.default.awrap(this.web3.eth.getBalance(address));

            case 7:
              balance = _context9.sent;

              balances.ETH = balance;

            case 9:
              if (!(!symbol || symbol === 'PTI')) {
                _context9.next = 18;
                break;
              }

              _context9.next = 12;
              return _regenerator2.default.awrap(this.getContract('ParatiiToken'));

            case 12:
              contract = _context9.sent;

              contract.setProvider(this.web3.currentProvider);
              _context9.next = 16;
              return _regenerator2.default.awrap(this.fixMethodAndCall(contract.methods.balanceOf(address)));

            case 16:
              balance = _context9.sent;

              balances.PTI = balance;

            case 18:
              if (!symbol) {
                _context9.next = 22;
                break;
              }

              return _context9.abrupt('return', balance);

            case 22:
              return _context9.abrupt('return', balances);

            case 23:
            case 'end':
              return _context9.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: '_transferETH',
    value: function _transferETH(beneficiary, amount) {
      var from, result;
      return _regenerator2.default.async(function _transferETH$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              // @args amount is in Wei
              // TODO: use the SendEther contract
              // TODO: this will only work on testrpc with unlocked accounts..
              from = this.config.account.address;

              if (from) {
                _context10.next = 3;
                break;
              }

              throw Error('No account set! Cannot send transactions');

            case 3:
              if (beneficiary) {
                _context10.next = 5;
                break;
              }

              throw Error('No beneficiary given.');

            case 5:
              from = (0, _utils.add0x)(from);
              beneficiary = (0, _utils.add0x)(beneficiary);

              _context10.next = 9;
              return _regenerator2.default.awrap(this.web3.eth.sendTransaction({
                from: from,
                to: beneficiary,
                value: amount,
                gasPrice: 20000000000,
                gas: 21000
              }));

            case 9:
              result = _context10.sent;
              return _context10.abrupt('return', result);

            case 11:
            case 'end':
              return _context10.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: '_transferPTI',
    value: function _transferPTI(beneficiary, amount) {
      var contract, from, result;
      return _regenerator2.default.async(function _transferPTI$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              _context11.next = 2;
              return _regenerator2.default.awrap(this.getContract('ParatiiToken'));

            case 2:
              contract = _context11.sent;

              if (!(!contract.options || !contract.options.address)) {
                _context11.next = 5;
                break;
              }

              throw Error('No ParatiiToken contract known - please run paratii.diagnose()');

            case 5:
              from = this.config.account.address;

              if (from) {
                _context11.next = 8;
                break;
              }

              throw Error('No account set! Cannot send transactions');

            case 8:
              from = (0, _utils.add0x)(from);
              beneficiary = (0, _utils.add0x)(beneficiary);

              _context11.next = 12;
              return _regenerator2.default.awrap(this.fixMethodAndSend(contract.methods.transfer(beneficiary, amount), { gas: 200000, from: from }));

            case 12:
              result = _context11.sent;
              return _context11.abrupt('return', result);

            case 14:
            case 'end':
              return _context11.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'transfer',
    value: function transfer(beneficiary, amount, symbol) {
      return _regenerator2.default.async(function transfer$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              if (!(symbol === 'ETH')) {
                _context12.next = 4;
                break;
              }

              return _context12.abrupt('return', this._transferETH(beneficiary, amount));

            case 4:
              if (!(symbol === 'PTI')) {
                _context12.next = 6;
                break;
              }

              return _context12.abrupt('return', this._transferPTI(beneficiary, amount));

            case 6:
            case 'end':
              return _context12.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'subscribe',
    value: function subscribe(type, options) {
      return _regenerator2.default.async(function subscribe$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              this.web3.eth.subscribe(type, function (error, result) {
                if (!error) {
                  console.log(result);
                } else {
                  console.log(error);
                }
              });

            case 1:
            case 'end':
              return _context13.stop();
          }
        }
      }, null, this);
    }
  }]);
  return ParatiiEth;
}();