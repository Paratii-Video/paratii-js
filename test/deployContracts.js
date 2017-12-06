
import { Paratii } from '../lib/paratii.js'
import { account, privateKey } from './utils.js'
import { assert } from 'chai'

describe('Paratii API:', function () {
  it('deployContracts should deploy and register all contracts', async function () {
    let paratii = new Paratii({
      // this address and key are the first accounts on testrpc when started with the --deterministic flag
      account,
      privateKey
    })

    let contracts = await paratii.eth.deployContracts()
    let paratiiRegistry = await paratii.eth.getContract('ParatiiRegistry')
    assert.equal(contracts.ParatiiRegistry.options.address, paratiiRegistry.options.address)

    let paratiiToken = await paratii.eth.getContract('ParatiiToken')
    assert.equal(contracts.ParatiiToken.options.address, paratiiToken.options.address)
  })
})
