const joi = require('joi')
const ethUtil = require('ethereumjs-util')

/**
 * Functions for distribute pti
 * @param  {Object} context ParatiiEth instance
 * @property {ParatiiEth} eth ParatiiEth instance
 */
export class ParatiiEthPTIDistributor {
  constructor (context) {
    // context is a ParatiiEth instance
    this.eth = context
  }

  /**
   * Generate a signature for a message
   * @return {Promise} Object representing the contract
   * @param  {string} message to be sign
   * @return {Promise} Signature
   * @example let contract = await paratii.eth.distribute.signMessage('message')
  */
  async signMessage (message) {
    return this.eth.web3.eth.sign(this.eth.web3.utils.soliditySha3(message), this.eth.getAccount())
  }

  /**
   * Generate a signature for a message
   * @return {Promise} Object representing the contract
   * @param  {string} message hashed message
   * @param  {string} signedMessage
   * @param  {string} whoSigned
   * @return {Boolean}
   * @example let contract = await paratii.eth.distribute.signMessage('message')
  */

  async checkSignedmessage (message, signedMessage, whoSigned) {
    let recoveredAddress = this.eth.web3.eth.accounts.recover(message, signedMessage, false)
    if (whoSigned === recoveredAddress) {
      return true
    } else {
      throw Error('You are try to do something nasty')
    }
  }
  /**
   * Get the contract instance of the PTIDistributor contract
   * @return {Promise} Object representing the contract
   * @example let contract = await paratii.eth.distribute.getPTIDistributeContract()
  */
  async getPTIDistributeContract () {
    let contract = await this.eth.getContract('PTIDistributor')
    if (contract.options.address === '0x0') {
      throw Error('There is not ptiDistributor contract known in the registry')
    }
    return contract
  }
  /**
   * Function to generate a signature
   * @param  {number} amount the amount to sign
   * @param  {string} salt the bytes32 salt to sign
   * @param  {string} reason the reason why to sign
   * @param  {string} address the address that signs
  */
  async generateSignature (address, amount, salt, reason, owner) {
    const hash = this.eth.web3.utils.soliditySha3('' + address, '' + amount, '' + salt, '' + reason)
    const signature = await this.eth.web3.eth.sign(hash, owner)
    const signatureData = ethUtil.fromRpcSig(signature)
    let sig = {}
    sig.v = ethUtil.bufferToHex(signatureData.v)
    sig.r = ethUtil.bufferToHex(signatureData.r)
    sig.s = ethUtil.bufferToHex(signatureData.s)
    return sig
  }
  /**
   * Function for distributing pti. Can only be called by a valid owner signature.
   * @param  {Object}  options data about the amount and the signature
   * @param {string} options.address recipient address
   * @param {number} options.amount amount of PTI in wei of this distribution
   * @param {string} options.salt an bytes32 hash
   * @param {string} options.reason a reason for distribution
   * @param {string} options.v signature
   * @param {string} options.r signature
   * @param {string} options.s signature

   * @return {Promise}        none
   * @example asd
   */
  async distribute (options) {
    const schema = joi.object({
      address: joi.string(),
      amount: joi.number(),
      salt: joi.string(),
      reason: joi.string(),
      v: joi.string(),
      r: joi.string(),
      s: joi.string()
    })

    const result = joi.validate(options, schema)
    if (result.error) throw result.error
    options = result.value

    let contract = await this.getPTIDistributeContract()

    let isUsed = await contract.methods.isUsed(options.salt).call()

    if (isUsed) {
      throw new Error(`Salt ${options.salt} is already used`)
    }

    let hash = this.eth.web3.utils.soliditySha3(
      options.address, options.amount, options.salt, options.reason
    )

    let distributorOwner = await contract.methods.owner().call()
    let account = await contract.methods.checkOwner(hash, options.v, options.r, options.s).call()

    if (account !== distributorOwner) {
      throw new Error(`Signature does not correspond to owner of the contract (${account} != ${distributorOwner})`)
    }

    let tx = await contract.methods.distribute(
      options.address, options.amount, options.salt, options.reason, options.v, options.r, options.s
    ).send()
    return tx
  }
}
