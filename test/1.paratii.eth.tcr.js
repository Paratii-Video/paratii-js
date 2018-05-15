import { Paratii } from '../src/paratii.js'
import { address, testConfig, privateKey17, address17, challengeFromDifferentAccount, voteFromDifferentAccount, revealVoteFromDifferentAccount } from './utils.js'
import { assert } from 'chai'
import { BigNumber } from 'bignumber.js'

describe('paratii.eth.tcr:', function () {
  let paratii
  let tcrConfig

  before(async function () {
    paratii = new Paratii(testConfig)
    tcrConfig = require(paratii.config.eth.tcrConfigFile)
    await paratii.eth.deployContracts()
    console.log('tcrConfig: ', tcrConfig)
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
  let myPrivateKey = '0x55e23c060d7d5e836b776852772d7de52d1756fc857d0493b4374a21e03d9c18'
  // let myAddress = '0x77Db6De1baD96E52492A25e0e86480F3a0A24Ae1'

  let myPrivateKey1 = '0x0690816a7e30ab2865f81ab924e0009d092f5d4c937eb7b39070f93cf153d5c9'
  // let myAddress2 = '0x246057C676E0EBA07F645A194E99B553b8afd2ad'

  let myPrivateKey2 = '0x4fb2363a8880b279e38316b749ad163708a5dc4445e3f69fdc58475054d77601'
  // let myAddress3 = '0x7d3f3a0c7ec67675ffc8B10b1F62D10096A14829'

  let privateKeyWithNoFunds = '0x50b2c2cd6a226d3f102c35af1220f7b36c9656efdec2590a47c4544a7d2ef497'
  // let addressWithNoFunds = '0xB7A4cE6D608BcF75d5d7219BcADAa0F45B5FcD0A'
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
    assert.isTrue(result)
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
    assert.isTrue(result)
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
    // console.log('starting challengeExists')
    let tcrRegistry = await paratii.eth.tcr.getTcrContract()

    // haven't applied yet
    let appWasMade = await paratii.eth.tcr.appWasMade(videoId5)
    assert.isFalse(appWasMade)

    // application for videoId5 --------------------------------------------------
    let result = await paratii.eth.tcr.checkEligiblityAndApply(videoId5, paratii.eth.web3.utils.toWei('5'))
    assert.isTrue(result)

    // application should be successful
    appWasMade = await paratii.eth.tcr.appWasMade(videoId5)
    assert.isTrue(appWasMade)

    // shouldn't be whitelisted yet
    let isWhitelisted = await paratii.eth.tcr.isWhitelisted(videoId5)
    assert.isFalse(isWhitelisted)

    // there shouldn't be challenges going on
    let challengeExists = await paratii.eth.tcr.challengeExists(videoId5)
    assert.isFalse(challengeExists)

    // await challengeFromDifferentAccount(myPrivateKey, videoId5, 40, paratii)
    let challengerAccount = await paratii.eth.web3.eth.accounts.wallet.add({
      privateKey: privateKey17
    })
    assert.isOk(challengerAccount)
    // console.log('challengerAccount: ', challengerAccount)

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
    // console.log('transferTx: ', transferTx)
    // console.log('transferTx: ', transferTx.events.Transfer.returnValues)

    let approveTx = await token.methods.approve(
      tcrRegistry.options.address,
      paratii.eth.web3.utils.toWei('39')
    ).send({from: paratii.eth.web3.eth.accounts.wallet[1].address})
    // ).send()
    assert.isOk(approveTx)
    // console.log('approval: ', approveTx)
    // console.log('approval values: ', approveTx.events.Approval.raw)

    let challengeTx = await tcrRegistry.methods.challenge(
      paratii.eth.web3.utils.soliditySha3(videoId5),
      ''
    ).send({from: paratii.eth.web3.eth.accounts.wallet[1].address})
    assert.isOk(challengeTx)
    // console.log('challengeTx: ', challengeTx)

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

  it('user should be able to vote on a non-whitelisted video', async function () {
    let id = 'i-need-a-new-id'
    let amount = 5
    let salt = 420 // this gotta be some random val

    // haven't applied yet
    let appWasMade = await paratii.eth.tcr.appWasMade(id)
    assert.isFalse(appWasMade)

    // apply
    let result = await paratii.eth.tcr.checkEligiblityAndApply(id, paratii.eth.web3.utils.toWei(amount.toString()))
    assert.isTrue(result)

    // applied
    appWasMade = await paratii.eth.tcr.appWasMade(id)
    assert.isTrue(appWasMade)

    // should be in apply stage
    let isInApplyStage = await paratii.eth.tcr.isInApplyStage(id)
    assert.isTrue(isInApplyStage)

    // shouldn't be whitelisted yet
    let isWhitelisted = await paratii.eth.tcr.isWhitelisted(id)
    assert.isFalse(isWhitelisted)

    // there shouldn't be challenges going on
    let challengeExists = await paratii.eth.tcr.challengeExists(id)
    assert.isFalse(challengeExists)

    let challengeID = await challengeFromDifferentAccount(myPrivateKey, id, 40, paratii)

    // there should be a challenges going on
    challengeExists = await paratii.eth.tcr.challengeExists(id)
    assert.isTrue(challengeExists)

    // shouldn't be whitelisted yet
    isWhitelisted = await paratii.eth.tcr.isWhitelisted(id)
    assert.isFalse(isWhitelisted)

    // commit period should still be going
    let isCommitPeriodActive = await paratii.eth.tcr.commitPeriodActive(challengeID)
    assert.isTrue(isCommitPeriodActive)

    // should be in apply stage
    isInApplyStage = await paratii.eth.tcr.isInApplyStage(id)
    assert.isTrue(isInApplyStage)

    // should be false because apply stage is not finished
    let canBeWhitelisted = await paratii.eth.tcr.canBeWhitelisted(id)
    assert.isFalse(canBeWhitelisted)

    // CURRENT SCENARIO ----------------------------------------------------------------------
    // the video is still in apply stage, a challenge is going on and we are in commit period,
    // nobody has voted

    await voteFromDifferentAccount(myPrivateKey, challengeID, 1, salt, 1, paratii)
    await voteFromDifferentAccount(myPrivateKey1, challengeID, 1, salt, 1, paratii)
    await voteFromDifferentAccount(myPrivateKey2, challengeID, 0, salt, 1, paratii)

    // commit period should still be going
    isCommitPeriodActive = await paratii.eth.tcr.commitPeriodActive(challengeID)
    assert.isTrue(isCommitPeriodActive)

    // apply stage should be finished
    isInApplyStage = await paratii.eth.tcr.isInApplyStage(id)
    assert.isFalse(isInApplyStage)

    // should be false even if the apply stage is finished because the challenge is not resolved
    canBeWhitelisted = await paratii.eth.tcr.canBeWhitelisted(id)
    assert.isFalse(canBeWhitelisted)

    // challenge can't be resolved because we are still in commit period
    let challengeCanBeResolved = await paratii.eth.tcr.challengeCanBeResolved(id)
    assert.isFalse(challengeCanBeResolved)

    // make tx so that the commit period is finished
    do {
      await paratii.eth.transfer(address17, 1, 'PTI')
      isCommitPeriodActive = await paratii.eth.tcr.commitPeriodActive(challengeID)
    } while (isCommitPeriodActive)

    // CURRENT SCENARIO ----------------------------------------------------------------------
    // the apply stage has finished but the video can't be whitelisted because a challenge is going on,
    // a challenge is going on and we are in reveal period,
    // there are 3 vote (2 for, 1 against) but nobody has revealed yet

    // should be false because we are in reveal period
    canBeWhitelisted = await paratii.eth.tcr.canBeWhitelisted(id)
    assert.isFalse(canBeWhitelisted)

    // challenge can't be resolved because we are in reveal period
    challengeCanBeResolved = await paratii.eth.tcr.challengeCanBeResolved(id)
    assert.isFalse(challengeCanBeResolved)

    await revealVoteFromDifferentAccount(myPrivateKey, challengeID, 1, salt, paratii)
    await revealVoteFromDifferentAccount(myPrivateKey1, challengeID, 1, salt, paratii)
    await revealVoteFromDifferentAccount(myPrivateKey2, challengeID, 0, salt, paratii)

    // make tx so that the reveal period is finished
    let isRevealPeriodActive
    do {
      await paratii.eth.transfer(address17, 1, 'PTI')
      isRevealPeriodActive = await paratii.eth.tcr.revealPeriodActive(challengeID)
    } while (isRevealPeriodActive)

    // the video should enter the whitelist succesfully because there are 2 votes for and 1 against
    let updateTx = await paratii.eth.tcr.updateStatus(id)
    assert.isOk(updateTx)
    assert.isOk(updateTx.events._ApplicationWhitelisted)
    assert.isOk(updateTx.events._ChallengeFailed)

    // the video should be isWhitelisted
    isWhitelisted = await paratii.eth.tcr.isWhitelisted(id)
    assert.isTrue(isWhitelisted)
  })
  it('startChallenge() should work correctly', async function () {
    let tcrRegistry = await paratii.eth.tcr.getTcrContract()
    let id = 'another-new-id'

    // haven't applied yet
    let appWasMade = await paratii.eth.tcr.appWasMade(id)
    assert.isFalse(appWasMade)

    // application for id --------------------------------------------------
    let result = await paratii.eth.tcr.checkEligiblityAndApply(id, paratii.eth.web3.utils.toWei('5'))
    assert.isTrue(result)

    // application should be successful
    appWasMade = await paratii.eth.tcr.appWasMade(id)
    assert.isTrue(appWasMade)

    // give approval to tcr
    await paratii.eth.approve(tcrRegistry.options.address, paratii.eth.web3.utils.toWei('40'))

    await paratii.eth.tcr.startChallenge(id)

    // there should be a challenges going on
    let challengeExists = await paratii.eth.tcr.challengeExists(id)
    assert.isTrue(challengeExists)
  })
  it('approveAndStartChallenge() should work correctly', async function () {
    let id = 'another-new-new-id'

    // haven't applied yet
    let appWasMade = await paratii.eth.tcr.appWasMade(id)
    assert.isFalse(appWasMade)

    // application for id --------------------------------------------------
    let result = await paratii.eth.tcr.checkEligiblityAndApply(id, paratii.eth.web3.utils.toWei('5'))
    assert.isTrue(result)

    // application should be successful
    appWasMade = await paratii.eth.tcr.appWasMade(id)
    assert.isTrue(appWasMade)

    await paratii.eth.tcr.approveAndStartChallenge(id)

    // there should be a challenges going on
    let challengeExists = await paratii.eth.tcr.challengeExists(id)
    assert.isTrue(challengeExists)
  })

  it('commit and reveal schema should work correctly', async function () {
    let id = 'new-new-id'
    let vote = 0

    // haven't applied yet
    let appWasMade = await paratii.eth.tcr.appWasMade(id)
    assert.isFalse(appWasMade)

    // application for id --------------------------------------------------
    let result = await paratii.eth.tcr.checkEligiblityAndApply(id, paratii.eth.web3.utils.toWei('5'))
    assert.isTrue(result)

    // application should be successful
    appWasMade = await paratii.eth.tcr.appWasMade(id)
    assert.isTrue(appWasMade)

    let challengeTx = await paratii.eth.tcr.approveAndStartChallenge(id)
    assert.isOk(challengeTx)
    assert.isOk(challengeTx.events._Challenge)

    let challengeID = await paratii.eth.tcr.getChallengeId(id)

    // there should be a challenges going on
    let challengeExists = await paratii.eth.tcr.challengeExists(id)
    assert.isTrue(challengeExists)

    // commit period should still be going
    let isCommitPeriodActive = await paratii.eth.tcr.commitPeriodActive(challengeTx.events._Challenge.returnValues.challengeID)
    assert.isTrue(isCommitPeriodActive)

    // one vote for
    let commitVoteTx = await paratii.eth.tcr.approveAndGetRightsAndCommitVote(id, vote, paratii.eth.web3.utils.toWei('1'))
    assert.isOk(commitVoteTx)
    assert.isOk(commitVoteTx.events._VoteCommitted)

    // make tx so that the commit period is finished
    do {
      await paratii.eth.transfer(address17, 1, 'PTI')
      isCommitPeriodActive = await paratii.eth.tcr.commitPeriodActive(challengeID)
    } while (isCommitPeriodActive)

    // we should be in reveal period
    let isRevealPeriodActive = await paratii.eth.tcr.revealPeriodActive(challengeID)
    assert.isTrue(isRevealPeriodActive)

    let revealTx = await paratii.eth.tcr.revealVote(challengeID, vote, paratii.eth.tcr.getSalt(id))
    assert.isOk(revealTx)
    assert.isOk(revealTx.events._VoteRevealed)

    // make tx so that the reveal period is finished
    do {
      await paratii.eth.transfer(address17, 1, 'PTI')
      isRevealPeriodActive = await paratii.eth.tcr.revealPeriodActive(challengeID)
    } while (isRevealPeriodActive)

    // reveal period is ended, challenge can be resolved
    let challengeCanBeResolved = await paratii.eth.tcr.challengeCanBeResolved(id)
    assert.isTrue(challengeCanBeResolved)

    // resolves the challenge
    let updateTx = await paratii.eth.tcr.updateStatus(id)
    assert.isOk(updateTx)
    // should succeed because there is only a vote against
    assert.isOk(updateTx.events._ChallengeSucceeded)
    assert.isOk(updateTx.events._ApplicationRemoved)

    // should be false because there was just 1 vote against --> listing rejected
    let isWhitelisted = await paratii.eth.tcr.isWhitelisted(id)
    assert.isFalse(isWhitelisted)
  })
  it.skip('[SHOULD WORK] User can commit multiple votes, but can reveal just the last one', async function () {
    let id = 'running-out-of-ids'

    // application for id --------------------------------------------------
    let result = await paratii.eth.tcr.checkEligiblityAndApply(id, paratii.eth.web3.utils.toWei('10'))
    assert.isTrue(result)

    // application should be successful
    let appWasMade = await paratii.eth.tcr.appWasMade(id)
    assert.isTrue(appWasMade)

    let challengeTx = await paratii.eth.tcr.approveAndStartChallenge(id)
    assert.isOk(challengeTx)
    assert.isOk(challengeTx.events._Challenge)

    let isCommitPeriodActive = await paratii.eth.tcr.commitPeriodActive(challengeTx.events._Challenge.returnValues.challengeID)
    assert.isTrue(isCommitPeriodActive)

    // TODO fix this

    // one vote for
    let commitVoteTx = await paratii.eth.tcr.approveAndGetRightsAndCommitVote(id, 1, paratii.eth.web3.utils.toWei('1'))
    assert.isOk(commitVoteTx)
    assert.isOk(commitVoteTx.events._VoteCommitted)

    // two vote for
    commitVoteTx = await paratii.eth.tcr.approveAndGetRightsAndCommitVote(id, 1, paratii.eth.web3.utils.toWei('1'))
    assert.isOk(commitVoteTx)
    assert.isOk(commitVoteTx.events._VoteCommitted)

    // one vote against
    commitVoteTx = await paratii.eth.tcr.approveAndGetRightsAndCommitVote(id, 0, paratii.eth.web3.utils.toWei('1'))
    assert.isOk(commitVoteTx)
    assert.isOk(commitVoteTx.events._VoteCommitted)
  })
  it('user can\'t vote if he doesn\'t have enough PTI', async function () {
    let id = 'joking'

    // application for id --------------------------------------------------
    let result = await paratii.eth.tcr.checkEligiblityAndApply(id, paratii.eth.web3.utils.toWei('10'))
    assert.isTrue(result)

    // application should be successful
    let appWasMade = await paratii.eth.tcr.appWasMade(id)
    assert.isTrue(appWasMade)

    let challengeTx = await paratii.eth.tcr.approveAndStartChallenge(id)
    assert.isOk(challengeTx)
    assert.isOk(challengeTx.events._Challenge)

    let tcrPLCRVoting = await paratii.eth.tcr.getPLCRVotingContract()
    assert.isOk(tcrPLCRVoting)

    // add voter account.
    let voterAccount = await paratii.eth.web3.eth.accounts.wallet.add({
      privateKey: privateKeyWithNoFunds
    })
    // index of the last added accounts
    let index = paratii.eth.web3.eth.accounts.wallet.length - 1
    assert.isOk(voterAccount)
    assert.isOk(paratii.eth.web3.eth.accounts.wallet[index])
    assert.equal(voterAccount.address, paratii.eth.web3.eth.accounts.wallet[index].address)

    // this address shouldn't have tokens
    let token = await paratii.eth.getContract('ParatiiToken')
    let startingFund = await token.methods.balanceOf(voterAccount.address).call()
    assert.equal(startingFund, 0)

    // approve PLCRVoting even if you don't have PTI
    let amountToVoteInWei = paratii.eth.web3.utils.toWei('1')
    let approveTx = await token.methods.approve(
      tcrPLCRVoting.options.address,
      amountToVoteInWei
    ).send({from: voterAccount.address})
    assert.isOk(approveTx)
    assert.isOk(approveTx.events.Approval)

    // request voting rights as voter. should fail given that you don't have tokens
    let requestVotingRightsTx = await tcrPLCRVoting.methods.requestVotingRights(
      amountToVoteInWei
    ).send({from: voterAccount.address})

    assert.isNotOk(requestVotingRightsTx.events._VotingRightsGranted)

    // shouldn't be able to vote
    let numTokens = await tcrPLCRVoting.methods.voteTokenBalance(voterAccount.address).call()
    assert.equal(numTokens, 0)
  })
})
