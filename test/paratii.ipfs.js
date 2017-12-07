import { Paratii } from '../lib/paratii.js'
import { account, privateKey } from './utils.js'
import { assert } from 'chai'

describe('paratii.ipfs API: :', function () {
  let paratii
  beforeEach(async function () {
    paratii = await new Paratii({
      provider: 'http://localhost:8545',
      account: account,
      privateKey: privateKey
    })
    await paratii.eth.deployContracts()
  })

  it('should exist', async function () {
    assert.isOk(paratii.ipfs)
  })
})
