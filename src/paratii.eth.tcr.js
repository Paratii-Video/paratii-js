'use strict'
import { getInfoFromLogs } from './utils.js'

 /**
  * Token Curated Registry functionalities
  * @param  {Object} context ParatiiEth instance
  * @property {ParatiiEth} eth ParatiiEth instance
  */
export class ParatiiEthTcr {
  constructor (context) {
    this.eth = context
  }

  /**
   * get TCR contract instance.
   * @return {Promise} Contract instance.
   * @example let contract = await paratii.eth.tcr.getTcrContract()
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
   * @example let minDeposit = await paratii.eth.tcr.getMinDeposit()
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
   * @param  {string}  videoId univocal video identifier randomly generated
   * @return {boolean}         true if video is whitelisted, false otherwise
   * @example let isWhitelisted = await paratii.eth.tcr.isWhitelisted('some-video-id')
   */
  async isWhitelisted (videoId) {
    let contract = await this.getTcrContract()
    let isWhitelisted = await contract.methods.isWhitelisted(videoId).call()
    return isWhitelisted
  }

  /**
   * check whether a video started the application process or not yet.
   * @param  {string}  videoId univocal video identifier randomly generated
   * @return {boolean}         true if video started the application process, false otherwise
   * @example let appWasMade = await paratii.eth.tcr.didVideoApply('some-video-id')
   */
  async didVideoApply (videoId) {
    let contract = await this.getTcrContract()
    let appWasMade = await contract.methods.appWasMade(videoId).call()
    return appWasMade
  }

  /**
   * start the application process.<br>
   * NOTE that this require the client approves PTI amount first before actually
   * running this function, use checkEligiblityAndApply instead.
   * @param  {string} videoId univocal video identifier randomly generated
   * @param  {Float}  amountToStake number of tokens to stake. must >= minDeposit
   * @return {boolean}               returns true if all is good, plus _Application
   * event.
   * @example let result = await paratii.eth.tcr.apply('some-video-id', 'amount of tokens')
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
    // console.log('amountInHex: ', amountInHex)
    let tx
    try {
      tx = await contract.methods.apply(videoId, amountInHex).send()
    } catch (error) {
      throw error
    }
    // console.log('tx: ', tx)
    let vId
    try {
      vId = getInfoFromLogs(tx, '_Application', 'videoId', 1)
    } catch (e) {
      // FIXME: thsi error should be thrown
      if (e) {
        console.log(tx)
        // throw (e)
        // return false
      }
    }

    // console.log('vId: ', vId)
    if (vId) {
      return true
    } else {
      return false
    }
  }

  /**
   * Stake amountToStake on video with id videoId
   * does a number of separate steps:
   * - check preconditions for staking
   * - approve that the TCR contract can transfer amountToStake tokens
   * - apply to the TCR
   * @param  {string}  videoId       univocal video identifier randomly generated
   * @param  {number}  amountToStake number of tokens to stake
   * @return {Promise}                returns true if all is good, plus _Application
   * event.
   * @example let result = await paratii.eth.tcr.checkEligiblityAndApply('some-video-id', 'amount of tokens')
   */
   // FIXME: better naming
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
    // let balance = await token.methods.balanceOf(this.getAccount()).call()
    // if (this.eth.web3.utils.toBN(balance.toString()).lt(amountToStake)) {
    //   throw new Error(`Your balance is to low: it is ${balance.toString()}, while a minimal deposit of ${minDeposit.toString()} is required`)
    // }

    let tx2 = await token.methods.approve(tcrPlaceholder.options.address, amountToStake).send()
    if (!tx2) {
      throw new Error('checkEligiblityAndApply Error ', tx2)
    }

    let allowance = await token.methods.allowance(this.eth.getAccount(), tcrPlaceholder.options.address).call()
    if (allowance.toString() !== amountToStake.toString()) {
      console.warn(`allowance ${allowance.toString()} != ${amountToStake.toString()}`)
    }

    let result = await this.apply(videoId, amountToStake)
    return result
  }

  /**
   * remove the video given by videoId from the listing
   * @param videoId univocal video identifier randomly generated
   * @return information about the transaction
   * @example let tx = await paratii.eth.tcr.exit('some-video-id')
   */
  async exit (videoId) {
    let contract = await this.getTcrContract()
    return contract.methods.exit(videoId).send()
  }
}
