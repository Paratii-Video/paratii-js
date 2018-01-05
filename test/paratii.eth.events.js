import { Paratii } from '../lib/paratii.js'
import { address, privateKey, address17 } from './utils.js'
import { assert } from 'chai'

describe('paratii.eth API: :', function () {
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

  it('subscription to Tranfer PTI events should work as expected', async function () {
    let beneficiary = address17
    let ptiTransfer = paratii.eth.events.addListener('transfer')

    let amount = paratii.eth.web3.utils.toWei('4', 'ether')
    await paratii.eth.transfer(beneficiary, amount, 'PTI')

    ptiTransfer.on('data', function (log) {
      const received = paratii.eth.web3.utils.hexToNumberString(log.data)
      assert.equal(received, amount)
    })
  })
})
