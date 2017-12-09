import { getInfoFromLogs } from './utils.js'
let dopts = require('default-options')

export class ParatiiEthVids {
  constructor (context) {
    // context is a ParatiiEth instance
    this.eth = context
  }

  async getRegistry() {
    return this.eth.getContract('VideoRegistry')
  }

  async register (options) {
    let defaults = {
      id: String,
      owner: String,
      price: Number,
      ipfsHash: String,
    }

    options = dopts(options, defaults)
    let contract = await this.getRegistry()
    let tx = await contract.methods.registerVideo(options.id, options.owner, options.price, options.ipfsHash).send()
    let videoId = getInfoFromLogs(tx, 'LogRegisterVideo', 'videoId')
    return videoId
  }

  async get (videoId ) {
    let contract = await this.getRegistry()
    let videoInfo = await contract.methods.getVideoInfo(videoId).call()
    console.log(videoInfo)
    console.log(contract.abi)
    let result = {
      id: videoId,
      owner: videoInfo[0],
      price: videoInfo[1],
      ipfsHash: videoInfo[2]
    }
    return result
  }


}
