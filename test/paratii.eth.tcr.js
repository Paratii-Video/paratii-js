import { Paratii } from '../src/paratii.js'
import { address, testConfig } from './utils.js'
import { assert } from 'chai'
import { BigNumber } from 'bignumber.js'

describe('paratii.eth.tcr:', function () {
  let paratii
  let tcrConfig

  before(async function () {
    paratii = new Paratii(testConfig)
    tcrConfig = require('sol-tcr/conf/config.json')
    await paratii.eth.deployContracts()
  })

  let videoId = 'some-video-id'
  let videoId2 = 'some-other-video-id'

  it('should be able to get minDeposit', async function () {
    let amount = await paratii.eth.tcr.getMinDeposit()
    assert.isOk(amount)
    assert.equal(amount, tcrConfig.paramDefaults.minDeposit)
  })

  it('videoId should not be whitelisted yet', async function () {
    let isWhitelisted = await paratii.eth.tcr.isWhitelisted(videoId)
    assert.isFalse(isWhitelisted)
  })

  it('should be able to apply a video to whitelist', async function () {
    let amount = 5
    // get some tokens
    let token = await paratii.eth.getContract('ParatiiToken')
    let tcr = await paratii.eth.tcr.getTcrContract()

    let tx = await token.methods.transfer(address, 1000).send()
    assert.isOk(tx)
    let balanceBefore = await token.methods.balanceOf(address).call()
    // console.log('balanceBefore: ', balanceBefore)
    // let balance = await token.methods.balanceOf(address).call()
    // assert.equal(balanceBefore, 1000)
    let amountToAllowWei = paratii.eth.web3.utils.toWei('100')
    let amountToAllowInHex = paratii.eth.web3.utils.toHex(amountToAllowWei)
    let tx2 = await token.methods.approve(tcr.options.address, amountToAllowInHex).send()
    assert.isOk(tx2)

    let allowance = await token.methods.allowance(address, tcr.options.address).call()
    assert.equal(allowance, paratii.eth.web3.utils.toWei('100'))

    let result = await paratii.eth.tcr.apply(videoId, paratii.eth.web3.utils.toWei(amount.toString()))
    assert.isTrue(result)
    let allowanceAfter = await token.methods.allowance(address, tcr.options.address).call()
    assert.equal(paratii.eth.web3.utils.toWei('95'), allowanceAfter)
    let balanceAfter = await token.methods.balanceOf(address).call()
    // console.log('balanceAfter: ', balanceAfter.toString())
    assert.equal(
      paratii.eth.web3.utils.toBN(balanceBefore.toString())
      .sub(paratii.eth.web3.utils.toBN(balanceAfter.toString())).toString()
    , paratii.eth.web3.utils.toWei(amount.toString()).toString())
  })
  it('checkEligiblityAndApply should work', async function () {
    let amount = 5
    let result = await paratii.eth.tcr.checkEligiblityAndApply(videoId2, paratii.eth.web3.utils.toWei(amount.toString()))
    assert.isOk(result, result)
    let didVideoApply = await paratii.eth.tcr.appWasMade(videoId2)
    assert.isOk(didVideoApply)
  })

  it('should NOT be able to apply twice', async function () {
    let amount = 5

    assert.isRejected(
      paratii.eth.tcr.checkEligiblityAndApply(videoId, paratii.eth.web3.utils.toWei(amount.toString())),
      Error,
       /already applied/g
     )
  })

  it('exit() should delist the video and return the money', async function () {
    let amount = new BigNumber(paratii.eth.web3.utils.toWei('5'))
    let balance1 = new BigNumber(await paratii.eth.balanceOf(paratii.config.account.address, 'PTI'))
    await paratii.eth.tcr.checkEligiblityAndApply('yetanothervid', amount)
    let balance2 = new BigNumber(await paratii.eth.balanceOf(paratii.config.account.address, 'PTI'))
    assert.equal(Number(balance2), Number(balance1.minus(amount)))
  })
})
