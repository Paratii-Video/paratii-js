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

  async getLikesContract () {
    let contract = await this.eth.getContract('Likes')
    if (contract.options.address === '0x0') {
      throw Error('There is not Likes contract known in the registry')
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

    let contract = await this.getVideoRegistry()
    let tx = await contract.methods.create(
      options.id,
      options.owner,
      options.price,
      options.ipfsHashOrig,
      options.ipfsHash,
      options.ipfsData
    ).send()
    let videoId = getInfoFromLogs(tx, 'LogCreateVideo', 'videoId')

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
      ipfsHashOrig: videoInfo[2],
      ipfsHash: videoInfo[3],
      ipfsData: videoInfo[4]
    }
    if (result.owner === NULL_ADDRESS) {
      throw Error(`No video with id '${videoId}' was registered`)
    }
    return result
  }

  async sendLike (options, type) {
    let defaults = {
      videoId: null,
      liked: null
    }
    options = dopts(options, defaults)

    if (options.videoId === null) {
      let msg = `The videoId argument should be provided`
      throw Error(msg)
    }

    if (options.liked === null) {
      let msg = `The liked argument should be provided`
      throw Error(msg)
    }

    if (options.liked !== true && options.liked !== false) {
      let msg = `The liked argument should be a boolean`
      throw Error(msg)
    }
    let contract = await this.getVideoRegistry()
    let contract2 = await this.getLikesContract()

    let videoInfo = await contract.methods.get(options.videoId).call()

    if (videoInfo[0] === NULL_ADDRESS) {
      let msg = `Video with ID '${options.videoId}' doesn't exist`
      throw Error(msg)
    }

    let tx = await contract2.methods.likeVideo(
      options.videoId,
      options.liked
    ).send()

    return tx
  }

  async like (videoId) {
    await this.sendLike({ videoId: videoId, liked: true })
  }

  async dislike (videoId) {
    await this.sendLike({ videoId: videoId, liked: false })
  }

  async doesLike (videoId) {
    let contract = await this.getLikesContract()
    let address = this.eth.config.account.address
    let likeInfo = await contract.methods.userLikesVideo(address, videoId).call()

    return likeInfo
  }

  async doesDislike (videoId) {
    let contract = await this.getLikesContract()
    let address = this.eth.config.account.address
    let likeInfo = await contract.methods.userDislikesVideo(address, videoId).call()
	
    return likeInfo
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
