import { Paratii } from '../lib/paratii.js'
import { account } from './utils.js'
let assert = require('assert')

describe('Paratii API:', function () {
  it('paratii.config should return the configuration with default values', async function () {
    let privateKey = '4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d'
    let paratii = Paratii({
      // this address and key are the first accounts on testrpc when started with the --deterministic flag
      account: account,
      privateKey: privateKey
    })

    let expected = {
      account,
      privateKey,
      provider: 'http://localhost:8545',
      registryAddress: null
    }
    assert.deepEqual(paratii.config, expected)
  })
})
