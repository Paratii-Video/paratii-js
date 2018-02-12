import { Paratii } from '../lib/paratii.js'
import { address, address1, privateKey } from './utils.js'
import { assert } from 'chai'

describe('paratii.eth.vids:', function () {
  let paratii

  beforeEach(async function () {
    paratii = new Paratii({
      provider: 'http://localhost:8545',
      address: address,
      privateKey: privateKey
    })
    await paratii.eth.deployContracts()
  })

  it('vids.create(),  .get(), .update() and .delete() should work', async function () {
    let price = 3 * 10 ** 18
    let ipfsHashOrig = 'ipfshashOrig2'
    let ipfsHash = 'ipfsHash2'
    let ipfsData = 'ipfsData2'
    let vid
    let videoId
    videoId = 'some-id'

    let result = await paratii.eth.vids.create({
      id: videoId,
      price: price,
      owner: address1,
      ipfsHashOrig: ipfsHashOrig,
      ipfsHash: ipfsHash,
      ipfsData: ipfsData
    })
    assert.equal(videoId, result)

    vid = await paratii.eth.vids.get(videoId)

    assert.equal(vid.price, price)
    assert.equal(vid.ipfsHash, ipfsHash)
    assert.equal(vid.ipfsHashOrig, ipfsHashOrig)

    vid = await paratii.eth.vids.update(videoId, {ipfsHash: 'new-hash'})
    assert.equal(vid.price, price)
    assert.equal(vid.ipfsHash, 'new-hash')

    await paratii.eth.vids.delete(videoId)

    assert.isRejected(paratii.eth.vids.get(videoId), Error, 'No video')
  })

  it('vids.create() should create a fresh id if non is given', async function () {
    let videoId = await paratii.eth.vids.create({
      owner: address1
    })
    assert.isOk(videoId)
    assert.equal(videoId.length, 12)
  })

  it('vids.get() should return an error if no video was found', async function () {
    assert.isRejected(paratii.eth.vids.get('thisviddoesnotexist'), Error, 'No video')
  })

  it.skip('vids.create() should throw meaningful errors', async function () {
    let vids = paratii.eth.vids
    await assert.isRejected(vids.create({}), Error, 'No id was given')
  })
})
