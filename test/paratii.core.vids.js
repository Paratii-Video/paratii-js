import { Paratii } from '../lib/paratii.js'
import { assert } from 'chai'
import { DB_PROVIDER, mockDb, testAccount, address1, address99 } from './utils.js'

describe('paratii.core.vids:', function () {
  let paratii
  let videoFile = 'test/data/some-file.txt'
  let videoId = 'some-id'
  let videoId2 = 'id-2'
  let videoId3 = 'id-3'
  let ipfsHash = 'some-hash'
  let videoTitle = 'some title'
  let videoTitle2 = 'some title 2'

  before(function () {
    mockDb()
  })

  beforeEach(async function () {
    paratii = new Paratii({
      eth: {provider: 'http://localhost:8545/rpc/'},
      account: testAccount,
      db: {provider: DB_PROVIDER}
    })
    await paratii.eth.deployContracts()
  })

  it.skip('core.vids.create() and get() should work as expected', async function () {
    let videoFromCreate, videoFromDb
    videoFromCreate = await paratii.core.vids.create({
      id: 'some-id',
      owner: address1,
      title: 'some Title',
      author: 'Steven Spielberg',
      duration: '2h 32m',
      description: 'A long description',
      price: 0,
      file: videoFile
    })
    assert.equal(videoFromCreate.id, 'some-id')
    videoFromDb = await paratii.core.vids.get(videoFromCreate.id)
    assert.deepEqual(videoFromCreate, videoFromDb)
  })

  it('core.vids.create() should accept many arguments', async function () {
    let data

    // make sure the video does not exist
    await assert.isRejected(paratii.eth.vids.get(videoId), Error, 'No video')

    data = await paratii.core.vids.create({
      id: videoId2,
      owner: address1,
      title: videoTitle,
      ipfsHash: ipfsHash,
      price: 1,
      transcodingStatus: {
        name: 'done',
        data: {
          progress: 70
        }
      }
    })

    assert.equal(data.ipfsHash, ipfsHash)

    data = await paratii.core.vids.get(videoId2)
    assert.equal(data.ipfsHash, ipfsHash)

    data = await paratii.core.vids.create({
      id: 'some-id',
      owner: address1,
      title: 'some Title',
      author: 'Steven Spielberg',
      duration: '2h 32m',
      description: 'A long description',
      price: 0,
      filename: videoFile,
      thumbnails: ['a thumbnail']
    })
  })

  it('core.vids.create() should create a fresh id if none is given', async function () {
    let video = await paratii.core.vids.create({
      owner: address1,
      title: videoTitle
    })
    assert.isOk(video.id)
    let videoId2 = await paratii.core.vids.create({
      owner: address1,
      title: videoTitle
    })
    assert.notEqual(videoId, videoId2)
  })

  it('core.vids.update() should work as expected', async function () {
    await paratii.core.vids.create({
      id: videoId2,
      owner: address1,
      title: videoTitle,
      author: 'Steven Spielberg',
      duration: '2h 32m'
    })
    let data
    data = await paratii.core.vids.get(videoId3)
    data = await paratii.core.vids.get(videoId2)
    assert.equal(data.title, videoTitle2)

    data = await paratii.core.vids.update(videoId3, {title: 'another-title'})
    assert.equal(data.title, 'another-title')
    assert.equal(data.owner, address1)

    data = await paratii.core.vids.update(videoId3, {description: 'another description'})
    assert.equal(data.description, 'another description')
    assert.equal(data.owner, address1)

    data = await paratii.core.vids.get(videoId3)
    assert.equal(data.title, 'another-title')
    assert.equal(data.owner, address1)
  })

  it('vids.upsert() should create a fresh id if non is given', async function () {
    let video = await paratii.core.vids.upsert({
      owner: address1,
      title: videoTitle
    })
    assert.isOk(video.id)
    assert.equal(video.id.length, 12)
  })

  it('vids.upsert() should update the video if id exist', async function () {
    await paratii.core.vids.upsert({
      id: videoId2,
      owner: address1,
      title: videoTitle
    })

    let data
    data = await paratii.core.vids.get(videoId2)
    assert.equal(data.title, videoTitle2)

    data = await paratii.core.vids.upsert({id: videoId3, title: 'another-title'})
    assert.equal(data.title, 'another-title')
    assert.equal(data.owner, address1)

    data = await paratii.core.vids.upsert({id: videoId3, description: 'another description'})
    assert.equal(data.description, 'another description')
    assert.equal(data.owner, address1)

    data = await paratii.core.vids.get(videoId3)
    assert.equal(data.title, 'another-title')
    assert.equal(data.owner, address1)
  })

  it.skip('core.vids.delete() should work as expected', async function () {
  })

  it('core.vids.like() should work as expected', async function () {
    let video = await paratii.core.vids.create({
      owner: address1,
      title: videoTitle
    })
    let newVideoId = video.id
    await paratii.core.vids.like(newVideoId)
    let dataLikes = await paratii.core.vids.doesLike(newVideoId)
    let dataDislikes = await paratii.core.vids.doesDislike(newVideoId)
    assert.isOk(dataLikes)
    assert.isNotOk(dataDislikes)
  })

  it('core.vids.dislike() should work as expected', async function () {
    let video = await paratii.core.vids.create({
      owner: address1,
      title: videoTitle
    })
    let newVideoId = video.id
    await paratii.core.vids.dislike(newVideoId)
    let dataLikes = await paratii.core.vids.doesLike(newVideoId)
    let dataDislikes = await paratii.core.vids.doesDislike(newVideoId)
    assert.isOk(dataDislikes)
    assert.isNotOk(dataLikes)
  })

  it('core.vids.view() should work as expected', async function () {
    await paratii.core.vids.view({
      viewer: address99,
      videoId: address1
    })
    let hasViewed = await paratii.core.vids.hasViewedVideo(address99, address1)
    assert.isOk(hasViewed)
  })

  it.skip('core.vids.search() should work as expected', async function () {
  })
})
