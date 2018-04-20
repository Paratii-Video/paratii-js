import { assert } from 'chai'
import { Paratii } from '../src/paratii.js'
import { DB_PROVIDER } from './utils.js'
import nock from 'nock'
const videos = require('./data/fixtures')

describe('paratii.db API: :', function () {
  let paratii

  before(function () {
    nock.cleanAll()
    nock('https://db.paratii.video/api/v1')
    .persist()
    .get('/videos/?keyword=keyword')
    .reply(200, videos)
    .get('/videos/')
    .reply(200, videos)
    .get('/videos/?owner=0x9e2d04eef5b16CFfB4328Ddd027B55736407B275&keyword=keyword')
    .reply(200, videos)
    .get('/videos/QmNZS5J3LS1tMEVEP3tz3jyd2LXUEjkYJHyWSuwUvHDaRJ')
    .reply(200, videos[0])
  })

  beforeEach(async function () {
    paratii = new Paratii({
      db: {provider: DB_PROVIDER}
    })
  })

  it('db.vids.search("keyword") should work as expected', async function () {
    let data = await paratii.db.vids.search({'keyword': 'keyword'})
    let check = data.length > 1
    assert.equal(check, true)
  })

  it('db.vids.search() should work as expected', async function () {
    let data = await paratii.db.vids.search()
    let check = data.length > 1
    assert.equal(check, true)
  })

  it('db.vids.search({owner: }) should work as expected', async function () {
    let data = await paratii.db.vids.search({owner: '0x9e2d04eef5b16CFfB4328Ddd027B55736407B275', keyword: 'keyword'})
    let check = data.length > 1
    assert.equal(check, true)
  })

  it('db.vids.get(videoid) should work as expected', async function () {
    let videoid = 'QmNZS5J3LS1tMEVEP3tz3jyd2LXUEjkYJHyWSuwUvHDaRJ'
    let data = await paratii.db.vids.get(videoid)
    let check = data._id === videoid
    assert.equal(check, true)
  })

  it('should be available as an attribute on Paratii instances', async function () {
    let paratii = new Paratii({
      db: {provider: DB_PROVIDER}
    })
    assert.isOk(paratii.db)
  })
})
