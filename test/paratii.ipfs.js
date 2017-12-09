import { Paratii } from '../lib/paratii.js'
import { ParatiiIPFS } from '../lib/paratii.ipfs.js'
import { address, privateKey } from './utils.js'
import { assert } from 'chai'

describe('ParatiiIPFS: :', function () {
  let paratiiIPFS
  this.timeout(30000)

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
    return paratiiIPFS.uploader.uploadFiles(files)
  })

  it('should be able to grab a youtube video and upload it', (done) => {
    paratiiIPFS.getIPFSInstance().then(() => {
      paratiiIPFS.uploader.grabYt('https://www.youtube.com/watch?v=IGQBtbKSVhY', (err) => {
        if (err) return done(err)
        done()
      }, (err, file) => {
        if (err) return done(err)
        // assert.isOk(file)
        console.log(file)
        // done()
      })
    }).catch(done)
  })

  it('should be able to grab a vimeo video and upload it', (done) => {
    paratiiIPFS.getIPFSInstance().then(() => {
      paratiiIPFS.uploader.grabVimeo('https://vimeo.com/129522659', (err) => {
        if (err) return done(err)
        done()
      }, (err, file) => {
        if (err) return done(err)
        // assert.isOk(file)
        console.log(file)
        // done()
      })
    }).catch(done)
  })
})

describe('paratii.ipfs: :', function () {
  let paratii

  beforeEach(async function () {
    paratii = await new Paratii({
      provider: 'http://localhost:8545',
      address: address,
      privateKey: privateKey
    })
  })

  it('should exist', async function () {
    assert.isOk(paratii.ipfs)
  })
})
