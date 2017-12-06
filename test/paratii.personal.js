import { Paratii } from '../lib/paratii.js'
import { account, privateKey, account99 } from './utils.js'
import { assert } from 'chai'

describe('paratii.personal API: :', function () {
  let paratii
  beforeEach(async function () {
    paratii = await new Paratii({
      provider: 'http://localhost:8545',
      account: account,
      privateKey: privateKey
    })
    await paratii.eth.deployContracts()
  })

  it('personal.address should return address', async function () {
    assert.equal(paratii.personal.account.address, account)
  })

  it('personal.setAccount should set the address', async function () {
    await paratii.personal.setAccount(account99)
    assert.equal(paratii.personal.account.address, account99)
  })
})
