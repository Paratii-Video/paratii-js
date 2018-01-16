const crypto = require('crypto')
const Web3 = require('web3')
const dopts = require('default-options')

export class ParatiiUtils {
  constructor (config) {
    let defaults = {
      provider: 'http://localhost:8545/rpc/',
      wsprovider: 'ws://localhost:8546/rpc/',
      registryAddress: null,
      account: {
        address: null,
        privateKey: null
      },
      web3: null,
      isTestNet: false
    }
    let options = dopts(config, defaults, {
      allowUnknown: true
    })
    this.config = config

    if (options.web3) {
      this.web3 = options.web3
    } else {
      this.web3 = new Web3()
      this.web3.setProvider(new this.web3.providers.HttpProvider(options.provider))
    }

    if (this.config.account.privateKey) {
      this.web3.eth.defaultAccount = this.config.account.address
      this.web3.eth.accounts.wallet.add(this.config.account.privateKey)
    }
  }

  getSelf () {
    return this
  }

  newChallenge () {
    return crypto.randomBytes(16).toString('hex')
  }

  signMessage (messageToSign) {
    return this.web3.eth.accounts.sign(this.web3.utils.toHex(messageToSign), this.config.account.privateKey)
  }

  recoverAccount (msg) {
    return this.web3.eth.accounts.recover(msg)
  }
}
