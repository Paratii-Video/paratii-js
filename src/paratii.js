import { ParatiiCore } from './paratii.core.js'
import { ParatiiDb } from './paratii.db.js'
import { ParatiiEth } from './paratii.eth.js'
import { ParatiiIPFS } from './paratii.ipfs.js'
import { ipfsSchema, ethSchema, accountSchema, dbSchema } from './schemas.js'

const joi = require('joi')
const utils = require('./utils.js')

//
/**
 * Paratii library main object
 * The Paratii object serves as the general entry point for interacting with the family of Paratii
 * contracts that are deployed on the blockchain, utilities to run and interact with a local IPFS node,
 * and utilities to interact with the Paratii index.
 * @class Paratii
 * @param {configSchema} opts options object to configure paratii library
 * @example paratii = new Paratii({
 *  eth: {
 *    provider': 'http://localhost:8545'
 *   },
 *   account: {
 *     address: 'your-address'
 *   }
 * })
 * @property {ParatiiCoreVids} vids operations on videos
 * @property {ParatiiCoreUsers} users
 * @property {ParatiiEth} eth interact with the Ethereum blockchain
 * @property {ParatiiEthTcr} eth.tcr interaction with the TCR contract on ethereum
 * @property {ParatiiIPFS} ipfs
 * @property {ParatiiDb} db
 * @property {ParatiiDbUsers} db.users
 */

class Paratii extends ParatiiCore {
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
  }
  /**
   * Set the ethereum address what will be used to sign all transactions
   * @param {String} address address of the operator/user
   * @param {String} privateKey optional - private key of the operator/user
   * @example paratii.setAccount('some-user-id','some-user-pub-key')
   */
  setAccount (address, privateKey) {
    this.eth.setAccount(address, privateKey)
  }
  /**
   * Set the address of the ParatiiRegistry contract
   * @param {String} address address of the ParatiiRegistry contract
   * @example paratii.setRegistryAddress('some-address')
  */
  setRegistryAddress (address) {
    return this.eth.setRegistryAddress(address)
  }

  /**
   * return an array of strings with diagnostic info
   * @return {Promise} array of strings with diagnostic info
   * @example paratii.diagnose()
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
