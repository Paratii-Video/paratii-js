import { getInfoFromLogs, makeId, NULL_ADDRESS } from './utils.js'
let dopts = require('default-options')

export class ParatiiEthVids {
  constructor (context) {
    // context is a ParatiiEth instance
    this.eth = context
  }

  async getVideoRegistry () {
    let contract = await this.eth.getContract('Videos')
    if (contract.options.address === '0x0') {
      throw Error('There is not Videos contract known in the registry')
    }
    return contract
  }

  makeId () {
    // create a fresh ID
    return makeId()
  }
  async create (options, type) {
    let defaults = {
      id: null,
      owner: undefined,
      price: 0,
      ipfsHashOrig: '',
      ipfsHash: '',
      ipfsData: ''
    }
    options = dopts(options, defaults)

    if (options.id === null) {
      options.id = this.makeId()
    }
    if (!this.eth.web3.utils.isAddress(options.owner)) {
      let msg = `The owner argument should be a valid address, not ${options.owner}`
      throw Error(msg)
    }

    console.log('1')
    console.log(options.id)
    let contract = await this.getVideoRegistry()
    console.log('2')
    console.log(options)
    let tx = await contract.methods.create(
      options.id,
      options.owner,
      options.price,
      options.ipfsHashOrig,
      options.ipfsHash,
      options.ipfsData
    ).send()
    console.log('3')
    let videoId = getInfoFromLogs(tx, 'LogCreateVideo', 'videoId')
    console.log(videoId)

    return videoId
  }

  async get (videoId) {
    let contract = await this.getVideoRegistry()
    // await contract.setProvider(this.eth.config.provider)
    let videoInfo = await contract.methods.get(videoId).call()
    let result = {
      id: videoId,
      owner: videoInfo[0],
      price: videoInfo[1],
      ipfsHash: videoInfo[2],
      ipfsData: videoInfo[3]
    }
    if (result.owner === NULL_ADDRESS) {
      throw Error(`No video with id '${videoId}' was registered`)
    }
    return result
  }

  async update (videoId, options) {
    options.id = videoId
    let data = await this.get(videoId)
    for (let key in options) {
      data[key] = options[key]
    }
    await this.create(data, 'updating')
    return data
  }

  async delete (videoId) {
    let contract = await this.getVideoRegistry()
    // contract.setProvider(this.eth.config.provider)
    let tx = await contract.methods.remove(videoId).send()
    return tx
  }
}
