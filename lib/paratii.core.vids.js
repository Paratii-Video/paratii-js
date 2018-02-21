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
    const schema = joi.object({
      id: joi.string().default(null),
      owner: joi.string().required(),
      price: joi.number().default(0),
      title: joi.string().empty('').default(''),
      description: joi.string().empty('').default(''),
      file: joi.string().default(null),
      ipfsHashOrig: joi.string().empty('').default(''),
      ipfsHash: joi.string().default('')
    })

    const result = joi.validate(options, schema)
    const error = result.error
    if (error) throw error
    options = result.value

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
    let data = await this.get(videoId)
    let dataToSave = {}

    if (data && data['ipfsData']) {
      delete data['ipfsData']
    }
    for (let key in options) {
      if (options[key] !== null) {
        dataToSave[key] = options[key]
      } else {
        dataToSave[key] = data[key]
      }
    }

    await this.create(dataToSave)

    return dataToSave
  }

  async upsert (options) {
    if (!options.id) {
      return this.create(options)
    } else {
      return this.update(options.id, options)
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
}
