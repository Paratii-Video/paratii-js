// this code is lifted and adapted from ethereumjs-lightwallet

var bip39 = require('bip39')
var hdkey = require('ethereumjs-wallet/hdkey')

export function patchWallet (wallet, config) {
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
        mnemonic = bip39.generateMnemonic()
      }
    }
    if (bip39.validateMnemonic(mnemonic)) {
      this._mnemonic = mnemonic
      this._hdIndex = 0

      var seed = bip39.mnemonicToSeed(this._mnemonic,this._passphrase)
      //saving for testing purpose
      this._seedHex = bip39.mnemonicToSeedHex(this._mnemonic,this._passphrase)

      //contains masternode extended priv key and extended pub key
      var masternode = hdkey.fromMasterSeed(seed)

      //saving xtended private key for testing purpose
      this._xpriv =masternode.privateExtendedKey();

      // var keys = []
      for (var i = 0; i < numberOfAccounts; ++i) {
        var generatedAddress = masternode.deriveChild(i).getWallet()

        var privkeyBuf = generatedAddress.getPrivateKey()

        var privkeyHex = generatedAddress.getPrivateKey().toString('hex');

        if (privkeyBuf.length < 32) {
        // Way too small key, something must have gone wrong
        // Halt and catch fire
          throw new Error('Private key suspiciously small: < 16 bytes. Aborting!')
        } else if (privkeyBuf.length > 32) {
          throw new Error('Private key larger than 32 bytes. Aborting!')
        }
        var privateKey = this._accounts.privateKeyToAccount(privkeyHex).privateKey
        this.add(privateKey)
        if (i === 0) {
          config.paratii.eth.setAccount(this[0].address, privateKey)
        }
      }
    } else {
      throw Error(`Mnemonic was not valid: ${mnemonic}`)
    }
    return this
  }

  function isValidMnemonic (mnemonic) {
    return bip39.validateMnemonic(mnemonic)
  }

  function newMnemonic () {
    return bip39.generateMnemonic()
  }

  function getMnemonic () {
    return this._mnemonic
  }

  function setPassphrase(passphrase){
    this._passphrase = passphrase
    return this._passphrase
  }

  let origDecrypt = wallet.decrypt.bind(wallet)
  function _decrypt (data, password) {
    let newWallet = origDecrypt(data, password)
    if (newWallet) {
      config.paratii.eth.setAccount(newWallet['0'].address, newWallet['0'].privateKey)
    }
    return newWallet
  }

  wallet._mnemonic = undefined
  //testing purpose
  wallet._passphrase = ''
  wallet.setPassphrase = setPassphrase
  wallet.create = create
  wallet.decrypt = _decrypt
  wallet.isValidMnemonic = isValidMnemonic
  wallet.newMnemonic = newMnemonic
  wallet.getMnemonic = getMnemonic
  return wallet
}
