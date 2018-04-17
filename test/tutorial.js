import { Paratii } from '../src/paratii.js'
import { testConfig } from './utils.js'
import { assert } from 'chai'

describe('Paratii API:', function () {
  let paratii

  beforeEach(async function () {
    paratii = new Paratii(testConfig)
    await paratii.eth.deployContracts()
  })

  it('paratii exists..', async function () {
    assert.isOk(paratii)
  })
})
