import { getInfoFromLogs } from './utils.js'
const joi = require('joi')
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
   * Function for creating a voucher. Can only be called by the owner of the contract.
   * @param  {Object}  options data about the voucher
   * @param {string} options.voucherCode unique string associated to this voucher
   * @param {number} options.amount amount of PTI in wei of this voucher
   * @return {Promise}         the voucher id
   * @example await paratii.eth.distribute.distribute({ voucherCode: 'some-id', amount: 10 })
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
    let tx = await contract.methods.distribute(options.address, options.amount, options.salt, options.reason, options.v, options.r, options.s).call()

    let recipient = getInfoFromLogs(tx, 'LogDistribute', '_toAddress')

    return recipient
  }
}
