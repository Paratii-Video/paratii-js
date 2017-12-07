import { ParatiiEth } from './paratii.eth.js'
import { ParatiiIPFS } from './paratii.ipfs.js'

const Web3 = require('web3')
const dopts = require('default-options')
const utils = require('./utils.js')

/**
 * Paratii Library
 * for usage, see https://github.com/Paratii-Video/paratii-contracts/tree/master/docs
 *
 */

class Paratii {
  constructor (opts = {}) {
    let defaults = {
      provider: 'http://localhost:8545',
      registryAddress: null,
      account: null,
      privateKey: null
    }
    let config = dopts(opts, defaults)
    this.config = config

    this.web3 = new Web3()
    this.web3.setProvider(new this.web3.providers.HttpProvider(config.provider))

    if (!config.account) {
      // this is the first account generated with testprc/ganache using the --deterministic flag
      // we use it here as default, but probably should not..
      this.account = {
        address: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
        privateKey: '4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d'
      }
      this.web3.eth.accounts.wallet.add(this.account.privateKey)
    } else {
      this.account = {
        address: config.account
      }
      if (config.privateKey) {
        this.web3.eth.accounts.wallet.add(config.privateKey)
      }
    }

    this.eth = new ParatiiEth(this)

    this.ipfs = new ParatiiIPFS(this)
    this.personal = {
      setAccount: this.setAccount,
      account: this.account
    }
  }

  setAccount (address, privateKey) {
    this.account = {
      address,
      privateKey
      // account = {
      //   address: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
      //   privateKey: '4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d'
      // }

    }
    if (privateKey) {
      this.web3.eth.accounts.wallet.add(privateKey)
    }
  }

  async diagnose () {
    // return an array of strings with diagnostic info

    let msg, address, msgs
    let isOk = true
    msgs = []
    function log (msg) {
      msgs.push(msg)
    }
    log('Paratii was initialized with the following options:')
    log(this.config)
    address = this.eth.getRegistryAddress()
    if (!address) {
      log('No registry address found!')
      log(`Value of this.config.registryAddress: ${this.config.registryAddress}`)
      isOk = false
    } else {
      log('checking deployed code of Registry...')
      msg = await this.web3.eth.getCode(address)
      if (msg === '0x') {
        log(`ERROR: no code was found on the registry address ${address}`)
        log(msg)
      } else {
        log('... seems ok...')
        // log(`We found the following code on the registry address ${address}`)
        // log(msg)
      }
      log('checking for addresses')
      let registry = await this.eth.getContract('ParatiiRegistry')
      for (let i = 0; i < this.eth.contractNames.length; i++) {
        let name = this.eth.contractNames[i]
        if (name !== 'ParatiiRegistry') {
          address = await registry.methods.getContract(name).call()
          log(`address of ${name}: ${address}`)
        }
      }
    }
    log('thats it!')
    if (!isOk) {
      throw Error(msgs)
    }
    return msgs
  }
}

export { Paratii, utils }
