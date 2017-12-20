const dopts = require('default-options')

/**
 * ParatiiDb contains a functionality to interact with the Paratii Blockchain Index
 *
 */
export class ParatiiDb {
  constructor (config) {
    let defaults = {
    }
    let options = dopts(config, defaults, {allowUnknown: true})
    this.config = config
    console.log(options)
  }
}
