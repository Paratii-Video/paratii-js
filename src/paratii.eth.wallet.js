// this code is lifted and adapted from ethereumjs-lightwallet

import {add0x} from './utils.js'
var bip39 = require('bip39')
var hdkey = require('hdkey')
/**
 * extends the native web3 wallet object with some new operations
 * @param  {Object} wallet wallet to patch
 * @return {Object}        patched wallet
 * @private
 */
export function patchWallet (wallet) {
  /**
   * Create a wallet with a given number of accounts from a BIP39 mnemonic
   * @param  {number} numberOfAccounts number of accounts to be created
   * @param  {string=} mnemonic mnemonic of the wallet, if not specified a random one is generated
   * @return {Object} the created wallet
   * @example wallet = await wallet.createFromMnemonic(5, 'some long mnemonic phrase')
   */
  async function createFromMnemonic (numberOfAccounts, mnemonic) {
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
   * @param  {string}  mnemonic mnemonic to check
   * @return {Boolean}          true if the mnemonic is valid, false otherwise
   * @example paratii.eth.wallet.isValidMnemonic('some long mnemonic phrase')

   */
  function isValidMnemonic (mnemonic) {
    return bip39.validateMnemonic(mnemonic)
  }
  /**
   * generates a new mnemonic
   * @return {string} newly generated mnemonic
   * @example let newMnemonic = paratii.eth.wallet.generateMnemonic()

   */
  function newMnemonic () {
    return bip39.generateMnemonic()
  }

  wallet.createFromMnemonic = createFromMnemonic
  wallet.isValidMnemonic = isValidMnemonic
  wallet.newMnemonic = newMnemonic
  return wallet
}
