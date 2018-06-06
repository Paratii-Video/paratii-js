import { ParatiiCore } from './paratii.core.js'
import { ParatiiDb } from './paratii.db.js'
import { ParatiiEth } from './paratii.eth.js'
import { ParatiiIPFS } from './paratii.ipfs.js'
// import { ParatiiTranscoder } from './paratii.transcoder.js'
import { ipfsSchema, ethSchema, accountSchema, dbSchema } from './schemas.js'

const joi = require('joi')
const utils = require('./utils.js')

/**
 * Paratii library main object
 * The Paratii object serves as the general entry point for interacting with the family of Paratii
 * contracts that are deployed on the blockchain, utilities to run and interact with a local IPFS node,
 * and utilities to interact with the Paratii index.

 * @param {ParatiiConfigSchema} opts options object to configure paratii library
 * @property {ParatiiConfigSchema} config where the configuration of the paratii object is stored
 * @property {ParatiiVids} vids operations on videos
 * @property {ParatiiUsers} users operations on users
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
    * @property {accountSchema=} account settings regarding your the Ethereum account
    * @property {ethSchema=} eth setings regarding the Ethereum blockchain
    * @property {dbSchema=} db settings regarding the database index
    * @property {ipfsSchema=} ipfs settings regardig IPFS
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
    this.eth = new ParatiiEth(this.config)
    this.db = new ParatiiDb(this.config)
    this.ipfs = new ParatiiIPFS(this.config)
    // this.transcoder = new ParatiiTranscoder(this.config)
    this.transcoder = this.ipfs.transcoder
  }

  /**
  * Sets the account that will be used to sign all transactions
  * @param {accountSchema} opts
  * @example paratii.eth.setAccount({address: '0xdF7EacFfb8F1C5F65CDD7d045A608DeBa980d473'})
  * @example paratii.setAccount({privateKey: '0x399b141d0cc2b863b2f514ffe53edc6afc9416d5899da4d9bd2350074c38f1c6'})
  */

  // FIXME: we should take an object as arguments here
  setAccount (opts) {
    this.eth.setAccount(opts)
  }
  /**
   * Gets the ethereum address that is used to sign all the transactions
   * @example let account = paratii.getAccount()
   */
  getAccount () {
    return this.eth.getAccount()
  }
  /**
   * Pings the provider to which the web3 is configured to connect to (see the set up in paratii.eth.js constructor)
   * @return {Promise} that resolves in a boolean
   */
  async pingEth () {
    return new Promise(resolve => {
      this.eth.web3.eth.net.isListening()
        .then(() => {
          resolve(true)
        })
        .catch(e => {
          resolve(false)
        })
    })
  }
  /**
   * Checks if the IPFS local node is running
   * @return {Promise} that resolves in a boolean
   */
  async checkIPFSState () {
    return new Promise(resolve => {
      this.ipfs.getIPFSInstance().then(function (ipfsInstance) {
        if (ipfsInstance.state.state() === 'running') {
          resolve(true)
        } else {
          resolve(false)
        }
      })
    })
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
    // Displaying the configuration
    log('Paratii was initialized with the following options:')
    log(this.config)
    // Main account check
    log('Checking main account')
    if (this.config.account.address && this.config.account.privateKey) {
      log(`Your private key: ${this.config.account.privateKey}`)
      log(`Your private key: ${this.config.account.privateKey}`)
      log(`First wallet account: ${this.eth.web3.eth.accounts.wallet[0].address}`)
    }
    // Test registry address
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
    // Pinging Eth provider
    log('Pinging the eth provider')
    const pEth = await this.pingEth()
    if (pEth === true) {
      log('The eth provider responds correctly.')
    } else {
      isOk = false
      log('There seems to be a problem reaching the eth provider.')
    }
    // Check if IPFS node is running
    log('Check if IPFS node is running')
    const ipfsState = await this.checkIPFSState()
    if (ipfsState === true) {
      log('The IPFS node seems to be running correctly.')
    } else {
      isOk = false
      log('The IPFS node doesn\'t seem to be running.')
    }
    // Recap
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
