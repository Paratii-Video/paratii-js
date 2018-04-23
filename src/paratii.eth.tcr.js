'use strict'
import { getInfoFromLogs } from './utils.js'

 /**
  * Token Curated Registry functionalities.
  * Work in progress: this class does not yet implement all TCR functionality
  * @param  {ParatiiEth} context ParatiiEth instance
  * @property {ParatiiEth} eth ParatiiEth instance
  * @example let paratii = new Paratii()
  * paratii.eth.tcr // this is an instance of ParatiiEthTcr
  */
export class ParatiiEthTcr {
  constructor (context) {
    this.eth = context
  }

  /**
   * get TCR contract instance.
   * @return {Promise} The TCR Contract instance.
   * @example let contract = await paratii.eth.tcr.getTcrContract()
   */
  async getTcrContract () {
    let contract = await this.eth.getContract('TcrRegistry')
    if (contract.options.address === '0x0') {
      throw Error('There is no TCR contract known in the registry')
    }
    return contract
  }

  /**
   * get parametrizer contract instance.
   * @return {Promise} The parametrizer Contract instance.
   * @example let contract = await paratii.eth.tcr.getParametrizerContract()
   */
  async getParametrizerContract () {
    let contract = await this.eth.getContract('TcrParameterizer')
    if (contract.options.address === '0x0') {
      throw Error('There is no Parametrizer contract known in the registry')
    }
    return contract
  }

  // -----------------------
  // TCR PARAMETERS GETTERS
  // -----------------------

  /**
   * get the minimum amount required to stake a video.
   * @return {integer} amount required, in PTI base units
   * @todo return amount as bignumber.js Object
   * @example let minDeposit = await paratii.eth.tcr.getMinDeposit()
   */
  async getMinDeposit () {
    return this.get('minDeposit')
  }

  /**
   * get the period over which applicants wait to be whitelisted
   * @return {integer} length of the apply stage in seconds
   * @example let applyStageLen = await paratii.eth.tcr.getApplyStageLen()
   */
  async getApplyStageLen () {
    return this.get('applyStageLen')
  }

  /**
   * get the percentage of losing party's deposit distributed to winning party
   * @return {integer} percentage of losing party's deposit distributed to winning party
   * @example let dispensationPct = await paratii.eth.tcr.getDispensationPct()
   */
  async getDispensationPct () {
    return this.get('dispensationPct')
  }

  /**
   * get the length of commit period for voting
   * @return {integer} length of the commit stage in seconds
   * @example let applyCommitLen = await paratii.eth.tcr.getCommitStageLen()
   */
  async getCommitStageLen () {
    return this.get('commitStageLen')
  }

  /**
   * get the length of reveal period for voting
   * @return {integer} length of the reveal stage in seconds
   * @example let applyRevealLen = await paratii.eth.tcr.getRevealStageLen()
   */
  async getRevealStageLen () {
    return this.get('revealStageLen')
  }

  /**
   * get the type of majority out of 100 necessary for vote success
   * @return {integer} percentage needed for success
   * @example let voteQuorum = await paratii.eth.tcr.getVoteQuorum()
   */
  async getVoteQuorum () {
    return this.get('voteQuorum')
  }

  // -----------------------
  // PARAMETRIZER PARAMETERS GETTERS
  // -----------------------

  /**
   * get the minimum deposit to propose a reparameterization
   * @return {integer} amount required, in PTI base units
   * @todo return amount as bignumber.js Object
   * @example let minpDeposit = await paratii.eth.tcr.getpMinDeposit()
   */
  async getpMinDeposit () {
    return this.get('pMinDeposit')
  }

  /**
   * get the period over which reparmeterization proposals wait to be processed
   * @return {integer} length of the parametrizer apply stage in seconds
   * @example let pApplyStageLen = await paratii.eth.tcr.getpApplyStageLen()
   */
  async getpApplyStageLen () {
    return this.get('pApplyStageLen')
  }

  /**
   * get the percentage of losing party's deposit distributed to winning party in parameterizer
   * @return {integer} percentage of losing party's deposit distributed to winning party
   * @example let pDispensationPct = await paratii.eth.tcr.getpDispensationPct()
   */
  async getpDispensationPct () {
    return this.get('pDispensationPct')
  }

  /**
   * get the length of commit period for voting in parametrizer
   * @return {integer} length of the parametrizer commit stage in seconds
   * @example let pCommitStageLen = await paratii.eth.tcr.getpCommitStageLen()
   */
  async getpCommitStageLen () {
    return this.get('pCommitStageLen')
  }

  /**
   * get the length of reveal period for voting in parametrizer
   * @return {integer} length of the parametrizer reveal stage in seconds
   * @example let pRevealStageLen = await paratii.eth.tcr.getpRevealStageLen()
   */
  async getpRevealStageLen () {
    return this.get('pRevealStageLen')
  }

  /**
   * get the type of majority out of 100 necessary for vote success in parametrizer
   * @return {integer} percentage needed for success in parametrizer
   * @example let pVoteQuorum = await paratii.eth.tcr.getpVoteQuorum()
   */
  async getpVoteQuorum () {
    return this.get('pVoteQuorum')
  }

  /**
   * get the value of the param passed on the Parametrizer contract
   * @param  {String}  param name of the param
   * @return {Promise}       that resolves in the value of the parameter
   * @example  let minDeposit = await paratii.eth.tcr.get('minDeposit')
   * @private
   */
  async get (param) {
    let contract = await this.getParametrizerContract()

    let value = await contract.methods.get(param).call()
    return value
  }

