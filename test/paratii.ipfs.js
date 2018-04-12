// const whyIsNodeRunning = require('why-is-node-running')

// import { address, privateKey } from './utils.js'
import Paratii from '../src/paratii.js'
import { ParatiiIPFS } from '../src/paratii.ipfs.js'
import { assert, expect } from 'chai'
// const FileApi = require('file-api')
// const fs = require('fs')

describe('ParatiiIPFS: :', function () {
  let paratiiIPFS
  this.timeout(30000)

  beforeEach(function () {
    paratiiIPFS = new ParatiiIPFS({
      ipfs: {repo: '/tmp/paratii-alpha-' + String(Math.random())}
    })
  })

  afterEach(async () => {
    await paratiiIPFS.stop()
    delete paratiiIPFS.ipfs
    assert.isNotOk(paratiiIPFS.ipfs)
  })

  it('should exist', (done) => {
    assert.isOk(paratiiIPFS)
    done()
  })

  it('ipfs.start() should return a promise', async () => {
    let p = paratiiIPFS.start()
    assert.isOk(p instanceof Promise)
    await p
  })
  it('ipfs.stop() should return a promise', async () => {
    let p = paratiiIPFS.stop()
    assert.isOk(p instanceof Promise)
    await p
  })

  it('should create an instance without trouble', (done) => {
    paratiiIPFS.getIPFSInstance().then((ipfs) => {
      assert.isOk(paratiiIPFS)
      assert.isOk(ipfs)
      assert.isTrue(ipfs.isOnline())
      done()
    }).catch(done)
  })

  it('should allow for simple add() and get() of files', async function () {
    let path = 'test/data/some-file.txt'
    // let fileStream = fs.createReadStream(path)
    let result = await paratiiIPFS.local.add(path)
    assert.isOk(result)
    console.log(result)
    let hash = result[0].hash
    let fileContent = await paratiiIPFS.local.get(hash)
    assert.equal(String(fileContent[0].content), 'with some content\n')
  })

  it('put a JSON object and get it back', async function () {
    let multihash = await paratiiIPFS.local.addJSON({test: 1})
    assert.isOk(multihash)

    let data = await paratiiIPFS.local.getJSON(multihash)
    assert.isOk(data)
    expect(JSON.stringify(data)).to.equal(JSON.stringify({test: 1}))
  })

  it('should exist and work as an attribute on the Paratii object', async function () {
    let paratii = await new Paratii()
    assert.isOk(paratii.ipfs)
    assert.isOk(await paratii.ipfs.getIPFSInstance())
  })

  it('addAndPinJSON should work', async () => {
    let paratii = await new Paratii()
    let result = await paratii.ipfs.addAndPinJSON({test: 1})
    assert.isOk(result)
  })
  it('addAndTranscode should work', async () => {
    let paratii = await new Paratii()
    let path = 'test/data/some-file.txt'
    let result = await paratii.ipfs.addAndTranscode(path)
    assert.isOk(result)
  })
})
