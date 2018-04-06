import { Paratii } from '../src/paratii.js'
import { vidsFixture, mockDb, testAccount, address, address23 } from './utils.js'
import { assert } from 'chai'

describe('paratii API: :', function () {
  let paratii, paratiiCore

  beforeEach(async function () {
    paratii = new Paratii({account: testAccount})
    await paratii.eth.deployContracts()
    paratiiCore = paratii
    mockDb()
  })

  it('should be configured', async function () {
    assert.isOk(paratiiCore)
    assert.isOk(paratiiCore.users)
    assert.isOk(paratiiCore.vids)
  })

  it('migrateAccount should work', async function () {
    // migrate all assets from default account address to address23
    let id1 = vidsFixture[1].id
    let id2 = vidsFixture[2].id

    // we first register some data so we can check later if the migration worked
    let result = await paratii.eth.tcr.checkEligiblityAndApply(id1, paratii.eth.web3.utils.toWei('5'))
    // result = await paratii.eth.tcr.apply(id1, paratii.eth.web3.utils.toWei('5'))
    assert.isOk(result, result)
    await paratii.eth.vids.create({id: id1, owner: address})
    await paratii.eth.vids.create({id: id2, owner: address})

    let oldBalance = await paratii.eth.balanceOf(address, 'PTI')
    assert.isOk(oldBalance > 0, oldBalance)

    // now (the current owner) sends  a request to migrate her account
    await paratii.migrateAccount(address23)

    // now the owner of the videos (on the contract) should be address23
    let vid = await paratii.eth.vids.get(id1)
    assert.equal(vid.owner, address23)
    vid = await paratii.eth.vids.get(id2)
    assert.equal(vid.owner, address23)
    // the balance in PTI should be transfered to the new address
    assert.equal(await paratii.eth.balanceOf(address23, 'PTI'), oldBalance)
    // assert.isOk(false, 'any stakes made should be transfered to the new account')
  })
})
