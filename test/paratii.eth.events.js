import { Paratii } from '../src/paratii.js'
import { testConfigWS, address, address1, voucherAmountInitial11 } from './utils.js'
import { assert } from 'chai'

describe('paratii.eth.events API: :', function () {
  let paratii
  before(async function () {
    paratii = new Paratii(testConfigWS)
    await paratii.eth.deployContracts()
    let token = await paratii.eth.getContract('ParatiiToken')
    let vouchers = await paratii.eth.getContract('Vouchers')
    let distributor = await paratii.eth.getContract('PTIDistributor')
    await token.methods.transfer(vouchers.options.address, voucherAmountInitial11).send()
    await token.methods.transfer(distributor.options.address, voucherAmountInitial11).send()
    await paratii.eth.setRegistryAddress(paratii.config.eth.registryAddress)
  })

  it('subscription to Tranfer PTI events should work as expected', function (done) {
    let beneficiary = '0xDbC8232Bd8DEfCbc034a0303dd3f0Cf41d1a55Cf'
    let amount = paratii.eth.web3.utils.toWei('4', 'ether')
    // console.log(testConfigWS)
    // let balance = await paratii.eth.balanceOf(testConfigWS.account.address, 'PTI')
    // let balan ceeth = await paratii.eth.balanceOf(testConfigWS.account.address, 'ETH')

    // console.log(balanceeth)
    // console.log(balance)
    paratii.eth.events.addListener('TransferPTI', function (log) {
      const received = log.returnValues.value
      if (amount === log.returnValues.value) {
        assert.equal(received, amount)
        done()
      }
    })

    paratii.eth.transfer(beneficiary, amount, 'PTI')
  })

  it('subscription to Tranfer ETH events should work as expected', function (done) {
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

  it('subscription to Create Video events should work as expected', function (done) {
    let creator = address1
    let price = 3 * 10 ** 18
    let ipfsHash = 'xyz'
    let ipfsData = 'zzz'
    let number = Math.random()
    let videoId = number.toString(36).substr(2, 9)

    paratii.eth.events.addListener('CreateVideo', function (log) {
      const receivedVideoId = log.returnValues.videoId
      if (videoId === receivedVideoId) {
        assert.equal(videoId, receivedVideoId)
        done()
      }
    })

    paratii.eth.vids.create({
      id: videoId,
      price: price,
      owner: creator,
      ipfsHash: ipfsHash,
      ipfsData: ipfsData
    })
  })

  it('subscription to Create Video events should work as expected if triggered twice', function (done) {
    let creator = address1
    let price = 3 * 10 ** 18
    let ipfsHash = 'xyz'
    let ipfsData = 'zzz'
    let number = Math.random()
    let number2 = Math.random()
    let videoId = number.toString(36).substr(2, 9)
    let videoId2 = number2.toString(36).substr(2, 9)
    let counter = 0
    let success = 2

    paratii.eth.events.addListener('CreateVideo', function (log) {
      const receivedVideoId = log.returnValues.videoId
      if (receivedVideoId === videoId) {
        assert.equal(videoId, receivedVideoId)
      }
      if (receivedVideoId === videoId2) {
        assert.equal(videoId2, receivedVideoId)
      }
      counter++

      if (counter === success) {
        done()
      }
    })

    paratii.eth.vids.create({
      id: videoId,
      price: price,
      owner: creator,
      ipfsHash: ipfsHash,
      ipfsData: ipfsData
    }).then(function () {
      paratii.eth.vids.create({
        id: videoId2,
        price: price,
        owner: creator,
        ipfsHash: ipfsHash,
        ipfsData: ipfsData
      })
    })
  })

  it('subscription to Update Video events should work as expected', function (done) {
    let creator = address1
    let price = 3 * 10 ** 18
    let ipfsHash = 'xyz'
    let ipfsData = 'zzz'
    let number = Math.random()
    let videoId = number.toString(36).substr(2, 9)
    let counter = 0
    // update it's call twice, from create and from update
    let success = 2
    paratii.eth.events.addListener('UpdateVideo', function (log) {
      const receivedVideoId = log.returnValues.videoId
      counter++
      if (videoId === receivedVideoId && counter === success) {
        assert.equal(videoId, receivedVideoId)
        done()
      }
    })

    paratii.eth.vids.create({
      id: videoId,
      price: price,
      owner: creator,
      ipfsHash: ipfsHash,
      ipfsData: ipfsData
    }).then(function () {
      paratii.eth.vids.update(videoId, {
        id: videoId,
        price: price,
        owner: creator,
        ipfsHash: ipfsHash,
        ipfsData: ipfsData
      })
    })
  })

  it('subscription to Remove Video events should work as expected', function (done) {
    let creator = address1
    let price = 3 * 10 ** 18
    let ipfsHash = 'xyz'
    let ipfsData = 'zzz'
    let number = Math.random()
    let videoId = number.toString(36).substr(2, 9)

    paratii.eth.events.addListener('RemoveVideo', function (log) {
      const receivedVideoId = log.returnValues.videoId
      assert.equal(videoId, receivedVideoId)
      done()
    })

    paratii.eth.vids.create({
      id: videoId,
      price: price,
      owner: creator,
      ipfsHash: ipfsHash,
      ipfsData: ipfsData
    }).then(function () {
      paratii.eth.vids.delete(videoId)
    })
  })
  it('subscription to Create User events should work as expected', function (done) {
    let userId = address
    let userData = {
      id: userId,
      name: 'Humbert Humbert',
      email: 'humbert@humbert.ru',
      ipfsData: 'some-hash'
    }

    paratii.eth.events.addListener('CreateUser', function (log) {
      const receivedUserId = log.returnValues._address

      if (receivedUserId === userId) {
        assert.equal(userData.id, receivedUserId)
        done()
      }
    })

    paratii.eth.users.create(userData)
  })
  it('subscription to Remove User events should work as expected', function (done) {
    let userId = address1
    let userData = {
      id: userId,
      name: 'Humbert Humbert',
      email: 'humbert@humbert.ru',
      ipfsData: 'some-hash'
    }

    paratii.eth.events.addListener('RemoveUser', function (log) {
      const receivedUserId = log.returnValues._address

      if (receivedUserId === userId) {
        assert.equal(userData.id, receivedUserId)
        done()
      }
    })

    paratii.eth.users.create(userData).then(function () {
      paratii.eth.users.delete(userId)
    })
  })
  it('subscription to Create Voucher should work as expected', function (done) {
    let voucher = {
      voucherCode: 'FISHFORFEE42',
      amount: 42
    }

    paratii.eth.events.addListener('CreateVoucher', function (log) {
      assert.equal(log.returnValues._amount, voucher.amount)
      done()
    })

    paratii.eth.vouchers.create(voucher)
  })
  it.skip('TO BE IMPLEMENTED: subscription to Remove Voucher should work as expected', function (done) {
    let voucher = {
      voucherCode: 'FISHFORFEE42',
      amount: 42
    }

    paratii.eth.events.addListener('RemoveVoucher', function (log) {
      assert.equal(log.returnValues._amount, voucher.amount)
      done()
    })

    paratii.eth.vouchers.create(voucher).then(function () {
      paratii.eth.vouchers.remove(voucher)
    })
  })
  it('subscription to Redeem Voucher should work as expected', function (done) {
    let voucher = {
      voucherCode: 'FISHFORFEE42',
      amount: 42
    }

    paratii.eth.events.addListener('RedeemVoucher', function (log) {
      assert.equal(log.returnValues._amount, voucher.amount)
      done()
    })

    paratii.eth.vouchers.redeem(voucher.voucherCode)
  })

  it.skip('subscription to Redeem Voucher should fail if already redeemed', function (done) {
    let voucher = {
      voucherCode: 'FISHFORFEE42',
      amount: 42
    }

    paratii.eth.events.addListener('RedeemVoucher', function (log) {
      assert.notEqual(log.returnValues._amount, voucher.amount)
      done()
    })

    paratii.eth.vouchers.redeem(voucher.voucherCode)
  })

  it('subscription to Application TCR should work as expected', function (done) {
    let amount = 5
    amount = paratii.eth.web3.utils.toWei(amount.toString())
    let videoId = 'some-vide-id'
    let expectedBytes = paratii.eth.tcr.getHash(videoId)

    paratii.eth.events.addListener('Application', function (log) {
      assert.equal(log.returnValues.listingHash, expectedBytes)
      assert.equal(log.returnValues.deposit, amount)
      done()
    })

    paratii.eth.tcr.checkEligiblityAndApply(videoId, amount)
  })

  it('subscription to Application TCR Placeholder should work as expected', function (done) {
    let amount = 5
    amount = paratii.eth.web3.utils.toWei(amount.toString())
    let videoId = 'some-vide-id2'

    paratii.eth.events.addListener('PHApplication', function (log) {
      assert.equal(log.returnValues.videoId, videoId)
      assert.equal(log.returnValues.deposit, amount)
      done()
    })

    paratii.eth.tcrPlaceholder.checkEligiblityAndApply(videoId, amount)
  })
  it.skip('TBI subscription to NewVideoWhitelisted TCR should work as expected', function (done) {
    let amount = 5
    amount = paratii.eth.web3.utils.toWei(amount.toString())
    let videoId = 'some-vide-id'

    paratii.eth.events.addListener('Application', function (log) {
      assert.equal(log.returnValues.videoId, videoId)
      assert.equal(log.returnValues.deposit, amount)
      done()
    })
    paratii.eth.tcr.checkEligiblityAndApply(videoId, amount)
  })

  it('subscription to LogDistribute should work as expected', function (done) {
    const amount = 5 ** 18
    const reason = 'email_verification'
    const salt = paratii.eth.web3.utils.sha3('' + Date.now())

    paratii.eth.distributor.generateSignature(amount, salt, reason, address).then(function (signature) {
      let v = signature.v
      let r = signature.r
      let s = signature.s

      paratii.eth.events.addListener('Distribute', function (log) {
        assert.equal(log.returnValues._amount, amount)
        assert.equal(log.returnValues._reason, reason)
        assert.equal(log.returnValues._toAddress, address1)
        done()
      })

      paratii.eth.distributor.distribute({address: address1, amount, salt, reason, v, r, s})
    })
  })
})
