'use strict'

export class ParatiiEthTcrMigration {
  constructor (opts) {
    // TODO: make this more modular by creating this.currentTcr , this.newTcr
    this.eth = opts
  }

  async getMigrationStatuss (address) {
    const vids = await this.eth.config.paratii.vids.search({owner: address})
    let ids = {}
    if (vids) {
      console.log('all vids:', vids.results)
    }

    let idArray = vids.results.map((vid) => { return vid.id })
    idArray.forEach(async id => {
      ids[id] = await this.eligibleForMigration(id)
    })
    return ids
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
    let appWasMade = await this.eth.tcrPlaceholder.didVideoApply(videoId)
    if (appWasMade) {
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
    let minDeposit = await this.eth.tcr.getMinDeposit()
    let hash = this.eth.tcr.getHash(videoId)
    let placeHolderContract = await this.eth.tcrPlaceholder.getTcrContract()
    let listing = await placeHolderContract.methods.listings(hash).call()
    if (listing) {
      // console.log('listing', listing)
      // return listing

      // check if whitelisted or not.
      let isWhitelisted = await this.eth.tcrPlaceholder.isWhitelisted(videoId)
      if (isWhitelisted) {
        // exit the old Tcr
        let exitTx = await this.eth.tcrPlaceholder.exit(videoId)
        if (exitTx) {
          // TODO check for token transfer event here.
          let applyTx = await this.eth.tcr.checkEligiblityAndApply(videoId, this.eth.web3.utils.toWei(minDeposit.toString()))
          // console.log('applyTx: ', applyTx)
          return applyTx
        } else {
          // no token transfer, whats up with that ?
          throw new Error(`Video ${videoId} is whitelisted but can't exit placeHolderContract`)
        }
      } else {
        // can it be whitelisted?
        let updateStatus = await this.eth.tcrPlaceholder.updateStatus(videoId)
        if (updateStatus && updateStatus.events && updateStatus.events._NewVideoWhitelisted) {
          // check for _NewVideoWhitelisted event
          // console.log('updateStatus: ', updateStatus)
          let applyTx = await this.eth.tcr.checkEligiblityAndApply(videoId, this.eth.web3.utils.toWei(minDeposit.toString()))
          // console.log('applyTx: ', applyTx)
          return applyTx
        } else {
          // no event. can't be whitelisted... now what ??
          throw new Error(`Video ${videoId} is still in applying process`)
        }
      }
    } else {
      throw new Error('listing is null')
    }
  }
}
