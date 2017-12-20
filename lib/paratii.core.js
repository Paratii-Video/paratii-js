const dopts = require('default-options')

/**
 * ParatiiCore
 *
 */
export class ParatiiCore {
  constructor (config) {
    let defaults = {
      'db.provider': null
    }
    let options = dopts(config, defaults, {allowUnknown: true})
    this.config = options
  }
}
