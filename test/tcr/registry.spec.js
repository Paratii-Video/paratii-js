import { Paratii } from '../../src/paratii.js'
import { testAccount, address1 } from '../utils.js'
import { assert } from 'chai'
// import { BigNumber } from 'bignumber.js'

describe('TCR Registry:', function () {
  let paratii, tcrRegistry

  before(async function () {
    paratii = new Paratii({account: testAccount})
    // paratii = new Paratii(testConfig)
    await paratii.eth.deployContracts()
    tcrRegistry = await paratii.eth.getContract('TcrRegistry')
    assert.isOk(tcrRegistry)
    assert.isOk(tcrRegistry.options.address)
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

    let contracts = await paratii.eth.getContracts()
    console.log('contracts: ', Object.keys(contracts))
    // console.log('contracts: TcrPLCRVoting ', contracts.TcrPLCRVoting.options)
    console.log('_voting: ', _voting)
    console.log('TcrPLCRVoting: ', contracts.TcrPLCRVoting.options.adddress)
    assert.equal(_voting, contracts.TcrPLCRVoting.options.adddress)
    assert.equal(_parameterizer, contracts.TcrParameterizer.options.adddress)
    assert.equal(_token, contracts.ParatiiToken.options.adddress)
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
      paratii.eth.web3.utils.toWei('20')
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
  })

  it('challenge should NOT exist yet', async function () {
    let challengeExists = await tcrRegistry.methods.challengeExists(
      paratii.eth.web3.utils.soliditySha3('test_video_id')
    ).call()

    assert.isFalse(challengeExists)
  })

  it('should be able to start a challenge', async function () {
    // fund address1
    let token = await paratii.eth.getContract('ParatiiToken')
    assert.isOk(token)
    let transferTx = await token.methods.transfer(
      address1,
      paratii.eth.web3.utils.toWei('40')
    ).send()

    assert.isOk(transferTx)
    let balanceOfAddress1 = await token.methods.balanceOf(address1).call()
    assert.equal(balanceOfAddress1, paratii.eth.web3.utils.toWei('40'))
    console.log('transferTx', transferTx, '\nbalanceOf:', balanceOfAddress1)

    let challengeTx = await tcrRegistry.methods.challenge(
      paratii.eth.web3.utils.soliditySha3('test_video_id'),
      ''
    ).send({from: address1})

    console.log('challengeTx ', challengeTx)
    assert.isOk(challengeTx)
    assert.isOk(challengeTx.events._Challenge)
  })
})
