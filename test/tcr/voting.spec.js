import { Paratii } from '../../src/paratii.js'
import { testAccount } from '../utils.js'
import { assert } from 'chai'
// import { BigNumber } from 'bignumber.js'

describe('PLCRVoting:', function () {
  let paratii, tcrRegistry, tcrParameterizer, tcrPLCRVoting

  before(async function () {
    paratii = new Paratii({account: testAccount})
    // paratii = new Paratii(testConfig)
    await paratii.eth.deployContracts()
    tcrRegistry = await paratii.eth.getContract('TcrRegistry')
    tcrParameterizer = await paratii.eth.getContract('TcrParameterizer')
    tcrPLCRVoting = await paratii.eth.getContract('TcrPLCRVoting')
    assert.isOk(tcrRegistry)
    assert.isOk(tcrRegistry.options.address)
    assert.isOk(tcrParameterizer)
    assert.isOk(tcrParameterizer.options.address)

    assert.isOk(tcrPLCRVoting)
    assert.isOk(tcrPLCRVoting.options.address)
  })

  it('should be deployed correctly', async function () {
    let _token = await tcrPLCRVoting.methods.token().call()
    let token = await paratii.eth.getContract('ParatiiToken')
    assert.equal(_token, token.options.address)
  })

  it('startPoll', async function () {
    let voteQuorum = await tcrParameterizer.methods.get('voteQuorum').call()
    let commitStageLen = await tcrParameterizer.methods.get('commitStageLen').call()
    let revealStageLen = await tcrParameterizer.methods.get('revealStageLen').call()

    let pollTx = await tcrPLCRVoting.methods.startPoll(
      voteQuorum,
      commitStageLen,
      revealStageLen
    ).send()

    assert.isOk(pollTx)
    assert.isOk(pollTx.events._PollCreated)
    assert.equal(pollTx.events._PollCreated.returnValues.pollID, '1')
    // console.log(pollTx.events._PollCreated.returnValues)
  })
})
