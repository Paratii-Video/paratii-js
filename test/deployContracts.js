
import { Paratii } from '../lib/paratii.js'
import { testAccount } from './utils.js'
import { assert } from 'chai'

describe('deployContracts:', function () {
  it('should deploy and register all contracts', async function () {
    let paratii = new Paratii({account: testAccount})

    let contracts = await paratii.eth.deployContracts()
    let paratiiRegistry = await paratii.eth.getContract('Registry')
    assert.equal(contracts.Registry.options.address, paratiiRegistry.options.address)
    let paratiiToken = await paratii.eth.getContract('ParatiiToken')
    assert.equal(contracts.ParatiiToken.options.address, paratiiToken.options.address)
  })

  it('deployContracts should not get confused if a registry address was already given', async function () {
    let paratii = new Paratii({account: testAccount})
    await paratii.eth.deployContracts()
    await paratii.eth.deployContracts()
    assert.equal(paratii.config.eth.registryAddress, (await paratii.eth.getContract('Registry')).options.address)
  })
})
