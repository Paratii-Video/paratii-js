const crypto = require('crypto')

export class ParatiiUtils {
  constructor (config) {
    this.config = config
  }

  getSelf () {
    return this
  }

  newChallenge () {
    return crypto.randomBytes(16).toString('hex')
  }

  signMessage (messageToSign) {
    return this.config.paratii.eth.web3.eth.accounts.sign(this.config.paratii.eth.web3.utils.toHex(messageToSign), this.config.account.privateKey)
  }

  recoverAccount (msg) {
    return this.config.paratii.eth.web3.eth.accounts.recover(msg)
  }
}
