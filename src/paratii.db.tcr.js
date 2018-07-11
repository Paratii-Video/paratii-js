const { ParatiiDbTcrChallenges } = require('./paratii.db.tcr.challenges.js')
const { ParatiiDbTcrVotes } = require('./paratii.db.tcr.votes.js')

/**
 * ParatiiDbUsers contains functionalities regarding the videos to interact with the Paratii Blockchain Index
 * @param {Object} config object to initialize Paratii object
 */
export class ParatiiDbTcr {
  constructor (config) {
    this.config = config
    this.api = 'tcr/'
    this.challenges = new ParatiiDbTcrChallenges(this.config)
    this.votes = new ParatiiDbTcrVotes(this.config)
  }
}
