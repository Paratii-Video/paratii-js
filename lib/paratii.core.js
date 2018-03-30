import { ParatiiCoreVids } from './paratii.core.vids.js'
import { ParatiiCoreUsers } from './paratii.core.users.js'
// const joi = require('joi')

/**
 * Contains functions that operate transversally over several backend systems. <br />
 * validates the config file and istantiates ParatiiCoreVids and ParatiiCoreUsers.
 * @param {Object} config configuration object to initialize Paratii object
 */
export class ParatiiCore {
  constructor (config) {
    // const schema = joi.object({
    //   'db.provider': joi.string()
    // }).unknown()
    //
    // const result = joi.validate(config, schema)
    // const error = result.error
    // if (error) throw error
    // this.config = result.value
    this.config = config

    this.vids = new ParatiiCoreVids(this.config)
    this.users = new ParatiiCoreUsers(this.config)
  }
}
