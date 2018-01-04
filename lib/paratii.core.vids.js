const dopts = require('default-options')

/**
 * ParatiiCoreVids
 *
 */
export class ParatiiCoreVids {
  constructor (config) {
    let defaults = {
      'db.provider': null
    }
    let options = dopts(config, defaults, {allowUnknown: true})
    this.config = options
    this.paratii = this.config.paratii

    this._defaults = {
      id: undefined, // must be a string
      owner: undefined, // must be a string
      price: 0, // must be a number, optional, default is 0
      title: undefined, // must be a string
      file: null, // must be string, optional
      ipfsHash: '' // must be a string, optional, default is ''
    }
  }

  async create (options) {
    let defaults = this._defaults
    options = dopts(options, defaults)

    let hash = await this.paratii.ipfs.addJSON({
      title: options.title
    })

    options.ipfsData = hash
    await this.paratii.eth.vids.create({
      id: options.id,
      owner: options.owner,
      price: options.price,
      ipfsHash: options.ipfsHash,
      ipfsData: options.ipfsData
    })

    return options
  }

  async update (videoId, options) {
    let defaults = this._defaults
    options = dopts(options, defaults)

    let data = await this.get(videoId)
    delete data['ipfsData']
    for (let key in options) {
      data[key] = options[key]
    }

    await this.create(data)

    return data
  }

  async get (videoId) {
    return this.paratii.db.vids.get(videoId)
  }
}
