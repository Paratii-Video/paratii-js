import { Paratii } from '../../src/paratii.js'
import { testAccount, privateKey17, challengeFromDifferentAccount, voteFromDifferentAccount } from '../utils.js'
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
    challengeID = await challengeFromDifferentAccount(privateKey17, 'test_video_id', 40, paratii)
  })

  it('should be able to vote on existing challenge', async function () {
    let voterAccount = await paratii.eth.web3.eth.accounts.create('54674321§3456764321§3456743')
    assert.isOk(voterAccount)

    await voteFromDifferentAccount(voterAccount.privateKey, challengeID, 1, 40, paratii)
  })
})
