import { Paratii } from '../lib/paratii.js'
import { assert } from 'chai'
import { address, privateKey } from './utils.js'
import nock from 'nock'
const users = require('./data/users-fixtures')
const videos = require('./data/fixtures')

describe('paratii.core.users: ', function () {
  let paratii
  let newUserData = {
		id: '0xa99dBd162ad5E1601E8d8B20703e5A3bA5c00Be7',
		email: 'humbert@humbert.ru',
		ipfsHash: 'some-hash',
		name: 'Humbert Humbert' 
	}
	let newUserId = '0xa99dBd162ad5E1601E8d8B20703e5A3bA5c00Be7'
  let dbProvider = 'https://db.paratii.video'

  before(function () {
    nock.cleanAll()

    nock('https://db.paratii.video/api/v1')
    .persist()
    .get('/users/' + users[0]['_id'])
    .reply(200, users[0])
  })
  beforeEach(async function () {
    paratii = await new Paratii({
      provider: 'http://localhost:8545/rpc/',
      address: address,
      privateKey: privateKey,
      'db.provider': dbProvider
    })
    await paratii.eth.deployContracts()
  })

  it('should be configured', async function () {
    assert.equal(paratii.config['db.provider'], dbProvider)
  })

  it('core.users.create() should work as expected', async function () {
    let result = await paratii.core.users.create(newUserData)
	assert.equal(result, newUserId)
  })

  it('core.users.get() should work as expected', async function () {
    let result = await paratii.core.users.get(newUserId)
	assert.deepEqual(result, users[0])
  })

  it('core.users.update() should work as expected', async function () {
    await paratii.core.users.create(newUserData)
    await paratii.core.users.update(newUserId, {name: 'John Doe'})
    let user = await paratii.eth.users.get(newUserId)
    assert.equal(user.name, 'John Doe')
  })
})
