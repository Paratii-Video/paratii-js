import { Paratii } from '../src/paratii.js'
import { testAccount } from './utils.js'

describe('Paratii API:', function () {
  it('diagnose() should run without errors', async function () {
    let paratii = new Paratii({account: testAccount})
    await paratii.eth.deployContracts()
    await paratii.diagnose()
  })
})
