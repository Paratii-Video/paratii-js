'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

exports.patchWallet = patchWallet;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// this code is lifted and adapted from ethereumjs-lightwallet

var Mnemonic = require('bitcore-mnemonic');
var bitcore = require('bitcore-lib');

function patchWallet(wallet, config) {
  function create(numberOfAccounts, mnemonic) {
    var hdRoot, i, hdprivkey, privkeyBuf, privkeyHex, privateKey;
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
                mnemonic = newMnemonic();
              }
            }

            if (!isValidMnemonic(mnemonic)) {
              _context.next = 27;
              break;
            }

            this._mnemonic = mnemonic;
            this._hdIndex = 0;
            // this code is lifted from eth-lightwallet
            hdRoot = new Mnemonic(this._mnemonic).toHDPrivateKey().xprivkey;

            // var keys = []

            i = 0;

          case 9:
            if (!(i < numberOfAccounts)) {
              _context.next = 25;
              break;
            }

            hdprivkey = new bitcore.HDPrivateKey(hdRoot).derive(this._hdIndex++);
            privkeyBuf = hdprivkey.privateKey.toBuffer();
            privkeyHex = privkeyBuf.toString('hex');

            if (!(privkeyBuf.length < 32)) {
              _context.next = 17;
              break;
            }

            throw new Error('Private key suspiciously small: < 16 bytes. Aborting!');

          case 17:
            if (!(privkeyBuf.length > 32)) {
              _context.next = 19;
              break;
            }

            throw new Error('Private key larger than 32 bytes. Aborting!');

          case 19:
            privateKey = this._accounts.privateKeyToAccount(privkeyHex).privateKey;

            this.add(privateKey);
            if (i === 0) {
              config.paratii.eth.setAccount(this[0].address, privateKey);
            }

          case 22:
            ++i;
            _context.next = 9;
            break;

          case 25:
            _context.next = 28;
            break;

          case 27:
            throw Error('Mnemonic was not valid: ' + mnemonic);

          case 28:
            return _context.abrupt('return', this);

          case 29:
          case 'end':
            return _context.stop();
        }
      }
    }, null, this);
  }

  function isValidMnemonic(mnemonic) {
    return Mnemonic.isValid(mnemonic);
  }

  function newMnemonic() {
    return new Mnemonic().toString();
  }

  function getMnemonic() {
    return this._mnemonic;
  }

  var origDecrypt = wallet.decrypt.bind(wallet);
  function _decrypt(data, password) {
    var newWallet = origDecrypt(data, password);
    if (newWallet) {
      config.paratii.eth.setAccount(newWallet['0'].address, newWallet['0'].privateKey);
    }
    return newWallet;
  }
  _decrypt.bind(wallet);

  wallet._mnemonic = undefined;
  wallet.create = create;
  wallet.decrypt = _decrypt;
  wallet.isValidMnemonic = isValidMnemonic;
  wallet.newMnemonic = newMnemonic;
  wallet.getMnemonic = getMnemonic;
  return wallet;
}