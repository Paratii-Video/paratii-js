import { assert } from 'chai'
import { Paratii } from '../src/paratii.js'
import { DB_PROVIDER } from './utils.js'
import nock from 'nock'
const { challengesResponse, challengesResponseForVideoId } = require('./data/fixtures')

describe('paratii.db.tcr API: :', function () {
  let paratii

  before(function () {
    nock.cleanAll()
    nock('https://db.paratii.video/api/v1')
    .persist()
    .get('/tcr/challenges/')
    // TODO: use videosResponse (from ./data/fixtures) instead of "videos" here
    .reply(200, challengesResponse)
    .get('/tcr/challenges/?videoId=video-id')
    .reply(200, challengesResponseForVideoId)
  })

  beforeEach(async function () {
    paratii = new Paratii({
      db: {provider: DB_PROVIDER}
    })
  })

  it('db.tcr.challenges.search() should work as expected', async function () {
    let data = await paratii.db.tcr.challenges.search()
    let check = data.total > 1
    assert.equal(check, true)
  })

  it('db.tcr.challenges.get(videoId) should work as expected', async function () {
    const videoId = 'video-id'
    let result = await paratii.db.tcr.challenges.get(videoId)
    assert.isOk(result.id)
  })
})
