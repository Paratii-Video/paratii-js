// this code is lifted and adapted from ethereumjs-lightwallet

var Mnemonic = require('bitcore-mnemonic')
var bitcore = require('bitcore-lib')

export function patchWallet (wallet) {
  async function create (numberOfAccounts, mnemonic) {
    if (this.length > 0) {
      throw Error('This wallet has already been created!')
    }
    if (numberOfAccounts === undefined) {
      numberOfAccounts = 1
    }
    if (mnemonic === undefined) {
      if (this._mnemonic) {
        mnemonic = this._mnemonic
      } else {
        mnemonic = newMnemonic()
      }
    }
    if (isValidMnemonic(mnemonic)) {
      this._mnemonic = mnemonic
      this._hdIndex = 0
    // this code is lifted from eth-lightwallet
      var hdRoot = new Mnemonic(this._mnemonic).toHDPrivateKey().xprivkey

      // var keys = []
      for (var i = 0; i < numberOfAccounts; ++i) {
        var hdprivkey = new bitcore.HDPrivateKey(hdRoot).derive(this._hdIndex++)
        var privkeyBuf = hdprivkey.privateKey.toBuffer()

        var privkeyHex = privkeyBuf.toString('hex')
        if (privkeyBuf.length < 32) {
        // Way too small key, something must have gone wrong
        // Halt and catch fire
          throw new Error('Private key suspiciously small: < 16 bytes. Aborting!')
        } else if (privkeyBuf.length > 32) {
          throw new Error('Private key larger than 32 bytes. Aborting!')
        }
      // privkeyHex = '0x' + privkeyHex
        var x = this._accounts.privateKeyToAccount(privkeyHex).privateKey
        this.add(x)
      }
    } else {
      throw Error(`Mnemonic was not valid: ${mnemonic}`)
    }
    return this
  }

  function isValidMnemonic (mnemonic) {
    return Mnemonic.isValid(mnemonic)
  }

  function newMnemonic () {
    return new Mnemonic().toString()
  }

  function getMnemonic () {
    return this._mnemonic
  }

  wallet._mnemonic = undefined
  wallet.create = create
  wallet.isValidMnemonic = isValidMnemonic
  wallet.newMnemonic = newMnemonic
  wallet.getMnemonic = getMnemonic
  return wallet
}
