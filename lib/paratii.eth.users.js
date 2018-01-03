let dopts = require('default-options')

export class ParatiiEthUsers {
  constructor (context) {
    // context is a ParatiiEth instance
    this.eth = context
  }

  async fixMethodAndSend (method, opts) {
    // this methos fix a know bug on web3, apparently, 'deployContract(...)' does not return the same object as `getContract()` [<- this is a bug]
    let rawTransaction = await method
    rawTransaction._ethAccounts = this.eth.web3.eth.accounts
    // wait for receipt let nonce increment
    let tx = await rawTransaction.send(opts)
    return tx
  }

  async getRegistry () {
    return this.eth.getContract('Users')
  }

  async create (options) {
    let defaults = {
      id: String,
      name: String,
      email: String,
      ipfsHash: String
    }

    if (!this.eth.web3.utils.isAddress(options.id)) {
      let msg = `The"id" argument should be a valid address, not ${options.id}`
      throw Error(msg)
    }
    options = dopts(options, defaults)
    let contract = await this.getRegistry()
    contract.setProvider(this.eth.config.provider)
    await this.fixMethodAndSend(contract.methods.create(options.id, options.name, options.email, options.ipfsHash))
    return options.id
  }

  async get (userId) {
    let contract = await this.getRegistry()
    let userInfo = await contract.methods.get(userId).call()
    let result = {
      id: userId,
      name: userInfo[0],
      email: userInfo[1],
      ipfsHash: userInfo[2]
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
    let tx = this.fixMethodAndSend(contract.methods.remove(userId))
    return tx
  }
}
