import { Paratii } from '../lib/paratii.js'
import { address, privateKey } from './utils.js'
import { assert } from 'chai'

describe('paratii.eth.tcr:', function () {
  let paratii

  before(async function () {
    paratii = new Paratii({
      provider: 'http://localhost:8545',
      address: address,
      privateKey: privateKey
    })
    await paratii.eth.deployContracts()
  })

  let videoId = 'some-vide-id'

  it('should be able to get minDeposit', async function () {
    let amount = await paratii.eth.tcr.getMinDeposit()
    assert.isOk(amount)
    assert.equal(amount.toString(), '5000000000000000000')
  })

  it('videoId should not be whitelisted yet', async function () {
    let isWhitelisted = await paratii.eth.tcr.isWhitelisted(videoId)
    assert.isFalse(isWhitelisted)
  })

  it('should be able to apply a video to whitelist', async function () {
    let amount = 5
    // get some tokens
    let token = await paratii.eth.getContract('ParatiiToken')
    let tcrPlaceholder = await paratii.eth.getContract('TcrPlaceholder')

    let tx = await token.methods.transfer(address, 1000).send()
    assert.isOk(tx)
    let balanceBefore = await token.methods.balanceOf(address).call()
    console.log('balanceBefore: ', balanceBefore)
    // let balance = await token.methods.balanceOf(address).call()
    // assert.equal(balance, 1000)
    let amountToAllowWei = paratii.eth.web3.utils.toWei('100')
    let amountToAllowInHex = paratii.eth.web3.utils.toHex(amountToAllowWei)
    let tx2 = await token.methods.approve(tcrPlaceholder.options.address, amountToAllowInHex).send()
    assert.isOk(tx2)

    let allowance = await token.methods.allowance(address, tcrPlaceholder.options.address).call()
    assert.equal(allowance, paratii.eth.web3.utils.toWei('100'))

    let result = await paratii.eth.tcr.apply(videoId, paratii.eth.web3.utils.toWei(amount.toString()))
    assert.isTrue(result)
    let allowanceAfter = await token.methods.allowance(address, tcrPlaceholder.options.address).call()
    assert.equal(paratii.eth.web3.utils.toWei('95'), allowanceAfter)
    let balanceAfter = await token.methods.balanceOf(address).call()
    console.log('balanceAfter: ', balanceAfter.toString())
    assert.equal(
      paratii.eth.web3.utils.toBN(balanceBefore.toString())
      .sub(paratii.eth.web3.utils.toBN(balanceAfter.toString())).toString()
    , paratii.eth.web3.utils.toWei(amount.toString()).toString())
  })

  it('videoId should be in process (appWasMade)', async function () {
    let appWasMade = await paratii.eth.tcr.didVideoApply(videoId)
    assert.isTrue(appWasMade)
  })

  it('should NOT be able to apply twice', async function () {
    let amount = 5

    let result = await paratii.eth.tcr.checkEligiblityAndApply(videoId, paratii.eth.web3.utils.toWei(amount.toString()))
    assert.isFalse(result)
  })
})
