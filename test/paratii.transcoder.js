// const whyIsNodeRunning = require('why-is-node-running')

// import Paratii from '../src/paratii.js'
// import { address, privateKey } from './utils.js'
import { ParatiiIPFS } from '../src/paratii.ipfs.js'
import { assert, expect } from 'chai'

describe('ParatiiIPFSLocal:', function () {
  let paratiiIPFS
  this.timeout(30000)

  beforeEach(() => {
    paratiiIPFS = new ParatiiIPFS({
      ipfs: {repo: '/tmp/paratii-alpha-' + String(Math.random())},
      verbose: true
    })
  })

  afterEach(async () => {
    await paratiiIPFS.stop()
    delete paratiiIPFS.ipfs
    assert.isNotOk(paratiiIPFS.ipfs)
  })

  it('addAndTranscode() should work as expected', (done) => {
    let files = []
    let ev = paratiiIPFS.transcoder.addAndTranscode(files)
    ev.once('transcoding:done', (resp) => {
      assert.isOk(resp)
      assert.isOk(resp.test)
      expect(resp.test).to.equal(1)
      done()
    })
  })
})