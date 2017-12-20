import { ParatiiDb } from '../lib/paratii.js'
import { assert } from 'chai'

describe('paratii.db API: :', function () {
  let paratiiDb
  let dbProvider = 'https://mock'
  beforeEach(function () {
    paratiiDb = new ParatiiDb({
      'db.provider': dbProvider
    })
  })

  it('should be configured', async function () {
    assert.equal(paratiiDb.config['db.provider'], dbProvider)
  })

  it.skip('db.videos.get() should work as expected', async function () {
  })

  it.skip('db.users.get() should work as expected', async function () {
  })

  it.skip('db.videos.search() should work as expected', async function () {
  })
})
