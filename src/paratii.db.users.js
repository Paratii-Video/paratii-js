const fetch = require('isomorphic-fetch')
/**
 * ParatiiDbUsers contains functionalities regarding the users to interact with the Paratii Blockchain Index
 * @param {Object} config object to initialize Paratii object
 */
export class ParatiiDbUsers {
  constructor (config) {
    this.config = config
    this.apiUsers = 'users/'
    this.apiVideos = '/videos'
  }

 /**
  * retrieve data about the user
  * @param  {string}  userId user univocal id
  * @return {Promise}        data about the user
  * @example await paratii.db.users.get('some-user-id')
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
  * create a user entry from a give public address and a mail
  * @param  {string}  userId user univocal id
  * @param  {string}  email user email
  * @return {Promise}        data about the user
  * @example await paratii.db.users.create('some-user-id')
  */
  async create (userId, email) {
    let users = await fetch(this.config.db.provider + this.apiUsers + 'create/' + userId + '/' + email, {
      method: 'get'
    }).then(function (response) {
      return response.json()
    })
    return users
  }

  /**
   * get information about all the videos of the user
   * @param  {string}  userId univocal user identifier
   * @return {Promise}        Collection of all the videos of the user
   * @example await paratii.db.users.videos('some-user-id')
   */
  async videos (userId) {
    let users = await fetch(this.config.db.provider + this.apiVersion + this.apiUsers + userId + this.apiVideos, {
      method: 'get'
    }).then(function (response) {
      return response.json()
    })
    return users
  }
}
