const joi = require('joi')

/**
 * ParatiiCoreUsers
 *
 */
export class ParatiiCoreUsers {
  constructor (config) {
    const schema = joi.object({
      'db.provider': joi.string().default(null)
    }).unknown()

    const result = joi.validate(config, schema)
    const error = result.error
    if (error) throw error
    this.config = result.value
    this.paratii = this.config.paratii
  }

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
    let hash = await this.paratii.ipfs.addJSON(optionsIpfs)
    optionsBlockchain['ipfsData'] = hash
    return this.paratii.eth.users.create(optionsBlockchain)
  }

  get (id) {
    return this.paratii.db.users.get(id)
  }

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
