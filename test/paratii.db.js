import { Paratii } from '../lib/paratii.js'
import { assert } from 'chai'
import nock from 'nock'
const videos = require('./data/fixtures')

describe('paratii.db API: :', function () {
  let paratii
  let dbProvider = 'https://db.paratii.video'

  before(function () {
    nock.cleanAll()

    nock('https://db.paratii.video/api/v1')
    .persist()
    .get('/videos/')
    .query({s: 'keyword'})
    .reply(200, videos[0])
    .get('/videos/')
    .reply(200, videos)
    .get('/videos/?s=foo')
    .reply(200, videos[0])
    .get('/videos/QmNZS5J3LS1tMEVEP3tz3jyd2LXUEjkYJHyWSuwUvHDaRJ')
    .reply(200, videos[0])
  })
  beforeEach(async function () {
    paratii = await new Paratii({
      'db.provider': dbProvider
    })
  })

  it('should be configured', async function () {
    assert.equal(paratii.config['db.provider'], dbProvider)
  })

  it('db.vids.search("keyword") should work as expected', async function () {
    let videoid = 'QmNZS5J3LS1tMEVEP3tz3jyd2LXUEjkYJHyWSuwUvHDaRJ'
    let data = await paratii.db.vids.search('keyword')
    let check = data._id === videoid
    assert.equal(check, true)
  })

  it('db.vids.search() should work as expected', async function () {
    let data = await paratii.db.vids.search()
    let check = data.length > 1
    assert.equal(check, true)
  })

  it('db.vids.get(videoid) should work as expected', async function () {
    let videoid = 'QmNZS5J3LS1tMEVEP3tz3jyd2LXUEjkYJHyWSuwUvHDaRJ'
    let data = await paratii.db.vids.get(videoid)
    let check = data._id === videoid
    assert.equal(check, true)
  })

  it('should be available as an attribute on Paratii instances', function () {
    let paratii = new Paratii({
      'db.provider': dbProvider
    })
    assert.isOk(paratii.db)
  })
})
