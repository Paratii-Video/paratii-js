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
        provider: 'ws://localhost:8546',
        registryAddress: null,
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
        registryAddress: paratii.config.eth.registryAddress
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
        registryAddress: null
      }
    }
    assert.deepInclude(paratii.config, expected)

    let promise = paratii.eth.getContract('ParatiiToken')
    await assert.isRejected(promise, /No registry/)
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
    await paratii.setAccount(address, privateKey)
    assert.equal(paratii.config.account.address, address)
    assert.equal(paratii.eth.config.account.address, address)
    assert.equal(paratii.eth.web3.eth.accounts.wallet[0].address, address)
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

it('paratii.eth.getContract() should throw a meaningful error if the registry address isn\'t correct', async function () {
  let paratii = new Paratii({
    account: testAccount,
    eth: {
      registryAddress: '0xDf6164EfD12678bF6A7d5A1Ddf73C831493F6574'
    }
  })

  await assert.isRejected(paratii.eth.getContract('Likes'), Error, /The registry address is not correct/g)
})

it('paratii.eth.getContract() should throw a meaningful error if no blockchain is available', async function () {
  let paratii = new Paratii({
    eth: { provider: 'http://localhost:8000',
      registryAddress: '0xC83003a9B5c2C5bcce29f9c9Ee34b4ef246c781C'}, // wrong port
    account: testAccount
  })
  await paratii.eth.deployContracts()
  // await assert.isRejected(paratii.eth.deployContracts(), Error, /You aren't connected to any Ethereum node/g)
  await assert.isRejected(paratii.eth.getContract('Likes'), Error, /You aren't connected to any Ethereum node/g)
})
