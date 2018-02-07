import { Paratii } from '../lib/paratii.js'
import { address, privateKey, voucherCode11, voucherAmount11, voucherAmountInitial11, hashedVoucherCode11 } from './utils.js'
import { assert } from 'chai'

describe('paratii.eth.vouchers:', function () {
  let paratii

  beforeEach(async function () {
    paratii = await new Paratii({
      provider: 'http://localhost:8545',
      address: address,
      privateKey: privateKey
    })
    await paratii.eth.deployContracts()
    let token = await paratii.eth.getContract('ParatiiToken')
    let vouchers = await paratii.eth.getContract('Vouchers')
    let addressOfVouchers = vouchers.options.address
    await token.methods.transfer(addressOfVouchers, voucherAmountInitial11)
  })

  it('vouchers.add() should work as expected', async function () {
    let result = await paratii.eth.vouchers.add({ voucherCode: voucherCode11, amount: voucherAmount11 })
    assert.equal(hashedVoucherCode11, result)
  })

  it('vouchers.redeem() should work as expected', async function () {
    let newVoucher = await paratii.eth.vouchers.add({ voucherCode: voucherCode11, amount: voucherAmount11 })
    assert.isOk(paratii.eth.vouchers.redeem(newVoucher))
  })

  it('vouchers.redeem() should fail on used code', async function () {
    let newVoucher = await paratii.eth.vouchers.add({ voucherCode: voucherCode11, amount: voucherAmount11 })
    await paratii.eth.vouchers.redeem(newVoucher)
    assert.isNotOk(await paratii.eth.vouchers.redeem(newVoucher))
  })
})
