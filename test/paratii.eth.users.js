import { Paratii } from '../lib/paratii.js'
import { account, privateKey } from './utils.js'

describe('paratii.eth.users: :', function () {
  let paratii
  beforeEach(async function () {
    paratii = await new Paratii({
      provider: 'http://localhost:8545',
      account: account,
      privateKey: privateKey
    })
    await paratii.eth.deployContracts()
  })

  it.skip('users.create(),  .get(), .update() and .delete() should work', async function () {
    // cf the tests in paratii.eth.vids.js

  })
})
