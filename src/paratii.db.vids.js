const joi = require('joi')

const fetch = require('isomorphic-fetch')

/**
 * ParatiiDbUsers contains functionalities regarding the videos to interact with the Paratii Blockchain Index
 * @param {Object} config object to initialize Paratii object
 */
export class ParatiiDbVids {
  constructor (config) {
    this.config = config
    this.apiVideos = 'videos/'
  }
  /**
   * Get information about this video from the db
   * @param  {string}  videoId id of the video
   * @return {Promise}         data about the video
   * @example await paratii.db.vids.get('some-video-id')
   */
  async get (videoId) {
    let response = await fetch(this.config.db.provider + this.apiVideos + videoId, {
      method: 'get'
    })
    let videoInfo = response.json()
    return videoInfo
  }

  /**
   * Get the data of the video
   * @param  {Object} options data about the video and (optional) owner i.e {'keyword':'titleOfTheVideo'}
   * @return {Promise}        data about the video
   * @example await paratii.db.vids.search({keyword : 'titleOftheVideo'})
   * the keyword value can be one from the following list
   * - video title
   * - description
   * - owner
   * - uploader.name
   * - uploader.address
   * - tags
   */
  async search (options) {
    // FIXME: does not handle combinations of parameters yet
    const schema = joi.object({
      'owner': joi.string().empty(),
      'keyword': joi.string().empty(),
      'offset': joi.string().empty(),
      'limit': joi.string().empty(),
      'staked': joi.boolean().empty()
    })

    const result = joi.validate(options, schema)
    const error = result.error
    if (error) throw error
    let k = ''
    for (let keyword in options) {
      k += `${keyword}=${options[keyword]}`
    }
    if (k !== '') {
      k = `?${k}`
    }
    let videos = await fetch(this.config.db.provider + this.apiVideos + k, {
      method: 'get'
    }).then(function (response) {
      return response.json()
    })

    return videos
  }
}
