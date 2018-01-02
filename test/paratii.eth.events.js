import { Paratii } from '../lib/paratii.js'
import { address, privateKey, address1 } from './utils.js'

describe('paratii.eth API: :', function () {
  let paratii
  beforeEach(async function () {
    paratii = await new Paratii({
      provider: 'http://localhost:8545/rpc/',
      address: address,
      privateKey: privateKey
    })
    await paratii.eth.deployContracts()
  })

  it('subscription to Tranfer PTI events should work as expected', async function () {
    paratii.eth.web3.setProvider('ws://localhost:8546')

    paratii.eth.events.addListener('newBlockHeaders', function () {
      console.log('ciao')
    })

    let beneficiary = address1
    let amount = paratii.eth.web3.utils.toWei('3', 'ether')
    await paratii.eth.transfer(beneficiary, amount, 'ETH')
  })
})
