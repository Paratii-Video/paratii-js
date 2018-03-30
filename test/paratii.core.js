import { Paratii } from '../lib/paratii.js'
import { testAccount } from './utils.js'
import { assert } from 'chai'

describe('paratii.core API: :', function () {
  let paratii, paratiiCore
  beforeEach(async function () {
    paratii = new Paratii({account: testAccount})
    await paratii.eth.deployContracts()
    paratiiCore = paratii.core
  })

  it('should be configured', async function () {
    assert.isOk(paratiiCore)
    assert.isOk(paratiiCore.users)
    assert.isOk(paratiiCore.vids)
  })
})
