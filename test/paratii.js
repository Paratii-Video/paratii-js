import Paratii from '../lib/paratii.js'
import { address, privateKey } from './utils.js'
import { assert } from 'chai'

describe('Paratii API:', function () {
  let paratii

  beforeEach(async function () {
    paratii = new Paratii({
      provider: 'http://localhost:8545',
      address: address,
      privateKey: privateKey
    })
    await paratii.eth.deployContracts()
  })

  it('paratii exists..', async function () {
    assert.isOk(paratii)
  })
})
