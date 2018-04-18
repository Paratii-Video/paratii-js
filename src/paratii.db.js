import { ParatiiDbVids } from './paratii.db.vids.js'
import { ParatiiDbUsers } from './paratii.db.users.js'
import { dbSchema, accountSchema } from './schemas.js'
import joi from 'joi'

/**
 * ParatiiDb contains a functionality to interact with the Paratii Index.
 * @param {ParatiiDbSchema} config configuration object to initialize Paratii object
 * @property {ParatiiDbVids} vids operations on videos
 * @property {ParatiiDbUsers} users operations on users
 */
export class ParatiiDb {
  /**
  * @typedef ParatiiDbSchema
  * @property {dbSchema} db
  * @property {accountSchema} account
 */
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
