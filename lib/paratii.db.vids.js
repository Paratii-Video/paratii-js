/**
 * ParatiiDb contains a functionality to interact with the Paratii Blockchain Index
 *
 */

const fetch = require('isomorphic-fetch')
export class ParatiiDbVids {
  constructor (config) {
    this.config = config
    this.apiVersion = '/api/v1/'
    this.apiVideos = 'videos/'
  }

  async get (videoId) {
    let videos = await fetch(this.config['db.provider'] + this.apiVersion + this.apiVideos + videoId, {
      method: 'get'
    }).then(function (response) {
      return response.json()
    })
    return videos
  }

  async search () {
    let videos = await fetch(this.config['db.provider'] + this.apiVersion + this.apiVideos, {
      method: 'get'
    }).then(function (response) {
      return response.json()
    })

    return videos
  }
}
