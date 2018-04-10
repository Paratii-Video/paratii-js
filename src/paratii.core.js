import { ParatiiCoreVids } from './paratii.core.vids.js'
import { ParatiiCoreUsers } from './paratii.core.users.js'
import { ipfsSchema, ethSchema, accountSchema, dbSchema } from './schemas.js'
import joi from 'joi'

/**
 * Contains functions that operate transversally over several backend systems. <br />
 * validates the config file and istantiates ParatiiCoreVids and ParatiiCoreUsers.
 * @param {paratiiSchema} config configuration object to initialize Paratii object
 */
export class ParatiiCore {
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
   * @alias migrateAccount
   * @param newAccount Address of new account
   * @async
   * @memberof Paratii
   */
  async migrateAccount (newAccount) {
    // migrate the videos
    const paratii = this.config.paratii
    const oldAccount = this.config.account.address
    const vids = await this.vids.search({owner: oldAccount})
    for (let i in vids) {
      let vid = vids[i]
      let videoId = vid.id || vid._id
      await this.vids.update(videoId, {owner: newAccount})
      let didVideoApply = await paratii.eth.tcr.didVideoApply(vid.id)
      if (didVideoApply) {
        // removing video from statke
        await this.paratii.eth.tcr.exit(videoId)
      }
    }

    // transfer all  PTI to the new account
    let ptiBalance = await paratii.eth.balanceOf(oldAccount, 'PTI')
    await paratii.eth.transfer(newAccount, ptiBalance, 'PTI')
    // FIXME: need to call tc.apply(vid.id) with newAccount as sender (how to do that?)
  }
}
