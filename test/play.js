import { Paratii } from '../lib/paratii.js'
import { address, privateKey, address1, address99, address17, privateKey17 } from './utils.js'
import { assert } from 'chai'

describe('paratii.eth API: :', function () {
  let paratii
  it('send() should succeed if a  private key is passed to the constructor', async function () {
    paratii = await new Paratii({
      provider: 'http://127.0.0.1:8545/rpc/',
      address: address17,
      privateKey: privateKey17
    })

    let paratiiRegistry = await paratii.eth.deployContract('Registry')

    console.log('Address of registry:', paratiiRegistry.options.address)
    // TODO: setRegistryAddress should be called when calling deployContract('Registry')
    await paratii.setRegistryAddress(paratiiRegistry.options.address)

    console.log('0-------------------------------------------------------------')
    // TODO: apparently, 'deployContract(...)' does not return the same object as `getContract()` [<- this is a bug]
    paratiiRegistry = await paratii.eth.getContract('Registry')
    let rawTransaction = await paratiiRegistry.methods.registerAddress('Avatar', address)
    // TODO: the next invocation is need for the transaction to sign itself automagically when calling 'send()'
    // (The fact that we need to do this by hand either is a web3 bug, or some web3 invocation we do not know)
    rawTransaction._ethAccounts = paratii.eth.web3.eth.accounts
    // console.log(x._ethAccounts)
    console.log('1-------------------------------------------------------------')
    let transactionReceipt = await rawTransaction.send()
    // console.log(y)
    console.log('2-------------------------------------------------------------')
    console.log(transactionReceipt)
    console.log('3-------------------------------------------------------------done')

    return '...DONE...'
  })
})
