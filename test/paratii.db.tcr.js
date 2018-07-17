import { assert } from 'chai'
import { Paratii } from '../src/paratii.js'
import { DB_PROVIDER } from './utils.js'
import nock from 'nock'
const { challengesResponse, challengesResponseForVideoId, votesResponse, votesResponseOneResult } = require('./data/fixtures')

describe('paratii.db.tcr API: :', function () {
  let paratii

  before(function () {
    nock.cleanAll()
    nock('https://db.paratii.video/api/v1')
    .persist()
    .get('/challenges/')
    .reply(200, challengesResponse)
    .get('/challenges/?videoId=video-id')
    .reply(200, challengesResponseForVideoId)
    .get('/votes/')
    // TODO: use videosResponse (from ./data/fixtures) instead of "videos" here
    .reply(200, votesResponse)
    .get(`/votes/?pollID=0x12244&voter=0x122344`)
    .reply(200, votesResponseOneResult)
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

  it('db.tcr.votes.search() should work as expected', async function () {
    let data = await paratii.db.tcr.votes.search()
    let check = data.total > 1
    assert.equal(check, true)
  })

  it('db.tcr.votes.get(challengeId, userAddress) should work as expected', async function () {
    const challengeId = '0x12244'
    const userAddress = '0x122344'
    let result = await paratii.db.tcr.votes.get(challengeId, userAddress)
    assert.isOk(result.id)
  })
})
