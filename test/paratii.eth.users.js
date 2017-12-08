import { Paratii } from '../lib/paratii.js'
import { account, privateKey } from './utils.js'
import { assert } from 'chai'

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

  it.skip('users.registerUser() should work', async function () {
    assert.isOk(true)
  })

  it.skip('users.unregisterUser() should work', async function () {
  })
  it.skip('users.updateUser() should work', async function () {
  })
})
