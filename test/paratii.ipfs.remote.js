// const whyIsNodeRunning = require('why-is-node-running')

// import Paratii from '../src/paratii.js'
// import { address, privateKey } from './utils.js'
import { ParatiiIPFS } from '../src/paratii.ipfs.js'
import { assert, expect } from 'chai'

describe('ParatiiIPFSRemote:', function () {
  let paratiiIPFS
  this.timeout(30000)

  beforeEach(() => {
    paratiiIPFS = new ParatiiIPFS({
      ipfs: {repo: '/tmp/paratii-alpha-' + String(Math.random())},
      verbose: false
    })
  })

  afterEach(async () => {
    await paratiiIPFS.stop()
    delete paratiiIPFS.ipfs
    assert.isNotOk(paratiiIPFS.ipfs)
  })

  // skip till i fix underlying libp2p issue.
  it.skip('should be able to getMetaData from Transcoder', (done) => {
    let testHash = 'QmTkuJTcQhtQm8bPzF1hQmhrDPsdLs28soUZQEUx7t9pBJ'
    paratiiIPFS.transcoder.getMetaData(testHash, {}).then((data) => {
      assert.isOk(data)
      console.log(data)
      done()
    }).catch(done)
  })

  it('should be able to pin a JSON Object', (done) => {
    paratiiIPFS.local.addJSON({test: 1}).then((multihash) => {
      assert.isOk(multihash)
      let ev = paratiiIPFS.remote.pinFile(multihash)
      ev.once('pin:error', done)
      ev.once('pin:done', (hash) => {
        expect(hash).to.equal(multihash)
        done()
      })
    }).catch((err) => {
      done(err)
    })
  })

  // FIXME : this requires a browser to run.
  // TODO : use karma with mocha to run browser tests.
  // it('should allow for generic file upload', (done) => {
  //   paratiiIPFS.getIPFSInstance().then((ipfs) => {
  //     assert.isOk(ipfs)
  //     assert.isTrue(ipfs.isOnline())
  //     let f = new FileApi.File('./data/genericJson.json')
  //     process.nextTick(() => {
  //       paratiiIPFS.uploader.upload(f, {
  //         onStart: () => { console.log('uploader started') },
  //         onError: (err) => { if (err) done(err) },
  //         onFileReady: (file) => { console.log('file Ready', file) },
  //         onProgress: (chunkLength, progress) => { console.log('chunkLength:', chunkLength, 'progress:', progress) }, // function(chunkLength)
  //         onDone: (file) => {
  //           console.log('Uploader Finished! ', file)
  //           done()
  //         }
  //       })
  //     })
  //   }).catch(done)
  // })

  // FIXME : don't depend on external resources for testing.
  it.skip('should be able to grab a youtube video and upload it', (done) => {
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

  it.skip('should be able to grab a vimeo video and upload it', (done) => {
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

// describe('paratii.ipfs: :', function () {
//   let paratii
//
//   beforeEach(async function () {
//     paratii = new Paratii({
//       'eth.provider': 'http://localhost:8545',
//       address: address,
//       privateKey: privateKey
//     })
//   })
//
//   it('should exist', function () {
//     assert.isOk(paratii.ipfs)
//   })
// })
