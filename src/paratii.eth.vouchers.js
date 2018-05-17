import { getInfoFromLogs, NULL_ADDRESS, makeId } from './utils.js'
const joi = require('joi')
/**
 * Functions for redeeming vouchers
 * @param  {Object} context ParatiiEth instance
 * @property {ParatiiEth} eth ParatiiEth instance
 */
export class ParatiiEthVouchers {
  constructor (context) {
    // context is a ParatiiEth instance
    this.eth = context
  }
  /**
   * Get the contract instance of the vouchers contract
   * @return {Promise} Object representing the contract
   * @example let contract = await paratii.eth.vids.getVouchersContract()
  */
  async getVouchersContract () {
    let contract = await this.eth.getContract('Vouchers')
    if (contract.options.address === '0x0') {
      throw Error('There is not Vouchers contract known in the registry')
    }
    return contract
  }
  /**
   * Function for creating a voucher. Can only be called by the owner of the contract.
   * @param  {Object}  options data about the voucher
   * @param {string} options.voucherCode unique string associated to this voucher
   * @param {number} options.amount amount of PTI in wei of this voucher
   * @return {Promise}         the voucher id
   * @example await paratii.eth.vouchers.create({ voucherCode: 'some-id', amount: 10 })
   */
  async create (options) {
    const schema = joi.object({
      voucherCode: joi.string(),
      amount: joi.number()
    })

    const result = joi.validate(options, schema)
    const error = result.error
    if (error) throw error
    options = result.value

    if (options.voucherCode === null) {
      let msg = 'Voucher Code argument must not be null'
      throw Error(msg)
    }
    if (typeof options.voucherCode !== 'string') {
      let msg = 'Voucher Code argument needs to be a string'
      throw Error(msg)
    }
    if (typeof options.amount !== 'number') {
      let msg = 'Amount argument needs to be a number'
      throw Error(msg)
    }
    if (options.amount === 0) {
      let msg = 'Amount needs to be greater than zero'
      throw Error(msg)
    }

    let contract = await this.getVouchersContract()
    let hashedVoucher = await contract.methods.hashVoucher(options.voucherCode).call()
    let tx = await contract.methods.create(
      hashedVoucher,
      options.amount
    ).send()
    let voucherId = getInfoFromLogs(tx, 'LogCreateVoucher', '_hashedVoucher')

    return voucherId
  }
  /**
   * throws a test error
   * @private
   */
  async test () {
    throw Error('test error message')
  }

   /**
    * Generates a given number of vouchers with unique IDs, and the given amount, and returns an array of objects.
    * @param  {number}  number number of voucher to create
    * @param  {number}  amount amount of every voucher
    * @return {Promise}        Object containing every voucher created
    * @example let vouchers = await paratii.eth.vouchers.createVouchers(10, 10)
    */
  async createVouchers (number, amount) {
    let i
    let vouchers = []
    for (i = 0; i < number; i++) {
      let code = makeId()
      let voucher = { voucherCode: code, amount: amount }
      await this.create(voucher)
      vouchers.push(voucher)
    }
    return vouchers
  }
  /**
   * Function for redeeming a voucher to the current account's address.
   * @param  {string}  voucherCode univocal voucher code
   * @return {Promise}             true if everything goes well, otherwise throws an error
   * @example await paratii.eth.vouchers.redeem('some-code')
   */
  async redeem (voucherCode) {
    let contract = await this.getVouchersContract()
    let voucherBytes = await contract.methods.hashVoucher(voucherCode).call()
    let thisVoucher = await contract.methods.vouchers(voucherBytes).call()
    let thisVoucherClaimant = thisVoucher[0].toString()
    let thisVoucherAmount = Number(thisVoucher[1])
    let vouchersContractBalance = Number(await this.eth.balanceOf(contract.options.address, 'PTI'))

    if (thisVoucherClaimant !== NULL_ADDRESS) {
      throw Error('This voucher was already used')
    }
    if (thisVoucherAmount > vouchersContractBalance) {
      throw Error('The Vouchers contract doesn\'t have enough PTI to redeem the voucher')
    }
    if (thisVoucherAmount === Number(0)) {
      throw Error('This voucher doesn\'t exist')
    }

    try {
      let tx = await contract.methods.redeem(voucherCode).send()
      console.log(tx)

      let claimant = getInfoFromLogs(tx, 'LogRedeemVoucher', '_claimant', 1)
      let amount = getInfoFromLogs(tx, 'LogRedeemVoucher', '_amount', 1)
      console.log(claimant)
      console.log(amount)

      if (claimant === this.eth.getAccount()) {
        return amount
      } else {
        return false
      }
    } catch (e) {
      throw Error('An unknown error occurred')
    }
  }
}
