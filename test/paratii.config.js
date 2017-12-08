import { Paratii } from '../lib/paratii.js'
import { account, privateKey } from './utils.js'
var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
var assert = chai.assert

describe('Paratii configuration:', function () {
  let paratii

  beforeEach(function () {
    paratii = new Paratii({
      // this address and key are the first accounts on testrpc when started with the --deterministic flag
      provider: 'http://localhost:8545',
      account: account,
      privateKey: privateKey
    })
  })

  it('paratii.config should return the configuration with default values', async function () {
    let expected = {
      account: {
        address: account,
        privateKey: privateKey
      },
      provider: 'http://localhost:8545',
      registryAddress: null,
      isTestNet: true
    }
    assert.deepEqual(paratii.config, expected)
  })

  it('should be possible to create a second Paratii object with the same settings', async function () {
    // deploy the contracts so we have a registry address
    await paratii.eth.deployContracts()
    assert.isOk(paratii.eth.config.registryAddress)
    // assert.isOk(paratii.config.registryAddress)

    let paratii2 = new Paratii({
      account: account,
      privateKey: privateKey,
      registryAddress: paratii.config.registryAddress,
      provider: 'http://localhost:8545'
    })

    assert.deepEqual(paratii.config, paratii2.config)
  })

  it('should be possible to create a Paratii instance without an account or registryAddress', async function () {
    let paratii = new Paratii({
      provider: 'http://chain.paratii.video/'
    })
    let expected = {
      account: {
        address: null,
        privateKey: null
      },
      provider: 'http://chain.paratii.video/',
      isTestNet: false,
      registryAddress: null
    }

    assert.deepEqual(paratii.config, expected)

    // functions should still work
    let promise = paratii.eth.getContract('ParatiiToken')
    assert.isRejected(promise, /No registry/)
  })

  it('setAccount should set the account', async function () {
    let paratii = new Paratii({
      provider: 'http://127.0.0.1:8545'
    })
    // await paratii.eth.deployContracts()
    // let beneficiary = account1
    // let amount = 0.3 * 10 ** 18
    // let promise = paratii.eth.transfer(beneficiary, amount, 'PTI')
    // assert.isRejected(promise, /No account/)
    //
    await paratii.setAccount(account)
    assert.equal(paratii.config.account.address, account)
    assert.equal(paratii.eth.config.account.address, account)
    // promise = paratii.eth.transfer(beneficiary, amount, 'PTI')
    // await assert.isFulfilled(promise)
  })
})
