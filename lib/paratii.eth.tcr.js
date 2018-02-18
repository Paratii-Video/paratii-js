'use strict'
import { getInfoFromLogs } from './utils.js'

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
   * @param  {string}  videoId       videoId
   * @param  {Float}  amountToStake number of tokens to stake. must >= minDeposit
   * @return {boolean}               returns true if all is good, plus _Application
   * event.
   */
  async apply (videoId, amountToStake) {
    let minDeposit = await this.getMinDeposit()
    if (amountToStake < minDeposit) {
      throw new Error(`amount to stake ${amountToStake} is less than minDeposit ${minDeposit.toString()}`)
    }

    let contract = await this.getTcrContract()
    let tx = await contract.methods.apply(videoId, amountToStake).send()
    let vId = getInfoFromLogs(tx, '_Application', 'videoId', 1)
    if (vId) {
      return true
    } else {
      return false
    }
  }
}
