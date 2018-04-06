const joi = require('joi')
/**
 * The eth.user namespace contains functions to interact with the video registration on the blockchain.
 * @class paratii.eth.users
 */
export class ParatiiEthUsers {
  constructor (context) {
    // context is a ParatiiEth instance
    this.eth = context
  }
  /**
   * Get the contract instance of the user contract
   * @return {Promise}  Object representing the contract
   * @memberof paratii.eth.users
   */
  async getRegistry () {
    return this.eth.getContract('Users')
  }
  /**
   * Creates a user
   * @param  {Object}  options information about the user
   * @param {String} options.id valid address
   * @param {String} options.name name of the user
   * @param {String} options.email email of the user
   * @param {String} options.ipfsData ipfs hash
   * @return {Promise}         the id of the newly created user
   * @example let userData = {
   *                    id: 'some-id',
   *                    name: 'Humbert Humbert',
   *                    email: 'humbert@humbert.ru',
   *                    ipfsData: 'some-hash'
   *              }
   *         let result = await paratii.eth.users.create(userData)
   * @memberof paratii.eth.users
   */
  async create (options) {
    const schema = joi.object({
      id: joi.string(),
      name: joi.string(),
      email: joi.string(),
      ipfsData: joi.string()
    })

    if (!this.eth.web3.utils.isAddress(options.id)) {
      let msg = `The "id" argument should be a valid address, not ${options.id}`
      throw Error(msg)
    }

    const result = joi.validate(options, schema)
    const error = result.error
    if (error) throw error
    options = result.value

    let contract = await this.getRegistry()
    await contract.methods.create(options.id, options.name, options.email, options.ipfsData).send()
    return options.id
  }
  /**
   * Get a users details from the blockchain
   * @param  {String}  userId valid address
   * @return {Promise}        information about the user
   * @example user = await paratii.eth.users.get('some-id')
   * @memberof paratii.eth.users
   */
  async get (userId) {
    let contract = await this.getRegistry()
    let userInfo = await contract.methods.get(userId).call()
    let result = {
      id: userId,
      name: userInfo[0],
      email: userInfo[1],
      ipfsData: userInfo[2]
    }
    return result
  }
  /**
   * Updates a user details on the blockchain.
   * @param  {String}  userId  valid address
   * @param  {Object}  options information to update. Left-out data is kept the same.
   * @return {Promise}         updated data
   * @example await paratii.eth.users.update('some-id', {ipfsData: 'new-hash'})
   * @memberof paratii.eth.users
   */
  async update (userId, options) {
    options.id = userId
    let data = await this.get(userId)
    for (let key in options) {
      data[key] = options[key]
    }
    await this.create(data)
    return data
  }
  /**
   * Deletes a user from the blockchain. Can only be called by the contract owner or the user him/her-self
   * @param  {String}  userId valid address
   * @return {Promise}        blockchain transaction
   * @example await paratii.eth.users.delete('some-id')
   * @memberof paratii.eth.users
   */
  async delete (userId) {
    let contract = await this.getRegistry()
    let tx = contract.methods.remove(userId).send()
    return tx
  }
}
