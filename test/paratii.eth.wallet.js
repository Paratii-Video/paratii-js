import { Paratii } from '../lib/paratii.js'
import { address, address1, privateKey, address17, mnemonic23, address23 } from './utils.js'
import { add0x } from '../lib/utils.js'
import { assert } from 'chai'

describe('paratii.eth.wallet: :', function () {
  let paratii
  let mnemonic = mnemonic23
  let addresses = [
    address23
  ]
  let password = 'some-password'

  it('init account is added to wallet', async function () {
    paratii = new Paratii({
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

    wallet = await wallet.create(5, mnemonic)
    assert.equal(wallet.length, 5)

    assert.isTrue(paratii.eth.web3.utils.isAddress(wallet[1].address))
    assert.isTrue(paratii.eth.web3.utils.isAddress(wallet[2].address))
    assert.equal(wallet[0].address, addresses[0])
  })

  it('wallet.create() does not create a new wallet object', async function () {
    paratii = await new Paratii()
    let wallet = await paratii.eth.wallet.create(5, mnemonic)
    assert.equal(wallet, paratii.eth.wallet)
  })

  it('wallet.create() creates a new mnenomic if not mnemonic is given', async function () {
    paratii = await new Paratii()
    let wallet = paratii.eth.wallet
    await wallet.create()
    wallet.isValidMnemonic(wallet.getMnemonic())
  })

  it('wallet.create() sets config.account.address and privatekey', async function () {
    paratii = await new Paratii()
    let wallet = paratii.eth.wallet
    await wallet.create()
    assert.equal(wallet[0].address, paratii.config.account.address)
    assert.isOk(paratii.config.account.privateKey)
  })

  it('wallet.decrypt() sets config.account.address and privatekey', async function () {
    // serialzie a wallet so we can test the decryption
    paratii = await new Paratii()
    let wallet = paratii.eth.wallet

    wallet = await wallet.create(1, mnemonic)
    let data = wallet.encrypt(password)

    // get a frsh paratii object
    paratii = await new Paratii()
    let decryptedWallet = await paratii.eth.wallet.decrypt(data, password)
    assert.equal(decryptedWallet[0].address, paratii.config.account.address)
    assert.isOk(paratii.config.account.privateKey)
  })

  it('wallet.encrypt() and decrypt() works', async function () {
    paratii = await new Paratii()
    let wallet = paratii.eth.wallet

    wallet = await wallet.create(5, mnemonic)
    assert.equal(wallet[0].address, addresses[0])

    let data = wallet.encrypt(password)
    assert.equal(add0x(data[0].address), addresses[0].toLowerCase())

    wallet = wallet.decrypt(data, password)
    assert.equal(wallet[0].address, addresses[0])
  })

  it.skip('send() should fail if no wallet is present', async function () {
    paratii = new Paratii({
      address: address,
      privateKey: privateKey
    })
    await paratii.eth.deployContracts()

    // instantiate paratii with an unlocked account
    paratii = new Paratii({
      provider: 'http://localhost:8545',
      address: address17,
      registryAddress: paratii.config.registryAddress
    })
    // set the account but not the private key
    // paratii.setAccount(address17)
    await assert.isRejected(paratii.eth.transfer(address1, 2e18, 'ETH'), 'could not unlock signer account')
  })

  it('send() should succeed if a  private key is passed to the constructor', async function () {
    paratii = new Paratii({
      provider: 'http://localhost:8545',
      address: address,
      privateKey: privateKey
    })
    await paratii.eth.deployContracts()
    await paratii.eth.transfer(address1, 2e10, 'ETH', 'thanks for all the fish')
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
  it('eth.wallet.create() should throw if a wallet already has an account', async function () {
    paratii = new Paratii({
      address: address,
      privateKey: privateKey
    })
    await assert.isRejected(paratii.eth.wallet.create())
  })

  it('eth.wallet.getMnemonic() should work as expected', async function () {
    paratii = await new Paratii()
    assert.equal(paratii.eth.wallet.getMnemonic(), undefined)
    let wallet = await paratii.eth.wallet.create()
    assert.notEqual(wallet.getMnemonic(), undefined)
    assert.isOk(wallet.isValidMnemonic(wallet.getMnemonic()))

    // if we construct the paratii object with
    paratii = new Paratii({
      address: address,
      privateKey: privateKey
    })
    assert.equal(paratii.eth.wallet.getMnemonic(), undefined)
  })
})
