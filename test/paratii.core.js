import { Paratii } from '../lib/paratii.js'
import { address, privateKey } from './utils.js'
import { assert } from 'chai'

describe('paratii.core API: :', function () {
  let paratii, paratiiCore
  beforeEach(function () {
    paratii = new Paratii({
      address: address,
      privateKey: privateKey
    })
    paratiiCore = paratii.core
  })

  it('should be configured', async function () {
    assert.isOk(paratiiCore)
    assert.isOk(paratiiCore.users)
    assert.isOk(paratiiCore.vids)
  })

  it.skip('core.users.create() should work as expected', async function () {
  })

  it.skip('core.users.get() should work as expected', async function () {
  })
})
