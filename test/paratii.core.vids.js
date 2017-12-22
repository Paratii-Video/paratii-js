import { Paratii } from '../lib/paratii.js'
import { assert } from 'chai'
import { address, address1, privateKey } from './utils.js'

describe('paratii.core.vids:', function () {
  let paratii
  let videoFile = 'test/data/some-file.txt'

  this.timeout(30000)

  beforeEach(async function () {
    paratii = new Paratii({
      address: address,
      privateKey: privateKey
    })
    await paratii.eth.deployContracts()
  })

  it('core.vids.create() and get() should work as expected', async function () {
    let videoId = await paratii.core.vids.create({
      id: 'some-id',
      owner: address1,
      title: 'some Title',
      price: 0,
      file: videoFile
    })
    assert.equal(videoId, 'some-id')

    // let video = await paratii.core.vids.get(videoId)
    // console.log(video)
  })

  it.skip('core.vids.get() should work as expected', async function () {
  })

  it.skip('db.vids.search() should work as expected', async function () {
  })
})
