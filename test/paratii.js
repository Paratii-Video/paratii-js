// import { Paratii } from '../lib/paratii.js'
//
// describe('Paratii API:', function () {
//   let paratii, contracts
//
//   beforeEach(async function () {
//     paratii = Paratii()
//     // paratii.init()
//     contracts = await paratii.getOrDeployContracts()
//   })
//
//   it('paratiicontract functions should work', async function () {
//     let paratiiRegistryAddress = await paratii.getRegistryAddress()
//     assert.equal(paratiiRegistryAddress, contracts.ParatiiRegistry.address)
//
//     let paratiiTokenAddress = await paratii.getContractAddress('ParatiiToken')
//     assert.equal(paratiiTokenAddress, contracts.ParatiiToken.address)
//   })
//
//   it('should have sane default settings', async function () {
//     // the `VideoRedistributionPoolShare` should be set to some reasonable number
//     let paratiiRegistry = await paratii.getContract('ParatiiRegistry')
//     let paratiiAvatar = await paratii.getContract('ParatiiAvatar')
//     let videoStore = await paratii.getContract('VideoStore')
//     let share = await paratiiRegistry.getUint('VideoRedistributionPoolShare')
//     assert.equal(Number(share), web3.toWei(0.3))
//     // check if the VideoStore is whitelisted
//     let isOnWhiteList = await paratiiAvatar.isOnWhiteList(videoStore.address)
//     assert.equal(isOnWhiteList, true)
//   })
// })
