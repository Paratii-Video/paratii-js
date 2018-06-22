import nock from 'nock'
import { Paratii } from '../src/paratii.js'
import { testAccount } from './utils.js'

describe('Paratii API:', function () {
  it('diagnose() should run without errors', async function () {
    nock.cleanAll()
    nock('https://db.paratii.video/api/v1')
      .get(`/`)
      .reply(200, {})

    let paratii = new Paratii({account: testAccount})
    await paratii.eth.deployContracts()
    await paratii.diagnose()
  })
})
