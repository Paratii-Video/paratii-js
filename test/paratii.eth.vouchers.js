import { Paratii } from '../lib/paratii.js'
import { address, privateKey, voucherCode11, voucherAmount11, voucherAmountInitial11, hashedVoucherCode11 } from './utils.js'
import { assert } from 'chai'

describe('paratii.eth.vouchers:', function () {
  let paratii

  beforeEach(async function () {
    paratii = new Paratii({
      // provider: 'http://localhost:8545',
      address: address,
      privateKey: privateKey
    })
    await paratii.eth.deployContracts()
    let token = await paratii.eth.getContract('ParatiiToken')
    let vouchers = await paratii.eth.getContract('Vouchers')
    await token.methods.transfer(vouchers.options.address, voucherAmountInitial11).send()
  })

  it('vouchers.create() should work as expected', async function () {
    let result = await paratii.eth.vouchers.create({ voucherCode: voucherCode11, amount: voucherAmount11 })
    assert.equal(hashedVoucherCode11, result)
  })

  it('vouchers.redeem() should work as expected', async function () {
    await paratii.eth.vouchers.create({ voucherCode: voucherCode11, amount: voucherAmount11 })
    assert.isOk(await paratii.eth.vouchers.redeem(voucherCode11))
  })

  it('vouchers.redeem() should fail on used code (and with a meaningful error)', async function () {
    await paratii.eth.vouchers.create({ voucherCode: voucherCode11, amount: voucherAmount11 })
    await paratii.eth.vouchers.redeem(voucherCode11)
    assert.isRejected(paratii.eth.vouchers.redeem(voucherCode11), Error, /This voucher was already used/g)
  })

  it('vouchers.create() should fail on invalid data', async function () {
    assert.isRejected(paratii.eth.vouchers.create({ voucherCode: null, amount: voucherAmount11 }))
    assert.isRejected(paratii.eth.vouchers.create({ voucherCode: 123, amount: voucherAmount11 }))
    assert.isRejected(paratii.eth.vouchers.create({ voucherCode: voucherCode11, amount: 'test' }))
    assert.isRejected(paratii.eth.vouchers.create({ voucherCode: voucherCode11, amount: 0 }))
  })

  it('vouchers.redeem() should throw meaningful errors on failure', async function () {
    await paratii.eth.vouchers.create({ voucherCode: voucherCode11, amount: voucherAmount11 * 10 })
    assert.isRejected(paratii.eth.vouchers.redeem(voucherCode11), Error, /The Vouchers contract doesn't have enough PTI to redeem the voucher/g)
    await paratii.eth.vouchers.create({ voucherCode: voucherCode11, amount: voucherAmount11 })
    await paratii.eth.vouchers.redeem(voucherCode11)
    assert.isRejected(paratii.eth.vouchers.redeem(voucherCode11), Error, /This voucher was already used/g)
    assert.isRejected(paratii.eth.vouchers.redeem('blah-blah-blah'), Error, /This voucher doesn't exist/g)
  })

  it('vouchers.createVouchers() should work as expected', async function () {
    let vouchers = await paratii.eth.vouchers.createVouchers(10, voucherAmount11 / 10)
    assert.equal(vouchers.length, 10)
  })
})
