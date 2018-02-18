const dopts = require('default-options')
const joi = require('joi')

/**
 * ParatiiCoreVids
 *
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
    //
    // this._defaults = {
    //   id: undefined, // must be a string
    //   owner: String, // must be a string
    //   price: 0, // must be a number, optional, default is 0
    //   title: String, // must be a string
    //   descripton: undefined, // must be a string, optional
    //   file: null, // must be string, optional
    //   ipfsHash: '' // must be a string, optional, default is ''
    // }
  }

  like (videoId) {
    return this.paratii.eth.vids.like(videoId)
  }

  dislike (videoId) {
    return this.paratii.eth.vids.dislike(videoId)
  }

  doesLike (videoId) {
    return this.paratii.eth.vids.doesLike(videoId)
  }

  hasViewedVideo (viewer, videoId) {
    return this.paratii.eth.vids.userViewedVideo({ viewer: viewer, videoId: videoId })
  }

  doesDislike (videoId) {
    return this.paratii.eth.vids.doesDislike(videoId)
  }

  async create (options) {
    let defaults = {
      id: null, // optional, a string
      owner: undefined, // must be a string
      price: 0, // must be a number, optional, default is 0
      title: undefined, // must be a string
      description: null, // must be a string, optional
      file: null, // must be string, optional
      ipfsHashOrig: '', // must be a string, optional, default is ''
      ipfsHash: '' // must be a string, optional, default is ''
    }

    options = dopts(options, defaults)

    if (options.id === null) {
      options.id = this.paratii.eth.vids.makeId()
    }

    let hash = await this.paratii.ipfs.addJSON({
      title: options.title,
      description: options.description
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

  async update (videoId, options) {
    let defaults = {
      description: null,
      owner: null, // must be a string, optional
      price: null, // must be a number, optional, default is 0
      title: null, // must be a string, optional
      file: null, // must be string, optional
      ipfsHashOrig: '', // must be a string, optional, default is ''
      ipfsHash: null // must be a string, optional, default is ''
    }
    options = dopts(options, defaults)

    let data = await this.get(videoId)
    delete data['ipfsData']
    for (let key in options) {
      if (options[key] !== null) {
        data[key] = options[key]
      }
    }

    await this.create(data)

    return data
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
}
