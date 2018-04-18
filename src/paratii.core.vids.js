import { videoSchema } from './schemas.js'
import { makeId } from './utils.js'
import joi from 'joi'

 /**
  * Utilities to create and manipulate information about the videos on the blockchain.
  * @param {Object} config configuration object to initialize Paratii object
  */
export class ParatiiCoreVids {
  constructor (config) {
    this.config = config
  }

  /**
   * Register the data of this video.
   * NB: this will _not_ upload the video file itself - just save these ata
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

    if (!options.id) {
      options.id = makeId()
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
   * @param  {string} videoId univocal video identifier randomly generated
   * @return {Object}         information about the transaction recording the like
   * @example paratii.core.vids.like('some-video-id')
   */
  like (videoId) {
    return this.config.paratii.eth.vids.like(videoId)
  }
  /**
   * Writes a dislike for the video on the blockchain (contract Likes), and negates a like for the video, if it exists.
   * @param  {string} videoId univocal video identifier randomly generated
   * @return {Object}         information about the transaction recording the dislike
   * @example paratii.core.vids.dislike('some-video-id')
   */
  dislike (videoId) {
    return this.config.paratii.eth.vids.dislike(videoId)
  }
  /**
   * Check if the current user has already liked the video
   * @param  {string} videoId univocal video identifier randomly generated
   * @return {Boolean}         true if the current user already liked the video, false otherwise
   * @example paratii.core.vids.doesLike('some-video-id')
   */
  doesLike (videoId) {
    return this.config.paratii.eth.vids.doesLike(videoId)
  }
  /**
   * Check if the viewer has already viewed the video
   * @param  {string}  viewer  viewer address
   * @param  {string}  videoId univocal video identifier randomly generated
   * @return {Boolean}         true if the current user already viewed the video, false otherwise
   * @example paratii.core.vids.hasViewedVideo('some-user-id','some-video-id')
   */
  hasViewedVideo (viewer, videoId) {
    return this.config.paratii.eth.vids.userViewedVideo({ viewer: viewer, videoId: videoId })
  }
  /**
   * Check if the current user has already disliked the video
   * @param  {string} videoId univocal video identifier randomly generated
   * @return {Boolean}         true if the current user already disliked the video, false otherwise
   * @example paratii.core.vids.doesDislike('some-video-id')
  */
  doesDislike (videoId) {
    return this.config.paratii.eth.vids.doesDislike(videoId)
  }

  /**
   * Update the information on the video.
   *  Only the account that has registered the video, or the owner of the contract, can update the information.
   * @param  {string}  videoId      univocal video identifier
   * @param  {Object}  options      key value pairs of properties and new values e.g. ({title: 'another-title'})
   * @param  {Object}  dataToUpdate optional. old data of the video. If not passed to the method, it will fetch the data itself using the videoId
   * @return {Promise}              Updated video informations
   * @example await paratii.core.vids.update('some-video-id', {title: 'another-title'})
   */
  async update (videoId, options, dataToUpdate) {
    let data
    if (dataToUpdate) {
      data = dataToUpdate
    } else {
      data = await this.get(videoId)
    }
    if (data === null) {
      throw new Error(`No video with id ${videoId} to update`)
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
   * await paratii.vids.upsert({ id: 'some-video-id', owner: 'some-user-id', title: 'videoTitle'}) //insert a new video
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
    let hash = await this.config.paratii.ipfs.local.addJSON(optionsIpfs)
    optionsBlockchain['ipfsData'] = hash
    return this.config.paratii.eth.vids.view(optionsBlockchain)
  }
  /**
   * Get the data of the video identified by videoId
   * @param  {string}  videoId univocal video identifier randomly generated
   * @return {Promise}         data about the video
   * @example await paratii.core.vids.get('some-video-id')
   */
  async get (videoId) {
    return this.config.paratii.db.vids.get(videoId)
  }
  /**
   * Get the data of the video
   * @param  {Object} options data about the video and (optional)
   * @param  {String} options.owner owner i.e {'owner':'0x9e2d04eef5b16CFfB4328Ddd027B55736407B275'}
   * @param  {String} options.keyword keyword i.e {'keyword':'titleOfTheVideo'}
   * @param  {Integer} options.offset pagination offset i.e {'offset': 10} skip the first 10 videos
   * @param  {Integer} options.limit pagination limit i.e {'limit': 10} get just 10 videos
   * @param  {Boolean} options.staked staked videos i.e {'staked': true} get staked videos, {'staked': false} get not staked videos
   * @return {Promise} that resolves in a object with this properties:
   * ```
   * {
   *    results: [Array], //videos array
   *    total: Integer, //results length
   *    hasNext: Boolean, //if there are more results
   *    query: Object, //get back your query
   * }
   * ```
   * @example paratii.core.vids.search({keyword : 'titleOftheVideo'})
   */
  search (options) {
    return this.config.paratii.db.vids.search(options)
  }

  /**
   * convenience method for adding and transcoding files. It will upload a file to the local IPFS instance, signal
   * the transcoder to transcode the file. It returns an EventEmitter that signals progress updates
   * and, when done, returns the hash of the transcoded file
   * @param {Object[]} files Either a single file or an array of files.
   * the files can either be a path to the local filesystem, or a fs.File object, or an HTML5 File object
   * @return {EventEmitter} an event emitter/Promise object, which defines the following events:
   *  - all events from {@link ParatiiIPFSLocal#add}
   *  - all events from {@link ParatiiTranscoder#transcode}
   * @example const pathToYourFile = './some/file.mp4'
   * const ev = paratii.vids.uploadAndTranscode(pathToYourFile)
   * ev.on('transcoding:error',  console.error )
   * ev.on('transcoding:done',  function(hash, transcoderResult) {
   *    console.log(`Your file should now be available on https://gateway.paratii.video/ipfs/${transcoderResult}`)
   *  })
   * @async
   */
  uploadAndTranscode (files) {
    return this.config.paratii.transcoder.uploadAndTranscode(files)
  }
}
