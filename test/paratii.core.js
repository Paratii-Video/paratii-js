import { Paratii } from '../lib/paratii.js'
import { address, privateKey } from './utils.js'
import { assert } from 'chai'

describe('paratii.core API: :', function () {
  let paratii, paratiiCore
  let userId = address
  let userData = {
    id: userId,
    name: 'Humbert Humbert',
    email: 'humbert@humbert.ru',
    ipfsHash: 'some-hash'
  }
  beforeEach(async function () {
    paratii = await new Paratii({
      address: address,
      privateKey: privateKey
    })
    await paratii.eth.deployContracts()
    paratiiCore = paratii.core
  })

  it('should be configured', async function () {
    assert.isOk(paratiiCore)
    assert.isOk(paratiiCore.users)
    assert.isOk(paratiiCore.vids)
  })

  it('core.users.create() should work as expected', async function () {
    let result = await paratii.eth.users.create(userData)
    assert.equal(result, userId)
  })

  it('core.users.get() should work as expected', async function () {
    await paratii.eth.users.create(userData)
    let user = await paratii.eth.users.get(userId)
    assert.deepEqual(user, userData)
  })

  it('core.users.update() should work as expected', async function () {
    await paratii.eth.users.create(userData)
    await paratii.eth.users.update(userId, {ipfsHash: 'new-hash'})
    let user = await paratii.eth.users.get(userId)
    assert.equal(user.ipfsHash, 'new-hash')
  })
})
