import { Paratii } from '../lib/paratii.js'
import { address, privateKey, address1 } from './utils.js'
import { assert } from 'chai'

describe('paratii.eth.events API: :', function () {
  let paratii
  before(async function () {
    paratii = await new Paratii({
      provider: 'http://localhost:8545',
      address: address,
      privateKey: privateKey
    })
    await paratii.eth.deployContracts()
    paratii.eth.web3.setProvider('ws://localhost:8546')
  })

  it.skip('subscription to Tranfer PTI events should work as expected', function (done) {
    let beneficiary = '0xDbC8232Bd8DEfCbc034a0303dd3f0Cf41d1a55Cf'
    let amount = paratii.eth.web3.utils.toWei('4', 'ether')

    paratii.eth.events.addListener('TransferPTI', function (log) {
      const received = log.returnValues.value
      assert.equal(received, amount)
      done()
    })

    paratii.eth.transfer(beneficiary, amount, 'PTI')
  })

  it.skip('subscription to Tranfer ETH events should work as expected', function (done) {
    let beneficiary = '0xDbC8232Bd8DEfCbc034a0303dd3f0Cf41d1a55Cf'
    let amount = paratii.eth.web3.utils.toWei('4', 'ether')
    let description = 'thanks for all the fish'

    paratii.eth.events.addListener('TransferETH', function (log) {
      let to = log.returnValues.to
      let value = log.returnValues.value
      let desc = log.returnValues.description
      assert.equal(to, beneficiary)
      assert.equal(value, amount)
      assert.equal(desc, description)
      done()
    })

    paratii.eth.transfer(beneficiary, amount, 'ETH', description)
  })

  it('subscription to Create Video events should work as expected', async function () {
    let creator = address1
    let price = 3 * 10 ** 18
    let ipfsHash = 'xyz'
    let ipfsData = 'zzz'
    let videoId = 'some-id'

    let userId = address
    let userData = {
      id: userId,
      name: 'Humbert Humbert',
      email: 'humbert@humbert.ru',
      ipfsHash: 'some-hash'
    }

    // await paratii.eth.web3.eth.clearSubscriptions()
    // await paratii.eth.events.addListener('CreateVideo', function (log) {
    //   console.log('video created')
    //   // console.log(paratii.eth.events._subscriptions)
    //   const receivedVideoId = log.returnValues.videoId
    //   assert.equal(videoId, receivedVideoId)
    // })

    let options = {
      fromBlock: null,
      topics: null
    }

    let subscription2Logs = await paratii.eth.web3.eth.subscribe('logs', options, function (err, result, subscription) {
      // console.log(err, result, subscription)
      console.log('2-callback subscription2Logs')
      console.log(err)
      console.log(result)
    })

    let contract = await paratii.eth.getContract('Videos')
    let subscription2Create = await contract.events.LogCreateVideo(options, function (err, result) {
      console.log('callback subscription2Create')
      console.log(err)
    })
    subscription2Create.on('data', function (log) {
      console.log('---------------subscription2Create Triggered!')
      // const receivedVideoId = log.returnValues.videoId
    })
    subscription2Create.on('error', function (err) {
      console.log(err)
    })
    // console.log(subscription2Create)

    // await sleep(100)
    // console.log(subscription)
    // console.log(paratii.eth.events._subscriptions)
    // paratii.eth.users.create(userData)
    await sleep(1000)
    console.log('create video..')
    await paratii.eth.vids.create({
      id: videoId,
      price: price,
      owner: creator,
      ipfsHash: ipfsHash,
      ipfsData: ipfsData
    })

    // await paratii.eth.vids.create({
    //   id: videoId + '1',
    //   price: price,
    //   owner: creator,
    //   ipfsHash: ipfsHash,
    //   ipfsData: ipfsData
    // })

    await sleep(1000)
    // await sleep(1000)
      // paratii.eth.vids.delete(videoId).then(function(res){
      //   console.log('deleted', res)
      // })
    // })
    function sleep (ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
  })

  it.skip('TOFIX: subscription to Update Video events should work as expected', function (done) {
    let creator = address1
    let price = 3 * 10 ** 18
    let ipfsHash = 'xyz'
    let ipfsData = 'zzz'
    let videoId = 'some-id'

    paratii.eth.events.addListener('UpdateVideo', function (log) {
      const receivedVideoId = log.returnValues.videoId
      assert.equal(videoId, receivedVideoId)
      done()
    })

    paratii.eth.vids.update(videoId, {
      id: videoId,
      price: price,
      owner: creator,
      ipfsHash: ipfsHash,
      ipfsData: ipfsData
    })
  })

  it.skip('subscription to Remove Video events should work as expected', function (done) {
    let videoId = 'some-id'

    paratii.eth.events.addListener('RemoveVideo', function (log) {
      const receivedVideoId = log.returnValues.videoId
      assert.equal(videoId, receivedVideoId)
      done()
    })

    paratii.eth.vids.delete(videoId)
  })
  it.skip('subscription to Create User events should work as expected', function (done) {
    let userId = address
    let userData = {
      id: userId,
      name: 'Humbert Humbert',
      email: 'humbert@humbert.ru',
      ipfsHash: 'some-hash'
    }

    paratii.eth.events.addListener('CreateUser', function (log) {
      const receivedVideoId = log.returnValues._address
      assert.equal(userData.id, receivedVideoId)
      done()
    })

    paratii.eth.users.create(userData)
  })
})
