import { getInfoFromLogs, makeId, NULL_ADDRESS } from './utils.js'
const joi = require('joi')
/**
 * [eth description]
 * @type {[type]}
 */
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

  async getViewsContract () {
    let contract = await this.eth.getContract('Views')
    if (contract.options.address === '0x0') {
      throw Error('There is not Views contract known in the registry')
    }
    return contract
  }

  makeId () {
    // create a fresh ID
    return makeId()
  }

  async create (options, retry = 1) {
    const schema = joi.object({
      id: joi.string(),
      owner: joi.string().required(),
      price: joi.any().default(0),
      ipfsHashOrig: joi.string().empty('').default(''),
      ipfsHash: joi.string().empty('').default(''),
      ipfsData: joi.string().default('')
    })

    const result = joi.validate(options, schema)

    if (result.error) {
      throw result.error
    }

    const validatedOptions = result.value

    if (!validatedOptions.id) {
      validatedOptions.id = this.makeId()
    }

    if (!this.eth.web3.utils.isAddress(validatedOptions.owner)) {
      let msg = `The owner argument should be a valid address, not ${validatedOptions.owner}`
      throw Error(msg)
    }

    let contract = await this.getVideoRegistry()
    try {
      let tx = await contract.methods.create(
        validatedOptions.id,
        validatedOptions.owner,
        validatedOptions.price,
        validatedOptions.ipfsHashOrig,
        validatedOptions.ipfsHash,
        validatedOptions.ipfsData
      ).send()
      let videoId = getInfoFromLogs(tx, 'LogCreateVideo', 'videoId')
      return videoId
    } catch (err) {
      if (/Transaction nonce is too low./.exec(err.message) && retry > 0) {
        return this.create(options, retry - 1)
      }

      if (/There is another transaction with same nonce in the queue./.exec(err.message) &&
        retry > 0) {
        return this.create(options, retry - 1)
      }

      if (/Transaction with the same hash was already imported./.exec(err.message)) {
        // this means that there is no need to send this transaction again
        return validatedOptions.id
      }
      throw err
    }
  }

  async get (videoId) {
    let contract = await this.getVideoRegistry()
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
    const schema = joi.object({
      videoId: joi.string().required(),
      liked: joi.bool().required()
    })

    const result = joi.validate(options, schema)
    const error = result.error
    if (error) throw error
    options = result.value

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

  async view (options) {
    const schema = joi.object({
      viewer: joi.string().required(),
      videoId: joi.string().required(),
      ipfsData: joi.string().default(null)
    })

    const result = joi.validate(options, schema)
    const error = result.error
    if (error) throw error
    options = result.value

    let contract = await this.getViewsContract()
    let tx = await contract.methods.create(
      options.viewer,
      options.videoId,
      options.ipfsData
    ).send()

    return tx
  }

  async userViewedVideo (options) {
    const schema = joi.object({
      viewer: joi.string().required(),
      videoId: joi.string().required()
    })

    const result = joi.validate(options, schema)
    const error = result.error
    if (error) throw error
    options = result.value

    let contract = await this.getViewsContract()

    return contract.methods.userViewedVideo(
      options.viewer,
      options.videoId
    ).call()
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
