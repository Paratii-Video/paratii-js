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
    await paratii.core.vids.create({
      id: videoId,
      owner: address1,
      title: videoTitle,
      ipfsHash: ipfsHash
    })
  })
  it.skip('core.vids.update() should work as expected', async function () {
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
