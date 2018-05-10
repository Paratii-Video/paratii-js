import { Paratii } from '../src/paratii.js'
import { address, testConfig, address17, challengeFromDifferentAccount } from './utils.js'
import { assert } from 'chai'
import { BigNumber } from 'bignumber.js'

describe('paratii.eth.tcr:', function () {
  let paratii
  let tcrConfig

  before(async function () {
    paratii = new Paratii(testConfig)
    tcrConfig = require(paratii.config.eth.tcrConfigFile)
    await paratii.eth.deployContracts()
  })

  // some are declared directly in test, be careful with that
  let videoId = 'some-video-id'
  let videoId2 = 'some-other-video-id'
  let videoId3 = 'another-one'
  let videoId4 = 'not-applied'
  let videoId5 = 'test-id'
  let videoId6 = 'test'
  let videoId7 = 'test2'

  let id = 'some-new-id'

  // to avoid problem with interaction with other tests
  let myPrivateKey = '0x7aa336aece017378c50b56c0f831aaab2a61d44cf75f4e658a20926e2cfb74b5'
  // let myAddress = '0x6631fe5E391AB7B6Cf61e5a3eb809943D46c2adD'

  it('should be able to get minDeposit', async function () {
    let amount = await paratii.eth.tcr.getMinDeposit()
    assert.isOk(amount)
    assert.equal(amount, tcrConfig.paramDefaults.minDeposit)
  })

  it('videoId should not be whitelisted yet', async function () {
    let isWhitelisted = await paratii.eth.tcr.isWhitelisted(videoId)
    assert.isFalse(isWhitelisted)
  })

  it('should be able to apply a video to whitelist (without using checkEligiblityAndApply)', async function () {
    let amount = 5
    // get some tokens
    let token = await paratii.eth.getContract('ParatiiToken')
    let tcr = await paratii.eth.tcr.getTcrContract()

    // just in case, this address should already have the max supply of the token
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

  it('checkEligiblityAndApply() should work', async function () {
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

  it('should be able to apply and balances should be correct', async function () {
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

    // haven't applied yet
    let appWasMade = await paratii.eth.tcr.appWasMade(videoId5)
    assert.isFalse(appWasMade)

    // application for videoId5 --------------------------------------------------
    let result = await paratii.eth.tcr.checkEligiblityAndApply(videoId5, paratii.eth.web3.utils.toWei('5'))
    assert.isOk(result, result)

    // application should be successful
    appWasMade = await paratii.eth.tcr.appWasMade(videoId5)
    assert.isTrue(appWasMade)

    // shouldn't be whitelisted yet
    let isWhitelisted = await paratii.eth.tcr.isWhitelisted(videoId5)
    assert.isFalse(isWhitelisted)

    // there shouldn't be challenges going on
    let challengeExists = await paratii.eth.tcr.challengeExists(videoId5)
    assert.isFalse(challengeExists)

    await challengeFromDifferentAccount(myPrivateKey, videoId5, 40, paratii)

    // there should be the challenges going on
    challengeExists = await paratii.eth.tcr.challengeExists(videoId5)
    assert.isTrue(challengeExists)

    let res = await tcrRegistry.methods.challengeExists(
      paratii.eth.tcr.getHash(videoId5)
    ).call()

    assert.equal(await paratii.eth.tcr.challengeExists(videoId5), res)
  })

  it('video should enter the whitelist succesfully if no challenge is made in the application stage', async function () {
    let amount = 5

    // haven't applied yet
    let appWasMade = await paratii.eth.tcr.appWasMade(id)
    assert.isFalse(appWasMade)

    // apply
    let result = await paratii.eth.tcr.checkEligiblityAndApply(id, paratii.eth.web3.utils.toWei(amount.toString()))
    assert.isTrue(result)

    // applied
    appWasMade = await paratii.eth.tcr.appWasMade(id)
    assert.isTrue(appWasMade)

    // shouldn't be whitelisted yet
    let isWhitelisted = await paratii.eth.tcr.isWhitelisted(id)
    assert.isFalse(isWhitelisted)

    // there shouldn't be challenges going on
    let challengeExists = await paratii.eth.tcr.challengeExists(id)
    assert.isFalse(challengeExists)

    // make tx so that the apply stage length is passed
    let i
    let n = await paratii.eth.tcr.getApplyStageLen()
    for (i = 0; i <= n; i++) {
      await paratii.eth.transfer(address17, 1, 'PTI')
    }

    // should be true because no challenges are going on and the apply stage should be finished
    let canBeWhitelisted = await paratii.eth.tcr.canBeWhitelisted(id)
    assert.isTrue(canBeWhitelisted)

    // the video should enter the whitelist succesfully
    let updateTx = await paratii.eth.tcr.updateStatus(id)
    assert.isOk(updateTx)
    assert.isOk(updateTx.events._ApplicationWhitelisted)

    // the video should be isWhitelisted
    isWhitelisted = await paratii.eth.tcr.isWhitelisted(id)
    assert.isTrue(isWhitelisted)
  })

  it('exit() should work correctly', async function () {
    // there should already be an application (see previous test)
    let appWasMade = await paratii.eth.tcr.appWasMade(id)
    assert.isTrue(appWasMade)

    // should be already whitelisted (see previous test)
    let isWhitelisted = await paratii.eth.tcr.isWhitelisted(id)
    assert.isTrue(isWhitelisted)

    // there shouldn't be challenges going on
    let challengeExists = await paratii.eth.tcr.challengeExists(id)
    assert.isFalse(challengeExists)

    // save the balance before
    let balanceBefore = await paratii.eth.balanceOf(paratii.eth.getAccount(), 'PTI')

    // get the deposit of the listing
    let l = await paratii.eth.tcr.getListing(id)
    let unstakedDeposit = l.unstakedDeposit

    // exit the whitelist
    let tx = await paratii.eth.tcr.exit(id)
    assert.isOk(tx)
    assert.isOk(tx.events._ListingRemoved)
    assert.isOk(tx.events._ListingWithdrawn)

    // get the balance after
    let balanceAfter = await paratii.eth.balanceOf(paratii.eth.getAccount(), 'PTI')

    // token should be returned to the owner
    assert.equal(
      paratii.eth.web3.utils.toBN(balanceBefore.toString())
      .add(paratii.eth.web3.utils.toBN(unstakedDeposit.toString())).toString()
    , paratii.eth.web3.utils.toBN(balanceAfter.toString()).toString())

    // there shouldn't be an application
    appWasMade = await paratii.eth.tcr.appWasMade(id)
    assert.isFalse(appWasMade)

    // the video shouldn't be isWhitelisted
    isWhitelisted = await paratii.eth.tcr.isWhitelisted(id)
    assert.isFalse(isWhitelisted)
  })

  it('user should be able to vote on a non-whitelisted video (really just messing around now)', async function () {

  })
})
