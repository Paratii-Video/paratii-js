// this code is lifted and adapted from ethereumjs-lightwallet

var Mnemonic = require('bitcore-mnemonic')
var bitcore = require('bitcore-lib')

export function patchWallet (wallet) {
  function create (numberOfAccounts, mnemonic) {
    if (Mnemonic.isValid(mnemonic)) {
      this.mnemonic = mnemonic
      this.hdIndex = 0
    // this code is lifted from eth-lightwallet
      var hdRoot = new Mnemonic(this.mnemonic).toHDPrivateKey().xprivkey

      // var keys = []
      for (var i = 0; i < numberOfAccounts; ++i) {
        var hdprivkey = new bitcore.HDPrivateKey(hdRoot).derive(this.hdIndex++)
        var privkeyBuf = hdprivkey.privateKey.toBuffer()

        var privkeyHex = privkeyBuf.toString('hex')
        if (privkeyBuf.length < 16) {
        // Way too small key, something must have gone wrong
        // Halt and catch fire
          throw new Error('Private key suspiciously small: < 16 bytes. Aborting!')
        } else if (privkeyBuf.length < 32) {
        // Pad private key if too short
        // bitcore has a bug where it sometimes returns
        // truncated keys
          // TODO: uncomment next line (fund out where leeftPadString is defined)
          // privkeyHex = leftPadString(privkeyBuf.toString('hex'), '0', 64)
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
  wallet.create = create
  return wallet
}
