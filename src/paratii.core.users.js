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
}
