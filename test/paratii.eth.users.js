import { Paratii } from '../lib/paratii.js'
import { account, privateKey } from './utils.js'
import { assert } from 'chai'

describe('paratii.eth.videos: :', function () {
  let paratii
  beforeEach(async function () {
    paratii = await new Paratii({
      provider: 'http://localhost:8545',
      account: account,
      privateKey: privateKey
    })
    await paratii.eth.deployContracts()
  })

  it.skip('vids.registerVideo() should work', async function () {
    assert.isOk(true)
  })

  it.skip('vids.unregisterVideo() should work', async function () {
  })
  it.skip('vids.updateVideo() should work', async function () {
  })
})
