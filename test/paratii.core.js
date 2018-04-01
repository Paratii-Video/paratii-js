import { Paratii } from '../lib/paratii.js'
import { vidsFixture, mockDb, testAccount, address, address23 } from './utils.js'
import { assert } from 'chai'

describe('paratii.core API: :', function () {
  let paratii, paratiiCore

  before(async function () {
  })

  beforeEach(async function () {
    paratii = new Paratii({account: testAccount})
    await paratii.eth.deployContracts()
    paratiiCore = paratii.core
    mockDb()
  })

  it('should be configured', async function () {
    assert.isOk(paratiiCore)
    assert.isOk(paratiiCore.users)
    assert.isOk(paratiiCore.vids)
  })

  it('migrateAccount should work @watch', async function () {
    // migrate all assets from default account address to address23
    let id1 = vidsFixture[1].id
    let id2 = vidsFixture[2].id

    // we first register some data so we can check later if the migration worked
    let oldBalance = await paratii.eth.balanceOf(address, 'PTI')
    assert.equal(oldBalance, 21 * 10 ** 24)
    await paratii.eth.vids.create({id: id1, owner: address})
    await paratii.eth.vids.create({id: id2, owner: address})
    await paratii.eth.tcr.checkEligiblityAndApply(id1, 5)

    // now (the current owner) sends  a request to migrate her account
    await paratii.core.migrateAccount(address23)

    // now the owner of the videos (on the contract) should be address23
    let vid = await paratii.eth.vids.get(id1)
    assert.equal(vid.owner, address23)
    vid = await paratii.eth.vids.get(id2)
    assert.equal(vid.owner, address23)
    // the balance in PTI should be transfered to the new address
    assert.equal(await paratii.eth.balanceOf(address23, 'PTI'), oldBalance)
    assert.isOk(false, 'any stakes made should be transfered to the new account')
  })
})
