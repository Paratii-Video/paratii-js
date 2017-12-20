import { Paratii } from '../lib/paratii.js'
import { assert } from 'chai'

describe('paratii.core API: :', function () {
  let paratii, paratiiCore
  beforeEach(function () {
    paratii = new Paratii({
    })
    paratiiCore = paratii.core
  })

  it('should be configured', async function () {
    assert.isOk(paratiiCore)
  })

  it.skip('core.videos.create() should work as expected', async function () {
  })

  it.skip('core.videos.get() should work as expected', async function () {
  })

  it.skip('db.videos.search() should work as expected', async function () {
  })

  it.skip('core.users.create() should work as expected', async function () {
  })

  it.skip('core.users.get() should work as expected', async function () {
  })
})
