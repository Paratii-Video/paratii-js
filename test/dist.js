import { Paratii } from '../dist/paratii.js'
import { testConfig, mineABlock } from './utils.js'
import { assert } from 'chai'

describe('Paratii dist should work:', function () {
  let paratii

  beforeEach(async function () {
    paratii = new Paratii(testConfig)
    await paratii.eth.deployContracts()
  })

  it('paratii exists..', async function () {
    assert.isOk(paratii)
  })

  it('should be able to simulate the passing of time ', async function () {
    let block = await paratii.eth.web3.eth.getBlock('latest')
    console.log('current timestamp: ', block.timestamp)
    let startingTimestamp = block.timestamp

    while (block.timestamp <= (startingTimestamp + 200)) {
      block = await mineABlock(paratii)
      console.log('mined a block, ', block.timestamp, 'target: ', (startingTimestamp + 2000))
    }

    console.log('mined a block, ', block.timestamp)
  })
})
