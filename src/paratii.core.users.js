const joi = require('joi')

/**
 * Utilities to create and manipulate information about the users on the blockchain.
 * @param {Object} config configuration object to initialize Paratii object
 */
export class ParatiiCoreUsers {
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
   * Creates a user, fields id, name and email go to the smart contract Users, other fields are stored on IPFS.
   * @param  {userSchema}  options information about the video ( id, name, email ... )
   * @return {Promise}         the id of the newly created user
   * @example
   *            paratii.users.create({
   *              id: 'some-user-id',
   *              name: 'A user name',
   *              email: 'some@email.com',
   *              ...
   *             })
   * @memberof paratii.users
   */
  // FIXME: do some joi validation here
  async create (options) {
    let keysForBlockchain = ['id', 'name', 'email']
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
    let hash = await this.config.paratii.ipfs.addJSON(optionsIpfs)
    optionsBlockchain['ipfsData'] = hash
    return this.config.paratii.eth.users.create(optionsBlockchain)
  }

  /**
   * retrieve data about the user
   * @param  {String} id user univocal id
   * @return {Object}    data about the user
   * @example paratii.users.get('some-user-id')
   * @memberof paratii.users
  */
  get (id) {
    return this.config.paratii.db.users.get(id)
  }
  /**
   * Updates a user's details. name and email are defined in the smart contract Users, other fields get written to IPFS.
   * @param  {String}  userId  user univocal id
   * @param  {Object}  options updated data i.e. { name: 'A new user name' }
   * @return {Promise}         updated data about the user
   * @example paratii.users.update('some-user-id', {name: 'A new user name'})
   * @memberof paratii.users
   */
  async update (userId, options) {
    const schema = joi.object({
      name: joi.string().default(null),
      email: joi.string().default(null)
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
   * @alias migrateAccount
   * @param newAccount Address of new account
   * @async
   * @memberof Paratii
   */
  async migrateAccount (newAccount) {
    // migrate the videos
    const paratii = this.config.paratii
    const oldAccount = this.config.account.address
    const vids = await paratii.vids.search({owner: oldAccount})
    for (let i in vids) {
      let vid = vids[i]
      let videoId = vid.id || vid._id
      await paratii.vids.update(videoId, {owner: newAccount})
      let didVideoApply = await paratii.eth.tcr.didVideoApply(vid.id)
      if (didVideoApply) {
        // removing video from statke
        await paratii.eth.tcr.exit(videoId)
      }
    }

    // transfer all  PTI to the new account
    let ptiBalance = await paratii.eth.balanceOf(oldAccount, 'PTI')
    await paratii.eth.transfer(newAccount, ptiBalance, 'PTI')
    // FIXME: need to call tc.apply(vid.id) with newAccount as sender (how to do that?)
  }
}