  /**
   * check if video is already whitelisted. note that this returns false
   * till the video is actually whitelisted. use appWasMade in case you want
   * to check whether the video is in application process.
   * @param  {string}  videoId id of the video
   * @return {boolean}         true if video is whitelisted, false otherwise
   * @example let isWhitelisted = await paratii.eth.tcr.isWhitelisted('some-video-id')
   */
  async isWhitelisted (videoId) {
    let contract = await this.getTcrContract()
    let videoIdBytes = this.eth.web3.utils.fromAscii(videoId)
    let isWhitelisted = await contract.methods.isWhitelisted(videoIdBytes).call()
    return isWhitelisted
  }

  /**
   * check whether a video started the application process
   * @param  {string}  videoId id of the video
   * @return {boolean}  true if video started the application process, false otherwise
   * @example let appWasMade = await paratii.eth.tcr.appWasMade('some-video-id')
   */
  async appWasMade (videoId) {
    let contract = await this.getTcrContract()
    let videoIdBytes = this.eth.web3.utils.fromAscii(videoId)
    let appWasMade = await contract.methods.appWasMade(videoIdBytes).call()
    return appWasMade
  }

  /**
   * Start the application process.
   * One of the preconditions for application is the client approve that the TCR contract can amount first before actually
   * transfer the stake. If this sounds unfamliar to you, use {@link ParatiiEthTcr#checkEligiblityAndApply} instead.
   * @param  {string} videoId id of the video
   * @param  {integer}  amountToStake number of tokens to stake. must >= minDeposit
   * @param  {string} data optional data for the application
   * @return {boolean}  returns true if the  application is successful
   * @example paratii.eth.tcr.apply('some-video-id', 3e18)
   */
  async apply (videoId, amountToStake, data) {
    // tcr contract wants a string anyway
    if (data == null) {
      data = ''
    }

    let minDeposit = await this.getMinDeposit()

    // FIXME: it is more efficient if we first call "apply", and check for preconditions only after this failed
    let isWhitelisted = await this.isWhitelisted(videoId)
    if (isWhitelisted) {
      throw new Error('The video is already whitelisted')
    }

    let appWasMade = await this.appWasMade(videoId)
    if (appWasMade) {
      throw new Error('The video has already applied for the whitelist')
    }

    if (this.eth.web3.utils.toBN(amountToStake).lt(minDeposit)) {
      throw new Error(`amount to stake ${amountToStake} is less than minDeposit ${minDeposit.toString()}`)
    }

    let contract = await this.getTcrContract()
    // let amountInWei = this.eth.web3.utils.toWei(amountToStake.toString())
    let amountInHex = this.eth.web3.utils.toHex(amountToStake.toString())
    // console.log('amountInHex: ', amountInHex)
    let videoIdBytes = this.eth.web3.utils.fromAscii(videoId)

    let tx
    try {
      tx = await contract.methods.apply(videoIdBytes, amountInHex, data).send()
    } catch (error) {
      throw error
    }
    let vId
    vId = getInfoFromLogs(tx, '_Application', 'listingHash', 1)

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
   * @param  {string}  videoId       id of the video
   * @param  {integer}  amountToStake amount (in base units) of tokens to stake
   * @return {Promise}  returns true if the application was successful, false otherwise
   * event.
   * @example let result = await paratii.eth.tcr.checkEligiblityAndApply('some-video-id', 31415926)
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

    let appWasMade = await this.appWasMade(videoId)
    if (appWasMade) {
      throw new Error(`video ${videoId} already applied and awaiting decision`)
    }

    // get some tokens
    let token = await this.eth.getContract('ParatiiToken')
    let tcr = await this.getTcrContract()

    // FIXME: restore this logic (it is broken!)
    // let balance = await token.methods.balanceOf(this.getAccount()).call()
    // if (this.eth.web3.utils.toBN(balance.toString()).lt(amountToStake)) {
    //   throw new Error(`Your balance is to low: it is ${balance.toString()}, while a minimal deposit of ${minDeposit.toString()} is required`)
    // }

    let tx2 = await token.methods.approve(tcr.options.address, amountToStake).send()
    if (!tx2) {
      throw new Error('checkEligiblityAndApply Error ', tx2)
    }

    let allowance = await token.methods.allowance(this.eth.getAccount(), tcr.options.address).call()
    if (allowance.toString() !== amountToStake.toString()) {
      console.warn(`allowance ${allowance.toString()} != ${amountToStake.toString()}`)
    }

    let result = await this.apply(videoId, amountToStake)
    return result
  }

  async getListing (videoId) {
    let contract = await this.getTcrContract()

    let videoIdBytes = this.eth.web3.utils.fromAscii(videoId)
    let listing = await contract.methods.listings(videoIdBytes).call()

    return listing
  }

  /**
   * remove the video given by videoId from the listing (and returns the stake to the staker)
   * @param videoId {string} video identifier
   * @return information about the transaction
   * @example let tx = await paratii.eth.tcr.exit('some-video-id')
   */
  async exit (videoId) {
    let isWhitelisted = await this.isWhitelisted(videoId)
    if (!isWhitelisted) {
      throw new Error('The video must be whitelisted in order to exit')
    }

    let contract = await this.getTcrContract()
    let videoIdBytes = this.eth.web3.utils.fromAscii(videoId)
    return contract.methods.exit(videoIdBytes).send()
  }
}
