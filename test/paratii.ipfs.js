// const whyIsNodeRunning = require('why-is-node-running')

// import { address, privateKey } from './utils.js'
import Paratii from '../src/paratii.js'
import { ParatiiIPFS } from '../src/paratii.ipfs.js'
import { assert, expect } from 'chai'
// const FileApi = require('file-api')
const fs = require('fs')

describe('ParatiiIPFS: :', function () {
  let paratiiIPFS
  this.timeout(30000)

  beforeEach(function () {
    paratiiIPFS = new ParatiiIPFS({
      ipfs: {repo: '/tmp/paratii-alpha-' + String(Math.random())}
    })
  })

  // afterEach((done) => {
  //   paratiiIPFS.stop(() => {
  //     delete paratiiIPFS.ipfs
  //     setImmediate(() => {
  //       assert.isNotOk(paratiiIPFS.ipfs)
  //       done()
  //     })
  //   })
  // })

  afterEach(async () => {
    await paratiiIPFS.stop()
    delete paratiiIPFS.ipfs
    assert.isNotOk(paratiiIPFS.ipfs)
  })

  it('should exist', (done) => {
    assert.isOk(paratiiIPFS)
    done()
  })
  it('ipfs.start() should return a promise', () => {
    assert.isOk(paratiiIPFS.start() instanceof Promise)
  })
  it('ipfs.stop() should return a promise', () => {
    assert.isOk(paratiiIPFS.stop() instanceof Promise)
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
    let fileStream = fs.createReadStream(path)
    let result = await paratiiIPFS.add(fileStream)
    assert.isOk(result)
    let hash = result[0].hash
    let fileContent = await paratiiIPFS.get(hash)
    assert.equal(String(fileContent[0].content), 'with some content\n')
  })

  it('put a JSON object and get it back', async function () {
    let multihash = await paratiiIPFS.addJSON({test: 1})
    assert.isOk(multihash)

    let data = await paratiiIPFS.getJSON(multihash)
    assert.isOk(data)
    expect(JSON.stringify(data)).to.equal(JSON.stringify({test: 1}))
  })

  it('should exist and work as an attribute on the Paratii object', async function () {
    let paratii = await new Paratii()
    assert.isOk(paratii.ipfs)
    assert.isOk(await paratii.ipfs.getIPFSInstance())
  })
})
