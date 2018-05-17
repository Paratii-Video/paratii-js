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
   * Function for generate a signature
   * @param  {number} amount the amount to sign
   * @param  {string} salt the bytes32 salt to sign
   * @param  {string} reason the reason why to sign
   * @param  {string} address the address that sign
  */
  async generateSignature (amount, salt, reason, address) {
    const hash = this.eth.web3.utils.soliditySha3('' + amount, '' + salt, '' + reason)
    const signature = await this.eth.web3.eth.sign(hash, address)
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
    const error = result.error
    if (error) throw error
    options = result.value

    // TODO: implement type and missing value check

    let contract = await this.getPTIDistributeContract()
    await contract.methods.distribute(
      options.address, options.amount, options.salt, options.reason, options.v, options.r, options.s
    ).send()
  }
}
