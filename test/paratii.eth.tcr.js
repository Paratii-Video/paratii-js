import { Paratii } from '../src/paratii.js'
import { address, testConfig, privateKey17 } from './utils.js'
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
  let videoId3 = 'another-one'
  let videoId4 = 'not-applied'
  let videoId5 = 'test-id'

  let videoId6 = 'test'
  let videoId7 = 'test2'

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

  it('getters for the parametrizer contract should return correct values', async function () {
    assert.equal(await paratii.eth.tcr.getpMinDeposit(), tcrConfig.paramDefaults.pMinDeposit)
    assert.equal(await paratii.eth.tcr.getpApplyStageLen(), tcrConfig.paramDefaults.pApplyStageLength)
    assert.equal(await paratii.eth.tcr.getpDispensationPct(), tcrConfig.paramDefaults.pDispensationPct)
    assert.equal(await paratii.eth.tcr.getpCommitStageLen(), tcrConfig.paramDefaults.pCommitStageLength)
    assert.equal(await paratii.eth.tcr.getpRevealStageLen(), tcrConfig.paramDefaults.pRevealStageLength)
    assert.equal(await paratii.eth.tcr.getpVoteQuorum(), tcrConfig.paramDefaults.pVoteQuorum)
  })

  it('getters for the tcr contract should return correct values', async function () {
    assert.equal(await paratii.eth.tcr.getMinDeposit(), tcrConfig.paramDefaults.minDeposit)
    assert.equal(await paratii.eth.tcr.getApplyStageLen(), tcrConfig.paramDefaults.applyStageLength)
    assert.equal(await paratii.eth.tcr.getDispensationPct(), tcrConfig.paramDefaults.dispensationPct)
    assert.equal(await paratii.eth.tcr.getCommitStageLen(), tcrConfig.paramDefaults.commitStageLength)
    assert.equal(await paratii.eth.tcr.getRevealStageLen(), tcrConfig.paramDefaults.revealStageLength)
    assert.equal(await paratii.eth.tcr.getVoteQuorum(), tcrConfig.paramDefaults.voteQuorum)
  })

  it('getListing should retrieve the listing inserted previously', async function () {
    let amount = 5
    let result = await paratii.eth.tcr.checkEligiblityAndApply(videoId3, paratii.eth.web3.utils.toWei(amount.toString()))
    assert.isOk(result, result)
    let didVideoApply = await paratii.eth.tcr.appWasMade(videoId3)
    assert.isOk(didVideoApply)

    let listing = await paratii.eth.tcr.getListing(videoId3)
    assert.isOk(listing)
  })

  it('getListing() should throw an error if the listing does not exist', async function () {
    assert.isFalse(await paratii.eth.tcr.appWasMade(videoId4))

    await assert.isRejected(paratii.eth.tcr.getListing(videoId4), Error, /doesn't exists/g)
  })

  it('getChallenge() should throw an error if the challenge does not exist', async function () {
    // new paratii --> contracts are re-deployed --> no challenges are present
    let paratii2 = new Paratii(testConfig)
    tcrConfig = require('sol-tcr/conf/config.json')
    await paratii2.eth.deployContracts()

    await assert.isRejected(paratii2.eth.tcr.getChallenge(1), Error, /doesn't exists/g)
  })

  it('localStorage storing should work also in tests', async function () {
    paratii.eth.tcr.clearNodeLocalStorage()

    let hash1 = paratii.eth.tcr.getAndStoreHash(videoId6)
    let hash2 = paratii.eth.tcr.getAndStoreHash(videoId7)

    assert.equal(paratii.eth.tcr.hashToId(hash1), videoId6)
    assert.equal(paratii.eth.tcr.hashToId(hash2), videoId7)

    let salt1 = paratii.eth.tcr.generateSalt()
    let salt2 = paratii.eth.tcr.generateSalt(12)

    paratii.eth.tcr.storeSalt(videoId6, salt1)
    paratii.eth.tcr.storeSalt(videoId7, salt2)

    assert.equal(paratii.eth.tcr.getSalt(videoId6), salt1)
    assert.equal(paratii.eth.tcr.getSalt(videoId7), salt2)
  })
  it('clearNodeLocalStorage() should delete all the key value pairs', async function () {
    paratii.eth.tcr.clearNodeLocalStorage()

    assert.equal(paratii.eth.tcr.getLocalStorage().length, 0)
  })

  it('challengeExists() implemented in the lib and challengeExists() implemented in the tcr contract should always return the same value', async function () {
    let tcrRegistry = await paratii.eth.tcr.getTcrContract()

    // application for videoId5 --------------------------------------------------
    let result = await paratii.eth.tcr.checkEligiblityAndApply(videoId5, paratii.eth.web3.utils.toWei('5'))
    assert.isOk(result, result)
    let didVideoApply = await paratii.eth.tcr.appWasMade(videoId5)
    assert.isOk(didVideoApply)

    // create challenger account --------------------------------------------------
    let challengerAccount = await paratii.eth.web3.eth.accounts.wallet.add({
      privateKey: privateKey17
    })
    assert.isOk(challengerAccount)

    // fund address1
    let token = await paratii.eth.getContract('ParatiiToken')
    assert.isOk(token)
    let transferTx = await token.methods.transfer(
      challengerAccount.address,
      paratii.eth.web3.utils.toWei('40')
    ).send()

    assert.isOk(transferTx)
    let balanceOfAddress1 = await token.methods.balanceOf(challengerAccount.address).call()
    assert.equal(balanceOfAddress1, paratii.eth.web3.utils.toWei('40'))

    let approval = await token.methods.approve(
      tcrRegistry.options.address, paratii.eth.web3.utils.toWei('40')
    ).send({from: paratii.eth.web3.eth.accounts[1]}) // send from challengerAccount
    assert.isOk(approval)
    assert.isOk(approval.events.Approval)

    let challengeTx = await tcrRegistry.methods.challenge(
      paratii.eth.tcr.getHash(videoId5),
      ''
    ).send({from: paratii.eth.web3.eth.accounts[1]})

    assert.isOk(challengeTx)
    assert.isOk(challengeTx.events._Challenge)
    let challengeID = challengeTx.events._Challenge.returnValues.challengeID
    assert.isOk(challengeID)

    let res = await tcrRegistry.methods.challengeExists(
      paratii.eth.tcr.getHash(videoId5)
    ).call()

    assert.equal(await paratii.eth.tcr.challengeExists(videoId5), res)
  })
  it.skip('exit() should throw errors if conditions aren\'t fulfilled', async function () {
    // need to be implemented after the challenge implementation
  })
})
