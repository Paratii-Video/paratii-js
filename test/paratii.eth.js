import { Paratii } from '../lib/paratii.js'
import { address, privateKey, address1, address99 } from './utils.js'
import { assert } from 'chai'

describe('paratii.eth API: :', function () {
  let paratii
  beforeEach(async function () {
    paratii = await new Paratii({
      provider: 'http://localhost:8545/rpc/',
      address: address,
      privateKey: privateKey
    })
    await paratii.eth.deployContracts()
  })

  it('getContracts() should return the contracts', async function () {
    let contracts = await paratii.eth.getContracts()
    assert.isOk(contracts.Avatar)
  })

  it('contracts should have their address set', async function () {
    let contract, contracts, registryAddress

    // After .deployContracts() was called, all addresses should be known
    contract = await paratii.eth.getContract('Registry')
    assert.isOk(contract.options.address)
    registryAddress = contract.options.address
    contract = await paratii.eth.getContract('Avatar')
    assert.isOk(contract.options.address)

    contracts = await paratii.eth.getContracts()
    assert.isOk(contracts.Avatar.options.address)
    assert.isOk(contracts.Registry.options.address)

    // If Paratii was created with a registeryAddress, addresses of other contracts should be known
    paratii = await new Paratii({
      provider: 'http://localhost:8545',
      registryAddress: registryAddress
    })

    contract = await paratii.eth.getContract('Registry')
    assert.isOk(contract.options.address)

    contracts = await paratii.eth.getContracts()
    assert.isOk(contracts.Avatar.options.address)
    assert.isOk(contracts.Registry.options.address)

    // if the reigstryAddress was set at a later stage, using parati.eth.setRegistryAddress
    paratii = await new Paratii({
      provider: 'http://localhost:8545'
    })

    contract = await paratii.eth.getContract('Registry')
    assert.isNotOk(contract.options.address)

    await paratii.eth.setRegistryAddress(registryAddress)
    contract = await paratii.eth.getContract('Registry')
    assert.isOk(contract.options.address)

    contracts = await paratii.eth.getContracts()
    assert.isOk(contracts.Avatar.options.address)
    assert.isOk(contracts.Registry.options.address)
  })

  it('getContract() should return the correct contract', async function () {
    let contract
    contract = await paratii.eth.getContract('ParatiiToken')
    assert.isOk(contract)
    contract = await paratii.eth.getContract('Registry')
    assert.isOk(contract)
  })

  it('balanceOf() should return the right balances', async function () {
    let balance

    // test ETH balance
    console.log('1')
    balance = await paratii.eth.balanceOf(address, 'ETH')
    assert.isOk(Number(balance) > 0)
    console.log(balance)
    console.log('2')
    balance = await paratii.eth.balanceOf(address99, 'ETH')
    assert.equal(Number(balance), 0)
    console.log('3')
    // test PTI balance
    // balance = await paratii.eth.balanceOf(address, 'PTI')
    // assert.equal(Number(balance), 21e24)
    // balance = await paratii.eth.balanceOf(address99, 'PTI')
    // assert.equal(Number(balance), 0)
    //
    // // test without second arg - should return an array with info
    // balance = await paratii.eth.balanceOf(address)
    // assert.isOk(Number(balance.ETH) > 0)
    // assert.equal(Number(balance.PTI), 21e24)
  })

  it('transfer ETH should work as expected', async function () {
    let beneficiary = address1
    let balance0 = await paratii.eth.balanceOf(beneficiary, 'ETH')
    let amount = paratii.eth.web3.utils.toWei('3', 'ether')
    await paratii.eth.transfer(beneficiary, amount, 'ETH')
    let balance1 = await paratii.eth.balanceOf(beneficiary, 'ETH')
    assert.equal(balance1 - balance0, amount)
  })

  it('transfer PTI should work as expected', async function () {
    let beneficiary = address1
    let amount = paratii.eth.web3.utils.toWei('3', 'ether')
    let balance0 = await paratii.eth.balanceOf(beneficiary, 'PTI')
    await paratii.eth.transfer(beneficiary, amount, 'PTI')
    let balance1 = await paratii.eth.balanceOf(beneficiary, 'PTI')
    assert.equal(balance1 - balance0, amount)
  })

  it('subscription to Tranfer PTI events should work as expected', async function () {
    // let beneficiary = address1
    // let amount = paratii.eth.web3.utils.toWei('3', 'ether')
    // let balance0 = await paratii.eth.balanceOf(beneficiary, 'PTI')
    // await paratii.eth.transfer(beneficiary, amount, 'PTI')
    // let balance1 = await paratii.eth.balanceOf(beneficiary, 'PTI')
    // assert.equal(balance1 - balance0, amount)
    await paratii.eth.subscribe('newBlockHeaders', {})
  })

  it('deployContract should throw a sensible error if address is not set', async function () {
    paratii = new Paratii()
    await assert.isRejected(paratii.eth.deployContract('ParatiiToken'), Error, 'No Ethereum address was set')
    await assert.isRejected(paratii.eth.deployContract('ParatiiToken'), Error, 'No Ethereum address was set')
  })
})
