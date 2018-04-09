import { ParatiiCoreVids } from './paratii.core.vids.js'
import { ParatiiCoreUsers } from './paratii.core.users.js'
import { ipfsSchema, ethSchema, accountSchema, dbSchema } from './schemas.js'
import joi from 'joi'

/**
 * Contains functions that operate transversally over several backend systems. <br />
 * validates the config file and istantiates ParatiiCoreVids and ParatiiCoreUsers.
 * @param {ParatiiCoreSchema} config configuration object to initialize Paratii object
 * @property {ParatiiCoreVids} vids operations on videos
 * @property {ParatiiCoreUsers} users operations on users
 * @property {Paratii} paratii main Paratii Object
 */
export class ParatiiCore {
  /**
  * @typedef {Array} ParatiiCoreSchema
  * @property {?accountSchema} account
  * @property {?ethSchema} eth
  * @property {?dbSchema} db
  * @property {?ipfsSchema} ipfs
  * @property {?Object} paratii
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
    this.vids = new ParatiiCoreVids(this.config)
    this.users = new ParatiiCoreUsers(this.config)
    this.paratii = this.config.paratii
  }

  /**
   * migrate all contract data for  paratii.config.account to a new account
   * @param {Object} newAccount Address of new account
   * @private
   */
  async migrateAccount (newAccount) {
    // migrate the videos
    const paratii = this.config.paratii
    const oldAccount = this.config.account.address
    const vids = await this.vids.search({owner: oldAccount})
    for (let i in vids) {
      let vid = vids[i]
      await this.vids.update(vid.id, {owner: newAccount})
      let didVideoApply = await paratii.eth.tcr.didVideoApply(vid.id)
      if (didVideoApply) {
        // removing video from statke
        await paratii.eth.tcr.exit(vid.id)
      }
    }

    // transfer all  PTI to the new account
    let ptiBalance = await paratii.eth.balanceOf(oldAccount, 'PTI')
    await paratii.eth.transfer(newAccount, ptiBalance, 'PTI')
    // FIXME: need to call tc.apply(vid.id) with newAccount as sender (how to do that?)
  }
}
