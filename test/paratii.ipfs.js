// const whyIsNodeRunning = require('why-is-node-running')

// import { Paratii } from '../lib/paratii.js'
// import { address, privateKey } from './utils.js'
import { ParatiiIPFS } from '../lib/paratii.ipfs.js'
import { assert, expect } from 'chai'
// const FileApi = require('file-api')
const fs = require('fs')

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
    await paratiiIPFS.getIPFSInstance()
    let multihash = await paratiiIPFS.putJSON({test: 1})
    assert.isOk(multihash)

    let data = await paratiiIPFS.getJSON(multihash)
    assert.isOk(data)
    expect(JSON.stringify(data)).to.equal(JSON.stringify({test: 1}))
  })
})
