// const whyIsNodeRunning = require('why-is-node-running')

// import { Paratii } from '../lib/paratii.js'
// import { address, privateKey } from './utils.js'
import { ParatiiIPFS } from '../lib/paratii.ipfs.js'
import { assert, expect } from 'chai'
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

  // after(() => {
  //   // console.log('why is node running??')
  //   // whyIsNodeRunning()
  //   // setImmediate(() => {
  //   //   done()
  //   // })
  //   // console.log('paratiiIPFS: ', paratiiIPFS)
  //   // global.asyncDump()
  // })

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

  it('should allow for file upload', async function () {
    // let file = fs.createReadStream('test/data/some-file.txt')
    let file = 'test/data/some-file.txt'
    console.log(file)
    let files = [file]
    await paratiiIPFS.uploader.add(files)
  })

  it('addAndTranscode() should work as expected', async function () {
    let files = []
    await paratiiIPFS.getIPFSInstance()
    await paratiiIPFS.uploader.addAndTranscode(files)
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

  it('put a JSON object and get it back', (done) => {
    paratiiIPFS.getIPFSInstance().then((ipfs) => {
      assert.isOk(paratiiIPFS)
      assert.isOk(ipfs)
      assert.isTrue(ipfs.isOnline())
      paratiiIPFS.putJSON({test: 1}).then((multihash) => {
        assert.isOk(multihash)
        console.log('NODE RETURNED, Object: ', multihash)

        paratiiIPFS.getJSON(multihash).then((data) => {
          assert.isOk(data)
          expect(JSON.stringify(data)).to.equal(JSON.stringify({test: 1}))
          done()
        }).catch(done)
      }).catch(done)
    }).catch(done)
  })
})

// describe('paratii.ipfs: :', function () {
//   let paratii
//
//   beforeEach(async function () {
//     paratii = await new Paratii({
//       provider: 'http://localhost:8545',
//       address: address,
//       privateKey: privateKey
//     })
//   })
//
//   it('should exist', function () {
//     assert.isOk(paratii.ipfs)
//   })
// })
