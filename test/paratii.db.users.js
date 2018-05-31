import { assert } from 'chai'
import { Paratii } from '../src/paratii.js'
import { DB_PROVIDER } from './utils.js'
import nock from 'nock'

describe('paratii.db API: :', function () {
  let paratii

  before(function () {
    nock.cleanAll()
    nock('https://db.paratii.video/api/v1')
      .persist()
    this.nock = nock
  })

  beforeEach(async function () {
    paratii = new Paratii({
      db: {provider: DB_PROVIDER}
    })
  })

  it('db.users.setEmail should work as expected', async function () {
    // you can perform a POST request to /users/:id/ with the email value set as body variable.
    const userId = 'some-id'
    const userRecord = {
      id: userId,
      name: 'my name'
    }
    const email = 'some@email.com'
    const signer = paratii.eth.getAccount()
    const signature = paratii.eth.distributor.signMessage(email)
    const expectedBody = `email=${email}&signedEmail=${signature}&whosigned=${signer}`
    nock('https://db.paratii.video/api/v1')
      .persist()
      .post(`/users/${userId}`, expectedBody)
      .reply(200, userRecord)
    let data = await paratii.db.users.setEmail(userId, email)
    assert.equal(data.id, userId)
  })
})
