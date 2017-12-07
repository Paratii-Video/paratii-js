import { Paratii } from '../lib/paratii.js'
import { account, privateKey } from './utils.js'
import { assert } from 'chai'

describe('paratii.eth.vids: :', function () {
  let paratii
  let title = 'The Human Centipede'

  beforeEach(async function () {
    paratii = await new Paratii({
      provider: 'http://localhost:8545',
      account: account,
      privateKey: privateKey
    })
    await paratii.eth.deployContracts()
  })

  it.skip('vids.register() should work', async function () {
    await paratii.vids.register(title)
    assert.isOk(true)
  })

  it.skip('vids.unregisterVideo() should work', async function () {
  })
  it.skip('vids.updateVideo() should work', async function () {
  })
})
