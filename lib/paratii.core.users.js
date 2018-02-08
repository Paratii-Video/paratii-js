const dopts = require('default-options')

/**
 * ParatiiCoreUsers
 *
 */
export class ParatiiCoreUsers {
  constructor (config) {
    let defaults = {
      'db.provider': null
    }
    let options = dopts(config, defaults, {allowUnknown: true})
    this.config = options
    this.paratii = this.config.paratii
  }

  async create (options) {
	let keysForBlockchain = ['id', 'name', 'email']
	let optionsKeys = Object.keys(options)
	let optionsBlockchain = {}
	let optionsIpfs = {}
	optionsKeys.forEach(function(key) {
		if(keysForBlockchain.includes(key)) {
			optionsBlockchain[key] = options[key]
		} else {
			optionsIpfs[key] = options[key]
		}
	})
    let hash = await this.paratii.ipfs.addJSON(optionsIpfs)
	optionsBlockchain['ipfsHash'] = hash
    return this.paratii.eth.users.create(optionsBlockchain)
  }

  get (id) {
    return this.paratii.db.users.get(id)
  }

  async update (userId, options) {
    let defaults = {
      name: null, // must be a string, optional
      email: null, // must be a string, optional
      ipfsHash: null // must be a string, optional, default is ''
    }
    options = dopts(options, defaults)

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
