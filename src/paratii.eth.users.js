import { ethUserSchema } from './schemas.js'
const joi = require('joi')
/**
 * The eth.user namespace contains functions to interact with the video registration on the blockchain.
 * @param {Object} context ParatiiEth instance
 * @property {ParatiiEth} eth ParatiiEth instance
 */
export class ParatiiEthUsers {
  constructor (context) {
    // context is a ParatiiEth instance
    this.eth = context
  }
  /**
   * Get the contract instance of the user contract
   * @return {Promise}  Object representing the contract
   * @example let usersContract =  await paratii.eth.users.getRegistry()
   */
  async getRegistry () {
    return this.eth.getContract('Users')
  }
  /**
   * Register the data of this user.
   * @param  {ethUserSchema}  options information about the user ( id, name ... )
   * @return {Promise}         information about the user ( id, name, ... )
   * @example await paratii.eth.users.create({
   *  id: 'some-video-id',
   *  name: 'some-nickname',
   *  ipfsData: 'ipfsHash',
   * })
   */
  async create (options) {
    if (!this.eth.web3.utils.isAddress(options.id)) {
      let msg = `The "id" argument should be a valid address, not ${options.id}`
      throw Error(msg)
    }
    const result = joi.validate(options, ethUserSchema)
    const error = result.error
    if (error) throw error
    options = result.value
    let contract = await this.getRegistry()
    await contract.methods.create(options.id, options.name, options.ipfsData).send()
    return options.id
  }
  /**
   * Get a users details from the blockchain
   * @param  {string}  userId valid address
   * @return {Promise}        information about the user
   * @example user = await paratii.eth.users.get('some-id')
   * See {@link ParatiiCoreUsers#get}
   */
  async get (userId) {
    let contract = await this.getRegistry()
    let userInfo = await contract.methods.get(userId).call()
    let result = {
      id: userId,
      name: userInfo[0],
      ipfsData: userInfo[1]
    }
    return result
  }
  /**
   * Updates a user details on the blockchain.
   * @param  {string}  userId  valid address
   * @param  {Object}  options information to update. Left-out data is kept the same.
   * @return {Promise}         updated data
   * @example await paratii.eth.users.update('some-id', {ipfsData: 'new-hash'})
   * See {@link ParatiiCoreUsers#update}
   */
  async update (userId, options) {
    options.id = userId
    const result = joi.validate(options, ethUserSchema)
    const error = result.error
    if (error) throw error
    let data = await this.get(userId)
    for (let key in options) {
      data[key] = options[key]
    }
    await this.create(data)
    return data
  }
  /**
   * Deletes a user from the blockchain. Can only be called by the contract owner or the user him/her-self
   * @param  {string}  userId valid address
   * @return {Promise}        blockchain transaction
   * @example await paratii.eth.users.delete('some-id')

   */
  async delete (userId) {
    let contract = await this.getRegistry()
    let tx = contract.methods.remove(userId).send()
    return tx
  }
}
