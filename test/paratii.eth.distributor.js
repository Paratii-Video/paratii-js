import { Paratii } from '../src/paratii.js'
import { testConfig, address1, address99 } from './utils.js'
import { assert } from 'chai'
import { getInfoFromLogs } from '../src/utils.js'

describe('paratii.eth.distributor:', function () {
  let paratii, distributor

  beforeEach(async function () {
    paratii = new Paratii(testConfig)
    await paratii.eth.deployContracts()
    let token = await paratii.eth.getContract('ParatiiToken')
    distributor = await paratii.eth.getContract('PTIDistributor')
    await token.methods.transfer(distributor.options.address, '1e21').send()
  })

  it('should work as expected', async function () {
    const amount = 20
    const reason = 'email_verification'
    const salt = paratii.eth.web3.utils.randomHex(32)
    const signature = await paratii.eth.distributor.generateSignature(
      address1,
      amount,
      salt,
      reason,
      paratii.eth.getAccount()
    )

    const opts = {
      v: signature.v,
      r: signature.r,
      s: signature.s,
      address: address1,
      amount,
      salt,
      reason
    }
    let tx = await paratii.eth.distributor.distribute(opts)
    let loggedAddress = getInfoFromLogs(tx, 'LogDistribute', '_toAddress')
    assert.equal(loggedAddress, address1)
  })

  it('should throw an error if the message is not signed by the contract owner', async function () {
    // change the conract owner
    const contract = await paratii.eth.distributor.getPTIDistributeContract()

    await contract.methods.transferOwnership(address99).send()

    const amount = 20
    const reason = 'email_verification'
    const salt = paratii.eth.web3.utils.randomHex(32)
    const signature = await paratii.eth.distributor.generateSignature(
      address1,
      amount,
      salt,
      reason,
      paratii.eth.getAccount()
    )

    const opts = {
      v: signature.v,
      r: signature.r,
      s: signature.s,
      address: address1,
      amount,
      salt,
      reason
    }

    await assert.isRejected(paratii.eth.distributor.distribute(opts), Error, /Signature does not correspond/g)
  })
  it('should throw an error if a different salt is passed', async function () {
    // change the conract owner
    const contract = await paratii.eth.distributor.getPTIDistributeContract()

    await contract.methods.transferOwnership(address99).send()

    const amount = 20
    const reason = 'email_verification'
    const salt = paratii.eth.web3.utils.randomHex(32)
    const signature = await paratii.eth.distributor.generateSignature(
      address1,
      amount,
      salt,
      reason,
      paratii.eth.getAccount()
    )

    const opts = {
      v: signature.v,
      r: signature.r,
      s: signature.s,
      address: address1,
      amount,
      salt: paratii.eth.web3.utils.randomHex(32),
      reason
    }

    await assert.isRejected(paratii.eth.distributor.distribute(opts), Error, /Signature does not correspond/g)
  })
  it('should throw an error if the salt has already been used before', async function () {
    const amount = 20
    const reason = 'email_verification'
    const salt = paratii.eth.web3.utils.randomHex(32)
    const signature = await paratii.eth.distributor.generateSignature(
      address1,
      amount,
      salt,
      reason,
      paratii.eth.getAccount()
    )

    const opts = {
      v: signature.v,
      r: signature.r,
      s: signature.s,
      address: address1,
      amount,
      salt,
      reason
    }

    await paratii.eth.distributor.distribute(opts)
    await assert.isRejected(paratii.eth.distributor.distribute(opts), Error, /is already used/g)
  })
})
