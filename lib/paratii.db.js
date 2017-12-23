const dopts = require('default-options')

/**
 * ParatiiDb contains a functionality to interact with the Paratii Blockchain Index
 *
 */
export class ParatiiDb {
  constructor (config) {
    let defaults = {
      'db.provider': null
    }
    let options = dopts(config, defaults, {allowUnknown: true})
    this.config = options
  }
}
