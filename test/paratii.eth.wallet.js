import { Paratii } from '../src/paratii.js'
import { testAccount, testConfig, address, address1, privateKey, address17, mnemonic23, address23 } from './utils.js'
import { add0x } from '../src/utils.js'
import { assert } from 'chai'

describe('paratii.eth.wallet: :', function () {
  let paratii
  let mnemonic = mnemonic23
  let addresses = [
    address23
  ]
  let password = 'some-password'

  it('init account is added to wallet', async function () {
    paratii = new Paratii(testConfig)
    assert.equal(paratii.eth.wallet.length, 1)
  })

  it('if no account is given, the wallet accounts are empty', async function () {
    paratii = await new Paratii()
    assert.equal(paratii.eth.wallet.length, 0)
  })

  it('wallet.createFromMnemonic works', async function () {
    paratii = await new Paratii()

    let wallet = paratii.eth.wallet
    assert.equal(wallet.length, 0)

    wallet = await wallet.createFromMnemonic(5, mnemonic)
    assert.equal(wallet.length, 5)

    assert.isTrue(paratii.eth.web3.utils.isAddress(wallet[1].address))
    assert.isTrue(paratii.eth.web3.utils.isAddress(wallet[2].address))
    assert.equal(wallet[0].address, address23)
  })

  it('wallet.createFromMnemonic() does not create a new wallet object', async function () {
    paratii = await new Paratii()
    let wallet = await paratii.eth.wallet.createFromMnemonic(5, mnemonic)
    assert.equal(wallet, paratii.eth.wallet)
  })

  it('wallet.createFromMnemonic() creates a new mnemonic if no mnemonic is given', async function () {
    paratii = await new Paratii()
    let wallet = paratii.eth.wallet
    await wallet.createFromMnemonic()
    // if it creates an address, it means that it has generated a new mmnemonic
    assert.equal(wallet.length, 1)
  })

  it('wallet.createFromMnemonic() sets getAccount() address', async function () {
    paratii = await new Paratii()
    let wallet = paratii.eth.wallet
    await wallet.createFromMnemonic()
    assert.equal(wallet[0].address, paratii.getAccount())
  })

  it('wallet.createFromMnemonic(), wallet.encrypt() and wallet.decrypt() play nicely together', async function () {
    paratii = await new Paratii()
    let w1 = await paratii.eth.wallet.createFromMnemonic(1)
    let w1encrypted = w1.encrypt('')
    assert.equal(w1[0].address.toLowerCase(), '0x' + w1encrypted[0].address)
    let w1decrypted = paratii.eth.wallet.decrypt(w1encrypted, '')
    assert.equal(w1[0].address, w1decrypted[0].address)
  })

  it('wallet.encrypt() and decrypt() works', async function () {
    paratii = await new Paratii()
    let wallet = paratii.eth.wallet

    wallet = await wallet.createFromMnemonic(5, mnemonic)
    assert.equal(wallet[0].address, addresses[0])

    let data = wallet.encrypt(password)
    assert.equal(add0x(data[0].address), addresses[0].toLowerCase())

    wallet = wallet.decrypt(data, password)
    assert.equal(wallet[0].address, addresses[0])
  })

  it('send() should fail if no wallet is present', async function () {
    paratii = new Paratii({ account: testAccount })
    await paratii.eth.deployContracts()

    // instantiate paratii with no account at all
    paratii = new Paratii({
      eth: {
        provider: 'http://localhost:8545',
        registryAddress: paratii.config.eth.registryAddress
      }
    })
    await assert.isRejected(paratii.eth.transfer(address1, 2e18, 'ETH'), 'No account set')
    paratii = new Paratii({
      eth: {
        provider: 'http://localhost:8545',
        registryAddress: paratii.config.eth.registryAddress
      },
      account: {address: address17}
    })
    await assert.isRejected(paratii.eth.transfer(address1, 2e18, 'PTI'), 'No account set')
    await assert.isRejected(paratii.eth.transfer(address1, 2e18, 'ETH'), 'No account set')
  })

  it('send() should succeed if a private key is passed to the constructor', async function () {
    paratii = new Paratii(
      {
        eth: {provider: 'http://localhost:8545'},
        account: {
          address: address,
          privateKey: privateKey
        }
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

  it('eth.wallet.createFromMnemonic() should throw if a wallet already has an account', async function () {
    paratii = new Paratii({account: {
      address: address,
      privateKey: privateKey
    }})
    await assert.isRejected(paratii.eth.wallet.createFromMnemonic())
  })

  it('eth.wallet.createFromMnemonic() generates key from mnemoninc correctly', async function () {
    const vector = [{
      mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
      address: '0x9858EfFD232B4033E47d90003D41EC34EcaEda94'
    },
    {
      mnemonic: 'jelly better achieve collect unaware mountain thought cargo oxygen act hood bridge',
      address: '0x627ac4c2d731E12fB386BD649114a08ebCc0C33f'
    },
    {
      mnemonic: 'planet warfare clay laptop aware junk decrease salute artwork barrel fabric pond',
      address: '0xff28EA918a9C29eA169BAA5b82F5587f19E6ba40'
    }]

    for (var i = 0; i < vector.length; i++) {
      paratii = await new Paratii()
      let wallet = paratii.eth.wallet
      wallet = await wallet.createFromMnemonic(1, vector[i].mnemonic)
      assert.equal(wallet[0].address, vector[i].address)
    }
  })
})
