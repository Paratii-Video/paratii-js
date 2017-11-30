import { Paratii } from '../lib/paratii.js'
import { account } from './utils.js'
let assert = require('assert')

describe('Paratii API:', function () {
  it('example session from ../docs/example-session.md should work', async function () {
    let paratii = Paratii({
      // this address and key are the first accounts on testrpc when started with the --deterministic flag
      account: account,
      privateKey: '4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d'
    })

    let contracts = await paratii.deployContracts()
    let paratiiToken = await paratii.getContract('ParatiiToken')
    assert.equal(contracts.ParatiiToken.options.address, paratiiToken.options.address)

    // check for balance
    const balance = await paratiiToken.methods.balanceOf(account).call()
    assert.equal(balance, '21000000000000000000000000')
    //
    // // USER
    // await contracts.UserRegistry.registerUser('0x123455', 'Marvin Pontiac', 'john@lurie.com', '/img/avatar_img.svg')
    //
      // const userInfo = await contracts.UserRegistry.getUserInfo('0x123455')
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
    // await contracts.VideoRegistry.registerVideo(
    //   '31415', // id of the video
    //   '0x123455', // address of the video owner
    //   27182, // price (in PTI "wei")
    //   'ladsfkjasdfkljfl' // hash of the video on IPFS
    // )
    //
    // const video = await contracts.VideoRegistry.getVideoInfo('31415')
    // assert.equal(video[0], '0x0000000000000000000000000000000000123455')

    // VIDEOSTORE - troubleshooting, next line fails
    // await contracts.VideoStore.buyVideo('31415') // Error: VM Exception while processing transaction: revert // Error: VM Exception while processing transaction: invalid opcode
    // await contracts.VideoStore.buyVideo('31415', { from : account})  // Error: invalid address // { from : 0x00000000000000000000000000000000000123455 }) // invalid address
    // await contracts.VideoStore.buyVideo('31415', { from : '0x00000000000000000000000000000000000123455'}) // Error: could not unlock signer account
    // await contracts.VideoStore.buyVideo('31415', { from : 0x123455})  // Error: invalid address // { from : 0x0000000000000000000000000000000000012455 }) // invalid address

    // await contracts.VideoStore.isAcquired('31415') // TODO isAcquired is not a smart contract method, write it
    // await contracts.UserRegistry.isAcquired('0x123455', '31415')
    // , gas: 210000, gasPrice: 20000000000z
  })
})
