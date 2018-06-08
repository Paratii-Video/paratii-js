const joi = require('joi')

/**
 * Utilities to create and manipulate information about the users on the blockchain.
 * @param {ParatiiConfigSchema} config configuration object to initialize Paratii object
 * @example let paratii = new Paratii()
 * paratii.users // <- this is an instance of ParatiiUsers
 */
export class ParatiiUsers {
  constructor (config) {
    // const schema = joi.object({
    //   'db.provider': joi.string().default(null)
    // }).unknown()
    //
    // const result = joi.validate(config, schema)
    // // const error = result.error
    // if (error) throw error
    this.config = config
  }
  /**
   * @typedef {Array} userSchema
   * @property {string} id the Ethereum address of the user
   * @property {string=} name
   * @property {string=} email
   */

  /**
   * Creates a user, fields id, name and email go to the smart contract Users, other fields are stored on IPFS.
   * @param  {userSchema}  options information about the video ( id, name, email ... )
   * @return {Promise}         the id of the newly created user
   * @example let userData = {
   *                    id: '0x12456....',
   *                    name: 'Humbert Humbert',
   *                    email: 'humbert@humbert.ru',
   *                    ipfsData: 'some-hash'
   *              }
   *   let result = await paratii.eth.users.create(userData)
   *  })
   */
  async create (options) {
    // FIXME: do some joi validation here
    const paratii = this.config.paratii
    let keysForBlockchain = ['id', 'name']
    let optionsKeys = Object.keys(options)
    let optionsBlockchain = {}
    let optionsIpfs = {}
    optionsKeys.forEach(function (key) {
      if (keysForBlockchain.includes(key)) {
        optionsBlockchain[key] = options[key]
      } else {
        optionsIpfs[key] = options[key]
      }
    })
    let hash = await paratii.ipfs.local.addJSON(optionsIpfs)
    optionsBlockchain['ipfsData'] = hash
    // FIXME: add error handling if call to db fails.
    if (options.email !== undefined) {
      await paratii.db.users.setEmail(options.id, options.email)
    }
    return paratii.eth.users.create(optionsBlockchain)
  }

  /**
   * Update the information of the user if the user already exists, otherwise it creates it
   * @param  {Object}  options user informations
   * @return {Promise}         updated/new user informations
   * @example let userData = {
   *                    id: '0x12456....',
   *                    name: 'Humbert Humbert',
   *                    email: 'humbert@humbert.ru',
   *                    ipfsData: 'some-hash'
   *              }
   *   let result = await paratii.eth.users.upsert(userData)
   *  })
   */
  async upsert (options) {
    let data = null
    let userId = ''
    if (options.id) {
      userId = options.id
      data = await this.get(userId)
    }
    if (!data) {
      return this.create(options)
    } else {
      delete options.id
      return this.update(userId, options, data)
    }
  }

  /**
   * retrieve data about the user
   * @param  {string} id user univocal id
   * @return {Object}    data about the user
   * @example paratii.users.get('some-user-id')
  */
  get (id) {
    return this.config.paratii.db.users.get(id)
  }
  /**
   * Updates a user's details. name and email are defined in the smart contract Users, other fields get written to IPFS.
   * @param  {string}  userId  user univocal id
   * @param  {UserSchema}  options updated data i.e. { name: 'A new user name' }
   * @return {Promise}         updated data about the user
   * @example let updatedData = await paratii.users.update('some-user-id', {name: 'A new user name'})
   */
  async update (userId, options) {
    const schema = joi.object({
      name: joi.string().default(null).empty(''),
      email: joi.string().default(null).empty('')
    })

    const result = joi.validate(options, schema)
    const error = result.error
    if (error) throw error
    options = result.value

    let data = await this.get(userId)
    for (let key in options) {
      if (options[key] !== null) {
        data[key] = options[key]
      }
    }

    data['id'] = userId

    await this.create(data)

    return data
  }

  /**
   * migrate all contract data for  paratii.config.account to a new account
   * @param newAccount Address of new account
   * @private
   */
  async migrateAccount (newAccount) {
    // migrate the videos
    const paratii = this.config.paratii
    const oldAccount = this.config.account.address
    const search = await paratii.vids.search({owner: oldAccount})
    const vids = search && search.results
    const originalUserRecord = await paratii.eth.users.get(oldAccount)
    const newUserRecord = originalUserRecord
    newUserRecord.id = newAccount
    await paratii.eth.users.create(newUserRecord)
    if (vids) {
      for (let i = 0; i < vids.length; i++) {
        const vid = vids[i]
        let videoId = vid.id || vid._id
        await paratii.vids.update(videoId, {owner: newAccount})
        let didVideoApply = await paratii.eth.tcrPlaceholder.didVideoApply(videoId)
        if (didVideoApply) {
          // removing video from stake
          await paratii.eth.tcrPlaceholder.exit(videoId)
        }
      }
    }
    // transfer all  PTI to the new account
    let ptiBalance = await paratii.eth.balanceOf(oldAccount, 'PTI')
    await paratii.eth.transfer(newAccount, ptiBalance, 'PTI')
    // FIXME: need to call tc.apply(vid.id) with newAccount as sender (how to do that?)
  }
}
