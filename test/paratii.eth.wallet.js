import { Paratii } from '../lib/paratii.js'
import { address, privateKey } from './utils.js'
import { assert } from 'chai'

describe('paratii.eth.wallet: :', function () {
  let paratii

  it('init account is added to wallet', async function () {
    paratii = await new Paratii({
      provider: 'http://localhost:8545',
      address: address,
      privateKey: privateKey
    })
    assert.equal(paratii.eth.wallet.length, 1)
  })
  it('if no account is given, the wallet accounts are empty', async function () {
    paratii = await new Paratii({
      provider: 'http://localhost:8545'
    })
    assert.equal(paratii.eth.wallet.length, 0)
  })

  it('wallet.create() works', async function () {
    paratii = await new Paratii({
      provider: 'http://localhost:8545'
    })

    let test = {
      // mnemonic: 'select scout crash enforce riot rival spring whale hollow radar rule sentence',
      mnemonic: 'jelly better achieve collect unaware mountain thought cargo oxygen act hood bridge',
      addresses: [
        '0x9e2d04eef5b16CFfB4328Ddd027B55736407B275'
      ]
    }

    let wallet = paratii.eth.wallet
    assert.equal(wallet.length, 0)

    wallet = wallet.create(5, test.mnemonic)
    assert.equal(wallet.length, 5)
    assert.isTrue(paratii.eth.web3.utils.isAddress(wallet[1].address))
    assert.isTrue(paratii.eth.web3.utils.isAddress(wallet[2].address))
    //
    assert.equal(wallet[0].address, test.addresses[0])
  })
})
