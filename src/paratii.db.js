import { ParatiiDbVids } from './paratii.db.vids.js'
import { ParatiiDbUsers } from './paratii.db.users.js'
import { dbSchema, accountSchema } from './schemas.js'
import joi from 'joi'

/**
 * ParatiiDb contains a functionality to interact with the Paratii Blockchain Index. <br>
 * validates the config file and istantiates ParatiiDbVids and ParatiiDbUsers.
 * @param {Object} config
 * @class paratii.db
 * @memberof paratii
 */
export class ParatiiDb {
  constructor (config) {
    const schema = {
      db: dbSchema,
      account: accountSchema
    }
    const result = joi.validate(config, schema, {allowUnknown: true})
    if (result.error) throw result.error

    this.config = config
    this.config.db = result.value.db
    this.config.account = result.value.account
    this.vids = new ParatiiDbVids(this.config)
    this.users = new ParatiiDbUsers(this.config)
  }
}
