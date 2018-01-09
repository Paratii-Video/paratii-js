import { Paratii } from '../lib/paratii.js'
import { address, privateKey } from './utils.js'
import { assert } from 'chai'

describe('paratii.eth.events API: :', function () {
  let paratii

  beforeEach(async function () {
    paratii = await new Paratii({
      provider: 'http://localhost:8545',
      address: address,
      privateKey: privateKey
    })
    await paratii.eth.deployContracts()
  })

  it('subscription to Tranfer PTI events should work as expected', function (done) {
    paratii.eth.web3.setProvider('ws://localhost:8546/rpc/')
    let beneficiary = '0xDbC8232Bd8DEfCbc034a0303dd3f0Cf41d1a55Cf'
    let amount = paratii.eth.web3.utils.toWei('4', 'ether')

    let ptiTransferData = paratii.eth.events.addListener('TransferPTI', function (log) {
      const received = paratii.eth.web3.utils.hexToNumberString(log.returnValues.value)
      assert.equal(received, amount)
      done()
      ptiTransferData.unsubscribe()
    })

    // console.log(ptiTransferData)

    paratii.eth.transfer(beneficiary, amount, 'PTI')
  })

  it.skip('subscription to Create Video events should work as expected', function () {
    // let videoCreate = paratii.eth.events.addListener('logs')
    let creator = '0xDbC8232Bd8DEfCbc034a0303dd3f0Cf41d1a55Cf'
    let price = 3 * 10 ** 18
    let ipfsHash = 'xyz'
    let ipfsData = 'zzz'
    let videoId = 'some-id'

    // let logCreateVideoData = paratii.eth.events.addListener('LogCreateVideo', function (log) {
    //   console.log(log)
    //   done()
    // })

    paratii.eth.vids.create({
      id: videoId,
      price: price,
      owner: creator,
      ipfsHash: ipfsHash,
      ipfsData: ipfsData
    })
  })
})
