//
//
//
// WE FAKE THE DB RESPONSE WITH THE FIXTURES, UNTIL THE DB IS READY
const USE_FIXTURES = true
const { challengesResponse, challengesResponseForVideoId } = require('../test/data/fixtures.js')

const joi = require('joi')
const fetch = require('isomorphic-fetch')

/**
 * ParatiiDbUsers contains functionalities regarding the videos to interact with the Paratii Blockchain Index
 * @param {Object} config object to initialize Paratii object
 */
export class ParatiiDbTcrChallenges {
  constructor (config) {
    this.config = config
    this.api = 'tcr/challenges/'
  }
  /**
   * Get informatino about any currently active challenge
   * @param  {string}  videoId id of the video
   * @return {Promise}         data about the video
   * @example await paratii.db.vids.get('some-video-id')
   */
  async get (videoId) {
    let response = await this.search({ videoId })
    // we should have just one result
    if (response.total === 0) {
      throw Error(`Did not find a challenge for video with id ${videoId}`)
    } else if (response.total > 1) {
      throw Error(`Something unexpected occurred: found ${response.total} challenges for video with id ${videoId}`)
    }
    return response.results[0]
  }

  /**
   * Get the data of the video. See {@link ParatiiCoreVids#search}
   */
  async search (options) {
    // FIXME: does not handle combinations of parameters yet
    const schema = joi.object({
      'videoId': joi.string().empty(),
      'offset': joi.number().integer().empty(),
      'limit': joi.number().integer().empty()
    })

    const parsedOptions = joi.validate(options, schema)
    const error = parsedOptions.error
    if (error) throw error
    let queryString = ''
    for (let keyword in options) {
      queryString += `${keyword}=${parsedOptions.value[keyword]}`
      queryString += '&'
    }
    if (queryString !== '') {
      queryString = queryString.slice(0, -1) // remove the last &
      queryString = `?${queryString}`
    }
    const url = this.config.db.provider + this.api + queryString
    if (USE_FIXTURES) {
      if (parsedOptions.value && parsedOptions.value.videoId) return challengesResponseForVideoId
      else return challengesResponse
    }
    const response = await fetch(url, { method: 'get' })
    return response.json()
  }
}
