import { ParatiiDbVids } from './paratii.db.vids.js'
import { ParatiiDbUsers } from './paratii.db.users.js'
const joi = require('joi')
/**
 * ParatiiDb contains a functionality to interact with the Paratii Blockchain Index
 *
 */
export class ParatiiDb {
  constructor (config) {
    const schema = joi.object({
      'db.provider': joi.string()
    }).unknown()
    const result = joi.validate(config, schema)
    const error = result.error
    if (error) throw error
    this.config = result.value

    this.vids = new ParatiiDbVids(this.config)
    this.users = new ParatiiDbUsers(this.config)
  }
}
