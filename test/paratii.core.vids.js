import { Paratii } from '../lib/paratii.js'
import { assert } from 'chai'
import { address, address1, privateKey } from './utils.js'

describe('paratii.core.vids:', function () {
  let paratii, paratiiCore
  let videoFile = 'test/data/some-file.txt'
  beforeEach(async function () {
    paratii = new Paratii({
      address: address,
      privateKey: privateKey
    })
    await paratii.eth.deployContracts()
    paratiiCore = paratii.core
  })

  it('core.vids.create() and get() should work as expected', async function () {
    let videoId = await paratiiCore.vids.create({
      id: 'some-id',
      owner: address1,
      title: 'some Title',
      price: 0,
      file: videoFile
    })
    assert.equal(videoId, 'some-id')
  }).timeout(10000)

  it.skip('core.vids.get() should work as expected', async function () {
  })

  it.skip('db.vids.search() should work as expected', async function () {
  })
})
