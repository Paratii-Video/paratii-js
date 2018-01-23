import { Paratii } from '../lib/paratii.js'
import { assert } from 'chai'
import { address, address1, privateKey } from './utils.js'

describe('paratii.core.vids:', function () {
  let paratii
  let videoFile = 'test/data/some-file.txt'
  let videoId = 'some-id'
  let ipfsHash = 'some-hash'
  let videoTitle = 'some title'
  beforeEach(async function () {
    paratii = new Paratii({
      address: address,
      privateKey: privateKey
    })
    await paratii.eth.deployContracts()
  })

  it('core.vids.create() and get() should work as expected', async function () {
    let vidToAdd = {
      id: 'some-id',
      owner: address1,
      title: 'some Title',
      price: '0',
      file: videoFile
    }
    let videoInfo = await paratii.core.vids.create(vidToAdd)
    assert.equal(videoInfo.id, 'some-id')

    delete videoInfo.file
    let videoInfo2 = await paratii.core.vids.get(videoInfo.id)
    assert.deepEqual(videoInfo2, videoInfo)
  })

  it('core.vids.create() should accept ipfsHash as argument', async function () {
    let data

    // make sure the video does not exist
    assert.isRejected(paratii.eth.vids.get(videoId), Error, 'No video')

    data = await paratii.core.vids.create({
      id: videoId,
      owner: address1,
      title: videoTitle,
      ipfsHash: ipfsHash,
      price: 1
    })

    assert.equal(data.ipfsHash, ipfsHash)

    data = await paratii.core.vids.get(videoId)
    assert.equal(data.ipfsHash, ipfsHash)
  })

  it('core.vids.update() should work as expected', async function () {
    await paratii.core.vids.create({
      id: videoId,
      owner: address1,
      title: videoTitle
    })
    let data
    data = await paratii.core.vids.get(videoId)
    assert.equal(data.title, videoTitle)

    data = await paratii.core.vids.update(videoId, {title: 'another-title'})
    assert.equal(data.title, 'another-title')
    assert.equal(data.owner, address1)

    data = await paratii.core.vids.get(videoId)
    assert.equal(data.title, 'another-title')
    assert.equal(data.owner, address1)
  })

  it.skip('core.vids.delete() should work as expected', async function () {
  })

  it.skip('core.vids.like() should work as expected', async function () {
  })

  it.skip('core.vids.dislike() should work as expected', async function () {
  })

  it.skip('core.vids.view() should work as expected', async function () {
  })

  it.skip('core.vids.buy() should work as expected', async function () {
  })

  it.skip('core.vids.search() should work as expected', async function () {
  })
})
