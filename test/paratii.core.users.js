import Paratii from '../src/paratii.js'
import { assert } from 'chai'
import { DB_PROVIDER, testAccount } from './utils.js'
import nock from 'nock'
const users = require('./users-fixtures')

describe('paratii.users: ', function () {
  let paratii
  let newUserData = {
    id: '0xa99dBd162ad5E1601E8d8B20703e5A3bA5c00Be7',
    email: 'humbert@humbert.ru',
    ipfsHash: 'some-hash',
    name: 'Humbert Humbert'
  }
  let newUserId = '0xa99dBd162ad5E1601E8d8B20703e5A3bA5c00Be7'

  before(function () {
    nock('https://db.paratii.video/api/v1')
    .persist()
    .get('/users/' + users[0]['_id'])
    .reply(200, users[0])
  })

  beforeEach(async function () {
    paratii = new Paratii({
      eth: {provider: 'http://localhost:8545/rpc/'},
      account: testAccount,
      db: {provider: DB_PROVIDER}
    })
    await paratii.eth.deployContracts()
  })

  it('users.create() "name" is optional and can be empty', async function () {
    let result = await paratii.users.create({
      id: '0xa99dBd162ad5E1601E8d8B20703e5A3bA5c00Be7'
    })
    assert.equal(result, newUserId)
    result = await paratii.users.create({
      id: '0xa99dBd162ad5E1601E8d8B20703e5A3bA5c00Be7',
      name: ''
    })
    assert.equal(result, newUserId)
  })

  it('users.create() should work as expected', async function () {
    let result = await paratii.users.create(newUserData)
    assert.equal(result, newUserId)
  })

  it('users.get() should work as expected', async function () {
    let result = await paratii.users.get(newUserId)
    assert.deepEqual(result, users[0])
  })

  it('users.update() should work as expected', async function () {
    await paratii.users.create(newUserData)
    await paratii.users.update(newUserId, {name: 'John Doe'})
    let user = await paratii.eth.users.get(newUserId)
    assert.equal(user.name, 'John Doe')
  })
})
