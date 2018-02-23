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
    let amountInWei = this.eth.web3.utils.toWei(amountToStake.toString())
    let amountInHex = this.eth.web3.utils.toHex(amountInWei.toString())
    console.log('amountInHex: ', amountInHex)
    let tx = await contract.methods.apply(videoId, amountInHex).send()
    console.log('tx: ', tx)
    let vId = getInfoFromLogs(tx, '_Application', 'videoId', 1)
    console.log('vId: ', vId)
    if (vId) {
      return true
    } else {
      return false
    }
  }

  async checkEligiblityAndApply (videoId, amountToStake) {
    let minDeposit = await this.getMinDeposit()
    if (amountToStake < minDeposit) {
      throw new Error(`amount to stake ${amountToStake} is less than minDeposit ${minDeposit.toString()}`)
    }

    // get some tokens
    let token = await this.eth.getContract('ParatiiToken')
    let tcrPlaceholder = await this.eth.getContract('TcrPlaceholder')

    let balance = await token.methods.balanceOf(this.eth.config.account.address).call()
    if (balance < amountToStake) {
      throw new Error(`you don't have enough balance ${balance.toString()}, ${minDeposit.toString()} is required`)
    }

    let tx2 = await token.methods.approve(tcrPlaceholder.options.address, amountToStake).send()
    if (!tx2) {
      // TODO better handle this.
      console.error('checkEligiblityAndApply Error ', tx2)
    }

    let allowance = await token.methods.allowance(this.eth.config.account.address, tcrPlaceholder.options.address).call()
    if (allowance.toString() !== amountToStake.toString()) {
      console.warn(`allowance ${allowance.toString()} != ${amountToStake.toString()}`)
    }

    let result = await this.apply(videoId, amountToStake)
    return result
  }
}
