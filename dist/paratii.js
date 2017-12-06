'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.utils = exports.Paratii = undefined;

var _utils = require('./utils.js');

var Web3 = require('web3');
var dopts = require('default-options');
var utils = require('./utils.js');

/**
 * Paratii Library
 * for usage, see https://github.com/Paratii-Video/paratii-contracts/tree/master/docs
 *
 */

var Paratii = function Paratii(opts) {
  var PARATIIREGISTRYADDRESS = void 0;
  var CONTRACTS = void 0;
  var account = void 0; // the account that will be the sender of all transactions
  var config = void 0; // options for the Paratii object
  var web3 = void 0;
  var contracts = {};

  var contractNames = ['ParatiiAvatar', 'ParatiiToken', 'ParatiiRegistry', 'SendEther', 'UserRegistry', 'VideoRegistry', 'VideoStore'];

  init(opts);

  function init() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var defaults = {
      provider: 'http://localhost:8545',
      registryAddress: null,
      // TODO: the account can be derived from the private key, so there is no need to specify both
      account: null,
      privateKey: null
    };
    config = dopts(opts, defaults);

    web3 = new Web3();
    web3.setProvider(new web3.providers.HttpProvider(config.provider));

    if (!config.account) {
      // this is the first account generated with testprc/ganache using the --deterministic flag
      // we use it here as default, but probably should not..
      account = {
        address: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
        privateKey: '4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d'
      };
      web3.eth.accounts.wallet.add(account.privateKey);
    } else {
      account = {
        address: config.account
      };
      web3.eth.accounts.wallet.add(config.privateKey);
    }

    if (opts.registryAddress) {
      PARATIIREGISTRYADDRESS = opts.registryAddress;
    }

    var ParatiiToken = requireContract('ParatiiToken');
    var ParatiiAvatar = requireContract('ParatiiAvatar');
    var ParatiiRegistry = requireContract('ParatiiRegistry');
    var SendEther = requireContract('SendEther');
    var UserRegistry = requireContract('UserRegistry');
    var VideoRegistry = requireContract('VideoRegistry');
    var VideoStore = requireContract('VideoStore');
    CONTRACTS = {
      'ParatiiAvatar': {
        contract: ParatiiAvatar
      },
      'ParatiiRegistry': {
        contract: ParatiiRegistry
      },
      'ParatiiToken': {
        contract: ParatiiToken
      },
      'SendEther': {
        contract: SendEther
      },
      'UserRegistry': {
        contract: UserRegistry
      },
      'VideoRegistry': {
        contract: VideoRegistry
      },
      'VideoStore': {
        contract: VideoStore
      }
    };
  }
  function setAccount(address, privateKey) {
    account = {
      address: account,
      privateKey: privateKey
      // account = {
      //   address: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
      //   privateKey: '4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d'
      // }

    };
    if (privateKey) {
      web3.eth.accounts.wallet.add(privateKey);
    }
  }

  function requireContract(contractName) {
    var artifact = require('paratii-contracts/build/contracts/' + contractName + '.json');
    var contract = new web3.eth.Contract(artifact.abi, {
      from: account.address,
      gas: web3.utils.toHex(4e6),
      data: artifact.bytecode
    });
    contract.setProvider(web3.currentProvider);
    return contract;
  }

  function deployContract(name) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var contract, deployedContract;
    return regeneratorRuntime.async(function deployContract$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            contract = CONTRACTS[name].contract;
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

  function deployContracts() {
    var paratiiRegistry, paratiiRegistryAddress, paratiiAvatar, paratiiToken, sendEther, userRegistry, videoRegistry, videoStore;
    return regeneratorRuntime.async(function deployContracts$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return regeneratorRuntime.awrap(deployContract('ParatiiRegistry'));

          case 2:
            paratiiRegistry = _context2.sent;
            paratiiRegistryAddress = paratiiRegistry.options.address;

            PARATIIREGISTRYADDRESS = paratiiRegistryAddress;

            _context2.next = 7;
            return regeneratorRuntime.awrap(deployContract('ParatiiAvatar', paratiiRegistryAddress));

          case 7:
            paratiiAvatar = _context2.sent;
            _context2.next = 10;
            return regeneratorRuntime.awrap(deployContract('ParatiiToken'));

          case 10:
            paratiiToken = _context2.sent;
            _context2.next = 13;
            return regeneratorRuntime.awrap(deployContract('SendEther'));

          case 13:
            sendEther = _context2.sent;
            _context2.next = 16;
            return regeneratorRuntime.awrap(deployContract('UserRegistry', paratiiRegistryAddress));

          case 16:
            userRegistry = _context2.sent;
            _context2.next = 19;
            return regeneratorRuntime.awrap(deployContract('VideoRegistry', paratiiRegistryAddress));

          case 19:
            videoRegistry = _context2.sent;
            _context2.next = 22;
            return regeneratorRuntime.awrap(deployContract('VideoStore', paratiiRegistryAddress));

          case 22:
            videoStore = _context2.sent;
            _context2.next = 25;
            return regeneratorRuntime.awrap(paratiiRegistry.methods.registerAddress('ParatiiAvatar', paratiiAvatar.options.address).send());

          case 25:
            _context2.next = 27;
            return regeneratorRuntime.awrap(paratiiRegistry.methods.registerAddress('ParatiiToken', paratiiToken.options.address).send());

          case 27:
            _context2.next = 29;
            return regeneratorRuntime.awrap(paratiiRegistry.methods.registerAddress('SendEther', sendEther.options.address).send());

          case 29:
            _context2.next = 31;
            return regeneratorRuntime.awrap(paratiiRegistry.methods.registerAddress('VideoRegistry', videoRegistry.options.address).send());

          case 31:
            _context2.next = 33;
            return regeneratorRuntime.awrap(paratiiRegistry.methods.registerAddress('VideoStore', videoStore.options.address).send());

          case 33:
            _context2.next = 35;
            return regeneratorRuntime.awrap(paratiiRegistry.methods.registerAddress('UserRegistry', userRegistry.options.address).send());

          case 35:
            _context2.next = 37;
            return regeneratorRuntime.awrap(paratiiRegistry.methods.registerUint('VideoRedistributionPoolShare', web3.utils.toWei('0.3')).send());

          case 37:
            _context2.next = 39;
            return regeneratorRuntime.awrap(paratiiAvatar.methods.addToWhitelist(videoStore.address).send());

          case 39:

            contracts = {
              ParatiiAvatar: paratiiAvatar,
              ParatiiRegistry: paratiiRegistry,
              ParatiiToken: paratiiToken,
              SendEther: sendEther,
              UserRegistry: userRegistry,
              VideoRegistry: videoRegistry,
              VideoStore: videoStore
            };

            return _context2.abrupt('return', contracts);

          case 41:
          case 'end':
            return _context2.stop();
        }
      }
    }, null, this);
  }

  function getContract(name) {
    var contractInfo, contract, address;
    return regeneratorRuntime.async(function getContract$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            contractInfo = void 0, contract = void 0;

            contractInfo = CONTRACTS[name];

            if (contractInfo) {
              _context3.next = 4;
              break;
            }

            throw Error('No contract with name "' + name + '" is known');

          case 4:
            _context3.next = 6;
            return regeneratorRuntime.awrap(getContractAddress(name));

          case 6:
            address = _context3.sent;

            if (address) {
              contract = contractInfo.contract;
              contract.options.address = address;
            }
            return _context3.abrupt('return', contract);

          case 9:
          case 'end':
            return _context3.stop();
        }
      }
    }, null, this);
  }

  // TODO: optimization: do not ask the contract addresses from the registry each time, only on startup/first access
  function getContractAddress(name) {
    var registry, address;
    return regeneratorRuntime.async(function getContractAddress$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (!(name === 'ParatiiRegistry')) {
              _context4.next = 2;
              break;
            }

            return _context4.abrupt('return', getRegistryAddress());

          case 2:
            _context4.prev = 2;
            _context4.next = 5;
            return regeneratorRuntime.awrap(getContract('ParatiiRegistry'));

          case 5:
            registry = _context4.sent;

            if (registry) {
              _context4.next = 8;
              break;
            }

            throw Error('No contract!');

          case 8:
            _context4.next = 10;
            return regeneratorRuntime.awrap(registry.methods.getContract(name).call({
              from: account.address
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

  function getContracts() {
    return regeneratorRuntime.async(function getContracts$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            return _context5.abrupt('return', contracts);

          case 1:
          case 'end':
            return _context5.stop();
        }
      }
    }, null, this);
  }

  // function getParatiiRegistry () {
  //
  //   let address = getRegistryAddress()
  //   if (!address) {
  //     let msg = `No paratii registry address known!`
  //     throw Error(msg)
  //   }
  //   CONTRACTS.ParatiiRegistry.contract.options.address = address
  //   return CONTRACTS.ParatiiRegistry.contract
  // }

  function getRegistryAddress() {
    return PARATIIREGISTRYADDRESS;
  }

  // async function getOrDeployContracts () {
  //   // get the paratii contracts if a registryaddress is known, otherwise deploy them
  //   let contracts
  //   if (PARATIIREGISTRYADDRESS) {
  //     contracts = await getContracts()
  //   } else {
  //     console.log('deploying new contracts')
  //     contracts = await deployContracts()
  //     console.log('setting registry address')
  //     PARATIIREGISTRYADDRESS = contracts['ParatiiRegistry'].address
  //   }
  //   return contracts
  // }

  function balanceOf(account, symbol) {
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
            return regeneratorRuntime.awrap(web3.eth.getBalance(account));

          case 7:
            balance = _context6.sent;

            balances.ETH = balance;

          case 9:
            if (!(!symbol || symbol === 'PTI')) {
              _context6.next = 17;
              break;
            }

            _context6.next = 12;
            return regeneratorRuntime.awrap(getContract('ParatiiToken'));

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
  function _transferETH(beneficiary, amount) {
    var fromAddress, result;
    return regeneratorRuntime.async(function _transferETH$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            if (config.account) {
              _context7.next = 2;
              break;
            }

            throw Error('No account set! Cannot send transactions');

          case 2:
            fromAddress = config.account;
            _context7.next = 5;
            return regeneratorRuntime.awrap(web3.eth.sendTransaction({
              from: (0, _utils.add0x)(fromAddress),
              to: (0, _utils.add0x)(beneficiary),
              value: amount,
              gasPrice: 20000000000
            }));

          case 5:
            result = _context7.sent;
            return _context7.abrupt('return', result);

          case 7:
          case 'end':
            return _context7.stop();
        }
      }
    }, null, this);
  }

  function _transferPTI(beneficiary, amount) {
    var contract, fromAddress, result;
    return regeneratorRuntime.async(function _transferPTI$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return regeneratorRuntime.awrap(getContract('ParatiiToken'));

          case 2:
            contract = _context8.sent;
            fromAddress = config.account;

            if (config.account) {
              _context8.next = 6;
              break;
            }

            throw Error('No account set! Cannot send transactions');

          case 6:
            _context8.next = 8;
            return regeneratorRuntime.awrap(contract.methods.transfer(beneficiary, amount).send({ gas: 200000, from: fromAddress }));

          case 8:
            result = _context8.sent;
            return _context8.abrupt('return', result);

          case 10:
          case 'end':
            return _context8.stop();
        }
      }
    }, null, this);
  }

  function transfer(beneficiary, amount, symbol) {
    return regeneratorRuntime.async(function transfer$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            if (!(symbol === 'ETH')) {
              _context9.next = 4;
              break;
            }

            return _context9.abrupt('return', _transferETH(beneficiary, amount));

          case 4:
            if (!(symbol === 'PTI')) {
              _context9.next = 6;
              break;
            }

            return _context9.abrupt('return', _transferPTI(beneficiary, amount));

          case 6:
          case 'end':
            return _context9.stop();
        }
      }
    }, null, this);
  }

  function diagnose() {
    var msg, address, msgs, log, registry, i, name;
    return regeneratorRuntime.async(function diagnose$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            log = function log(msg) {
              msgs.push(msg);
            };

            // return an array of strings with diagnostic info
            msg = void 0, address = void 0, msgs = void 0;

            msgs = [];

            log('Paratii was initialized with the following options:');
            log(config);
            address = getRegistryAddress();
            log('checking deployed code of Registry...');
            _context10.next = 9;
            return regeneratorRuntime.awrap(web3.eth.getCode(address));

          case 9:
            msg = _context10.sent;

            if (msg === '0x') {
              log('ERROR: no code was found on the registry address ' + address);
              log(msg);
            } else {
              log('... seems ok...');
              // log(`We found the following code on the registry address ${address}`)
              // log(msg)
            }
            log('checking for addresses');
            _context10.next = 14;
            return regeneratorRuntime.awrap(getContract('ParatiiRegistry'));

          case 14:
            registry = _context10.sent;
            i = 0;

          case 16:
            if (!(i < contractNames.length)) {
              _context10.next = 26;
              break;
            }

            name = contractNames[i];

            if (!(name !== 'ParatiiRegistry')) {
              _context10.next = 23;
              break;
            }

            _context10.next = 21;
            return regeneratorRuntime.awrap(registry.methods.getContract(name).call());

          case 21:
            address = _context10.sent;

            log('address of ' + name + ': ' + address);

          case 23:
            i++;
            _context10.next = 16;
            break;

          case 26:
            log('thats it!');
            return _context10.abrupt('return', msgs);

          case 28:
          case 'end':
            return _context10.stop();
        }
      }
    }, null, this);
  }

  return {
    config: config,
    diagnose: diagnose,
    eth: {
      deployContracts: deployContracts,
      balanceOf: balanceOf,
      getContract: getContract,
      getContracts: getContracts,
      getContractAddress: getContractAddress,
      // getOrDeployContracts,
      getRegistryAddress: getRegistryAddress,
      transfer: transfer
    },
    personal: {
      address: account.address,
      setAccount: setAccount,
      account: account
    },
    web3: web3
  };
};

exports.Paratii = Paratii;
exports.utils = utils;