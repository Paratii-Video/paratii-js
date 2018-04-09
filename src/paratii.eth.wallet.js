// this code is lifted and adapted from ethereumjs-lightwallet

import {add0x} from './utils.js'
var bip39 = require('bip39')
var hdkey = require('hdkey')
/**
 * overrides some web3js wallet functionalties
 * @param  {Object} wallet wallet to patch
 * @param  {Object} config configuration object to initialize Paratii object
 * @return {Object}        patched wallet

 */
export function patchWallet (wallet, config) {
  /**
   * Create a wallet with a given number of accounts from a BIP39 mnemonic
   * @param  {Number} numberOfAccounts number of accounts to be created
   * @param  {String} mnemonic         optional - mnemonic of the wallet, if not specified a random one is generated
   * @return {Object}                  the created wallet
   * @example wallet = await wallet.create(5, 'some long mnemonic phrase')

   */
  async function create (numberOfAccounts, mnemonic) {
    if (this.length > 0) {
      throw Error('This wallet has already been created!')
    }
    if (numberOfAccounts === undefined) {
      numberOfAccounts = 1
    }
    if (mnemonic === undefined) {
      mnemonic = bip39.generateMnemonic()
    }

    if (bip39.validateMnemonic(mnemonic)) {
      let seed = bip39.mnemonicToSeed(mnemonic)
      // contains masternode extended priv key and extended pub key
      let masternode = hdkey.fromMasterSeed(seed)

      for (let i = 0; i < numberOfAccounts; ++i) {
        // m / purpose' / coin_type' / account' / change / address_index
        let child = masternode.derive(`m/44'/60'/0'/0/${i}`)
        let privkeyHex = child.privateKey.toString('hex')
        var privateKey = this._accounts.privateKeyToAccount(add0x(privkeyHex)).privateKey
        this.add(privateKey)
      }
    } else {
      throw Error(`Mnemonic was not valid: ${mnemonic}`)
    }
    return this
  }
  /**
   * check if the passed mnemonic is bip39 valid
   * @param  {String}  mnemonic mnemonic to check
   * @return {Boolean}          true if the mnemonic is valid, false otherwise
   * @example paratii.eth.wallet.isValidMnemonic('some long mnemonic phrase')

   */
  function isValidMnemonic (mnemonic) {
    return bip39.validateMnemonic(mnemonic)
  }
  /**
   * generates a new mnemonic
   * @return {String} newly generated mnemonic
   * @example let newMnemonic = paratii.eth.wallet.generateMnemonic()

   */
  function newMnemonic () {
    return bip39.generateMnemonic()
  }

  /* function getMnemonic () {
    return this._mnemonic
  }

  function setPassphrase (passphrase) {
    this._passphrase = passphrase
    return this._passphrase
  } */

  let origDecrypt = wallet.decrypt.bind(wallet)
  /**
   * decrypts the wallet
   * @param       {Object} data     encrypted wallet
   * @param       {String} password password to decrypt
   * @return      {Object}          decrypted wallet
   * @example let decryptedWallet = paratii.eth.wallet._decrypt(encryptedWallet,'some-psw')

   */
  function _decrypt (data, password) {
    let newWallet = origDecrypt(data, password)
    if (newWallet) {
      config.paratii.eth.setAccount(newWallet['0'].address, newWallet['0'].privateKey)
    }
    return newWallet
  }

  // wallet._mnemonic = undefined
  // testing purpose
  // wallet._passphrase = ''
  // wallet.setPassphrase = setPassphrase
  wallet.create = create
  wallet.decrypt = _decrypt
  wallet.isValidMnemonic = isValidMnemonic
  wallet.newMnemonic = newMnemonic
  // wallet.getMnemonic = getMnemonic
  return wallet
}
