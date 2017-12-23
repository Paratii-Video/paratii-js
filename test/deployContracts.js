
import { Paratii } from '../lib/paratii.js'
import { address, privateKey } from './utils.js'
import { assert } from 'chai'

describe('Paratii API:', function () {
  it('deployContracts should deploy and register all contracts', async function () {
    let paratii = new Paratii({
      // this address and key are the first accounts on testrpc when started with the --deterministic flag
      address,
      privateKey
    })
    let contracts = await paratii.eth.deployContracts()
    let paratiiRegistry = await paratii.eth.getContract('Registry')
    assert.equal(contracts.Registry.options.address, paratiiRegistry.contractAddress)
    let paratiiToken = await paratii.eth.getContract('ParatiiToken')
    assert.equal(contracts.ParatiiToken.options.address, paratiiToken.contractAddress)
  })
})
