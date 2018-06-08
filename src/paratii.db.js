import { ParatiiDbVids } from './paratii.db.vids.js'
import { ParatiiDbUsers } from './paratii.db.users.js'
import { dbSchema, accountSchema } from './schemas.js'
import joi from 'joi'

// Needed to check if the DB provider is up
require('es6-promise').polyfill()
const fetch = require('isomorphic-fetch')

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
   * Requests the DB provider to see if it's up (Easily adds a dozen seconds to check the status)
   * @return {Promise} that resolves in a boolean
   */
  async checkDBProviderStatus () {
    return new Promise(resolve => {
      fetch(this.config.db.provider)
        .then(function (response) {
          if (response.status === 200) {
            resolve(true)
          } else {
            resolve(false)
          }
        })
    })
  }
  /**
   * Checks DB provider and returns a detailed object
   * @return {Promise} that resolves in an object
   */
  async serviceCheckDBProviderStatus () {
    return new Promise(resolve => {
      let executionStart = new Date().getTime()

      fetch(this.config.db.provider)
        .then((response) => {
          let reponseStatus = response.status
          if (reponseStatus === 200) {
            let executionEnd = new Date().getTime()
            let executionTime = executionEnd - executionStart

            let dbServiceCheckObject = {
              provider: this.config.db.provider,
              responseTime: executionTime,
              response: reponseStatus,
              responsive: true
            }
            resolve(dbServiceCheckObject)
          } else {
            let dbServiceCheckObject = {
              provider: this.config.db.provider,
              responseTime: 0,
              response: reponseStatus,
              responsive: false
            }
            resolve(dbServiceCheckObject)
          }
        })
    })
  }
}
