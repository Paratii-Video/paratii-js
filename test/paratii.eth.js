import { Paratii } from '../lib/paratii.js'
import { account, privateKey, account1, account99 } from './utils.js'
import { assert } from 'chai'

describe('paratii.eth API: :', function () {
  let paratii
  beforeEach(async function () {
    paratii = await Paratii({
      provider: 'http://localhost:8545',
      account: account,
      privateKey: privateKey
    })
    await paratii.eth.deployContracts()
  })

  it('getContracts() should return the contracts', async function () {
    let contracts = await paratii.eth.getContracts()
    assert.isOk(contracts.ParatiiAvatar)
  })

  it('getContract() should return the correct contract', async function () {
    let contract
    contract = await paratii.eth.getContract('ParatiiToken')
    assert.isOk(contract)
    contract = await paratii.eth.getContract('ParatiiRegistry')
    assert.isOk(contract)
  })

  it('balanceOf() should return the right balances', async function () {
    let balance

    // test ETH balance
    balance = await paratii.eth.balanceOf(account, 'ETH')
    assert.isOk(Number(balance) > 0)
    balance = await paratii.eth.balanceOf(account99, 'ETH')
    assert.equal(Number(balance), 0)

    // test PTI balance
    balance = await paratii.eth.balanceOf(account, 'PTI')
    assert.equal(Number(balance), 21e24)
    balance = await paratii.eth.balanceOf(account99, 'PTI')
    assert.equal(Number(balance), 0)

    // test without second arg - should return an array with info
    balance = await paratii.eth.balanceOf(account)
    assert.isOk(Number(balance.ETH) > 0)
    assert.equal(Number(balance.PTI), 21e24)
  })

  it('transfer ETH should work as expected', async function () {
    let beneficiary = account1
    let balance0 = await paratii.eth.balanceOf(beneficiary, 'ETH')
    let amount = paratii.web3.utils.toWei('3', 'ether')
    await paratii.eth.transfer(beneficiary, amount, 'ETH')
    let balance1 = await paratii.eth.balanceOf(beneficiary, 'ETH')
    assert.equal(balance1 - balance0, amount)
  })

  it('transfer PTI should work as expected', async function () {
    let beneficiary = account1
    let amount = paratii.web3.utils.toWei('3', 'ether')
    let balance0 = await paratii.eth.balanceOf(beneficiary, 'PTI')
    await paratii.eth.transfer(beneficiary, amount, 'PTI')
    let balance1 = await paratii.eth.balanceOf(beneficiary, 'PTI')
    assert.equal(balance1 - balance0, amount)
  })
})
