// const whyIsNodeRunning = require('why-is-node-running')

// import { Paratii } from '../lib/paratii.js'
// import { address, privateKey } from './utils.js'
import { ParatiiIPFS } from '../lib/paratii.ipfs.js'
import { assert } from 'chai'
// const FileApi = require('file-api')
// const fs = require('fs')

describe('ParatiiIPFS: :', function () {
  let paratiiIPFS
  this.timeout(30000)

  beforeEach(function () {
    paratiiIPFS = new ParatiiIPFS({})
  })

  afterEach((done) => {
    paratiiIPFS.stop(() => {
      delete paratiiIPFS.ipfs
      setImmediate(() => {
        assert.isNotOk(paratiiIPFS.ipfs)
        done()
      })
    })
  })

  it('should exist', (done) => {
    assert.isOk(paratiiIPFS)
    done()
  })

  it('should create an instance without trouble', (done) => {
    paratiiIPFS.getIPFSInstance().then((ipfs) => {
      assert.isOk(paratiiIPFS)
      assert.isOk(ipfs)
      assert.isTrue(ipfs.isOnline())
      done()
    }).catch(done)
  })

  it('should allow for quick adding of files', async function () {
    let file = 'test/data/some-file.txt'
    let result = await paratiiIPFS.add(file)
    console.log(result)
  })
})
