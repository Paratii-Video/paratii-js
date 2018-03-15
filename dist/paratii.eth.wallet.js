'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

exports.patchWallet = patchWallet;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// this code is lifted and adapted from ethereumjs-lightwallet

var bip39 = require('bip39');
var hdkey = require('ethereumjs-wallet/hdkey');

function patchWallet(wallet, config) {
  function create(numberOfAccounts, mnemonic) {
    var seed, masternode, i, generatedAddress, privkeyBuf, privkeyHex, privateKey;
    return _regenerator2.default.async(function create$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(this.length > 0)) {
              _context.next = 2;
              break;
            }

            throw Error('This wallet has already been created!');

          case 2:
            if (numberOfAccounts === undefined) {
              numberOfAccounts = 1;
            }
            if (mnemonic === undefined) {
              if (this._mnemonic) {
                mnemonic = this._mnemonic;
              } else {
                mnemonic = bip39.generateMnemonic();
              }
            }

            if (!bip39.validateMnemonic(mnemonic)) {
              _context.next = 30;
              break;
            }

            this._mnemonic = mnemonic;
            this._hdIndex = 0;

            seed = bip39.mnemonicToSeed(this._mnemonic, this._passphrase);
            // saving for testing purpose

            this._seedHex = bip39.mnemonicToSeedHex(this._mnemonic, this._passphrase);

            // contains masternode extended priv key and extended pub key
            masternode = hdkey.fromMasterSeed(seed);

            // saving xtended private key for testing purpose

            this._xpriv = masternode.privateExtendedKey();

            // var keys = []
            i = 0;

          case 12:
            if (!(i < numberOfAccounts)) {
              _context.next = 28;
              break;
            }

            generatedAddress = masternode.deriveChild(i).getWallet();
            privkeyBuf = generatedAddress.getPrivateKey();
            privkeyHex = generatedAddress.getPrivateKey().toString('hex');

            if (!(privkeyBuf.length < 32)) {
              _context.next = 20;
              break;
            }

            throw new Error('Private key suspiciously small: < 16 bytes. Aborting!');

          case 20:
            if (!(privkeyBuf.length > 32)) {
              _context.next = 22;
              break;
            }

            throw new Error('Private key larger than 32 bytes. Aborting!');

          case 22:
            privateKey = this._accounts.privateKeyToAccount(privkeyHex).privateKey;

            this.add(privateKey);
            if (i === 0) {
              config.paratii.eth.setAccount(this[0].address, privateKey);
            }

          case 25:
            ++i;
            _context.next = 12;
            break;

          case 28:
            _context.next = 31;
            break;

          case 30:
            throw Error('Mnemonic was not valid: ' + mnemonic);

          case 31:
            return _context.abrupt('return', this);

          case 32:
          case 'end':
            return _context.stop();
        }
      }
    }, null, this);
  }

  function isValidMnemonic(mnemonic) {
    return bip39.validateMnemonic(mnemonic);
  }

  function newMnemonic() {
    return bip39.generateMnemonic();
  }

  function getMnemonic() {
    return this._mnemonic;
  }

  function setPassphrase(passphrase) {
    this._passphrase = passphrase;
    return this._passphrase;
  }

  var origDecrypt = wallet.decrypt.bind(wallet);
  function _decrypt(data, password) {
    var newWallet = origDecrypt(data, password);
    if (newWallet) {
      config.paratii.eth.setAccount(newWallet['0'].address, newWallet['0'].privateKey);
    }
    return newWallet;
  }

  wallet._mnemonic = undefined;
  // testing purpose
  wallet._passphrase = '';
  wallet.setPassphrase = setPassphrase;
  wallet.create = create;
  wallet.decrypt = _decrypt;
  wallet.isValidMnemonic = isValidMnemonic;
  wallet.newMnemonic = newMnemonic;
  wallet.getMnemonic = getMnemonic;
  return wallet;
}