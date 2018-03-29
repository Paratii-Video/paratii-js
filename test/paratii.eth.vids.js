import { Paratii } from '../lib/paratii.js'
import { address, address1, privateKey } from './utils.js'
import { assert } from 'chai'

describe('paratii.eth.vids:', function () {
  let paratii

  beforeEach(async function () {
    paratii = new Paratii({
      'eth.provider': 'http://localhost:8545',
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
  let videoData1 = {
    id: '1',
    owner: address1
  }
  let videoData2 = {
    id: '2',
    owner: address1
  }
  let videoData3 = {
    id: '3',
    owner: address1
  }

  it('vids.create should not raise "Transaction hash was already imported"', async function () {
    //  sending the same transaction twice gives a "Transaction hash was already imported"
    // that should be caught
    await Promise.all([
      paratii.eth.vids.create(videoData1),
      paratii.eth.vids.create(videoData1)
    ])
  })

  // FIXME: this test runs locally  for me (<- Jelle), but not  on circle.
  it.skip('vids.create should not raise "transaction nonce is too low" if we send two transactions', async function () {
    // we expect an error if we call the fynction with retry set to 0
    try {
      await Promise.all([
        paratii.eth.vids.create(videoData1, 0),
        paratii.eth.vids.create(videoData2, 0),
        paratii.eth.vids.create(videoData3, 0)
      ])
    } catch (err) {
      //   // console.log(err.message)
      // assert.isOk(/Transaction nonce is too low/.exec(err.message))
    }

    // but default behavior is that no error is thrown
    await Promise.all([
      paratii.eth.vids.create(videoData1),
      paratii.eth.vids.create(videoData2)
      // paratii.eth.vids.create(videoData3)
    ])
  })
})
