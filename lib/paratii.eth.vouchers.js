import { getInfoFromLogs } from './utils.js'
let dopts = require('default-options')

export class ParatiiEthVouchers {
  constructor (context) {
    // context is a ParatiiEth instance
    this.eth = context
  }

  async getVouchersContract () {
    let contract = await this.eth.getContract('Vouchers')
    if (contract.options.address === '0x0') {
      throw Error('There is not Vouchers contract known in the registry')
    }
    return contract
  }

  async create (options) {
    let defaults = {
      voucherCode: undefined,
      amount: undefined
    }
    options = dopts(options, defaults)

    if (options.voucherCode === null) {
      let msg = `Voucher Code argument must not be null`
      throw Error(msg)
    }
    if (typeof options.voucherCode !== 'string') {
      let msg = `Voucher Code argument needs to be a string`
      throw Error(msg)
    }
    if (typeof options.amount !== 'number') {
      let msg = `Amount argument needs to be a number`
      throw Error(msg)
    }
    if (options.amount === 0) {
      let msg = `Amount needs to be greater than zero`
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

  async redeem (voucherCode) {
    // console.log(await this.eth.balanceOf((await this.eth.getContract('ParatiiToken')).options.address, 'PTI'))
    let contract = await this.getVouchersContract()
    let tx = await contract.methods.redeem(voucherCode).send()
    try {
      let claimant = getInfoFromLogs(tx, 'LogRedeemVoucher', '_claimant')
      if (claimant === this.eth.config.accounts.address) {
        return true
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  }
}
