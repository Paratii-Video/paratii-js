/**
 * ParatiiDb contains a functionality to interact with the Paratii Blockchain Index
 *
 */

const fetch = require('isomorphic-fetch')
export class ParatiiDbUsers {
  constructor (config) {
    this.config = config
    this.apiVersion = '/api/v1/'
    this.apiUsers = 'users/'
    this.apiVideos = '/videos'
  }

  async get (userId) {
    let users = await fetch(this.config['db.provider'] + this.apiVersion + this.apiUsers + userId, {
      method: 'get'
    }).then(function (response) {
      return response.json()
    })
    return users
  }

  async videos (userId) {
    let users = await fetch(this.config['db.provider'] + this.apiVersion + this.apiUsers + userId + this.apiVideos, {
      method: 'get'
    }).then(function (response) {
      return response.json()
    })
    return users
  }
}
