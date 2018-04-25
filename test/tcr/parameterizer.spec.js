import { Paratii } from '../../src/paratii.js'
import { testAccount } from '../utils.js'
import { assert } from 'chai'
// import { BigNumber } from 'bignumber.js'

let tcrConfig = require('sol-tcr/conf/config.json')
let parameterizerConfig = tcrConfig.paramDefaults

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

  it('params should equal default config', async function () {
    let deposit = await tcrParameterizer.methods.get('minDeposit').call()
    assert.isOk(deposit)
    assert.equal(deposit, 10)

    let params = ['voteQuorum', 'commitStageLen', 'revealStageLen']
    // let params = Object.keys(parameterizerConfig)
    params.forEach(async (param) => {
      let val = await tcrParameterizer.methods.get(param).call()
      console.log(`${param}: ${val}`)
      assert.equal(param, parameterizerConfig[param])
    })
    // TODO all the other params.
  })
})
