
import { Paratii } from '../lib/paratii.js'
import { account } from './utils.js'

let assert = require('assert')

describe('Paratii API:', function () {
  it('deployContracts should deploy and register all contracts', async function () {
    let paratii = Paratii({
      // this address and key are the first accounts on testrpc when started with the --deterministic flag
      account: account,
      privateKey: '4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d'
    })

    let contracts = await paratii.deployContracts()
    let paratiiRegistry = await paratii.getContract('ParatiiRegistry')
    assert.equal(contracts.ParatiiRegistry.options.address, paratiiRegistry.options.address)

    let paratiiToken = await paratii.getContract('ParatiiToken')
    assert.equal(contracts.ParatiiToken.options.address, paratiiToken.options.address)
  })
})
