'use strict'
import { getInfoFromLogs } from './utils.js'
/**
 * [eth description]
 * @type {[type]}
 */
export class ParatiiEthTcr {
  /**
   * TCR functionality
   * @param  {object} context ParatiiEth Instance
   * @return {TCR}      returns instances of Tcr
   */
  constructor (context) {
    this.eth = context
  }

  /**
   * get TCR contract instance.
   * @return {Promise} Contract instance.
   */
  async getTcrContract () {
    let contract = await this.eth.getContract('TcrPlaceholder')
    if (contract.options.address === '0x0') {
      throw Error('There is no TCR contract known in the registry')
    }
    return contract
  }

  /**
   * get the minimum amount required to stake a video.
   * @return {Float} amount required in PTI
   * @todo return amount as bignumber.js Object
   */
  async getMinDeposit () {
    let contract = await this.getTcrContract()
    let minDeposit = await contract.methods.getMinDeposit().call()
    return minDeposit
  }

  /**
   * check if video is already whitelisted or not. note that this returns false
   * till the video is actually whitelisted. use didVideoApply in case you want
   * to check whether the video is in application process.
   * @param  {string}  videoId videoId
   * @return {boolean}         is video whitelisted or not.
   */
  async isWhitelisted (videoId) {
    let contract = await this.getTcrContract()
    let isWhitelisted = await contract.methods.isWhitelisted(videoId).call()
    return isWhitelisted
  }

  /**
   * check whether a video started the application process or not yet.
   * @param  {string}  videoId videoId
   * @return {boolean}         did the video start the TCR process.
   */
  async didVideoApply (videoId) {
    let contract = await this.getTcrContract()
    let appWasMade = await contract.methods.appWasMade(videoId).call()
    return appWasMade
  }

  /**
   * start the application process.
   * NOTE that this require the client approves PTI amount first before actually
   * running this function, use `checkEligiblityAndApply` instead.
   * @param  {string}  videoId       videoId
   * @param  {Float}  amountToStake number of tokens to stake. must >= minDeposit
   * @return {boolean}               returns true if all is good, plus _Application
   * event.
   */
  async apply (videoId, amountToStake) {
    // FIXME: it is more efficient if we first call "apply", and check for preconditions only after this failed
    let minDeposit = await this.getMinDeposit()
    if (this.eth.web3.utils.toBN(amountToStake).lt(minDeposit)) {
      throw new Error(`amount to stake ${amountToStake} is less than minDeposit ${minDeposit.toString()}`)
    }

    let contract = await this.getTcrContract()
    // let amountInWei = this.eth.web3.utils.toWei(amountToStake.toString())
    let amountInHex = this.eth.web3.utils.toHex(amountToStake.toString())
    console.log('amountInHex: ', amountInHex)
    let tx
    try {
      tx = await contract.methods.apply(videoId, amountInHex).send()
    } catch (error) {
      throw error
    }
    console.log('tx: ', tx)
    let vId
    try {
      vId = getInfoFromLogs(tx, '_Application', 'videoId', 1)
    } catch (e) {
      // FIXME: thsi error should be thrown
      if (e) {
        return false
      }
    }

    console.log('vId: ', vId)
    if (vId) {
      return true
    } else {
      return false
    }
  }

  /**
   * check whether the user has enough funds to stake.
   * it also approves the TCR contract to amountToStake.
   * @param  {[type]}  videoId       [description]
   * @param  {[type]}  amountToStake [description]
   * @return {Promise}               [description]
   */
  async checkEligiblityAndApply (videoId, amountToStake) {
    let minDeposit = await this.getMinDeposit()
    if (this.eth.web3.utils.toBN(amountToStake).lt(minDeposit)) {
      throw new Error(`amount to stake ${amountToStake} is less than minDeposit ${minDeposit.toString()}`)
    }

    // check if the videoId was already applied or is whitelisted
    let isWhitelisted = await this.isWhitelisted(videoId)
    if (isWhitelisted) {
      throw new Error(`video ${videoId} is already whitelisted`)
    }

    let appWasMade = await this.didVideoApply(videoId)
    if (appWasMade) {
      throw new Error(`video ${videoId} already applied and awaiting decision`)
    }

    // get some tokens
    let token = await this.eth.getContract('ParatiiToken')
    let tcrPlaceholder = await this.eth.getContract('TcrPlaceholder')

    // FIXME: restore this logic (it is broken!)
    // let balance = await token.methods.balanceOf(this.eth.config.account.address).call()
    // if (this.eth.web3.utils.toBN(balance.toString()).lt(amountToStake)) {
    //   throw new Error(`Your balance is to low: it is ${balance.toString()}, while a minimal deposit of ${minDeposit.toString()} is required`)
    // }

    let tx2 = await token.methods.approve(tcrPlaceholder.options.address, amountToStake).send()
    if (!tx2) {
      throw new Error('checkEligiblityAndApply Error ', tx2)
    }

    let allowance = await token.methods.allowance(this.eth.config.account.address, tcrPlaceholder.options.address).call()
    if (allowance.toString() !== amountToStake.toString()) {
      console.warn(`allowance ${allowance.toString()} != ${amountToStake.toString()}`)
    }

    let result = await this.apply(videoId, amountToStake)
    return result
  }
}
