import { getInfoFromLogs, makeId, NULL_ADDRESS } from './utils.js'
const joi = require('joi')
/**
 * The eth.vids namespace contains functions to interact with the video registration on the blockchain.
 * @param {Object} context ParatiiEth instance
 * @property {ParatiiEth} eth ParatiiEth instance
 */
export class ParatiiEthVids {
  constructor (context) {
    // context is a ParatiiEth instance
    this.eth = context
  }
  /**
   * Get the contract instance of the videos contract
   * @return {Promise} Object representing the contract
   * @example let contract = await paratii.eth.vids.getVideoRegistry()
   */
  async getVideoRegistry () {
    let contract = await this.eth.getContract('Videos')
    if (contract.options.address === '0x0') {
      throw Error('There is not Videos contract known in the registry')
    }
    return contract
  }
  /**
   * Get the contract instance of the likes contract
   * @return {Promise} Object representing the contract
   * @example let contract = await paratii.eth.vids.getLikesContract()

   */
  async getLikesContract () {
    let contract = await this.eth.getContract('Likes')
    if (contract.options.address === '0x0') {
      throw Error('There is not Likes contract known in the registry')
    }
    return contract
  }
  /**
   * Get the contract instance of the views contract
   * @return {Promise} Object representing the contract
   * @example let contract = await paratii.eth.vids.getViewsContract()

   */
  async getViewsContract () {
    let contract = await this.eth.getContract('Views')
    if (contract.options.address === '0x0') {
      throw Error('There is not Views contract known in the registry')
    }
    return contract
  }
  /**
   * Creates a random id
   * @return {string} id created
   * @example let id = paratii.eth.vids.makeId()

   */
  makeId () {
    // create a fresh ID
    return makeId()
  }
  /**
   * Record the video on the blockchain
   * @param  {Object}  options   data about the video
   * @param  {number}  [retry=1] optional, default = 1
   * @return {Promise}           the video id
   * @example let videoId = await paratii.eth.vids.create({
   *                                    id: 'some-id',
   *                                    price: 20,
   *                                    owner: 'some-address',
   *                                    ipfsHash: 'some-hash'
   *                          })

   */
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
  /**
   * get data about the video
   * @param  {string}  videoId univocal video id
   * @return {Promise}         data about the video
   * @example let video = eth.vids.get('0x12345')

   */
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
/**
 * record a like/dislike to the video on the blockchain
 * TODO RIVEDI I TIPI
 * @param  {Object}  options data about the video to like
 * @param {string} options.videoId univocal video id
 * @param {Boolean} options.liked true/false
 * @return {Promise}         transaction recording the like
 * @example await paratii.eth.vids.sendLike({ videoId: 'some-id', liked: true })
 * @example await paratii.eth.vids.sendLike({ videoId: 'some-id', liked: false })

 */
  async sendLike (options) {
    const schema = joi.object({
      videoId: joi.string().required(),
      liked: joi.bool().required()
    })

    const result = joi.validate(options, schema)
    const error = result.error
    if (error) throw error
    options = result.value

    if (options.liked !== true && options.liked !== false) {
      let msg = 'The liked argument should be a boolean'
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
/**
 * record a views to the video on the blockchain
 * @param  {Object}  options data about the video and the viewer
 * @param {string} options.viewer address of the viewer
 * @param {string} options.videoId univocal video identifier
 * @param {string} options.ipfsData ipfs multihash
 * @return {Promise}         transaction recording the view
 * @example await paratii.eth.vids.view({viewer:'some-user-id',videoId: 'some-video-id'})

 */
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
  /**
   * Check if the viewer has already viewed the video
   * @param  {Object}  options data about the video and the viewer
   * @param {string} options.viewer viewer address
   * @param {string} options.videoId  univocal video identifier
   * @return {Promise}         true if the current user already viewed the video, false otherwise
   * @example let result = await paratii.eth.vids.userViewedVideo({viewer:'some-user-id',videoId: 'some-video-id'})

   */
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
  /**
   * Writes a like for the video on the blockchain (contract Likes), and negates a dislike for the video, if it exists.
   * @param  {string}  videoId univocal video identifier
   * @return {Promise}          transaction recording the like
   * @example let result = paratii.eth.vids.like('some-id')

   */
  async like (videoId) {
    await this.sendLike({ videoId: videoId, liked: true })
  }
  /**
   * Writes a dislike for the video on the blockchain (contract Likes), and negates a like for the video, if it exists.
   * @param  {string}  videoId univocal video identifier
   * @return {Promise}          transaction recording the dislike
   * @example let result = paratii.eth.vids.dislike('some-id')

   */
  async dislike (videoId) {
    await this.sendLike({ videoId: videoId, liked: false })
  }
  /**
   * Check if the current user has already liked the video
   * @param  {string}  videoId univocal video identifier
   * @return {Promise}          true if the current user already liked the video, false otherwise
   * @example let result = paratii.eth.vids.doesLike('some-id')

   */
  async doesLike (videoId) {
    let contract = await this.getLikesContract()
    let address = this.eth.config.account.address
    let likeInfo = await contract.methods.userLikesVideo(address, videoId).call()

    return likeInfo
  }
  /**
   * Check if the current user has already disliked the video.
   * @param  {string}  videoId univocal video identifier
   * @return {Promise}          true if the current user already disliked the video, false otherwise
   * @example let result = paratii.eth.vids.doesDislike('some-id')

   */
  async doesDislike (videoId) {
    let contract = await this.getLikesContract()
    let address = this.eth.config.account.address
    let likeInfo = await contract.methods.userDislikesVideo(address, videoId).call()

    return likeInfo
  }
  /**
   * Update the information on the video.
   *  Only the account that has registered the video, or the owner of the contract, can update the information.
   * @param  {string}  videoId      univocal video identifier
   * @param  {Object}  options      key value pairs of properties and new values e.g. ({title: 'another-title'})
   * @return {Promise}              Updated video informations
   * @example paratii.eth.vids.update('some-video-id', {title: 'another-title'})

   */
  async update (videoId, options) {
    options.id = videoId
    let data = await this.get(videoId)
    for (let key in options) {
      data[key] = options[key]
    }
    await this.create(data, 'updating')
    return data
  }
  /**
   * delete the video from the blockchain
   * @param  {string}  videoId univocal video identifier
   * @return {Promise}         transaction recording the remove action
   * @example let tx = paratii.eth.vids.delete('some-id')
   */
  async delete (videoId) {
    let contract = await this.getVideoRegistry()
    // contract.setProvider(this.eth.config.provider)
    let tx = await contract.methods.remove(videoId).send()
    return tx
  }
}
