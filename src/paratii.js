import { ParatiiCore } from './paratii.core.js'
import { ParatiiDb } from './paratii.db.js'
import { ParatiiEth } from './paratii.eth.js'
import { ParatiiIPFS } from './paratii.ipfs.js'
import { ParatiiTranscoder } from './paratii.transcoder.js'
import { ipfsSchema, ethSchema, accountSchema, dbSchema } from './schemas.js'

const joi = require('joi')
const utils = require('./utils.js')

/**
 * Paratii library main object
 * The Paratii object serves as the general entry point for interacting with the family of Paratii
 * contracts that are deployed on the blockchain, utilities to run and interact with a local IPFS node,
 * and utilities to interact with the Paratii index.

 * @param {ParatiiConfigSchema} opts options object to configure paratii library
 * @property {ParatiiCoreVids} vids operations on videos
 * @property {ParatiiCoreUsers} users operations on users
 * @property {ParatiiEth} eth interact with the Ethereum blockchain
 * @property {ParatiiIPFS} ipfs interact with the IPFS instance
 * @property {ParatiiDb} db interact with the Paratii Index
 * @property {ParatiiTranscoder} transcoder commands for transcoding files
 * @example import Paratii from 'paratii-js'
 * paratii = new Paratii({
 *  eth: {
 *    provider': 'http://localhost:8545'
 *   },
 *   account: {
 *     address: 'your-address'
 *   }
 * })
 */

class Paratii extends ParatiiCore {
  /**
    * @typedef {Array} ParatiiConfigSchema
    * @property {?accountSchema} account
    * @property {?ethSchema} eth
    * @property {?dbSchema} db
    * @property {?ipfsSchema} ipfs
   */
  constructor (opts = {}) {
    const schema = joi.object({
      account: accountSchema,
      eth: ethSchema,
      db: dbSchema,
      ipfs: ipfsSchema
    })

    const result = joi.validate(opts, schema)
    if (result.error) throw result.error
    const config = result.value
    super(config)
    this.config = config
    this.config.paratii = this
    // this.core = this
    this.eth = new ParatiiEth(this.config)
    // this.core = new ParatiiCore(this.config)
    this.db = new ParatiiDb(this.config)
    this.ipfs = new ParatiiIPFS(this.config)
    this.transcoder = new ParatiiTranscoder(this.config)
  }
  /**
  * Sets the account that will be used to sign all transactions
  * @param {?string} address    public address
  * @param {?string} privateKey private key related to the previous public address
  * @param {?string} mnemonic   mnemonic related to the previous public address
  * @example paratii.eth.setAccount(null,'some-private-key')
  * @example paratii.eth.setAccount('some-address', null, 'some-mnemonic')
  */
  // FIXME: we should take an object as arguments here
  setAccount (address, privateKey, mnemonic) {
    this.eth.setAccount(address, privateKey, mnemonic)
  }
  /**
   * Gets the ethereum address that is used to sign all the transactions
   * @example paratii.getAccount()
   */
  getAccount () {
    this.eth.getAccount()
  }
  /**
   * Sets the address of the ParatiiRegistry contract
   * @param {string} address address of the ParatiiRegistry contract
   * @example paratii.eth.setRegistryAddress('0x12345')
  */
  setRegistryAddress (address) {
    return this.eth.setRegistryAddress(address)
  }

  /**
   * Sets the address of the ParatiiRegistry contract
   * @param {string} address address of the ParatiiRegistry contract
   * @example paratii.getRegistryAddress()
  */
  getRegistryAddress (address) {
    return this.eth.getRegistryAddress()
  }

  /**
   * Get some diagnostic info about the state of the system
   * @return {Promise} that resolves in an array of strings with diagnostic info
   * @example let diagnosticInfo = await paratii.diagnose()
   * console.log(diagnosticInfo)
   */
  async diagnose () {
    let msg, address, msgs
    let isOk = true
    msgs = []
    function log (msg) {
      msgs.push(msg)
    }
    log('Paratii was initialized with the following options:')
    log(this.config)
    log('Checking main account')
    if (this.config.account.address && this.config.account.privateKey) {
      log(`Your private key: ${this.config.account.privateKey}`)
      log(`Your private key: ${this.config.account.privateKey}`)
      log(`First wallet account: ${this.eth.web3.eth.accounts.wallet[0].address}`)
    }
    address = this.eth.getRegistryAddress()
    if (!address) {
      log('*** No registry address found!')
      log(`Value of this.config['eth.registryAddress']: ${this.config['eth.registryAddress']}`)
      isOk = false
    } else {
      log('checking deployed code of Registry...')
      msg = await this.eth.web3.eth.getCode(address)
      if (msg === '0x') {
        log(`ERROR: no code was found on the registry address ${address}`)
        log(msg)
      } else {
        log('... seems ok...')
        // log(`We found the following code on the registry address ${address}`)
        // log(msg)
      }
      log(`checking for addresses on registry@${address}`)
      let registry = await this.eth.getContract('Registry')
      log(`(registry address is ${registry.options.address})`)
      for (var name in this.eth.contracts) {
        if (name !== 'Registry') {
          address = await registry.methods.getContract(name).call()
          log(`address of ${name}: ${address}`)
        }
      }
    }
    if (isOk) {
      log('---- everything seems fine -----')
    } else {
      log('***** Something is wrong *****')
    }
    return msgs
  }
}

export default Paratii
export { Paratii, utils, ParatiiIPFS, ParatiiDb, ParatiiEth }
