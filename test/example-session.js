import { Paratii } from '../lib/paratii.js'
import { address, privateKey } from './utils.js'
import { assert } from 'chai'

describe('Paratii API:', function () {
  it('example session from ../docs/example-session.md should work', async function () {
    let paratii = await new Paratii({
      // this address and key are the first accounts on testrpc when started with the --deterministic flag
      // provider: 'http://127.0.0.1:8545/rpc/',
      provider: 'ws://localhost:8546',
      address,
      privateKey
    })

    let contracts = await paratii.eth.deployContracts()
    let paratiiToken = await paratii.eth.getContract('ParatiiToken')
    assert.equal(contracts.ParatiiToken.options.address, paratiiToken.options.address)
    // check for balance
    paratiiToken.setProvider(paratii.eth.web3.currentProvider)
    let rawTransaction = await paratiiToken.methods.balanceOf(address)
    rawTransaction._ethAccounts = paratii.eth.web3.eth.accounts
    const balance = await rawTransaction.call()

    assert.equal(balance, '21000000000000000000000000')
    //
    // // USER
    // await contracts.Users.registerUser('0x123455', 'Marvin Pontiac', 'john@lurie.com', '/img/avatar_img.svg')
    //
      // const userInfo = await contracts.Users.get('0x123455')
    // let user = {
    //   name: userInfo[0],
    //   email: userInfo[1],
    //   avatar: userInfo[2]
    // }
    // assert.equal(user.name, 'Marvin Pontiac')
    // assert.equal(user.email, 'john@lurie.com')
    // assert.equal(user.avatar, '/img/avatar_img.svg')
    //
    // // VIDEO
    // await contracts.Videos.registerVideo(
    //   '31415', // id of the video
    //   '0x123455', // address of the video owner
    //   27182, // price (in PTI "wei")
    //   'ladsfkjasdfkljfl' // hash of the video on IPFS
    // )
    //
    // const video = await contracts.Videos.getVideoInfo('31415')
    // assert.equal(video[0], '0x0000000000000000000000000000000000123455')

    // VIDEOSTORE - troubleshooting, next line fails
    // await contracts.Store.buyVideo('31415') // Error: VM Exception while processing transaction: revert // Error: VM Exception while processing transaction: invalid opcode
    // await contracts.Store.buyVideo('31415', { from : address})  // Error: invalid address // { from : 0x00000000000000000000000000000000000123455 }) // invalid address
    // await contracts.Store.buyVideo('31415', { from : '0x00000000000000000000000000000000000123455'}) // Error: could not unlock signer address
    // await contracts.Store.buyVideo('31415', { from : 0x123455})  // Error: invalid address // { from : 0x0000000000000000000000000000000000012455 }) // invalid address

    // await contracts.Store.isAcquired('31415') // TODO isAcquired is not a smart contract method, write it
    // await contracts.Users.isAcquired('0x123455', '31415')
    // , gas: 210000, gasPrice: 20000000000z
  })
})
