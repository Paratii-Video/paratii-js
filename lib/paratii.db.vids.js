/**
 * ParatiiDb contains a functionality to interact with the Paratii Blockchain Index
 *
 */
const joi = require('joi')

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

  async search (options) {
    // FIXME: does not handle combinations of parameters yet
    const schema = joi.object({
      'owner': joi.string().empty(),
      'keyword': joi.string().empty()
    })

    const result = joi.validate(options, schema)
    const error = result.error
    if (error) throw error
    let k = ''
    for (let keyword in options) {
      k = `${keyword}=${options[keyword]}`
    }
    if (k !== '') {
      k = `?${k}`
    }
    let videos = await fetch(this.config['db.provider'] + this.apiVersion + this.apiVideos + k, {
      method: 'get'
    }).then(function (response) {
      return response.json()
    })

    return videos
  }
}
