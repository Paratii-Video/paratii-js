import { Paratii } from '../lib/paratii.js'
import { assert } from 'chai'

describe('paratii.db API: :', function () {
  let paratii
  let dbProvider = 'http://localhost:3000'
  beforeEach(async function () {
    paratii = await new Paratii({
      'db.provider': dbProvider
    })

    // console.log(paratii)
  })

  it('should be configured', async function () {
    assert.equal(paratii.config['db.provider'], dbProvider)
  })

  it('db.vids.get() should work as expected', async function () {
    let data = await paratii.db.vids.get()
    console.log(data)
  })

  it.skip('db.users.get() should work as expected', async function () {
  })

  it('db.vids.search() should work as expected', async function () {
  })

  it('should be available as an attribute on Paratii instances', function () {
    let paratii = new Paratii({
      'db.provider': dbProvider
    })
    assert.isOk(paratii.db)
  })
})
