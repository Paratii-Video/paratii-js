import { Paratii } from '../lib/paratii.js'
import { address, address1, privateKey, address17, mnemonic23, address23 } from './utils.js'
import { add0x } from '../lib/utils.js'

var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const assert = chai.assert

describe('paratii.eth.wallet: :', function () {
  let paratii
  let mnemonic = mnemonic23
  let addresses = [
    address23
  ]
  let password = 'some-password'

  it('init account is added to wallet', async function () {
    paratii = await new Paratii({
      provider: 'http://localhost:8545',
      address: address,
      privateKey: privateKey
    })
    assert.equal(paratii.eth.wallet.length, 1)
  })
  it('if no account is given, the wallet accounts are empty', async function () {
    paratii = await new Paratii()
    assert.equal(paratii.eth.wallet.length, 0)
  })

  it('wallet.create() works', async function () {
    paratii = await new Paratii()

    let wallet = paratii.eth.wallet
    assert.equal(wallet.length, 0)

    wallet = wallet.create(5, mnemonic)
    assert.equal(wallet.length, 5)
    assert.isTrue(paratii.eth.web3.utils.isAddress(wallet[1].address))
    assert.isTrue(paratii.eth.web3.utils.isAddress(wallet[2].address))
    //
    assert.equal(wallet[0].address, addresses[0])
  })

  it('wallet.encrypt() and decrypt() works', async function () {
    paratii = await new Paratii()
    let wallet = paratii.eth.wallet

    wallet = wallet.create(5, mnemonic)
    assert.equal(wallet[0].address, addresses[0])

    let data = wallet.encrypt(password)
    assert.equal(add0x(data[0].address), addresses[0].toLowerCase())

    wallet = wallet.decrypt(data, password)
    assert.equal(wallet[0].address, addresses[0])
  })

  it('send() should fail if no wallet is present', async function () {
    // instantiate paratii with an unlocked account
    paratii = await new Paratii({
      provider: 'http://localhost:8545',
      address: address17
    })
    assert.isRejected(paratii.eth.transfer(address1, 2e18, 'ETH'), 'could not unlock signer account')
  })

  it('send() should succeed if a  private key is passed to the constructor', async function () {
    paratii = await new Paratii({
      provider: 'http://localhost:8545',
      address: address,
      privateKey: privateKey
    })
    await paratii.eth.transfer(address1, 2e18, 'ETH')
  })

  it('send() should succeed if a  private key is passed to the constructor', async function () {
    paratii = await new Paratii({
      provider: 'http://localhost:8545',
      address: address,
      privateKey: privateKey
    })
    await paratii.eth.transfer(address1, 2e18, 'ETH')
  })

  it('eth.wallet.isValidMnemonic() should work as expected', async function () {
    paratii = await new Paratii()
    assert.isOk(paratii.eth.wallet.isValidMnemonic(mnemonic23))
    assert.isNotOk(paratii.eth.wallet.isValidMnemonic('some dumb string'))
  })

  it('eth.wallet.newMnemonic() should work as expected', async function () {
    paratii = await new Paratii()
    let m1 = paratii.eth.wallet.newMnemonic()
    let m2 = paratii.eth.wallet.newMnemonic()
    assert.notEqual(m1, m2)
    assert.isOk(paratii.eth.wallet.isValidMnemonic(m1))
  })

  it.skip('eth.wallet.getMnemonic()', function () {
  })
})
