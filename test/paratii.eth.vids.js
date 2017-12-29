import { Paratii } from '../lib/paratii.js'
import { address, address1, privateKey } from './utils.js'
import { assert } from 'chai'

describe('paratii.eth.vids:', function () {
  let paratii

  beforeEach(async function () {
    paratii = await new Paratii({
      provider: 'http://localhost:8545',
      address: address,
      privateKey: privateKey
    })
    await paratii.eth.deployContracts()
  })

  it('vids.create(),  .get(), .update() and .delete() should work', async function () {
    let price = 3 * 10 ** 18
    let ipfsHash = 'xyz'
    let ipfsData = 'zzz'
    let videoId = 'some-id'
    let vid

    let result = await paratii.eth.vids.create({
      id: videoId,
      price: price,
      owner: address1,
      ipfsHash: ipfsHash,
      ipfsData: ipfsData
    })
    assert.equal(videoId, result)

    vid = await paratii.eth.vids.get(videoId)
    assert.equal(vid.price, price)
    assert.equal(vid.ipfsHash, ipfsHash)

    vid = await paratii.eth.vids.update(videoId, {ipfsHash: 'new-hash'})
    assert.equal(vid.price, price)
    assert.equal(vid.ipfsHash, 'new-hash')

    await paratii.eth.vids.delete(videoId)

    vid = await paratii.eth.vids.get(videoId)
    assert.equal(vid.ipfsHash, '') // or should we raise an error?
    assert.equal(vid.price, 0) // or should we raise an error?
  })

  it.skip('vids.create() should throw meaningful errors', async function () {
    let vids = paratii.eth.vids
    await assert.isRejected(vids.create({}), Error, 'No id was given')
  })

  it.skip('vids.create() should create a fresh id if no id wat provided', async function () {

  })
})
