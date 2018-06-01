import path from 'path'
import { Paratii } from '../src/paratii.js'
import { address, privateKey, mnemonic23, address23, testConfig, testAccount } from './utils.js'
import { assert } from 'chai'

describe('Paratii configuration:', function () {
  let paratii

  it('paratii.config should return the configuration with default values', async function () {
    paratii = new Paratii({ account: testAccount })

    let expected = {
      account: {
        address: address,
        privateKey: privateKey,
        mnemonic: null
      },
      eth: {
        provider: 'http://localhost:8545',
        registryAddress: null,
        tcrConfigFile: path.join(require.resolve('sol-tcr'), '..', '/conf/config.json'),
        isTestNet: true
      }
    }
    assert.deepInclude(paratii.config, expected)
  })

  it('testnet configuration should be recognized', async function () {
    paratii = new Paratii({eth: {provider: 'http://127.0.0.1:8545'}})
    assert.isOk(paratii.config.eth.isTestNet)
    paratii = new Paratii({eth: {provider: 'http://localhost:8545'}})
    assert.isOk(paratii.config.eth.isTestNet)
  })

  it('should be possible to create a second Paratii object with the same settings', async function () {
    // deploy the contracts so we have a registry address
    paratii = new Paratii(testConfig)
    await paratii.eth.deployContracts()
    assert.isOk(paratii.config.eth.registryAddress)

    let paratii2 = new Paratii({
      account: testAccount,
      eth: {
        provider: 'http://localhost:8545',
        registryAddress: paratii.config.eth.registryAddress,
        tcrConfigFile: testConfig.eth.tcrConfigFile
      }
    })

    // the two config's are equal, except for the reference to the Paratii object itself
    // and the paratii-repo.
    delete paratii.config.paratii
    delete paratii2.config.paratii
    delete paratii.config.ipfs.repo
    delete paratii2.config.ipfs.repo
    assert.deepEqual(paratii.config, paratii2.config)
  })

  it('should be possible to create a Paratii instance without an address or registryAddress', async function () {
    let paratii = new Paratii({
      eth: {provider: 'http://chain.paratii.video/'}
    })
    let expected = {
      account: {
        address: null,
        privateKey: null,
        mnemonic: null
      },
      eth: {
        provider: 'http://chain.paratii.video/',
        isTestNet: false,
        registryAddress: null,
        tcrConfigFile: path.join(require.resolve('sol-tcr'), '..', '/conf/config.json')
      }
    }
    assert.deepInclude(paratii.config, expected)

    let promise = paratii.eth.getContract('ParatiiToken')
    await assert.isRejected(promise, /No registry/)
  })

  it('config should accept the privateKey argument without the addrss', async function () {
    let paratii = new Paratii({
      account: {
        privateKey: privateKey
      }
    })
    assert.equal(paratii.getAccount(), address)
  })

  it('the account should be added to the wallet if a private key is given', async function () {
    let paratii = new Paratii({
      account: {
        address: address,
        privateKey: privateKey
      },
      eth: {provider: 'http://localhost:8545'}
    })
    assert.equal(paratii.eth.web3.eth.accounts.wallet[0].address, address)
  })

  it('the account should be added to the wallet if mnenomic is given', async function () {
    let paratii = new Paratii({
      account: {
        address: address23,
        mnemonic: mnemonic23
      },
      eth: {provider: 'http://localhost:8545'}
    })
    assert.equal(paratii.eth.web3.eth.accounts.wallet[0].address, address23)
  })

  it('the account address can be generated from the mnenomic', async function () {
    let paratii = new Paratii({
      account: {mnemonic: mnemonic23},
      eth: {provider: 'http://localhost:8545'}
    })
    assert.equal(paratii.eth.web3.eth.accounts.wallet[0].address, address23)
    assert.equal(paratii.config.account.address, address23)
    assert.equal(paratii.config.account.mnemonic, mnemonic23)

    // check if the wallet is functioning property
    paratii.eth.deployContract('Registry')
  })

  it('setAccount should set the account', async function () {
    let paratii = new Paratii({
      eth: {provider: 'http://127.0.0.1:8545'}
    })
    // let beneficiary = account1
    // let amount = 0.3 * 10 ** 18
    // let promise = paratii.eth.transfer(beneficiary, amount, 'PTI')
    // assert.isRejected(promise, /No account/)
    //
    await paratii.setAccount({address, privateKey})
    assert.equal(paratii.config.account.address, address)
    assert.equal(paratii.eth.config.account.address, address)
    assert.equal(paratii.eth.web3.eth.accounts.wallet[0].address, address)
  })

  it('setAccount should throw if address and private key do not match', async function () {
    const privateKeyWithout0x = '399b141d0cc2b863b2f514ffe53edc6afc9416d5899da4d9bd2350074c38f1c6'
    const anotherPrivateKey = '0x399b141d0cc2b863b2f514ffe53edc6afc9416d5899da4d9bd2350074c38f1c7'
    const anotherAddress = '0xCbe4f07b343171ac37055B25a5266f48f6945b7e'
    const addressWithout0x = 'Cbe4f07b343171ac37055B25a5266f48f6945b7d'
    // matching address and pk should work fine
    const paratii = new Paratii({
      eth: {provider: 'http://127.0.0.1:8545'}
    })

    let assertWillThrowNoCompatibility = (address, privateKey) => {
      assert.throws(
        () => {
          return new Paratii({
            account: {
              address: address,
              privateKey: privateKey
            },
            eth: {provider: 'http://127.0.0.1:8545'}
          })
        },
        Error,
        /not compatible/g
      )
      assert.throws(
        () => { paratii.eth.setAccount({address, privateKey}) },
        Error,
        /not compatible/g
      )
    }
    assertWillThrowNoCompatibility(address, anotherPrivateKey)
    assertWillThrowNoCompatibility(address, privateKeyWithout0x)
    assertWillThrowNoCompatibility(anotherAddress, privateKey)
    assertWillThrowNoCompatibility(addressWithout0x, privateKey)
  })

  it('paratii.eth.web3 should be available', async function () {
    let paratii = new Paratii({})
    assert.isOk(paratii.eth.web3)
  })

  it('sending transactions should work both with http as with ws providers', async function () {
    let paratii
    paratii = new Paratii({
      eth: { provider: 'http://localhost:8545' },
      account: testAccount
    })
    await paratii.eth.deployContract('Registry')

    paratii = new Paratii({
      eth: {provider: 'http://localhost:8545/rpc'},
      account: testAccount
    })
    await paratii.eth.deployContract('Registry')

    paratii = new Paratii({
      eth: {provider: 'ws://localhost:8546'},
      account: testAccount
    })
    await paratii.eth.deployContract('Registry')
  })
})

it.skip('paratii.eth.getContract() should throw a meaningful error if the registry address isn\'t correct', async function () {
  let paratii = new Paratii({
    account: testAccount,
    eth: {
      registryAddress: '0xDf6164EfD12678bF6A7d5A1Ddf73C831493F6574'
    }
  })

  await assert.isRejected(paratii.eth.getContract('Likes'), Error, /The registry address is not correct/g)
})

it.skip('paratii.eth.getContract() should throw a meaningful error if no blockchain is available', async function () {
  let paratii = new Paratii({
    eth: { provider: 'http://localhost:8000', // wrong port
      registryAddress: '0xC83003a9B5c2C5bcce29f9c9Ee34b4ef246c781C'},
    account: testAccount
  })

  await assert.isRejected(paratii.eth.getContract('Likes'), Error, /Cannot connect/g)
  await assert.isRejected(paratii.eth.getContracts(), Error, /Cannot connect/g)
})
