import { Paratii } from '../lib/paratii.js'
import { ParatiiUtils } from '../lib/paratii.utils.js'
import { address, privateKey, challenge1, signedMessage3 } from './utils.js'
import { assert } from 'chai'

describe('ParatiiUtils:', function () {
  let paratiiUtils
  let paratii
  this.timeout(30000)
  beforeEach(async function () {
    paratii = await new Paratii({
      provider: 'http://localhost:8545',
      address: address,
      privateKey: privateKey
    })
    await paratii.eth.deployContracts()
    paratiiUtils = new ParatiiUtils(paratii.config)
  })

  it('should exist', (done) => {
    assert.isOk(paratiiUtils)
    done()
  })

  it('should generate 16bit random challenge', (done) => {
    let challenge = paratiiUtils.newChallenge()
    assert.isOk(challenge)
    assert.equal(challenge.length, 32)
    done()
  })

  it('should generate valid signature for challenge', (done) => {
    let signed = paratiiUtils.signMessage(challenge1)
    assert.isOk(signed)
    assert.equal(signed.signature.toString(), signedMessage3)
    done()
  })

  it('should recover valid address from signature', (done) => {
    let signed = paratiiUtils.signMessage(challenge1)
    assert.isOk(signed)
    let account1 = paratiiUtils.recoverAccount(signed)
    assert.isOk(account1)
    assert.equal(account1.toString(), address)
    done()
  })

  it('should exist and work as an attribute on the Paratii object', async function () {
    let paratii = new Paratii()
    assert.isOk(paratii.utils)
    assert.isOk(paratii.utils.getSelf())
  })
})