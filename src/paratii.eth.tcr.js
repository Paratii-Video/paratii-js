'use strict'
import { getInfoFromLogs } from './utils.js'

const HASH_TO_KEY_PREFIX = 'HASH_KEY_'
const SALT_KEY_PREFIX = 'SALT_KEY_'

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

  // ---------------------------------------------------------------------------

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
    let hash = this.getHash(videoId)
    let isWhitelisted = await contract.methods.isWhitelisted(hash).call()
    return isWhitelisted
  }

  /**
   * Determines whether the given videoId be whitelisted.
   * @param  {string}  videoId id of the video
   * @return {Promise}         true if it can be whitelisted.
   */
  async canBeWhitelisted (videoId) {
    let hash = this.getHash(videoId)
    let tcrRegistry = await this.getTcrContract()
    let canBeWhitelisted = await tcrRegistry.methods.canBeWhitelisted(hash).call()
    return canBeWhitelisted
  }

  /**
   * check whether a video started the application process
   * @param  {string}  videoId id of the video
   * @return {boolean}  true if video started the application process, false otherwise
   * @example let appWasMade = await paratii.eth.tcr.appWasMade('some-video-id')
   */
  async appWasMade (videoId) {
    let contract = await this.getTcrContract()
    let hash = this.getHash(videoId)
    let appWasMade = await contract.methods.appWasMade(hash).call()
    return appWasMade
  }

  /**
   * Calculates the provided voter's token reward for the given poll.
   * @param  {string}  voterAddress address of the voter
   * @param  {uint}  challengeID  challengeID ( in hex )
   * @param  {string}  salt         the salt used for that vote.
   * @return {Number}              returns the voterReward in BN format.
   */
  async voterReward (voterAddress, challengeID, salt) {
    let tcrRegistry = await this.getTcrContract()
    let voterReward = await tcrRegistry.methods.voterReward(voterAddress, challengeID, salt).call()
    return voterReward
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
    let hash = this.getHash(videoId)

    let tx
    try {
      tx = await contract.methods.apply(hash, amountInHex, data).send()
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
    // let balance = await token.methods.balanceOf(this.eth.getAccount()).call()
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

  /**
   * get the listing of that videoId
   * @param  {String}  videoId id of the video
   * @return {Promise}        that resolves in the listings
   * @example let listing = await paratii.eth.tcr.getListing('video-id')
   */
  async getListing (videoId) {
    let contract = await this.getTcrContract()

    let hash = this.getHash(videoId)
    let listing = await contract.methods.listings(hash).call()

    if (listing.owner === '0x0000000000000000000000000000000000000000') { throw Error(`Listing with videoId ${videoId} doesn't exists`) }
    return listing
  }

  /**
   * get the challenge of that challengeId
   * @param  {integer}  challengeId id of the challenge
   * @return {Promise}        that resolves in the challenge
   * @example let challenge = await paratii.eth.tcr.getChallenge(1)
   */
  async getChallenge (challengeId) {
    let contract = await this.getTcrContract()

    let challenge = await contract.methods.challenges(challengeId).call()

    if (challenge.challenger === '0x0000000000000000000000000000000000000000') { throw Error(`Challenge with challengeId ${challengeId} doesn't exists`) }
    return challenge
  }

  /**
   * get the hash of the video Id to be inserted in the TCR contract
   * @param  {String} videoId univocal id of the video
   * @return {String}         sha3 of the id
   * @private
   */
  getHash (videoId) {
    return this.eth.web3.utils.soliditySha3(videoId)
  }

  /**
   * Allows the owner of a listingHash to increase their unstaked deposit.
   * @param  {string}  videoId id of the video
   * @param  {number}  amount  amount in bignumber format.
   * @return {Promise}         the deposit tx
   */
  async deposit (videoId, amount) {
    // check if user is the listing owner.
    let hash = this.getAndStoreHash(videoId)
    let listing = await this.getListing(videoId)
    if (listing.owner !== this.eth.getAccount()) {
      throw new Error(`Can't deposit tokens to video ${videoId} because ${this.eth.getAccount()} isn't the owner.`)
    }

    // check if tcrRegistry has the allowance
    let tcrRegistry = await this.getTcrContract()
    let allowance = await this.eth.allowance(this.eth.getAccount(), tcrRegistry.options.address)
    if (allowance.lt(amount)) {
      throw new Error(`tcrRegistry doesn't have enough allowance (${allowance.toString()}) to deposit ${amount.toString()}`)
    }

    let tx = await tcrRegistry.methods.deposit(hash, amount).send()
    return tx
  }

  /**
   * Allows the owner of a listingHash to decrease their unstaked deposit.
   * @param  {string}  videoId id of the video
   * @param  {number}  amount  amount to withdraw.
   * @return {Promise}         withdraw tx.
   */
  async withdraw (videoId, amount) {
    let tcrRegistry = await this.getTcrContract()
    let hash = this.getAndStoreHash(videoId)
    let listing = await this.getListing(videoId)
    if (listing.owner !== this.eth.getAccount()) {
      throw new Error(`Can't deposit tokens to video ${videoId} because ${this.eth.getAccount()} isn't the owner.`)
    }

    if (listing.unstakedDeposit.lt(amount)) {
      throw new Error(`unstakedDeposit ${listing.unstakedDeposit.toString()} is less than amount ${amount.toString()}`)
    }

    let minDeposit = await this.getMinDeposit()
    if (listing.unstakedDeposit.minus(amount).lt(minDeposit)) {
      throw new Error(`can't withdraw amount (${amount.toString()}) from ${listing.unstakedDeposit.toString()} since it'd be under ${minDeposit.toString()}`)
    }

    let tx = await tcrRegistry.methods.withdraw(hash, amount).send()
    return tx
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

    let listing = this.getListing(videoId)
    let sender = this.eth.getAccount()
    if (sender !== listing.owner) {
      throw new Error('You must be the owner of the listing to exit the whitelist')
    }

    if (listing.challengeID !== 0) {
      let challenge = this.getChallenge(listing.challengeID)
      if (challenge.resolved !== 1) {
        throw new Error('You can\'t exit during a challenge')
      }
    }

    let contract = await this.getTcrContract()
    let hash = this.getHash(videoId)

    return contract.methods.exit(hash).send()
  }

  async startChallenge (videoId, _data) {
    if (!_data) {
      _data = ''
    }

    let tcrRegistry = await this.getTcrContract()
    let hash = this.getAndStoreHash(videoId)

    // 1. check if challenger has enough minDeposit and approved the
    // contract to spend that
    let minDeposit = await this.getMinDeposit()
    let balance = await this.eth.balanceOf(this.eth.config.account.address)
    let allowance = await this.eth.allowance(this.eth.getAccount, tcrRegistry.options.address)

    if (allowance.lt(minDeposit)) {
      throw new Error(`allowance ${allowance.toString()} is less than ${minDeposit.toString()}`)
    }

    if (balance.lt(minDeposit)) {
      throw new Error(`balance ${balance.toString()} is less than ${minDeposit.toString()}`)
    }

    // Listing must be in apply stage or already on the whitelist
    let appWasMade = await this.appWasMade(videoId)
    let isWhitelisted = await this.isWhitelisted(videoId)

    if (!appWasMade && !isWhitelisted) {
      throw new Error(`video ${videoId} has no application or is not whitelisted`)
    }

    // Prevent multiple challenges
    let listing = await this.getListing(videoId)
    if (listing.challengeID !== 0) {
      throw new Error(`challenge for ${videoId} already exist. challengeID ${listing.challengeID}`)
    }

    let pollID = await tcrRegistry.methods.challenge(hash, _data).send()
    if (!pollID) {
      throw new Error(`starting Challenge ${videoId} failed!!`)
    }

    return pollID
  }

  /**
   * Updates a listingHash's status from 'application' to 'listing' or resolves
   * a challenge if one exists.
   * this is required to be able to use claimReward.
   * @param  {string}  videoId id of the video
   * @return {Promise}         tx of the updateStatus
   */
  async updateStatus (videoId) {
    let hash = this.getAndStoreHash(videoId)
    let tcrRegistry = await this.getTcrContract()
    let tx = await tcrRegistry.methods.updateStatus(hash).send()
    return tx
  }

  /**
   * claim reward. nuff said.
   * @param  {string}  videoId id of the video.
   * @param  {string}  salt    salt used in that vote.
   * @return {Promise}         the claimReward tx
   */
  async claimReward (videoId, salt) {
    let tcrRegistry = await this.getTcrContract()
    let listing = await this.getListing(videoId)
    let challengeID = listing.challengeID

    // Ensure the voter has not already claimed tokens and challenge results have been processed
    let challenge = await this.getChallenge(challengeID)
    if (challenge.tokenClaims[this.eth.getAccount()] !== false) {
      throw new Error(`Account ${this.eth.getAccount()} has already claimed reward. for video ${videoId}`)
    }

    if (challenge.resolved !== true) {
      throw new Error(`Challenge ${challengeID} (videoId: ${videoId}) hasn't been resolved`)
    }

    let tx = await tcrRegistry.methods.claimReward(
      this.eth.web3.utils.toHex(challengeID.toString()),
      salt
    ).send()
    return tx
  }

  // --------------------[voting functions]-------------------------------------

  async commitVote (vote, amount) {

  }

  /**
   * Loads amount ERC20 tokens into the voting contract for one-to-one voting rights
   * @param  {bignumber}  amount amount to deposit into voting contract.
   * @return {Promise}        `requestVotingRights` tx
   */
  async requestVotingRights (amount) {
    let tcrPLCRVoting = await this.eth.getContract('TcrPLCRVoting')
    let balance = await this.eth.balanceOf(this.eth.getAccount(), 'PTI')
    if (balance.lt(amount)) {
      throw new Error(`${this.eth.getAccount()} balance (${balance.toString()}) is insufficient (amount = ${amount.toString()})`)
    }

    let allowance = await this.eth.allowance(this.eth.getAccount(), tcrPLCRVoting.options.address)
    if (allowance.lt(amount)) {
      throw new Error(`PLCRVoting Contract allowance (${allowance.toString()}) is < amount (${amount.toString()})`)
    }

    let tx = await tcrPLCRVoting.methods.requestVotingRights(amount).send()
    return tx
  }

  async getLockedTokens (voterAddress) {
    if (!voterAddress) {
      voterAddress = this.eth.getAccount()
    }
    let tcrPLCRVoting = await this.eth.getContract('TcrPLCRVoting')
    let lockedTokens = await tcrPLCRVoting.methods.getLockedTokens(voterAddress).call()
    return lockedTokens
  }

  /**
   * Withdraw amount ERC20 tokens from the voting contract, revoking these voting rights
   * @param  {bignumber}  amount amount to withdraw
   * @return {Promise}        withdrawVotingRights tx
   */
  async withdrawVotingRights (amount) {
    let tcrPLCRVoting = await this.eth.getContract('TcrPLCRVoting')
    let voterBalance = await tcrPLCRVoting.methods.voteTokenBalance(this.eth.getAccount()).call()
    let lockedTokens = await this.getLockedTokens(this.eth.getAccount())
    let balanceAfter = voterBalance.minus(lockedTokens)
    if (balanceAfter.lt(amount)) {
      throw new Error(`unlocked balance ${balanceAfter.toString()} is < amount ${amount.toString()}`)
    }

    let tx = await tcrPLCRVoting.methods.withdrawVotingRights(amount).send()
    return tx
  }

  async isExpired (deadline) {
    let tcrPLCRVoting = await this.eth.getContract('TcrPLCRVoting')
    let isExpired = await tcrPLCRVoting.methods.isExpired(deadline).call()
    return isExpired
  }

  /**
   * Unlocks tokens locked in unrevealed vote where poll has ended
   * @param  {uint}  pollID the pollID , aka challengeID
   * @return {Promise}        rescueTokens tx
   */
  async rescueTokens (pollID) {
    let tcrPLCRVoting = await this.eth.getContract('TcrPLCRVoting')
    // TODO make sure pollID is a uint and is converted to hex
    let poll = await tcrPLCRVoting.methods.pollMap(pollID).call()
    let isExpired = await this.isExpired(poll.revealEndDate)
    if (!isExpired) {
      throw new Error(`poll ${pollID.toString()} did not expire just yet.`)
    }

    // TODO check the DLL if it contains this poll.
    let tx = await tcrPLCRVoting.methods.rescueTokens(pollID).send()
    return tx
  }

  // ---------------------------[ utils ]---------------------------------------
  getAndStoreHash (videoId) {
    let hash = this.getHash(videoId)
    if (window && window.localStorage) {
      window.localStorage.setItem(HASH_TO_KEY_PREFIX + hash.toString(), videoId)
    } else {
      console.warn('localStorage isn\'t available. TODO: levelDB integration.')
    }

    return hash
  }
  storeSalt (videoId, salt) {
    if (window && window.localStorage) {
      window.localStorage.setItem(SALT_KEY_PREFIX + videoId, salt)
    } else {
      console.warn('localStorage isn\'t available. TODO: levelDB integration.')
    }
  }

  getSalt (videoId) {
    if (window && window.localStorage) {
      return window.localStorage.getItem(SALT_KEY_PREFIX + videoId)
    } else {
      console.warn('localStorage isn\'t available. TODO: levelDB integration.')
    }
  }

  hashToId (hash) {
    if (window && window.localStorage) {
      return window.localStorage.getItem(HASH_TO_KEY_PREFIX + hash.toString())
    } else {
      console.warn('localStorage isn\'t available. TODO: levelDB integration.')
    }
  }
}
