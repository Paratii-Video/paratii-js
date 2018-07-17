const joi = require('joi')

const fetch = require('isomorphic-fetch')

/**
 * ParatiiDbTcrVotes contains functionalities regarding the videos to interact with the Paratii Blockchain Index
 * @param {Object} config object to initialize Paratii object
 */
export class ParatiiDbTcrVotes {
  constructor (config) {
    this.config = config
    this.api = 'votes/'
  }
  /**
   * Get information about this particular vote
   * @param  {string}  pollID id of the challenge
   * @param  {string}  voter address of the user that has submitted the vote
   * @return {Promise<Object>}         data about the video
   * @example await paratii.db.vids.get('some-video-id')
   */
  async get (pollID, voter) {
    let response = await this.search({ pollID, voter })
    // we should have just one result
    if (response.total === 0) {
      throw Error(`Did not find a vote for challenge ${pollID} and account ${voter}`)
    } else if (response.total > 1) {
      throw Error(`Something unexpected occurred: found ${response.total} votes challenge ${pollID} and account ${voter} (expected 0 or 1)`)
    }
    return response.results[0]
  }

  /**
   *  Search for challenges Search for challenges Search for challenges Search for challenges
   */
  async search (options) {
    const schema = joi.object({
      'pollID': joi.string().empty(),
      'voter': joi.string().empty(),
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
    const response = await fetch(url, { method: 'get' })
    return response.json()
  }
}
