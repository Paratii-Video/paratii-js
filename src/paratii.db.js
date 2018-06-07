import { ParatiiDbVids } from './paratii.db.vids.js'
import { ParatiiDbUsers } from './paratii.db.users.js'
import { dbSchema, accountSchema } from './schemas.js'
import joi from 'joi'

// Needed to check the DB provider status code
const request = require('request')

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
  /**
   * Requests a link to see if it's up (Easily adds a dozen seconds to check the status)
   * @return {Promise} that resolves in a boolean
   */
  async checkDBProviderStatus () {
    return new Promise(resolve => {
      request(this.config.db.provider, function (error, response) {
        if (error) {
          resolve(false)
        } else if (response && response.statusCode === 200) { // We suppose for now that only 200 is the right status code (see: https://en.wikipedia.org/wiki/List_of_HTTP_status_codes)
          resolve(true)
        } else {
          resolve(false)
        }
      })
    })
  }
}
