import { Paratii } from '../lib/paratii.js'
import { account, account1, privateKey } from './utils.js'
import { assert } from 'chai'

describe('paratii.eth.vids: :', function () {
  let paratii

  beforeEach(async function () {
    paratii = await new Paratii({
      provider: 'http://localhost:8545',
      account: account,
      privateKey: privateKey
    })
    await paratii.eth.deployContracts()
  })

  it('vids.register() should work', async function () {
    let price = 3 * 10 ** 18
    let ipfsHash = 'xyz'

    let videoId = await paratii.eth.vids.register({
      id: '0x12355',
      price: price,
      owner: account1,
      ipfsHash: ipfsHash
    })
    assert.equal(videoId, '0x12355')

    let vid = await paratii.eth.vids.get(videoId)
    console.log(vid)
    assert.equal(vid.price, price)
    // assert.equal(vid.ipfsHash, ipfsHash)
  })

  it.skip('vids.unregisterVideo() should work', async function () {
  })
  it.skip('vids.updateVideo() should work', async function () {
  })
})
