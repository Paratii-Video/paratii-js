import { Paratii } from '../lib/paratii.js'
import { address, privateKey, address1 } from './utils.js'

describe('paratii.eth API: :', function () {
  let paratii
  it('send() should succeed if a  private key is passed to the constructor', async function () {
    paratii = await new Paratii({
      provider: 'http://127.0.0.1:8545/rpc/',
      address,
      privateKey
    })

    let balance = await paratii.eth.balanceOf(address, 'ETH')
    console.log(balance)

    let amount = paratii.eth.web3.utils.toWei('3', 'ether')
    await paratii.eth.transfer(address1, amount, 'ETH')

    let balance1 = await paratii.eth.balanceOf(address1, 'ETH')
    console.log(balance1)
  })
})
