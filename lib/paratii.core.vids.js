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

    // data to be put o the blockchain
    // let blockData = {
    //
    // }

    // data to be put in ipfs

    //
    await this.paratii.ipfs.addJSON({
      title: options.title
    })
    await this.paratii.eth.vids.create({
      id: options.id,
      owner: options.owner,
      price: options.price,
      ipfsHash: ''
    })
    return options.id
  }

  async get (videoId) {
    this.paratii.db.vids.get(videoId)
  }
}
