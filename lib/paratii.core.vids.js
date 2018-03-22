const joi = require('joi')

const schema = joi.object({
  id: joi.string().default(null),
  author: joi.string().empty('').default('').allow(null),
  description: joi.string().empty('').default(''),
  duration: joi.string().empty('').default('').allow(null),
  filename: joi.string().empty('').default('').allow(null).allow(''),
  filesize: joi.any(),
  // .default(null).allow(null).empty(''),
  free: joi.string().empty('').default(null).allow(null),
  ipfsHashOrig: joi.string().empty('').default(''),
  ipfsHash: joi.string().empty('').default(''),
  owner: joi.string().required(),
  price: joi.any().default(0),
  // published: joi.any().default(false).allow(null),
  title: joi.string().empty('').default(''),
  thumbnails: joi.array(),
  storageStatus: joi.object({
    name: joi.string().required(),
    data: joi.object().allow(null)
  }).optional().default({}),
  transcodingStatus: joi.object({
    name: joi.string().required(),
    data: joi.object().allow(null)
  }).allow(null).default({}),
  uploadStatus: joi.object({
    name: joi.string().required(),
    data: joi.object().allow(null)
  }).allow(null).default({})
})

 /**
  * validates the config file MODIFIED5
  * @param {Object} config configuration object to initialize Paratii object
  */
export class ParatiiCoreVids {
  constructor (config) {
    const schema = joi.object({
      'db.provider': joi.string().default(null)
    }).unknown()

    const result = joi.validate(config, schema)
    const error = result.error
    if (error) throw error
    let options = result.value

    this.config = options
    this.paratii = this.config.paratii
  }
  /**
   * Writes a like for the video on the blockchain (contract Likes), and negates a dislike for the video, if it exists.
   * @param  {String} videoId univocal video identifier
   * @return {Object}         information about the transaction recording the like
   */
  like (videoId) {
    return this.paratii.eth.vids.like(videoId)
  }
  /**
   * Writes a dislike for the video on the blockchain (contract Likes), and negates a like for the video, if it exists.
   * @param  {String} videoId univocal video identifier
   * @return {Object}         information about the transaction recording the dislike
   */
  dislike (videoId) {
    return this.paratii.eth.vids.dislike(videoId)
  }
  /**
   * Check if the current user has already liked the video
   * @param  {String} videoId univocal video identifier
   * @return {Boolean}         true if the current user already liked the video, false otherwise
   */
  doesLike (videoId) {
    return this.paratii.eth.vids.doesLike(videoId)
  }
  /**
   * [hasViewedVideo description]
   * @param  {String}  viewer  viewer address
   * @param  {String}  videoId univocal video identifier
   * @return {Boolean}         true if the current user already liked the video, false otherwise
   */
  hasViewedVideo (viewer, videoId) {
    return this.paratii.eth.vids.userViewedVideo({ viewer: viewer, videoId: videoId })
  }
  /**
   * Check if the current user has already disliked the video
   * @param  {String} videoId univocal video identifier
   * @return {Boolean}         true if the current user already disliked the video, false otherwise
   */
  doesDislike (videoId) {
    return this.paratii.eth.vids.doesDislike(videoId)
  }
  /**
   * This call will register the video on the blockchain, add its metadata to IPFS, upload file to IPFS, and transcode it
   * @param  {Object}  options information about the video ( videoId, title, FilePath ... )
   * @return {Promise}         information about the video ( VideoId, owner, ipfsHash ... )
   */
  async create (options) {
    // FIXME: validate!!
    const result = joi.validate(options, schema)
    const error = result.error
    if (error) throw error
    options = result.value

    if (options.id === null) {
      options.id = this.paratii.eth.vids.makeId()
    }

    let hash = await this.paratii.ipfs.addAndPinJSON({
      author: options.author,
      description: options.description,
      duration: options.duration,
      filename: options.filename,
      filesize: options.filesize,
      free: options.fee,
      // published: options.published,
      storageStatus: options.storageStatus,
      title: options.title,
      transcodingStatus: options.transcodingStatus,
      uploadStatus: options.uploadStatus,
      thumbnails: options.thumbnails
    })

    options.ipfsData = hash

    await this.paratii.eth.vids.create({
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
   * Update the information on the video.
  *  Only the account that has registered the video, or the owner of the contract, can update the information.
   * @param  {String}  videoId      univocal video identifier
   * @param  {Object}  options      key value pairs of properties and new values e.g. ({title: 'another-title'})
   * @param  {Object}  dataToUpdate optional. old data of the video. If not passed to the method, it will fetch the data itself using the videoId
   * @return {Promise}              Updated video informations
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

    const elements = schema._inner.children
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
    let hash = await this.paratii.ipfs.addJSON(optionsIpfs)
    optionsBlockchain['ipfsData'] = hash
    return this.paratii.eth.vids.view(optionsBlockchain)
  }

  async get (videoId) {
    return this.paratii.db.vids.get(videoId)
  }
  search (options) {
    return this.paratii.db.vids.search(options)
  }
}
