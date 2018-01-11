import { getInfoFromLogs } from './utils.js'
let dopts = require('default-options')

export class ParatiiEthVids {
  constructor (context) {
    // context is a ParatiiEth instance
    this.eth = context
  }

  async getRegistry () {
    return this.eth.getContract('Videos')
  }

  async create (options) {
    let defaults = {
      id: undefined,
      owner: undefined,
      price: 0,
      ipfsHash: undefined,
      ipfsData: undefined
    }

    if (!this.eth.web3.utils.isAddress(options.owner)) {
      let msg = `The owner argument should be a valid address, not ${options.owner}`
      throw Error(msg)
    }
    options = dopts(options, defaults)

    let contract = await this.getRegistry()
    console.log('this is data options from the create', options)
    // contract.setProvider(this.eth.config.wsprovider)
    let tx = await contract.methods.create(options.id, options.owner, options.price, options.ipfsHash, options.ipfsData).send()
    let videoId = getInfoFromLogs(tx, 'LogCreateVideo', 'videoId')

    return videoId
  }

  async get (videoId) {
    let contract = await this.getRegistry()
    // contract.setProvider(this.eth.config.provider)
    let videoInfo = await contract.methods.get(videoId).call()
    let result = {
      id: videoId,
      owner: videoInfo[0],
      price: videoInfo[1],
      ipfsHash: videoInfo[2],
      ipfsData: videoInfo[3]
    }
    return result
  }

  // async update (videoId, options) {
  //   options.id = videoId
  //   let data = await this.get(videoId)
  //
  //   for (let key in options) {
  //     data[key] = options[key]
  //   }
  //   console.log('this is data from the update',data)
  //   await this.create(data)
  //   return data
  // }
  async update (videoId, options) {
    let data = await this.get(videoId)
    console.log('this is the get', data)
    return await this.create(options)
  }

  async delete (videoId) {
    let contract = await this.getRegistry()
    // contract.setProvider(this.eth.config.provider)
    let tx = await contract.methods.remove(videoId).send()
    return tx
  }
}
