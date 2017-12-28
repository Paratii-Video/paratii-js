import { getInfoFromLogs } from './utils.js'
let dopts = require('default-options')

export class ParatiiEthVids {
  constructor (context) {
    // context is a ParatiiEth instance
    this.eth = context
  }

  async fixMethodAndSend (method, opts) {
    // this methos fix a know bug on web3, apparently, 'deployContract(...)' does not return the same object as `getContract()` [<- this is a bug]
    let rawTransaction = await method
    rawTransaction._ethAccounts = this.eth.web3.eth.accounts
    // wait for receipt let nonce increment
    let tx = await rawTransaction.send(opts)
    return tx
  }

  async fixMethodAndCall (method) {
    // this methos fix a know bug on web3, apparently, 'deployContract(...)' does not return the same object as `getContract()` [<- this is a bug]
    let rawTransaction = await method
    rawTransaction._ethAccounts = this.eth.web3.eth.accounts
    // wait for receipt let nonce increment
    let result = await rawTransaction.call()
    return result
  }

  async getRegistry () {
    return this.eth.getContract('Videos')
  }

  async create (options) {
    let defaults = {
      id: String,
      owner: String,
      price: Number,
      ipfsHash: String
    }

    if (!this.eth.web3.utils.isAddress(options.owner)) {
      let msg = `The owner argument should be a valid address, not ${options.owner}`
      throw Error(msg)
    }
    options = dopts(options, defaults)
    let contract = await this.getRegistry()
    contract.setProvider(this.eth.config.provider)
    let tx = await this.fixMethodAndSend(contract.methods.registerVideo(options.id, options.owner, options.price, options.ipfsHash))
    let videoId = getInfoFromLogs(tx, 'LogRegisterVideo', 'videoId')
    return videoId
  }

  async get (videoId) {
    let contract = await this.getRegistry()
    contract.setProvider(this.eth.config.provider)
    let videoInfo = await this.fixMethodAndCall(contract.methods.getVideoInfo(videoId))
    let result = {
      id: videoId,
      owner: videoInfo[0],
      price: videoInfo[1],
      ipfsHash: videoInfo[2]
    }
    return result
  }

  async update (videoId, options) {
    options.id = videoId
    let data = await this.get(videoId)
    for (let key in options) {
      data[key] = options[key]
    }
    await this.create(data)
    return data
  }

  async delete (videoId) {
    let contract = await this.getRegistry()
    contract.setProvider(this.eth.config.provider)
    let tx = await this.fixMethodAndSend(contract.methods.unregisterVideo(videoId))
    return tx
  }
}
