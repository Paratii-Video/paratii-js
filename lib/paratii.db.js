import { ParatiiDbVids } from './paratii.db.vids.js'
import { ParatiiDbUsers } from './paratii.db.users.js'
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

    this.vids = new ParatiiDbVids(this.config)
    this.users = new ParatiiDbUsers(this.config)
  }
}
