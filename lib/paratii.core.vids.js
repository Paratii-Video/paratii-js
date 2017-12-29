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
  }

  async create (options) {
    let defaults = {
      id: String,
      owner: String,
      price: Number,
      title: String,
      file: String
    }

    options = dopts(options, defaults)

    let hash = await this.paratii.ipfs.addJSON({
      title: options.title
    })

    options.ipfsData = hash
    options.ipfsHash = ''
    await this.paratii.eth.vids.create({
      id: options.id,
      owner: options.owner,
      price: options.price,
      ipfsHash: options.ipfsHash,
      ipfsData: options.ipfsData
    })

    return options
  }

  async get (videoId) {
    return this.paratii.db.vids.get(videoId)
  }
}
