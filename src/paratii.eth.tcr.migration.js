'use strict'

export class ParatiiEthTcrMigration {
  constructor (opts) {
    // TODO: make this more modular by creating this.currentTcr , this.newTcr
    this.eth = opts
  }

  async eligibleForMigration (videoId) {
    let didMigrate = await this._didMigrate(videoId)
    if (didMigrate) {
      return false
    } else {
      let inPlaceholder = await this._inTcrPlaceholder(videoId)
      if (inPlaceholder) {
        return true
      }

      return false
    }
  }

  async _didMigrate (videoId) {
    // 1. Check if the video is in TcrRegistry, if so . return true
    // 2. Check TcrPlaceholder if it has the video, if so, return false
    let inTcr = await this._inTcrRegistry(videoId)
    if (inTcr) {
      return true
    }

    return false
  }

  async _inTcrPlaceholder (videoId) {
    let isWhitelisted = await this.eth.tcrPlaceholder.isWhitelisted(videoId)
    if (isWhitelisted) {
      return true
    } else {
      return false
    }
  }

  async _inTcrRegistry (videoId) {
    let isWhitelisted = await this.eth.tcr.isWhitelisted(videoId)
    if (isWhitelisted) {
      return true
    } else {
      return false
    }
  }

  async migrate (videoId) {
    // get info from Placeholder
    // check if user is owner of the video
    // start a new whitelisting process on the new TCR
  }
}
