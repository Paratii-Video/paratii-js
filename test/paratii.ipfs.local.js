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

  // FIXME : this requires a browser to run.
  // I'm trying to mock the FileReader but it's glitchy so far :(
  it('should allow for file upload', (done) => {
    let filePath = 'test/data/some-file.txt'
    let files = [paratiiIPFS.local.fsFileToPull(filePath)]
    paratiiIPFS.start().then(() => {
      let uploaderEv = paratiiIPFS.local.upload(files)

      uploaderEv.once('start', () => {
      // console.log('uploader started')
      })

      uploaderEv.on('progress', (chunkLength, percent) => {
        console.log('progress: ', percent)
      })

      uploaderEv.on('fileReady', (file) => {
        console.log('got fileReady ', file)
      })

      uploaderEv.once('done', (files) => {
        console.log('uploader done, ', files)
        assert.isOk(files)
        expect(files).to.have.lengthOf(1)
        expect(files[0].hash).to.equal('QmS8yinWCD1vm7WJx34tg81FpjEXbdYXf3Y5XcCeh29C6K')
        done()
      })
    })
  })

  it('should add a directory to IPFS', async function () {
    let testDir = 'test/data'
    await paratiiIPFS.start()
    let response = await paratiiIPFS.local.addDirectory(testDir)
    assert.isOk(response)
    assert.isOk(response.hash)
    // NOTE THIS WILL Trigger an error if the director test/data content changes.
    assert.equal(response.hash, 'QmbwqfRAtRRpuf87He77tGmunwihd7bFSLVstVNM8FxS5s')
  })
})
