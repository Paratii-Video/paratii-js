import { Paratii } from '../lib/paratii.js'
import { address, privateKey, address1 } from './utils.js'
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
    paratii.eth.web3.setProvider('ws://localhost:8546')
  })

  it('subscription to Tranfer PTI events should work as expected', function (done) {
    let beneficiary = '0xDbC8232Bd8DEfCbc034a0303dd3f0Cf41d1a55Cf'
    let amount = paratii.eth.web3.utils.toWei('4', 'ether')

    let ptiTransferData = paratii.eth.events.addListener('TransferPTI', function (log) {
      const received = log.returnValues.value
      assert.equal(received, amount)
      done()
      ptiTransferData.unsubscribe()
    })

    paratii.eth.transfer(beneficiary, amount, 'PTI')
  })

  it('subscription to Create Video events should work as expected', function (done) {
    let creator = address1
    let price = 3 * 10 ** 18
    let ipfsHash = 'xyz'
    let ipfsData = 'zzz'
    let videoId = 'some-id'

    let logCreateVideoData = paratii.eth.events.addListener('LogCreateVideo', function (log) {
      const receivedVideoId = log.returnValues.videoId
      assert.equal(videoId, receivedVideoId)
      done()
      logCreateVideoData.unsubscribe()
    })

    paratii.eth.vids.create({
      id: videoId,
      price: price,
      owner: creator,
      ipfsHash: ipfsHash,
      ipfsData: ipfsData
    })
  })
})
