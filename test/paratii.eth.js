import { Paratii } from '../lib/paratii.js'
import { account, privateKey, account1 } from './utils.js'
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

  it('getBalance() should return the right balances', async function () {
    let balance
    balance = await paratii.eth.getBalance(account, 'ETH')
    assert.isOk(Number(balance) > 0)
    balance = await paratii.eth.getBalance(account1, 'ETH')
    assert.isOk(Number(balance) > 0)
  })

  it('sendETH should send Ether', async function () {
    let beneficiary = account1
    let amount = paratii.web3.utils.toWei('3', 'ether')
    await paratii.eth.sendETH(beneficiary, amount)
    // TODO: check balance before and after
  })

  it('sendPTI should send PTI', async function () {
    let beneficiary = account1
    let amount = paratii.web3.utils.toWei('3', 'ether')

    await paratii.eth.sendPTI(beneficiary, amount)
    // TODO: check balance before and after
  })
})
