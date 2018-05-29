import { Paratii } from '../src/paratii.js'
import { testConfig, address1 } from './utils.js'
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
    // console.log(await paratii.eth.getAccount())

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
})
