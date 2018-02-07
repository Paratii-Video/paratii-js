const dopts = require('default-options')

/**
 * ParatiiCoreUsers
 *
 */
export class ParatiiCoreUsers {
  constructor (config) {
    let defaults = {
      'db.provider': null
    }
    let options = dopts(config, defaults, {allowUnknown: true})
    this.config = options
  }

  create (options) {
    return this.paratii.eth.users.create(options)
  }

  get (id) {
    return this.paratii.eth.users.get(id)
  }

  update (id, options) {
    return this.paratii.eth.users.update(id, options)
  }
}
