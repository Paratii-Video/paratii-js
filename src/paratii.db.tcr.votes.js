const joi = require('joi')

const fetch = require('isomorphic-fetch')

/**
 * ParatiiDbUsers contains functionalities regarding the videos to interact with the Paratii Blockchain Index
 * @param {Object} config object to initialize Paratii object
 */
export class ParatiiDbTcrVotes {
  constructor (config) {
    this.config = config
    this.api = 'tcr/'
  }
  /**
   * Get informatino about any currently active challenge
   * @param  {string}  videoId id of the video
   * @return {Promise}         data about the video
   * @example await paratii.db.vids.get('some-video-id')
   */
  async getChallenge (videoId) {
    let response = await fetch(this.config.db.provider + this.apiVideos + videoId, {
      method: 'get'
    })
    let videoInfo = response.json()
    return videoInfo
  }

  /**
   * Get the data of the video. See {@link ParatiiCoreVids#search}
   */
  async search (options) {
    // FIXME: does not handle combinations of parameters yet
    const schema = joi.object({
      'owner': joi.string().empty(),
      'keyword': joi.string().empty(),
      'offset': joi.number().integer().empty(),
      'limit': joi.number().integer().empty(),
      'staked': joi.boolean().empty()
    })

    const result = joi.validate(options, schema)
    const error = result.error
    if (error) throw error
    let k = ''
    for (let keyword in options) {
      k += `${keyword}=${options[keyword]}`
      k += '&'
    }
    if (k !== '') {
      k = `?${k}`
      k = k.slice(0, -1)
    }
    let videos = await fetch(this.config.db.provider + this.apiVideos + k, {
      method: 'get'
    }).then(function (response) {
      return response.json()
    })

    return videos
  }
}
