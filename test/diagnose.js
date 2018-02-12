import { Paratii } from '../lib/paratii.js'
import { address, privateKey } from './utils.js'

describe('Paratii API:', function () {
  it('diagnose() should run without errors', async function () {
    let paratii = await new Paratii({
      // this address and key are the first accounts on testrpc when started with the --deterministic flag
      address,
      privateKey
    })

    await paratii.eth.deployContracts()
    await paratii.diagnose()
  })
})
