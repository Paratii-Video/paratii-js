const fetch = require('isomorphic-fetch')
/**
 * ParatiiDbUsers contains functionalities regarding the users to interact with the Paratii Blockchain Index
 * @param {Object} config object to initialize Paratii object
 * @class paratii.db.users
 */
export class ParatiiDbUsers {
  constructor (config) {
    this.config = config
    this.apiUsers = 'users/'
    this.apiVideos = '/videos'
  }

 /**
  * retrieve data about the user
  * @param  {String}  userId user univocal id
  * @return {Promise}        data about the user
  * @example paratii.db.users.get('some-user-id')
  * @memberof paratii.db.users
  */
  async get (userId) {
    let users = await fetch(this.config.db.provider + this.apiUsers + userId, {
      method: 'get'
    }).then(function (response) {
      return response.json()
    })
    return users
  }
  /**
   * get information about all the videos of the user
   * @param  {String}  userId univocal user identifier
   * @return {Promise}        Collection of all the videos of the user
   * @example paratii.db.users.videos('some-user-id')
   * @memberof paratii.db.users
   */
  async videos (userId) {
    let users = await fetch(this.config.db.provider + this.apiVersion + this.apiUsers + userId + this.apiVideos, {
      method: 'get'
    }).then(function (response) {
      return response.json()
    })
    console.log(users)
    return users
  }
}
