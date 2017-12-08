import { Paratii } from '../lib/paratii.js'
import { account, privateKey } from './utils.js'
var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
var assert = chai.assert

describe('Paratii configuration:', function () {
  let paratii

  before(function () {
    paratii = new Paratii({
      // this address and key are the first accounts on testrpc when started with the --deterministic flag
      account: account,
      privateKey: privateKey
    })
  })

  it('paratii.config should return the configuration with default values', async function () {
    let expected = {
      account,
      privateKey,
      provider: 'http://localhost:8545',
      registryAddress: null
    }
    assert.deepEqual(paratii.config, expected)
  })

  it('should be possible to create a second Paratii object with the same settings', async function () {
    // deploy the contracts so we have a registry address
    await paratii.eth.deployContracts()
    assert(paratii.config.registryAddress)

    let paratii2 = new Paratii({
      account,
      privateKey,
      registryAddress: paratii.config.registryAddress,
      provider: 'http://localhost:8545'
    })

    assert.deepEqual(paratii.config, paratii2.config)
  })

  it('should be possible to create a Paratii instance without an account or registryAddress', async function () {
    let paratii = new Paratii({
      provider: 'http://127.0.0.1:8545'
    })
    let expected = {
      account: null,
      privateKey: null,
      provider: 'http://127.0.0.1:8545',
      registryAddress: null
    }

    assert.deepEqual(paratii.config, expected)

    // functions should still work
    let promise = paratii.eth.getContract('ParatiiToken')
    assert.isRejected(promise, /No registry/)
  })
})
