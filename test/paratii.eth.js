import Paratii from '../lib/paratii.js'
import { address, privateKey, address1 } from './utils.js'
import { assert } from 'chai'

describe('paratii.eth API: :', function () {
  let paratii
  beforeEach(async function () {
    paratii = new Paratii({
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

    contract = await paratii.eth.getContract('Registry')
    assert.isOk(contract.options.address)
    registryAddress = contract.options.address
    contract = await paratii.eth.getContract('Avatar')
    assert.isOk(contract.options.address)

    contracts = await paratii.eth.getContracts()
    // assert.isOk(contracts.Avatar.options.address)
    assert.isOk(contracts.Registry.options.address)

    // If Paratii was created with a registeryAddress, addresses of other contracts should be known
    paratii = new Paratii({
      registryAddress: registryAddress
    })

    contract = await paratii.eth.getContract('Registry')
    assert.isOk(contract.options.address)

    contracts = await paratii.eth.getContracts()
    assert.isOk(contracts.Avatar.options.address)
    assert.isOk(contracts.Registry.options.address)

    // if the reigstryAddress was set at a later stage, using parati.eth.setRegistryAddress
    paratii = new Paratii({
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

  it('getContract() should return set and update the from address on the contract', async function () {
    let contract
    contract = await paratii.eth.getContract('ParatiiToken')
    assert.equal(contract.options.from, address)
    await paratii.setAccount(address1)
    contract = await paratii.eth.getContract('ParatiiToken')
    assert.equal(contract.options.from, address1)
  })

  it.skip('getcontract() should return a meaningful error if the address of the contract is not known', async function () {
    let registry = await paratii.eth.getContract('Registry')
    // the next line does not update the get contract address
    await registry.methods.registerAddress('Videos', '').send()
    assert.equal(await registry.methods.getContract('Videos').options.address, '0x0000000000000000000000000000000000000000')

    await paratii.eth.vids.get('some-id')
  })
  it('balanceOf() should return the right balances', async function () {
    let balance

    paratii.eth.web3.eth.accounts.wallet.clear()
    let accounts = await paratii.eth.wallet.create(5)
    let beneficiary = accounts[0].address
    // test ETH balance
    balance = await paratii.eth.balanceOf(address, 'ETH')
    assert.isOk(Number(balance) > 0)
    balance = await paratii.eth.balanceOf(beneficiary, 'ETH')
    assert.equal(Number(balance), 0)
    // test PTI balance
    balance = await paratii.eth.balanceOf(address, 'PTI')
    assert.equal(Number(balance), 21e24)
    balance = await paratii.eth.balanceOf(beneficiary, 'PTI')
    assert.equal(Number(balance), 0)

    // test without second arg - should return an array with info
    balance = await paratii.eth.balanceOf(address)
    assert.isOk(Number(balance.ETH) > 0)
    assert.equal(Number(balance.PTI), 21e24)
  })

  it('transfer ETH should work as expected', async function () {
    let beneficiary = address1
    let balance0 = await paratii.eth.balanceOf(beneficiary, 'ETH')
    let amount = paratii.eth.web3.utils.toWei('3', 'ether')
    await paratii.eth.transfer(beneficiary, amount, 'ETH', 'thanks for all the fish')
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

  it('deployContracts should update the contract information', async function () {
    let contracts = await paratii.eth.deployContracts()
    assert.equal(contracts.Registry.options.address, (await paratii.eth.getContract('Registry')).options.address)
    let registry = contracts.Registry
    let videosAddress = await registry.methods.getContract('Videos').call()
    assert.equal(contracts.Videos.options.address, videosAddress)
    // assert.equal(contracts.Videos.options.address, (await paratii.eth.getContract('Registry')).options.address)
  })
  it('deployContract should throw a sensible error if address is not set', async function () {
    paratii = await new Paratii()
    await assert.isRejected(paratii.eth.deployContract('ParatiiToken'), Error, 'You need an Ethereum account')
  })
})
