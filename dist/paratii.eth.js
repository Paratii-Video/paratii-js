'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiEth = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./utils.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ParatiiEth = exports.ParatiiEth = function () {
  function ParatiiEth(context) {
    _classCallCheck(this, ParatiiEth);

    this.context = context;
    this.contracts = {};
    this.contracts.ParatiiToken = this.requireContract('ParatiiToken');
    this.contracts.ParatiiAvatar = this.requireContract('ParatiiAvatar');
    this.contracts.ParatiiRegistry = this.requireContract('ParatiiRegistry');
    this.contracts.SendEther = this.requireContract('SendEther');
    this.contracts.UserRegistry = this.requireContract('UserRegistry');
    this.contracts.VideoRegistry = this.requireContract('VideoRegistry');
    this.contracts.VideoStore = this.requireContract('VideoStore');

    this.contractNames = ['ParatiiAvatar', 'ParatiiToken', 'ParatiiRegistry', 'SendEther', 'UserRegistry', 'VideoRegistry', 'VideoStore'];

    this.vids = new ParatiiEthVids(this);
  }

  _createClass(ParatiiEth, [{
    key: 'requireContract',
    value: function requireContract(contractName) {
      var artifact = require('paratii-contracts/build/contracts/' + contractName + '.json');
      var contract = new this.context.web3.eth.Contract(artifact.abi, {
        from: this.context.account.address,
        gas: this.context.web3.utils.toHex(4e6),
        data: artifact.bytecode
      });
      contract.setProvider(this.context.web3.currentProvider);
      return contract;
    }
  }, {
    key: 'deployContract',
    value: function deployContract(name) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var contract, deployedContract;
      return regeneratorRuntime.async(function deployContract$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              contract = this.contracts[name];
              _context.next = 3;
              return regeneratorRuntime.awrap(contract.deploy({ arguments: args }).send());

            case 3:
              deployedContract = _context.sent;
              return _context.abrupt('return', deployedContract);

            case 5:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'deployContracts',
    value: function deployContracts() {
      var paratiiRegistry, paratiiRegistryAddress, paratiiAvatar, paratiiToken, sendEther, userRegistry, videoRegistry, videoStore;
      return regeneratorRuntime.async(function deployContracts$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return regeneratorRuntime.awrap(this.deployContract('ParatiiRegistry'));

            case 2:
              paratiiRegistry = _context2.sent;
              paratiiRegistryAddress = paratiiRegistry.options.address;
              _context2.next = 6;
              return regeneratorRuntime.awrap(this.deployContract('ParatiiAvatar', paratiiRegistryAddress));

            case 6:
              paratiiAvatar = _context2.sent;
              _context2.next = 9;
              return regeneratorRuntime.awrap(this.deployContract('ParatiiToken'));

            case 9:
              paratiiToken = _context2.sent;
              _context2.next = 12;
              return regeneratorRuntime.awrap(this.deployContract('SendEther'));

            case 12:
              sendEther = _context2.sent;
              _context2.next = 15;
              return regeneratorRuntime.awrap(this.deployContract('UserRegistry', paratiiRegistryAddress));

            case 15:
              userRegistry = _context2.sent;
              _context2.next = 18;
              return regeneratorRuntime.awrap(this.deployContract('VideoRegistry', paratiiRegistryAddress));

            case 18:
              videoRegistry = _context2.sent;
              _context2.next = 21;
              return regeneratorRuntime.awrap(this.deployContract('VideoStore', paratiiRegistryAddress));

            case 21:
              videoStore = _context2.sent;
              _context2.next = 24;
              return regeneratorRuntime.awrap(paratiiRegistry.methods.registerAddress('ParatiiAvatar', paratiiAvatar.options.address).send());

            case 24:
              _context2.next = 26;
              return regeneratorRuntime.awrap(paratiiRegistry.methods.registerAddress('ParatiiToken', paratiiToken.options.address).send());

            case 26:
              _context2.next = 28;
              return regeneratorRuntime.awrap(paratiiRegistry.methods.registerAddress('SendEther', sendEther.options.address).send());

            case 28:
              _context2.next = 30;
              return regeneratorRuntime.awrap(paratiiRegistry.methods.registerAddress('VideoRegistry', videoRegistry.options.address).send());

            case 30:
              _context2.next = 32;
              return regeneratorRuntime.awrap(paratiiRegistry.methods.registerAddress('VideoStore', videoStore.options.address).send());

            case 32:
              _context2.next = 34;
              return regeneratorRuntime.awrap(paratiiRegistry.methods.registerAddress('UserRegistry', userRegistry.options.address).send());

            case 34:
              _context2.next = 36;
              return regeneratorRuntime.awrap(paratiiRegistry.methods.registerUint('VideoRedistributionPoolShare', this.context.web3.utils.toWei('0.3')).send());

            case 36:
              _context2.next = 38;
              return regeneratorRuntime.awrap(paratiiAvatar.methods.addToWhitelist(videoStore.address).send());

            case 38:

              this.contracts = {
                ParatiiAvatar: paratiiAvatar,
                ParatiiRegistry: paratiiRegistry,
                ParatiiToken: paratiiToken,
                SendEther: sendEther,
                UserRegistry: userRegistry,
                VideoRegistry: videoRegistry,
                VideoStore: videoStore
              };
              this.context.config.registryAddress = paratiiRegistryAddress;

              return _context2.abrupt('return', this.contracts);

            case 41:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'getContract',
    value: function getContract(name) {
      var contract, address;
      return regeneratorRuntime.async(function getContract$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              contract = this.contracts[name];

              if (contract) {
                _context3.next = 3;
                break;
              }

              throw Error('No contract with name "' + name + '" is known');

            case 3:
              _context3.next = 5;
              return regeneratorRuntime.awrap(this.getContractAddress(name));

            case 5:
              address = _context3.sent;

              if (address) {
                contract.options.address = address;
              }
              return _context3.abrupt('return', contract);

            case 8:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this);
    }

    // TODO: optimization: do not ask the contract addresses from the registry each time, only on startup/first access

  }, {
    key: 'getContractAddress',
    value: function getContractAddress(name) {
      var registry, address;
      return regeneratorRuntime.async(function getContractAddress$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              if (!(name === 'ParatiiRegistry')) {
                _context4.next = 2;
                break;
              }

              return _context4.abrupt('return', this.getRegistryAddress());

            case 2:
              _context4.prev = 2;
              _context4.next = 5;
              return regeneratorRuntime.awrap(this.getContract('ParatiiRegistry'));

            case 5:
              registry = _context4.sent;

              if (registry) {
                _context4.next = 8;
                break;
              }

              throw Error('No registry contract!');

            case 8:
              _context4.next = 10;
              return regeneratorRuntime.awrap(registry.methods.getContract(name).call({
                from: this.context.account.address
              }));

            case 10:
              address = _context4.sent;
              return _context4.abrupt('return', address);

            case 14:
              _context4.prev = 14;
              _context4.t0 = _context4['catch'](2);

              console.log(_context4.t0);
              throw _context4.t0;

            case 18:
            case 'end':
              return _context4.stop();
          }
        }
      }, null, this, [[2, 14]]);
    }
  }, {
    key: 'getContracts',
    value: function getContracts() {
      return regeneratorRuntime.async(function getContracts$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              return _context5.abrupt('return', this.contracts);

            case 1:
            case 'end':
              return _context5.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'getRegistryAddress',
    value: function getRegistryAddress() {
      return this.context.config.registryAddress;
    }
  }, {
    key: 'balanceOf',
    value: function balanceOf(account, symbol) {
      var balance, balances, contract;
      return regeneratorRuntime.async(function balanceOf$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              balance = void 0;
              balances = {};

              // TODO: use default-options for argument type checking

              if (!(symbol && !['PTI', 'ETH'].includes(symbol))) {
                _context6.next = 4;
                break;
              }

              throw Error('Unknown symbol "' + symbol + '", must be one of "ETH", "PTI"');

            case 4:
              if (!(!symbol || symbol === 'ETH')) {
                _context6.next = 9;
                break;
              }

              _context6.next = 7;
              return regeneratorRuntime.awrap(this.context.web3.eth.getBalance(account));

            case 7:
              balance = _context6.sent;

              balances.ETH = balance;

            case 9:
              if (!(!symbol || symbol === 'PTI')) {
                _context6.next = 17;
                break;
              }

              _context6.next = 12;
              return regeneratorRuntime.awrap(this.getContract('ParatiiToken'));

            case 12:
              contract = _context6.sent;
              _context6.next = 15;
              return regeneratorRuntime.awrap(contract.methods.balanceOf(account).call());

            case 15:
              balance = _context6.sent;

              balances.PTI = balance;

            case 17:
              if (!symbol) {
                _context6.next = 21;
                break;
              }

              return _context6.abrupt('return', balance);

            case 21:
              return _context6.abrupt('return', balances);

            case 22:
            case 'end':
              return _context6.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: '_transferETH',
    value: function _transferETH(beneficiary, amount) {
      var from, result;
      return regeneratorRuntime.async(function _transferETH$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              // @args amount is in Wei
              // TODO: use the SendEther contract
              // TODO: this will only work on testrpc with unlocked accounts..
              from = this.context.config.account;

              if (from) {
                _context7.next = 3;
                break;
              }

              throw Error('No account set! Cannot send transactions');

            case 3:
              if (beneficiary) {
                _context7.next = 5;
                break;
              }

              throw Error('No beneficiary given.');

            case 5:
              from = (0, _utils.add0x)(from);
              beneficiary = (0, _utils.add0x)(beneficiary);
              // console.log('000000000000000000000000000000000000000000000000000000000000000')
              // console.log(from)
              // console.log(beneficiary)
              // console.log('000000000000000000000000000000000000000000000000000000000000000')
              _context7.next = 9;
              return regeneratorRuntime.awrap(this.context.web3.eth.sendTransaction({
                from: from,
                to: beneficiary,
                value: amount,
                gasPrice: 20000000000
              }));

            case 9:
              result = _context7.sent;
              return _context7.abrupt('return', result);

            case 11:
            case 'end':
              return _context7.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: '_transferPTI',
    value: function _transferPTI(beneficiary, amount) {
      var contract, from, result;
      return regeneratorRuntime.async(function _transferPTI$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return regeneratorRuntime.awrap(this.getContract('ParatiiToken'));

            case 2:
              contract = _context8.sent;

              if (!(!contract.options || !contract.options.address)) {
                _context8.next = 5;
                break;
              }

              throw Error('No ParaktiiToken contract known - please run paratii.diagnose()');

            case 5:
              from = this.context.config.account;

              if (from) {
                _context8.next = 8;
                break;
              }

              throw Error('No account set! Cannot send transactions');

            case 8:
              from = (0, _utils.add0x)(from);
              beneficiary = (0, _utils.add0x)(beneficiary);
              // console.log('000000000000000000000000000000000000000000000000000000000000000')
              // console.log(from)
              // console.log(beneficiary)
              // console.log('000000000000000000000000000000000000000000000000000000000000000')
              // console.log(`Sending ${amount} PTI from ${fromAddress} to ${beneficiary} using contract ${contract}`)
              _context8.next = 12;
              return regeneratorRuntime.awrap(contract.methods.transfer(beneficiary, amount).send({ gas: 200000, from: from }));

            case 12:
              result = _context8.sent;
              return _context8.abrupt('return', result);

            case 14:
            case 'end':
              return _context8.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'transfer',
    value: function transfer(beneficiary, amount, symbol) {
      return regeneratorRuntime.async(function transfer$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              if (!(symbol === 'ETH')) {
                _context9.next = 4;
                break;
              }

              return _context9.abrupt('return', this._transferETH(beneficiary, amount));

            case 4:
              if (!(symbol === 'PTI')) {
                _context9.next = 6;
                break;
              }

              return _context9.abrupt('return', this._transferPTI(beneficiary, amount));

            case 6:
            case 'end':
              return _context9.stop();
          }
        }
      }, null, this);
    }
  }]);

  return ParatiiEth;
}();

var ParatiiEthVids = function () {
  function ParatiiEthVids(context) {
    _classCallCheck(this, ParatiiEthVids);

    this.context = context;
  }

  _createClass(ParatiiEthVids, [{
    key: 'register',
    value: function register(title) {}
  }]);

  return ParatiiEthVids;
}();