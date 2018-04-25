import { Paratii } from '../../src/paratii.js'
import { testAccount, privateKey17 } from '../utils.js'
import { assert } from 'chai'
// import { BigNumber } from 'bignumber.js'

describe('TCR Registry:', function () {
  let paratii, tcrRegistry, challengeID, tcrPLCRVoting

  before(async function () {
    paratii = new Paratii({account: testAccount})
    // paratii = new Paratii(testConfig)
    await paratii.eth.deployContracts()
    tcrRegistry = await paratii.eth.getContract('TcrRegistry')
    tcrPLCRVoting = await paratii.eth.getContract('TcrPLCRVoting')
    assert.isOk(tcrRegistry)
    assert.isOk(tcrRegistry.options.address)
    assert.isOk(tcrPLCRVoting)
    assert.isOk(tcrPLCRVoting.options.address)
  })

  it('should already be deployed', async function () {
    // console.log('registryAddress: ', tcrRegistry.options.address)
    let registryName = await tcrRegistry.methods.name().call()
    // console.log('registryName: ', registryName)
    assert.isOk(registryName)
    assert.equal(registryName, 'paratii test TCR integration')
  })

  it('PLCRVoting, Parameterizer and Token address should not be 0x0', async function () {
    let _voting = await tcrRegistry.methods.voting().call()
    let _parameterizer = await tcrRegistry.methods.parameterizer().call()
    let _token = await tcrRegistry.methods.token().call()

    assert.isOk(_voting)
    assert.isOk(_parameterizer)
    assert.isOk(_token)

    let tcrPLCRVoting = await paratii.eth.getContract('TcrPLCRVoting')
    let tcrParameterizer = await paratii.eth.getContract('TcrParameterizer')
    let token = await paratii.eth.getContract('ParatiiToken')
    assert.equal(_token, token.options.address)
    assert.equal(_voting, tcrPLCRVoting.options.address)
    assert.equal(_parameterizer, tcrParameterizer.options.address)
  })

  it('test_video_id should not be whitelisted', async function () {
    let isWhitelisted = await tcrRegistry.methods.isWhitelisted(
      paratii.eth.web3.utils.soliditySha3('test_video_id')
    ).call()
    assert.isFalse(isWhitelisted)
  })

  it('should allow new video to be listed', async function () {
    let token = await paratii.eth.getContract('ParatiiToken')
    assert.isOk(token)

    let amountToAllowWei = paratii.eth.web3.utils.toWei('100')
    let amountToAllowInHex = paratii.eth.web3.utils.toHex(amountToAllowWei)
    let tx2 = await token.methods.approve(tcrRegistry.options.address, amountToAllowInHex).send()
    assert.isOk(tx2)

    // let allowance = await token.methods.allowance(address, tcrRegistry.options.address).call()
    // assert.equal(allowance, paratii.eth.web3.utils.toWei('100'))

    let applicationTx = await tcrRegistry.methods.apply(
      paratii.eth.web3.utils.soliditySha3('test_video_id'),
      paratii.eth.web3.utils.toWei('20'),
      ''
    ).send()

    assert.isOk(applicationTx)
    assert.isOk(applicationTx.events._Application)
    // console.log('apply Tx', applicationTx)
  })

  it('application was made', async function () {
    let appWasMade = await tcrRegistry.methods.appWasMade(
      paratii.eth.web3.utils.soliditySha3('test_video_id')
    ).call()

    assert.isTrue(appWasMade)
  })

  it('should be able to deposit', async function () {
    let depositTx = await tcrRegistry.methods.deposit(
      paratii.eth.web3.utils.soliditySha3('test_video_id'),
      paratii.eth.web3.utils.toWei('42')
    ).send()

    assert.isOk(depositTx)
    assert.isOk(depositTx.events._Deposit)
  })

  it('should be able to withdraw', async function () {
    let withdrawTx = await tcrRegistry.methods.withdraw(
      paratii.eth.web3.utils.soliditySha3('test_video_id'),
      paratii.eth.web3.utils.toWei('20')
    ).send()

    assert.isOk(withdrawTx)
    assert.isOk(withdrawTx.events._Withdrawal)
    // console.log('withdraw: ', withdrawTx.events._Withdrawal.returnValues)
  })

  it('challenge should NOT exist yet', async function () {
    let challengeExists = await tcrRegistry.methods.challengeExists(
      paratii.eth.web3.utils.soliditySha3('test_video_id')
    ).call()

    assert.isFalse(challengeExists)
  })

  it('should be able to start a challenge', async function () {
    // create challenger account
    let challengerAccount = await paratii.eth.web3.eth.accounts.wallet.add({
      privateKey: privateKey17
    })
    assert.isOk(challengerAccount)
    console.log('challengerAccount: ', challengerAccount)

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
    // console.log('transferTx', transferTx, '\nbalanceOf:', balanceOfAddress1)
    // console.log('balanceOf challengerAccount: ', balanceOfAddress1)

    let challengeTx = await tcrRegistry.methods.challenge(
      paratii.eth.web3.utils.soliditySha3('test_video_id'),
      ''
    ).send({from: paratii.eth.web3.eth.accounts[1]})

    // let balanceAfter = await token.methods.balanceOf(challengerAccount.address).call()
    // console.log('balanceOf challengerAccount After: ', balanceAfter)

    // check if the listing has challengeID now
    // let struct = await tcrRegistry.methods.listings(paratii.eth.web3.utils.soliditySha3('test_video_id')).call()
    // console.log('struct: ', struct)

    // console.log('challengeTx ', challengeTx)
    assert.isOk(challengeTx)
    assert.isOk(challengeTx.events._Challenge)
    challengeID = challengeTx.events._Challenge.returnValues.challengeID
    // console.log('challengeID: ', challengeID)
  })

  it('should be able to vote on existing challenge', async function () {
    // create Voter account.
    let voterAccount = await paratii.eth.web3.eth.accounts.create('54674321§3456764321§3456743')
    let addedVoterAccount = await paratii.eth.web3.eth.accounts.wallet.add({
      privateKey: voterAccount.privateKey
    })

    console.log('voterAccount: ', voterAccount)
    console.log('addedVoterAccount: ', addedVoterAccount)

    // fund it.
    let token = await paratii.eth.getContract('ParatiiToken')
    assert.isOk(token)
    let transferTx = await token.methods.transfer(
      voterAccount.address,
      paratii.eth.web3.utils.toWei('40')
    ).send()

    assert.isOk(transferTx)
    let balanceOfVoter = await token.methods.balanceOf(voterAccount.address).call()
    assert.equal(balanceOfVoter, paratii.eth.web3.utils.toWei('40'))
    console.log('balanceOfVoter: ', balanceOfVoter)
    // approve PLCRVoting
    let approveTx = await token.methods.approve(
      tcrPLCRVoting.options.address,
      paratii.eth.web3.utils.toWei('1')
    ).send({from: paratii.eth.web3.eth.accounts[2]})
    assert.isOk(approveTx)
    console.log('approveTx', approveTx)
    // voting process.
    // 1. create voteSaltHash
    let vote = 1
    let salt = 420 // this gotta be some random val
    let voteSaltHash = paratii.eth.web3.utils.soliditySha3(vote, salt)
    let amount = paratii.eth.web3.utils.toWei('1')

    // 2. request voting rights as voter.
    let requestVotingRightsTx = await tcrPLCRVoting.methods.requestVotingRights(
      amount
    ).send({from: paratii.eth.web3.eth.accounts[2]})

    console.log('requestVotingRightsTx: ', requestVotingRightsTx)
    assert.isOk(requestVotingRightsTx)
    assert.isOk(requestVotingRightsTx.events._VotingRightsGranted)
    // 3. getPrevious PollID
    let prevPollID = await tcrPLCRVoting.methods.getInsertPointForNumTokens(
      voterAccount.address,
      amount,
      challengeID
    ).call()
    console.log('prevPollID: ', prevPollID)
    assert.isOk(prevPollID)

    // 4. finally commitVote.
    let commitVoteTx = await tcrPLCRVoting.methods.commitVote(
      challengeID,
      voteSaltHash,
      amount,
      prevPollID
    ).send({from: paratii.eth.web3.eth.accounts[2]})

    console.log('commitVoteTx', commitVoteTx)
  })
})
