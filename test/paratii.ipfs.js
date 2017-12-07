import { Paratii } from '../lib/paratii.js'
import { ParatiiIPFS } from '../lib/paratii.ipfs.js'
import { account, privateKey } from './utils.js'
import { assert } from 'chai'

describe('ParatiiIPFS: :', function () {
  let paratiiIPFS
  this.timeout(10000)

  beforeEach(async function () {
    paratiiIPFS = await new ParatiiIPFS({})
  })

  afterEach(async function () {
    paratiiIPFS.stop()
  })

  it('should exist', async function () {
    assert.isOk(paratiiIPFS)
  })

  it('should create an instance without trouble', async function () {
    return paratiiIPFS.getIPFSInstance()
  })

  it('should allow for file upload', async function () {
    let files = []
    await paratiiIPFS.getIPFSInstance()
    return paratiiIPFS.uploadFiles(files)
  })
})

describe('paratii.ipfs: :', function () {
  let paratii

  beforeEach(async function () {
    paratii = await new Paratii({
      provider: 'http://localhost:8545',
      account: account,
      privateKey: privateKey
    })
  })

  it('should exist', async function () {
    assert.isOk(paratii.ipfs)
  })
})
