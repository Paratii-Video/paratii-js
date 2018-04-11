// const whyIsNodeRunning = require('why-is-node-running')

// import Paratii from '../src/paratii.js'
// import { address, privateKey } from './utils.js'
import { ParatiiIPFS } from '../src/paratii.ipfs.js'
import { assert, expect } from 'chai'

describe('ParatiiIPFS Uploader :', function () {
  let paratiiIPFS
  this.timeout(30000)

  beforeEach(() => {
    paratiiIPFS = new ParatiiIPFS({
      ipfs: {repo: '/tmp/paratii-alpha-' + String(Math.random())},
      verbose: true
    })
  })

  afterEach(async () => {
    await paratiiIPFS.local.stop()
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

  // FIXME : this requires a browser to run.
  // I'm trying to mock the FileReader but it's glitchy so far :(
  it('should allow for file upload', (done) => {
    let file = 'test/data/some-file.txt'
    let files = [file]
    let uploaderEv = paratiiIPFS.local.add(files)

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

  it('should add a directory to IPFS', async function () {
    let testDir = 'test/data'
    await paratiiIPFS.local.start()
    let response = await paratiiIPFS.local.addDirectory(testDir)
    assert.isOk(response)
    assert.isOk(response.hash)
    // NOTE THIS WILL Trigger an error if the director test/data content changes.
    assert.equal(response.hash, 'QmbwqfRAtRRpuf87He77tGmunwihd7bFSLVstVNM8FxS5s')
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
