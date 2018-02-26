const joi = require('joi')

/**
 * ParatiiCoreVids
 *
 */

const schema = joi.object({
  id: joi.string().default(null),
  author: joi.string().empty('').default('').allow(null),
  description: joi.string().empty('').default(''),
  duration: joi.string().empty('').default('').allow(null),
  file: joi.string().default('').allow(null),
  filesize: joi.string().default('').allow(null),
  free: joi.string().empty('').default(null).allow(null),
  ipfsHashOrig: joi.string().empty('').default(''),
  ipfsHash: joi.string().empty('').default(''),
  owner: joi.string().required(),
  price: joi.number().default(0),
  published: joi.boolean().default(false).allow(null),
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
      file: options.file,
      filesize: options.filesize,
      free: options.fee,
      published: options.published,
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

    // const schema = joi.object({
    //   id: joi.string().default(null),
    //   owner: joi.string().required(),
    //   price: joi.number().default(0),
    //   title: joi.string().empty('').default(''),
    //   description: joi.string().empty('').default(''),
    //   duration: joi.string().empty('').default('').allow(null),
    //   file: joi.string().default(null),
    //   ipfsHashOrig: joi.string().empty('').default(''),
    //   ipfsHash: joi.string().empty().default(''),
    //   author: joi.string().empty('').default('').allow(null),
    //   free: joi.string().empty('').default('').allow(null),
    //   publish: joi.string().empty('').default('').allow(null)
    // })
    //
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
