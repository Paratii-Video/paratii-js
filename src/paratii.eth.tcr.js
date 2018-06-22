'use strict'
import { BigNumber } from 'bignumber.js'
import { getInfoFromLogs } from './utils.js'

var localStorage = null
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

  // -----------------------
  // CONTRACT GETTERS
  // -----------------------

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

  /**
   * get PLCRVoting contract instance.
   * @return {Promise} The PLCRVoting Contract instance.
   * @example let contract = await paratii.eth.tcr.getPLCRVotingContract()
   */
  async getPLCRVotingContract () {
    let contract = await this.eth.getContract('TcrPLCRVoting')
    if (contract.options.address === '0x0') {
      throw Error('There is no PLCRVoting contract known in the registry')
    }
    return contract
  }

  // -----------------------
  // TCR FUNCTION
  // -----------------------

  /**
   * Start the application process.
   * One of the preconditions for application is the client approve that the TCR contract can amount first before actually
   * transfer the stake. If this sounds unfamliar to you, use {@link ParatiiEthTcr#checkEligiblityAndApply} instead.
   * @param  {string} videoId id of the video
   * @param  {number}  amountToStake number of tokens to stake. must >= minDeposit
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
   * @param  {number}  amountToStake amount (in base units) of tokens to stake
   * @return {Promise}  returns true if the application was successful, false otherwise
   * event.
   * @example let result = await paratii.eth.tcr.checkEligiblityAndApply('some-video-id', 31415926)
   */
   // FIXME: better naming
  async checkEligiblityAndApply (videoId, amountToStake) {
    let minDeposit = await this.getMinDeposit()

    let amountToStakeBN = this.eth.web3.utils.toBN(amountToStake)
    if (amountToStakeBN.lt(minDeposit)) {
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

    let balance = await this.eth.balanceOf(this.eth.getAccount(), 'PTI')
    if (balance.lt(amountToStakeBN)) {
      throw new Error(`Your balance is to low: it is ${balance.toString()}, while a minimal deposit of ${minDeposit.toString()} is required`)
    }

    let tx2 = await token.methods.approve(tcr.options.address, amountToStake).send()
    if (!tx2) {
      throw new Error('checkEligiblityAndApply Error ', tx2)
    }

    let allowance = await token.methods.allowance(this.eth.getAccount(), tcr.options.address).call()
    if (allowance.toString() !== amountToStakeBN.toString()) {
      console.warn(`allowance ${allowance.toString()} != ${amountToStake.toString()}`)
    }

    let result = await this.apply(videoId, amountToStake)
    return result
  }

  /**
   * give the approval to the tcr and deposit amount tokens on the videoId
   * @param  {string}  videoId univocal video id
   * @param  {number}  amount  amount of token to be deposited
   * @return {Promise}         tx of the deposit
   * @example let tx = await paratii.eth.tcr.approveAndDeposit('some-video-id',paratii.eth.web3.utils.toWei('5'))
   */
  async approveAndDeposit (videoId, amount) {
    let tcrRegistry = await this.getTcrContract()

    // give approval to tcr
    let approved = await this.eth.approve(tcrRegistry.options.address, amount)

    if (!approved) { throw new Error('error in the approvation phase') }

    let depositTx = await this.deposit(videoId, amount)

    return depositTx
  }
  /**
   * Allows the owner of a listingHash to increase their unstaked deposit.
   * @param  {string}  videoId id of the video
   * @param  {number}  amount  amount to be deposited
   * @return {Promise}         the deposit tx
   * @example let tx = await paratii.eth.tcr.deposit('some-video-id',paratii.eth.web3.utils.toWei('5'))
   */
  async deposit (videoId, amount) {
    // check if user is the listing owner.
    let hash = this.getAndStoreHash(videoId)
    let listing = await this.getListing(videoId)

    let amountBN = this.eth.web3.utils.toBN(amount)
    if (listing.owner !== this.eth.getAccount()) {
      throw new Error(`Can't deposit tokens to video ${videoId} because ${this.eth.getAccount()} isn't the owner.`)
    }

    // check if tcrRegistry has the allowance
    let tcrRegistry = await this.getTcrContract()
    let allowance = await this.eth.allowance(this.eth.getAccount(), tcrRegistry.options.address)

    if (allowance.lt(amountBN)) {
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
   * @example let tx = await paratii.eth.tcr.withdraw('some-video-id',paratii.eth.web3.utils.toWei('5'))
   */
  async withdraw (videoId, amount) {
    let tcrRegistry = await this.getTcrContract()
    let hash = this.getAndStoreHash(videoId)
    let listing = await this.getListing(videoId)
    let amountBN = this.eth.web3.utils.toBN(amount)

    if (listing.owner !== this.eth.getAccount()) {
      throw new Error(`Can't deposit tokens to video ${videoId} because ${this.eth.getAccount()} isn't the owner.`)
    }

    let unstakedDeposit = this.eth.web3.utils.toBN(listing.unstakedDeposit)
    if (unstakedDeposit.lt(amountBN)) {
      throw new Error(`unstakedDeposit ${unstakedDeposit.toString()} is less than amount ${amount.toString()}`)
    }

    let minDeposit = await this.getMinDeposit()
    if (unstakedDeposit.sub(amountBN).lt(minDeposit)) {
      throw new Error(`can't withdraw amount (${amount.toString()}) from ${unstakedDeposit.toString()} since it'd be under ${minDeposit.toString()}`)
    }

    let tx = await tcrRegistry.methods.withdraw(hash, amount).send()
    return tx
  }

  /**
   * remove the video given by videoId from the listing (and returns the stake to the staker)
   * @param {string} videoId video identifier
   * @return information about the transaction
   * @example let tx = await paratii.eth.tcr.exit('some-video-id')
   */
  async exit (videoId) {
    let isWhitelisted = await this.isWhitelisted(videoId)
    if (!isWhitelisted) {
      throw new Error('The video must be whitelisted in order to exit')
    }

    let listing = await this.getListing(videoId)
    let sender = this.eth.getAccount()
    if (sender !== listing.owner) {
      throw new Error('You must be the owner of the listing to exit the whitelist')
    }

    if (parseInt(listing.challengeID) !== 0) {
      let challenge = await this.getChallenge(listing.challengeID)
      if (parseInt(challenge.resolved) !== 1) {
        throw new Error('You can\'t exit during a challenge')
      }
    }

    let contract = await this.getTcrContract()
    let hash = this.getHash(videoId)

    return contract.methods.exit(hash).send()
  }

  /**
   * give the approval to the tcr and starts the challenge
   * @param  {string}  videoId video to challenge
   * @param  {string}  _data   additional data
   * @return {Promise}         challenge tx
   * @example let tx = await paratii.eth.tcr.approveAndStartChallenge('some-video-id',"optional data")
   */
  async approveAndStartChallenge (videoId, _data) {
    let listing = await this.getListing(videoId)
    let unstakedDeposit = listing.unstakedDeposit
    let tcrRegistry = await this.getTcrContract()

    // give approval to tcr
    await this.eth.approve(tcrRegistry.options.address, unstakedDeposit)
    let challengeTx = await this.startChallenge(videoId, _data)

    return challengeTx
  }

  /**
   * starts the challenge
   * @param  {string}  videoId univocal video id
   * @param  {string}  _data   additional data
   * @return {Promise}         challenge tx
   * @example let tx = await paratii.eth.tcr.startChallenge('some-video-id',"optional data")

   */
  async startChallenge (videoId, _data) {
    if (!_data) {
      _data = ''
    }

    let tcrRegistry = await this.getTcrContract()
    let hash = this.getAndStoreHash(videoId)

    // 1. check if challenger has enough minDeposit and approved the
    // contract to spend that
    let minDeposit = await this.getMinDeposit()
    let balance = await this.eth.balanceOf(this.eth.getAccount(), 'PTI')
    let allowance = await this.eth.allowance(this.eth.getAccount(), tcrRegistry.options.address)

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
    if (parseInt(listing.challengeID) !== 0) {
      throw new Error(`challenge for ${videoId} already exist. challengeID ${listing.challengeID}`)
    }

    let challengeTx = await tcrRegistry.methods.challenge(hash, _data).send()
    if (!challengeTx.events._Challenge) {
      throw new Error(`starting Challenge ${videoId} failed!!`)
    }

    return challengeTx
  }

  /**
   * Updates a listingHash's status from 'application' to 'listing' or resolves
   * a challenge if one exists.
   * this is required to be able to use claimReward.
   * @param  {string}  videoId id of the video
   * @return {Promise}         tx of the updateStatus
   * @example let tx = await paratii.eth.tcr.updateStatus('some-video-id')
   */
  async updateStatus (videoId) {
    let hash = this.getAndStoreHash(videoId)
    let tcrRegistry = await this.getTcrContract()
    let tx = await tcrRegistry.methods.updateStatus(hash).send()
    return tx
  }

  /**
   * claim reward. nuff said.
   * @param  {string}  challengeId id of the challenge.
   * @param  {string}  salt    salt used in that vote.
   * @return {Promise}         the claimReward tx
   * @example let challengeID = await paratii.eth.tcr.getChallengeId('some-video-id')
   * let tx = await paratii.eth.tcr.claimReward(challengeID,paratii.eth.getSalt('some-video-id'))
   */
  async claimReward (challengeID, salt) {
    let tcrRegistry = await this.getTcrContract()

    // Ensure the voter has not already claimed tokens and challenge results have been processed
    let challenge = await this.getChallenge(challengeID)
    let claim = await this.tokenClaims(challengeID)

    if (claim !== false) {
      throw new Error(`Account ${this.eth.getAccount()} has already claimed reward for challenge ${challengeID}`)
    }

    if (challenge.resolved !== true) {
      throw new Error(`Challenge ${challengeID} hasn't been resolved`)
    }

    let tx = await tcrRegistry.methods.claimReward(
      challengeID,
      salt
    ).send()
    return tx
  }

  // -----------------------
  // VOTING FUNCTIONS
  // -----------------------

  /**
   * 1. gives the approval to PLCRVoting
   * 2. get voting Rights
   * 3. commit the vote
   * @param  {string}  videoId     univocal video identifier
   * @param  {integer}  vote        1 vote for, 0 vote against
   * @param  {number}  amountInWei amount for the vote
   * @return {Promise}             commit tx
   * @example let tx = await paratii.eth.tcr.approveAndGetRightsAndCommitVote('some-video-id',1,paratii.eth.web3.utils.toWei('5'))
   */
  async approveAndGetRightsAndCommitVote (videoId, vote, amountInWei) {
    let tcrPLCRVoting = await this.getPLCRVotingContract()
    let listing = await this.getListing(videoId)

    let challengeExists = await this.challengeExists(videoId)
    if (!challengeExists) { throw new Error(`Challenge ${listing.challengeID} is finished`) }

    let isCommitPeriodActive = await this.commitPeriodActive(listing.challengeID)
    if (!isCommitPeriodActive) { throw new Error(`Commit period for Challenge ${listing.challengeID} is finished`) }

    let approved = await this.eth.approve(tcrPLCRVoting.options.address, amountInWei)
    if (!approved) { throw new Error('Token approvation failed') }

    let tx = await this.requestVotingRights(amountInWei)
    if (!tx.events._VotingRightsGranted) { throw new Error('Rights request failed') }

    let commitVoteTx = await this.commitVote(videoId, vote, amountInWei)

    return commitVoteTx
  }
  /**
   * Commits vote using hash of choice and secret salt to conceal vote until reveal
   * @param  {string}  videoId videoId
   * @param  {integer}  vote    1 = yes, 0 = no
   * @param  {number}  amount  amount of tokens to vote with.
   * @return {Promise}         commitVote tx
   * @example let tx = await paratii.eth.tcr.commitVote('some-video-id',1,paratii.eth.web3.utils.toWei('5'))
   */
  async commitVote (videoId, vote, amountInWei) {
    let tcrPLCRVoting = await this.eth.getContract('TcrPLCRVoting')
    let amount = this.eth.web3.utils.toBN(amountInWei)

    let listing = await this.getListing(videoId)
    if (!listing) {
      throw new Error(`Can't find listing for video ${videoId}`)
    }

    let pollID = listing.challengeID
    if (!pollID || parseInt(pollID) === 0) {
      throw new Error(`Video ${videoId} isn't currently being challenged`)
    }

    // commit period should still be going
    let isCommitPeriodActive = await this.commitPeriodActive(pollID)
    if (!isCommitPeriodActive) {
      throw new Error('The challenge is not in commit period')
    }

    // check balance and allowance
    let balance = await this.eth.balanceOf(this.eth.getAccount(), 'PTI')

    if (balance.lt(amount)) {
      throw new Error(`${this.eth.getAccount()} balance (${balance.toString()}) is insufficient (amount = ${amount.toString()})`)
    }

    let hasVotingRights = await this.hasVotingRights(amountInWei)
    if (!hasVotingRights) { throw new Error('You don\'t have enough voting rights') }

    // generate salt and store it.
    let salt = this.generateSalt(32)
    this.storeSalt(videoId, salt)
    let secretHash = this.eth.web3.utils.soliditySha3(vote, salt)

    // get previous PollID
    let prevNode = await this.getLastNode(this.eth.getAccount())

    // Check if the position is valid.
    let isValidPosition = await this.validPosition(prevNode, pollID, this.eth.getAccount(), amount)
    if (!isValidPosition) {
      throw new Error('position is invalid')
    }

    let tx = await tcrPLCRVoting.methods.commitVote(
      pollID,
      secretHash,
      amount,
      prevNode
    ).send()

    return tx
  }

  /**
   * Reveals vote with choice and secret salt used in generating commitHash to attribute committed tokens
   * @param  {integer}  pollID     poll Id of the vote to reveal.
   * @param  {uint}  voteOption 1 for yes, 0 or other for no.
   * @param  {string}  salt       salt used when commiting the vote.
   * @return {Promise}            revealVote tx
   * @example let challengeID = paratii.eth.tcr.getChallengeId('some-video-id')
   * let tx = await paratii.eth.tcr.revealVote(challengeID,1,paratii.eth.tcr.getSalt('some-video-id'))
   */
  async revealVote (pollID, voteOption, salt) {
    let tcrPLCRVoting = await this.eth.getContract('TcrPLCRVoting')

    // check if reveal Period is active
    let isRevealPeriodActive = await this.revealPeriodActive(pollID)
    if (!isRevealPeriodActive) {
      throw new Error(`Reveal Period for poll ${pollID.toString()} is not active`)
    }

    let didCommit = await this.didCommit(this.eth.getAccount(), pollID)
    if (!didCommit) {
      throw new Error(`user ${this.eth.getAccount()} didn't commit to vote ${pollID.toString()}`)
    }

    let didReveal = await this.didReveal(this.eth.getAccount(), pollID)
    if (didReveal) {
      throw new Error(`user ${this.eth.getAccount()} already revealed vote ${pollID.toString()}`)
    }

    let secretHash = this.eth.web3.utils.soliditySha3(voteOption, salt)
    let commitHash = await this.getCommitHash(this.eth.getAccount(), pollID)
    if (commitHash !== secretHash) {
      throw new Error(`commitHash ${commitHash} !== secretHash ${secretHash}`)
    }

    let tx = await tcrPLCRVoting.methods.revealVote(
      pollID,
      voteOption,
      salt
    ).send()

    return tx
  }

  /**
   * Loads amount ERC20 tokens into the voting contract for one-to-one voting rights
   * @param  {number}  amount amount to deposit into voting contract.
   * @return {Promise}        `requestVotingRights` tx
   * @example let tx = await paratii.eth.tcr.requestVotingRights(5)
   */
  async requestVotingRights (amount) {
    let tcrPLCRVoting = await this.eth.getContract('TcrPLCRVoting')
    let balance = await this.eth.balanceOf(this.eth.getAccount(), 'PTI')
    let amountBN = this.eth.web3.utils.toBN(amount)

    if (balance.lt(amountBN)) {
      throw new Error(`${this.eth.getAccount()} balance (${balance.toString()}) is insufficient (amount = ${amount.toString()})`)
    }

    let allowance = await this.eth.allowance(this.eth.getAccount(), tcrPLCRVoting.options.address)

    if (allowance.lt(amountBN)) {
      throw new Error(`PLCRVoting Contract allowance (${allowance.toString()}) is < amount (${amount.toString()})`)
    }

    let tx = await tcrPLCRVoting.methods.requestVotingRights(amount).send()
    return tx
  }

  /**
   * Withdraw amount ERC20 tokens from the voting contract, revoking these voting rights
   * @param  {number}  amount amount to withdraw
   * @return {Promise}        withdrawVotingRights tx
   * @example let tx = await paratii.eth.tcr.withdrawVotingRights(5)
   */
  async withdrawVotingRights (amount) {
    let tcrPLCRVoting = await this.eth.getContract('TcrPLCRVoting')
    let voterBalancen = await tcrPLCRVoting.methods.voteTokenBalance(this.eth.getAccount()).call()
    let lockedTokens = await this.getLockedTokens(this.eth.getAccount())
    let voterBalance = this.eth.web3.utils.toBN(voterBalancen)
    let amountBN = this.eth.web3.utils.toBN(amount)

    let balanceAfter = voterBalance.sub(lockedTokens)
    if (balanceAfter.lt(amountBN)) {
      throw new Error(`unlocked balance ${balanceAfter.toString()} is < amount ${amount.toString()}`)
    }

    let tx = await tcrPLCRVoting.methods.withdrawVotingRights(amount).send()
    return tx
  }

  /**
   * Unlocks tokens locked in unrevealed vote where poll has ended
   * @param  {uint}  pollID the pollID , aka challengeID
   * @return {Promise}        rescueTokens tx
   * @example let challengeID = await paratii.eth.tcr.getChallengeId('some-video-id')
   * let tx = await paratii.eth.tcr.rescueTokens(challengeID)
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

  // -----------------------
  // TCR UTILS
  // -----------------------

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
   * @example let canBeWhitelisted = await paratii.eth.tcr.canBeWhitelisted('some-id')
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
   * checks whether the video has an unresolved challenge or not
   * @param  {string}  videoId id of the video
   * @return {Promise}        true if the video has an unresolved challenge, false otherwise
   * @example let challenge = await paratii.eth.tcr.challengeExists(1)
   */
  async challengeExists (videoId) {
    let challenge
    let challengeID = await this.getChallengeId(videoId)

    if (parseInt(challengeID) !== 0) { challenge = await this.getChallenge(challengeID) }

    return (challengeID > 0 && !challenge.resolved)
  }

/**
* Determines whether voting has concluded in a challenge for a given
* videoId. Throws if no challenge exists.
* @param  {string}  videoId univocal video id
* @return {Promise}         true if voting has concluded,false otherwise
* @example let challengeCanBeResolved = await paratii.eth.tcr.challengeCanBeResolved('some-video-id')
*/
  async challengeCanBeResolved (videoId) {
    let contract = await this.getTcrContract()

    if (!this.challengeExists(videoId)) { throw Error(`No challenge is in progress for video with id = ${videoId}`) }

    let result = await contract.methods.challengeCanBeResolved(this.getHash(videoId)).call()
    return result
  }
/**
 * get the listing of that videoId
 * @param  {string}  videoId id of the video
 * @return {Promise}        that resolves in the listings
 * @example let listing = await paratii.eth.tcr.getListing('video-id')
 */
  async getListing (videoId) {
    let contract = await this.getTcrContract()

    let hash = this.getHash(videoId)
    let listing = await contract.methods.listings(hash).call()

    if (listing.owner === '0x0000000000000000000000000000000000000000') { throw Error(`Listing with videoId ${videoId} doesn't exist`) }
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

    if (challenge.challenger === '0x0000000000000000000000000000000000000000') { throw Error(`Challenge with challengeId ${challengeId} doesn't exist`) }
    return challenge
  }
  /**
   * check if an address has already claimed for a challenge
   * @param  {integer}  challengeID  id of the challenge
   * @param  {address}  voterAddress address of the vote. if not inserted, the default address is used
   * @return {Promise}              true if already claimed, false otherwise
   * @example let challengeID = await paratii.eth.tcr.getChallengeId('some-id')
   * let areTokenClaimed = await paratii.eth.tcr.tokenClaims(challengeID)
   */
  async tokenClaims (challengeID, voterAddress) {
    if (!voterAddress) {
      voterAddress = this.eth.getAccount()
    }
    let tcr = await this.getTcrContract()
    let tokenClaim = await tcr.methods.tokenClaims(challengeID, voterAddress).call()
    return tokenClaim
  }
/**
 * get the challenge Id of that video
 * @param  {string}  videoId univocal id of the video
 * @return {Promise}         id of the challenge of that video
 * @example let challengeID = await paratii.eth.tcr.getChallengeId('some-video-id')
 */
  async getChallengeId (videoId) {
    let listing = await this.getListing(videoId)
    return listing.challengeID
  }

/**
 * get the hash of the video Id to be inserted in the TCR contract
 * @param  {string} videoId univocal id of the video
 * @return {string}         sha3 of the id
 * @example paratii.eth.tcr.getHash('some-video-id')
 */
  getHash (videoId) {
    return this.eth.web3.utils.soliditySha3(videoId)
  }

  // -----------------------
  // VOTING UTILS
  // -----------------------

  /**
   * check if the deadline is already passed
   * @param  {integer}  deadline deadline to check (timestamp)
   * @return {Promise}          true if already passed, false otherwise
   * @example let isExpired = await paratii.eth.tcr.isExpired(10000)
   */
  async isExpired (deadline) {
    let tcrPLCRVoting = await this.eth.getContract('TcrPLCRVoting')
    let isExpired = await tcrPLCRVoting.methods.isExpired(deadline).call()
    return isExpired
  }

  /**
   * get the number of locked tokens for a specified address
   * @param  {address}  voterAddress address of the voter. If not inserted, the default account is used
   * @return {Promise}              number of locked tokens in BN format
   * @example let numLockedTokens = await paratii.eth.tcr.getLockedTokens()
   */
  async getLockedTokens (voterAddress) {
    if (!voterAddress) {
      voterAddress = this.eth.getAccount()
    }
    let tcrPLCRVoting = await this.eth.getContract('TcrPLCRVoting')
    let lockedTokens = await tcrPLCRVoting.methods.getLockedTokens(voterAddress).call()
    return this.eth.web3.utils.toBN(lockedTokens)
  }

  /**
   * check if the commit period is still active for a specified challenge
   * @param  {integer}  pollID id of the challenge
   * @return {Promise}        true if still active, false otherwise
   * @example let challengeID = await paratii.eth.tcr.getChallengeId('some-video-id')
   * let isCommitPeriodActive = await paratii.eth.tcr.commitPeriodActive(challengeID)
   */
  async commitPeriodActive (pollID) {
    let tcrPLCRVoting = await this.eth.getContract('TcrPLCRVoting')
    let isCommitPeriodActive = await tcrPLCRVoting.methods.commitPeriodActive(pollID).call()
    return isCommitPeriodActive
  }
  /**
   * check if the reveal period is still active for a specified challenge
   * @param  {integer}  pollID id of the challenge
   * @return {Promise}        true if still active, false otherwise
   * @example let challengeID = await paratii.eth.tcr.getChallengeId('some-video-id')
   * let isCommitPeriodActive = await paratii.eth.tcr.revealPeriodActive(challengeID)
   */
  async revealPeriodActive (pollID) {
    let tcrPLCRVoting = await this.eth.getContract('TcrPLCRVoting')

    let isRevealPeriodActive = await tcrPLCRVoting.methods.revealPeriodActive(pollID).call()
    return isRevealPeriodActive
  }
  /**
   * check if a voter has committed a vote on a specified challenge
   * @param  {address}  voterAddress address of the voter
   * @param  {integer}  pollID       id of the challenge
   * @return {Promise}              true if he has already committed, false otherwise
   * @example let challengeID = await paratii.eth.tcr.getChallengeId('some-video-id')
   * let didCommit = await paratii.eth.tcr.didCommit(paratii.eth.getAccount(),challengeID)
   */
  async didCommit (voterAddress, pollID) {
    let tcrPLCRVoting = await this.eth.getContract('TcrPLCRVoting')

    let didCommit = await tcrPLCRVoting.methods.didCommit(voterAddress, pollID).call()
    return didCommit
  }
  /**
   * check if a voter has revealed a vote on a specified challenge
   * @param  {address}  voterAddress address of the voter
   * @param  {integer}  pollID       id of the challenge
   * @return {Promise}              true if he has already revealed, false otherwise
   * @example let challengeID = await paratii.eth.tcr.getChallengeId('some-video-id')
   * let didCommit = await paratii.eth.tcr.didReveal(paratii.eth.getAccount(),challengeID)
   */
  async didReveal (voterAddress, pollID) {
    let tcrPLCRVoting = await this.eth.getContract('TcrPLCRVoting')

    let didReveal = await tcrPLCRVoting.methods.didReveal(voterAddress, pollID).call()
    return didReveal
  }

    /**
     * Calculates the provided voter's token reward for the given poll.
     * @param  {string}  voterAddress address of the voter
     * @param  {uint}  challengeID  challengeID ( in hex )
     * @param  {string}  salt         the salt used for that vote.
     * @return {Number}              returns the voterReward in BN format.
     * @example let challengeID = await paratii.eth.tcr.getChallengeId('some-video-id')
     * let reward = await paratii.eth.tcr.voterReward(paratii.eth.getAccount(),challengeID,paratii.eth.tcr.getSalt('some-video-id'))
     */
  async voterReward (voterAddress, challengeID, salt) {
    let tcrRegistry = await this.getTcrContract()
    let voterReward = await tcrRegistry.methods.voterReward(voterAddress, challengeID, salt).call()
    return this.eth.web3.utils.toBN(voterReward)
  }

  /**
   * check if a video is still in apply stage
   * @param  {string}  videoId univocal video identifier
   * @return {Promise}         true if it's in apply stage, false otherwise
   * @example let isInApplyStage = await paratii.eth.tcr.isInApplyStage('some-video-id')
   */
  async isInApplyStage (videoId) {
    let listing = await this.getListing(videoId)
    let latestBlock = await this.eth.web3.eth.getBlock('latest')

    return (listing.applicationExpiry > latestBlock.timestamp)
  }
  /**
   * Gets top element of sorted poll-linked-list
   * @param  {address}  voter the address of the voter
   * @return {Promise}       [description]
   * @private
   */
  async getLastNode (voter) {
    if (!voter) {
      voter = this.eth.getAccount()
    }
    let tcrPLCRVoting = await this.eth.getContract('TcrPLCRVoting')
    let lastNode = await tcrPLCRVoting.methods.getLastNode(voter).call()
    return lastNode
  }
  /**
   * get the commit hash of a vote from the tcr contract
   * @param  {address}  voterAddress address of the voter
   * @param  {integer}  pollID       id of the challenge
   * @return {Promise}              hash of the vote
   * @example let challengeID = await paratii.eth.tcr.getChallengeId('some-video-id')
   * let commitHash = await paratii.eth.tcr.getCommitHash(paratii.eth.getAccount(),challengeID)
   */
  async getCommitHash (voterAddress, pollID) {
    let tcrPLCRVoting = await this.eth.getContract('TcrPLCRVoting')

    let commitHash = await tcrPLCRVoting.methods.getCommitHash(voterAddress, pollID).call()
    return commitHash
  }
  /**
   * check if a challenge has succeeded
   * @param  {integer}  pollID id of the challenge
   * @return {Promise}        true if the challenge succeeded, false otherwise
   * @example let challengeID = await paratii.eth.tcr.getChallengeId('some-video-id')
   * let isPassed = await paratii.eth.tcr.isPassed(challengeID)
   */
  async isPassed (pollID) {
    let tcrPLCRVoting = await this.eth.getContract('TcrPLCRVoting')

    let didPass = await tcrPLCRVoting.methods.isPassed(pollID).call()
    return didPass
  }

  /**
   * get the number of tokens voted for winning option
   * @param  {address}  voterAddress address of the voter
   * @param  {integer}  pollID       id of the challenge
   * @param  {hex}  salt         salt of the vote
   * @return {Promise}              Number of tokens voted for winning option in BN format
   * @example let challengeID = await paratii.eth.tcr.getChallengeId('some-video-id')
   * let isPassed = await paratii.eth.tcr.isPassed(paratii.eth.getAccount(),challengeID,paratii.eth.getSalt('some-video-id'))
   */
  async getNumPassingTokens (voterAddress, pollID, salt) {
    let tcrPLCRVoting = await this.eth.getContract('TcrPLCRVoting')

    let winnings = await tcrPLCRVoting.methods.getNumPassingTokens(
      voterAddress,
      pollID,
      salt
    ).call()

    return this.eth.web3.utils.toBN(winnings)
  }

  /**
   * Compares previous and next poll's committed tokens for sorting purposes
   * @param  {integer}  prevPollID uint of the previous PollID
   * @param  {integer}  nextPollID uint of the next PollID
   * @param  {address}  voter      eth address of the voter
   * @param  {number}  amount     the amount to commit to the current vote.
   * @return {Promise}            returns true if both prev and next positions are valid.
   * @private
   */
  async validPosition (prevPollID, nextPollID, voter, amount) {
    // check the validity of the prevPollID
    let prevNumTokens = await this.getNumTokens(voter, prevPollID)
    if (amount.lt(prevNumTokens)) {
      throw new Error(`prev position is invalid, prevPollID: ${prevPollID.toString()},
      numTokens: ${prevNumTokens.toString()},
      amount: ${amount.toString()}`)
    }

    let nextNumTokens = await this.getNumTokens(voter, nextPollID)
    if (amount.lt(nextNumTokens)) {
      throw new Error(`next position is invalid, nextPollID: ${nextPollID.toString()},
      numTokens: ${nextNumTokens.toString()},
      amount: ${amount.toString()}`)
    }

    return true
  }

  /**
   * Wrapper for getAttribute with attrName="numTokens"
   * @param  {address}  voterAddress eth voter address
   * @param  {integer}  pollID       uint of the pollID
   * @return {Promise}              BN of commited tokens.
   * @example let challengeID = await paratii.eth.tcr.getChallengeId('some-video-id')
   * let numTokens = await paratii.eth.tcr.getNumTokens(paratii.eth.tcr.getAccount(),challengeID)
   */
  async getNumTokens (voterAddress, pollID) {
    let tcrPLCRVoting = await this.eth.getContract('TcrPLCRVoting')
    let numTokens = await tcrPLCRVoting.methods.getNumTokens(
      voterAddress,
      pollID
    ).call()

    return this.eth.web3.utils.toBN(numTokens)
  }
  /**
   * checks if a user has >= amount voting rights
   * @param  {number}  amount amount of token to check
   * @return {Promise}        true if >= amount, false otherwise
   * @example let hasVotingRights = await paratii.eth.trc.hasVotingRights(5)
   */
  async hasVotingRights (amount) {
    let PLCRVoting = await this.getPLCRVotingContract()

    let numTokens = await PLCRVoting.methods.voteTokenBalance(this.eth.getAccount()).call()
    let numTokensBN = this.eth.web3.utils.toBN(numTokens)
    let amountBN = this.eth.web3.utils.toBN(amount)

    return numTokensBN.gte(amountBN)
  }

  // -----------------------
  // LOCALSTORAGE UTILS
  // -----------------------

  /**
   * utility function to get the right localStorage
   * @return {Object} localStorage
   * @example let localStorage = paratii.eth.tcr.getLocalStorage()
   */
  getLocalStorage () {
    if (localStorage) {
      return localStorage
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage = window.localStorage
    } else {
      localStorage = {
        _data: {},
        setItem: function (id, val) {
          this._data[id] = String(val)
          return this._data[id]
        },
        getItem: function (id) {
          return this._data.hasOwnProperty(id) ? this._data[id] : undefined
        },
        removeItem: function (id) { return delete this._data[id] },
        clear: function () {
          this._data = {}
          return this._data
        }
      }
    }

    return localStorage
  }
  /**
   * clear the nodeLocalstorage
   * @example paratii.eth.tcr.clearNodeLocalStorage()
   */
  clearNodeLocalStorage () {
    let localStorage = this.getLocalStorage()

    localStorage.clear()
  }

  /**
   * get the hash to be inserted in the tcr and save it in localStorage
   * @param  {string} videoId univocal id of the video
   * @return {string}         hash of the id
   * @example let hash = paratii.eth.tcr.getAndStoreHash('some-video-id')
   */
  getAndStoreHash (videoId) {
    let hash = this.getHash(videoId)
    let localStorage = this.getLocalStorage()

    localStorage.setItem(HASH_TO_KEY_PREFIX + hash.toString(), videoId)

    return hash
  }

  /**
   * generates random salt
   * @param  {integer} size size of the generated salt (default 32)
   * @return {hex}      random salt (hexadecimal)
   * @example let salt = paratii.eth.tcr.generateSalt()
   */
  generateSalt (size) {
    if (!size) {
      size = 32
    }

    return this.eth.web3.utils.randomHex(size)
  }

  /**
   * store salt
   * @param  {string} videoId univocal video id
   * @param  {hex} salt    hexadecimal salt
   * @example paratii.eth.tcr.storeSalt('some-video-id',paratii.eth.tcr.generateSalt())
   */
  storeSalt (videoId, salt) {
    let localStorage = this.getLocalStorage()

    localStorage.setItem(SALT_KEY_PREFIX + videoId, salt)
  }

  /**
   * get the salt related to that videoId
   * @param  {string} videoId univocal videoId
   * @return {hex}          hexadecimal salt
   * @example let salt = paratii.eth.tcr.getSalt('some-video-id')
   */
  getSalt (videoId) {
    let localStorage = this.getLocalStorage()

    return localStorage.getItem(SALT_KEY_PREFIX + videoId)
  }

  /**
   * get the videoId related to that hash
   * @param  {string} hash hash of the videoId
   * @return {string}      the videoId
   * @example let videoId = paratii.eth.tcr.hashToId(hashedVideoId)
   */
  hashToId (hash) {
    let localStorage = this.getLocalStorage()

    return localStorage.getItem(HASH_TO_KEY_PREFIX + hash.toString())
  }

// -----------------------
// TCR PARAMETERS GETTERS
// -----------------------

/**
 * get the minimum amount required to stake a video.
 * @return {integer} amount required, in PTI base units
 * @todo return amount as BN Object
 * @example let minDeposit = await paratii.eth.tcr.getMinDeposit()
 */
  async getMinDeposit () {
    return this.eth.web3.utils.toBN(await this.get('minDeposit'))
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
 * @example let minpDeposit = await paratii.eth.tcr.getpMinDeposit()
 */
  async getpMinDeposit () {
    return this.eth.web3.utils.toBN(await this.get('pMinDeposit'))
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
 * @param  {string}  param name of the param
 * @return {Promise}       that resolves in the value of the parameter
 * @example  let minDeposit = await paratii.eth.tcr.get('minDeposit')
 */
  async get (param) {
    let contract = await this.getParametrizerContract()

    let value = await contract.methods.get(param).call()
    return value
  }

  /**
   * get the sum of all stkeds
   * @param address  the ethereum address that is staked
   * @return {integer}  total of all statkes
   */
  async getTotalStaked (address) {
    // this is now implemented by getting all vids for this user, and counting all the stakes
    const vids = await this.eth.config.paratii.vids.search({owner: address})
    if (vids.total === 0) {
      return new BigNumber(0)
    } else {
      const stakes = vids.results.map((a) => ((a.staked && a.staked.deposit) || 0))
      const total = stakes.reduce((a, b) => a + b)
      return BigNumber(total)
    }
  }
}
