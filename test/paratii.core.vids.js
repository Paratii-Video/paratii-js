import { Paratii } from '../lib/paratii.js'
import { assert } from 'chai'
import { address, address1, privateKey } from './utils.js'
import nock from 'nock'

nock.enableNetConnect()
nock('https://db.paratii.video/api/v1')
.persist()
.get('/videos/some-id')
.reply(200, {
  id: 'some-id',
  owner: address1,
  title: 'some Title',
  description: 'A long description',
  price: '0',
  ipfsData: 'QmY88mq3yPsMxB8MBAy8eaAGBjByGnA2YJG66mDdoGsspv',
  ipfsHash: '',
  ipfsHashOrig: ''

})
.get('/videos/some-id2')
.reply(200, {
  id: 'some-id2',
  owner: address1,
  title: 'some title',
  description: 'A long description',
  price: '0',
  ipfsData: 'QmY88mq3yPsMxB8MBAy8eaAGBjByGnA2YJG66mDdoGsspv',
  ipfsHash: 'some-hash',
  ipfsHashOrig: ''

})
.get('/videos/some-id3')
.reply(200, {
  id: 'some-id3',
  owner: address1,
  title: 'another-title',
  description: 'A long description',
  price: '0',
  ipfsData: 'QmY88mq3yPsMxB8MBAy8eaAGBjByGnA2YJG66mDdoGsspv',
  ipfsHash: 'some-hash',
  ipfsHashOrig: ''

})

describe('paratii.core.vids:', function () {
  let paratii
  let videoFile = 'test/data/some-file.txt'
  let videoId = 'some-id'
  let videoId2 = 'some-id2'
  let videoId3 = 'some-id3'
  let ipfsHash = 'some-hash'
  let videoTitle = 'some title'
  let dbProvider = 'https://db.paratii.video'
  beforeEach(async function () {
    paratii = new Paratii({
      address: address,
      privateKey: privateKey,
      'db.provider': dbProvider
    })
    await paratii.eth.deployContracts()
  })

  it('core.vids.create() and get() should work as expected', async function () {
    let vidToAdd = {
      id: 'some-id',
      owner: address1,
      title: 'some Title',
      description: 'A long description',
      price: '0',
      file: videoFile
    }
    let videoInfo = await paratii.core.vids.create(vidToAdd)
    assert.equal(videoInfo.id, 'some-id')

    delete videoInfo.file
    let videoInfo2 = await paratii.core.vids.get(videoInfo.id)
    assert.deepEqual(videoInfo2, videoInfo)
  })

  it('core.vids.create() should accept ipfsHash as argument', async function () {
    let data

    // make sure the video does not exist
    assert.isRejected(paratii.eth.vids.get(videoId), Error, 'No video')

    data = await paratii.core.vids.create({
      id: videoId2,
      owner: address1,
      title: videoTitle,
      ipfsHash: ipfsHash,
      price: 1
    })

    assert.equal(data.ipfsHash, ipfsHash)

    data = await paratii.core.vids.get(videoId2)
    assert.equal(data.ipfsHash, ipfsHash)
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
      title: videoTitle
    })
    let data
    data = await paratii.core.vids.get(videoId2)
    assert.equal(data.title, videoTitle)

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

  it.skip('core.vids.view() should work as expected', async function () {
  })

  it.skip('core.vids.buy() should work as expected', async function () {
  })

  it.skip('core.vids.search() should work as expected', async function () {
  })
})
