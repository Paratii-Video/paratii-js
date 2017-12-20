import { Paratii } from '../lib/paratii.js'
import { assert } from 'chai'
import { address1 } from './utils.js'

describe('paratii.core API: :', function () {
  let paratii, paratiiCore
  let videoFile = 'test/data/some-file.txt'
  beforeEach(async function () {
    paratii = new Paratii()
    await paratii.eth.deployContracts()
    paratiiCore = paratii.core
  })

  it.skip('core.vids.create() should work as expected', async function () {
    let videoId = await paratiiCore.vids.create({
      id: 'some-id',
      owner: address1,
      title: 'some Title',
      file: videoFile
    })
    assert.equal(videoId, 'some-id')
  })

  it.skip('core.vids.get() should work as expected', async function () {
  })

  it.skip('db.vids.search() should work as expected', async function () {
  })
})
