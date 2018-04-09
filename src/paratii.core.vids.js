import { videoSchema } from './schemas.js'
import joi from 'joi'

 /**
  * Utilities to create and manipulate information about the videos on the blockchain.
  * @param {Object} config configuration object to initialize Paratii object
  * @namespace vids
  * @lends Paratii
  * @class ParatiiCoreVids
  */
export class ParatiiCoreVids {
  constructor (config) {
    this.config = config
  }

  /**
   * This call will register the video on the blockchain, add its metadata to IPFS, upload file to IPFS, and transcode it
   * @param  {videoSchema}  options information about the video ( id, title, FilePath ... )
   * @return {Promise}         information about the video ( id, owner, ipfsHash ... )
   * @example await paratii.core.vids.create({
   *  id: 'some-video-id',
   *  owner: 'some-user-id',
   *  title: 'some Title',
   *  author: 'Steven Spielberg',
   *  duration: '2h 32m',
   *  description: 'A long description',
   *  price: 0,
   *  filename: 'test/data/some-file.txt'
   * })
   */
  async create (options = {}) {
    const result = joi.validate(options, videoSchema)
    const error = result.error
    if (error) throw error
    options = result.value

    if (options.id === null) {
      options.id = this.config.paratii.eth.vids.makeId()
    }

    let hash = await this.config.paratii.ipfs.addAndPinJSON({
      author: options.author,
      description: options.description,
      duration: options.duration,
      filename: options.filename,
      filesize: options.filesize,
      free: options.free,
      storageStatus: options.storageStatus,
      title: options.title,
      transcodingStatus: options.transcodingStatus,
      uploadStatus: options.uploadStatus,
      thumbnails: options.thumbnails
    })

    options.ipfsData = hash

    await this.config.paratii.eth.vids.create({
      id: options.id,
      owner: options.owner,
      price: options.price,
      ipfsHashOrig: options.ipfsHashOrig,
      ipfsHash: options.ipfsHash,
      ipfsData: options.ipfsData
    })

    return options
  }

  /**
   * Writes a like for the video on the blockchain (contract Likes), and negates a dislike for the video, if it exists.
   * @param  {String} videoId univocal video identifier
   * @return {Object}         information about the transaction recording the like
   * @example paratii.core.vids.like('some-video-id')
   * @memberof paratii.core.vids
   */
  like (videoId) {
    return this.config.paratii.eth.vids.like(videoId)
  }
  /**
   * Writes a dislike for the video on the blockchain (contract Likes), and negates a like for the video, if it exists.
   * @param  {String} videoId univocal video identifier
   * @return {Object}         information about the transaction recording the dislike
   * @example paratii.core.vids.dislike('some-video-id')
   * @memberof paratii.core.vids
   */
  dislike (videoId) {
    return this.config.paratii.eth.vids.dislike(videoId)
  }
  /**
   * Check if the current user has already liked the video
   * @param  {String} videoId univocal video identifier
   * @return {Boolean}         true if the current user already liked the video, false otherwise
   * @example paratii.core.vids.doesLike('some-video-id')
   * @memberof paratii.core.vids
   */
  doesLike (videoId) {
    return this.config.paratii.eth.vids.doesLike(videoId)
  }
  /**
   * Check if the viewer has already viewed the video
   * @param  {String}  viewer  viewer address
   * @param  {String}  videoId univocal video identifier
   * @return {Boolean}         true if the current user already viewed the video, false otherwise
   * @example paratii.core.vids.hasViewedVideo('some-user-id','some-video-id')
   * @memberof paratii.core.vids
   */
  hasViewedVideo (viewer, videoId) {
    return this.config.paratii.eth.vids.userViewedVideo({ viewer: viewer, videoId: videoId })
  }
  /**
   * Check if the current user has already disliked the video
   * @param  {String} videoId univocal video identifier
   * @return {Boolean}         true if the current user already disliked the video, false otherwise
   * @example paratii.core.vids.doesDislike('some-video-id')
   * @memberof paratii.core.vids
  */
  doesDislike (videoId) {
    return this.config.paratii.eth.vids.doesDislike(videoId)
  }

  /**
   * Update the information on the video.
   *  Only the account that has registered the video, or the owner of the contract, can update the information.
   * @param  {String}  videoId      univocal video identifier
   * @param  {Object}  options      key value pairs of properties and new values e.g. ({title: 'another-title'})
   * @param  {Object}  dataToUpdate optional. old data of the video. If not passed to the method, it will fetch the data itself using the videoId
   * @return {Promise}              Updated video informations
   * @example paratii.core.vids.update('some-video-id', {title: 'another-title'})
   * @memberof paratii.core.vids
   */
  async update (videoId, options, dataToUpdate) {
    let data
    if (dataToUpdate) {
      data = dataToUpdate
    } else {
      data = await this.get(videoId)
    }
    if (data === null) {
      throw new Error('No video to update')
    }

    // FIXME: missing the validate invociation

    const elements = videoSchema._inner.children
    let dataToSave = {}

    elements.forEach(function (name) {
      const key = name.key
      if (options[key] !== undefined) {
        dataToSave[key] = options[key]
      } else {
        dataToSave[key] = data[key]
      }
    })
    await this.create(dataToSave)

    return dataToSave
  }
  /**
   * Update the information of the video the video already exists, otherwise it creates it
   * @param  {Object}  options video informations
   * @return {Promise}         updated/new video informations
   * @example
   * paratii.vids.upsert({ id: 'some-video-id', owner: 'some-user-id', title: 'videoTitle'}) //insert a new video
   * @memberof paratii.core.vids
   */
  async upsert (options) {
    let data = null
    if (options.id) {
      data = await this.get(options.id)
    }
    if (!data) {
      return this.create(options)
    } else {
      return this.update(options.id, options, data)
    }
  }

  /**
   * Register a view on the blockchain
   * @param  {Object}  options should contain keys viewer (address of the viewer) and videoId (univocal video identifier)
   * @return {Promise}         information about the transaction recording the view
   * @example paratii.core.vids.view({viewer:'some-user-id',videoId: 'some-video-id'})
   * @memberof paratii.core.vids
   */
  async view (options) {
    let keysForBlockchain = ['viewer', 'videoId']
    let optionsKeys = Object.keys(options)
    let optionsBlockchain = {}
    let optionsIpfs = {}
    optionsKeys.forEach(function (key) {
      if (keysForBlockchain.includes(key)) {
        optionsBlockchain[key] = options[key]
      } else {
        optionsIpfs[key] = options[key]
      }
    })
    let hash = await this.config.paratii.ipfs.addJSON(optionsIpfs)
    optionsBlockchain['ipfsData'] = hash
    return this.config.paratii.eth.vids.view(optionsBlockchain)
  }
  /**
   * Get the data of the video identified by videoId
   * @param  {String}  videoId univocal video identifier
   * @return {Promise}         data about the video
   * @example paratii.core.vids.get('some-video-id')
   * @memberof paratii.core.vids
   */
  async get (videoId) {
    return this.config.paratii.db.vids.get(videoId)
  }
  /**
   * Get the data of the video
   * @param  {Object} options data about the video and (optional) owner i.e {'keyword':'titleOfTheVideo'}
   * @return {Promise}        data about the video
   * @example paratii.core.vids.search({keyword : 'titleOftheVideo'})
   * the keyword value can be one from the following list
   * - video title
   * - description
   * - owner
   * - uploader.name
   * - uploader.address
   * - tags
   * @memberof paratii.core.vids
   */
  search (options) {
    return this.config.paratii.db.vids.search(options)
  }
}
