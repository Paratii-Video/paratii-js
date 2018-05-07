import { Paratii } from '../../src/paratii.js'
import { testAccount } from '../utils.js'
import { assert } from 'chai'
// import { BigNumber } from 'bignumber.js'

let tcrConfig = require('sol-tcr/conf/config.json')

describe('Parameterizer:', function () {
  let paratii, tcrRegistry, tcrParameterizer

  before(async function () {
    paratii = new Paratii({account: testAccount})
    // paratii = new Paratii(testConfig)
    await paratii.eth.deployContracts()
    tcrRegistry = await paratii.eth.getContract('TcrRegistry')
    tcrParameterizer = await paratii.eth.getContract('TcrParameterizer')
    assert.isOk(tcrRegistry)
    assert.isOk(tcrRegistry.options.address)
    assert.isOk(tcrParameterizer)
    assert.isOk(tcrParameterizer.options.address)
  })

  it('should point to the same Token/PLCRVoting contracts', async function () {
    let _token = await tcrParameterizer.methods.token().call()
    let _voting = await tcrParameterizer.methods.voting().call()

    let token = await paratii.eth.getContract('ParatiiToken')
    let tcrPLCRVoting = await paratii.eth.getContract('TcrPLCRVoting')

    assert.equal(_token, token.options.address)
    assert.equal(_voting, tcrPLCRVoting.options.address)
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
})
