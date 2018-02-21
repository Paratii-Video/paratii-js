const joi = require('joi')

export class ParatiiEthUsers {
  constructor (context) {
    // context is a ParatiiEth instance
    this.eth = context
  }

  async getRegistry () {
    return this.eth.getContract('Users')
  }

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

  async update (userId, options) {
    options.id = userId
    let data = await this.get(userId)
    for (let key in options) {
      data[key] = options[key]
    }
    await this.create(data)
    return data
  }

  async delete (userId) {
    let contract = await this.getRegistry()
    let tx = contract.methods.remove(userId).send()
    return tx
  }
}
