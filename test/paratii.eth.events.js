import { Paratii } from '../lib/paratii.js'
import { address, privateKey } from './utils.js'
import { assert } from 'chai'

describe('paratii.eth.events API: :', function () {
  let paratii

  beforeEach(async function () {
    paratii = await new Paratii({
      provider: 'http://localhost:8545/rpc/',
      address: address,
      privateKey: privateKey
    })
    await paratii.eth.deployContracts()
    paratii.eth.web3.setProvider('ws://localhost:8546/rpc/')
  })

  it('subscription to Tranfer PTI events should work as expected', function (done) {
    let beneficiary = '0xDbC8232Bd8DEfCbc034a0303dd3f0Cf41d1a55Cf'
    let ptiTransfer = paratii.eth.events.addListener('Transfer')

    let amount = paratii.eth.web3.utils.toWei('4', 'ether')

    ptiTransfer.on('data', function (log) {
      const received = paratii.eth.web3.utils.hexToNumberString(log.data)
      assert.equal(received, amount)
      done()
      ptiTransfer.unsubscribe()
    })
    paratii.eth.transfer(beneficiary, amount, 'PTI')
  })
})
