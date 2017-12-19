import { Paratii } from '../lib/paratii.js'
import { address, privateKey } from './utils.js'
import { assert } from 'chai'

describe('paratii.eth.users: :', function () {
  let paratii
  beforeEach(async function () {
    paratii = await new Paratii({
      provider: 'http://localhost:8545',
      address: address,
      privateKey: privateKey
    })
    await paratii.eth.deployContracts()
  })

  it('users.create(),  .get(), .update() and .delete() should work', async function () {
    let userId = address
    let user
    let userData = {
      id: userId,
      name: 'Humbert Humbert',
      email: 'humbert@humbert.ru',
      ipfsHash: 'some-hash'
    }
    let result = await paratii.eth.users.create(userData)

    assert.equal(result, userId)

    user = await paratii.eth.users.get(userId)
    assert.deepEqual(user, userData)

    await paratii.eth.users.update(userId, {ipfsHash: 'new-hash'})
    user = await paratii.eth.users.get(userId)
    assert.equal(user.ipfsHash, 'new-hash')

    await paratii.eth.users.delete(userId)

    user = await paratii.eth.users.get(userId)
    assert.equal(user.ipfsHash, '')
  })

  it.skip('missing or wrong arguments in users.create() should trhow meaningful errors', async function () {
    // let result = await paratii.eth.users.create({
    //   id: userId,
    //   owner: address1
    //   // price: price,
    //   // ipfsHash: 'some-hash'
    // })
  })
})
