import { ParatiiVids } from './paratii.core.vids.js'
import { ParatiiUsers } from './paratii.core.users.js'
import { ipfsSchema, ethSchema, accountSchema, dbSchema } from './schemas.js'
import joi from 'joi'

/**
 * Contains functions that operate transversally over several backend systems. <br />
 * validates the config file and istantiates ParatiiVids and ParatiiUsers.
 * @param {ParatiiCoreSchema} config configuration object to initialize Paratii object
 * @property {ParatiiVids} vids operations on videos
 * @property {ParatiiUsers} users operations on users
 * @property {Paratii} paratii main Paratii Object
 * @private
 */
export class ParatiiCore {
  /**
  * @typedef {Array} ParatiiCoreSchema
  * @property {accountSchema=} account
  * @property {ethSchema=} eth
  * @property {dbSchema=} db
  * @property {ipfsSchema=} ipfs
  * @property {Object=} paratii
  * @private
 */
  constructor (config) {
    const schema = joi.object({
      account: accountSchema,
      eth: ethSchema,
      db: dbSchema,
      ipfs: ipfsSchema,
      paratii: joi.object().optional()
    })
    const result = joi.validate(config, schema)
    if (result.error) throw result.error
    this.config = config
    // this.config = result.value
    this.vids = new ParatiiVids(this.config)
    this.users = new ParatiiUsers(this.config)
    this.paratii = this.config.paratii
  }
}
