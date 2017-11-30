import { Paratii } from '../lib/paratii.js'
import { account } from './utils.js'

describe('Paratii API:', function () {
  it('diagnose() should run without errors', async function () {
    let paratii = Paratii({
      // this address and key are the first accounts on testrpc when started with the --deterministic flag
      account: account,
      privateKey: '4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d'
    })

    await paratii.deployContracts()
    await paratii.diagnose()
  })
})
