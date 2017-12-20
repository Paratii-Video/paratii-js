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
    await this.config.paratii.eth.vids.create({
      id: options.id,
      owner: options.owner,
      price: options.price
    })
    return options.id
  }
}
