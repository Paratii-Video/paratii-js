import nock from 'nock'
import chai from 'chai'
import { BigNumber } from 'bignumber.js'

chai.use(require('chai-as-promised'))
chai.use(require('chai-bignumber')())

let address = '0xCbe4f07b343171ac37055B25a5266f48f6945b7d'
let privateKey = '0x399b141d0cc2b863b2f514ffe53edc6afc9416d5899da4d9bd2350074c38f1c6'
let address1 = '0xa99dBd162ad5E1601E8d8B20703e5A3bA5c00Be7'

// a valid address
let address99 = '0xa99dBd162ad5E1601E8d8B20703e5A3bA5c00Be7'

// an address and privatey key not known in testrpc
let address17 = '0xb8CE9ab6943e0eCED004cDe8e3bBed6568B2Fa01'
let privateKey17 = '0x348ce564d427a3311b6536bbcff9390d69395b06ed6c486954e971d960fe8709'

// an address generated from a seed phrase
let mnemonic23 = 'jelly better achieve collect unaware mountain thought cargo oxygen act hood bridge'
// this is the first HD address generated
let address23 = '0x627ac4c2d731E12fB386BD649114a08ebCc0C33f'

// a voucher code and an amount
let voucherCode11 = 'ZJLUaMqLR1'
let voucherAmount11 = 0.3141 * 10 ** 18
let voucherAmountInitial11 = 2 * 10 ** 18
let hashedVoucherCode11 = '0x182b41b125c1c14efaf188d95b6a7e2074d8b746237fc47b48beb63551d742f9'

const testAccount = {
  address,
  privateKey
}

const testConfig = {
  eth: {
    provider: 'http://localhost:8545',
    tcrConfig: require('sol-tcr/conf/devConfig.json')
  },
  account: {
    address: address,
    privateKey: privateKey
  }
}

const testConfigWS = {
  eth: { provider: 'ws://localhost:8546' },
  account: {
    address: address,
    privateKey: privateKey
  }
}

const vidsFixture = [
  {
    id: 'some-id',
    author: 'Steven Spielberg',
    filename: 'test/data/some-file.txt',
    // filesize: '',
    free: null,
    title: 'some Title',
    description: 'A long description',
    // published: false,
    price: 0,
    ipfsData: 'QmT7tAEP9C6MqaP2KBszyYijxda14arzqY3qdbCi55CYyU',
    ipfsHash: '',
    ipfsHashOrig: '',
    duration: '2h 32m',
    storageStatus: {},
    transcodingStatus: {},
    uploadStatus: {},
    owner: address1,
    ownershipProof: 'this my video'
        // published: false
  },
  {
    id: 'id-2',
    owner: address1,
    title: 'some title 2',
    description: 'A long description',
    price: 0,
    ipfsData: 'QmUUMpwyWBbJKeNCbwDySXJCay5TBBuur3c59m1ajQufmn',
    ipfsHash: 'some-hash',
    ipfsHashOrig: ''
  },
  {
    id: 'id-3',
    owner: address1,
    title: 'another-title',
    description: 'A long description',
    price: 0,
    ipfsData: 'QmUUMpwyWBbJKeNCbwDySXJCay5TBBuur3c59m1ajQufmn',
    ipfsHash: 'some-hash',
    ipfsHashOrig: ''
  }
]

const searchVidsFixture =
  {
    results: [
      {
        id: 'id-2',
        owner: address,
        title: 'some title 2',
        description: 'A long description',
        price: 0,
        ipfsData: 'QmUUMpwyWBbJKeNCbwDySXJCay5TBBuur3c59m1ajQufmn',
        ipfsHash: 'some-hash',
        ipfsHashOrig: ''
      },
      {
        id: 'id-3',
        owner: address,
        title: 'another-title',
        description: 'A long description',
        price: 0,
        ipfsData: 'QmUUMpwyWBbJKeNCbwDySXJCay5TBBuur3c59m1ajQufmn',
        ipfsHash: 'some-hash',
        ipfsHashOrig: ''
      }
    ],
    query: {owner: address},
    total: 2
  }

const mockDb = function () {
  const vids = vidsFixture
  const search = searchVidsFixture
  nock.cleanAll()
  nock.enableNetConnect()
  nock('https://db.paratii.video')
    .persist()
    .get('/api/v1/videos/some-id')
    .reply(200, vids[0])
    .get('/api/v1/videos/id-2')
    .reply(200, vids[1])
    .get('/api/v1/videos/id-3')
    .reply(200, vids[2])
    .get('/api/v1/videos/?owner=0xCbe4f07b343171ac37055B25a5266f48f6945b7d')
    .reply(200, search)
}

/**
 * utility function for testing.
 * 1. Creates the account and adds it to the wallet
 * 2. fund the account
 * 3. gives the approval to the tcr
 * 4. starts the challenge
 * @param  {string} privateKey   private key of the challenger
 * @param  {string} videoId      videoId to be challenged
 * @param  {integer} amountToFund amount to fund the challenger
 * @param  {Object} paratii      paratii instance
 * @return {Promise} that resolves in the challengeId
 * @private
 */
async function challengeFromDifferentAccount (privateKey, videoId, amountToFund, paratii) {
  // console.log('challengeFromDifferentAccount ', privateKey.slice(0, 6), videoId, amountToFund)
  // let contracts = await paratii.eth.getContracts()
  // console.log('contracts: ', Object.keys(contracts))
  let tcrRegistry = await paratii.eth.tcr.getTcrContract()
  chai.assert.isOk(tcrRegistry)

  // create challenger account --------------------------------------------------
  let challengerAccount = await paratii.eth.web3.eth.accounts.wallet.add({
    privateKey: privateKey
  })
  chai.assert.isOk(challengerAccount)
  let index = paratii.eth.web3.eth.accounts.wallet.length - 1
  chai.assert.equal(challengerAccount.address, paratii.eth.web3.eth.accounts.wallet[index].address)
  // console.log('private key', privateKey.slice(0, 6), 'added, index: ', index)
  let token = await paratii.eth.getContract('ParatiiToken')
  chai.assert.isOk(token)

  let startingFund = new BigNumber(await token.methods.balanceOf(challengerAccount.address).call())
  // console.log('startingFund', privateKey.slice(0, 6), startingFund.toString())

  // fund address1 of the challenger account -------------------------------------
  let amountToTransferInWei = paratii.eth.web3.utils.toWei(amountToFund.toString())
  let smallerAmountToTransferInWei = paratii.eth.web3.utils.toWei('39')
  // console.log('smallerAmountToTransferInWei: ', smallerAmountToTransferInWei.toString())
  let transferTx = await token.methods.transfer(
    challengerAccount.address,
    amountToTransferInWei
  ).send({from: paratii.eth.getAccount()})
  // console.log('transferTx: ', transferTx)
  chai.assert.isOk(transferTx)
  let balanceOfAddress1 = new BigNumber(await token.methods.balanceOf(challengerAccount.address).call())
  let amount = new BigNumber(paratii.eth.web3.utils.toWei(amountToFund.toString()))
  // console.log('amountToFund', privateKey.slice(0, 6), amountToTransferInWei.toString(), 'balance: ', balanceOfAddress1.toString())
  chai.assert.equal(Number(balanceOfAddress1), Number(amount.plus(startingFund)))

  // approve the tcr to spend address1 tokens ------------------------------------
  let approval = await token.methods.approve(
    tcrRegistry.options.address,
    smallerAmountToTransferInWei.toString()
  ).send({from: paratii.eth.web3.eth.accounts.wallet[index].address}) // send from challengerAccount
  // console.log('approval ', privateKey.slice(0, 6), approval)
  chai.assert.isOk(approval)
  chai.assert.isOk(approval.events.Approval)

  // start the challenge from the challenger account -----------------------------
  let challengeTx = await tcrRegistry.methods.challenge(
    paratii.eth.tcr.getHash(videoId),
    ''
  ).send({from: challengerAccount.address})
  // console.log('challengeTx: ', challengeTx)

  chai.assert.isOk(challengeTx)
  chai.assert.isOk(challengeTx.events._Challenge)
  let challengeID = challengeTx.events._Challenge.returnValues.challengeID
  chai.assert.isOk(challengeID)
  // console.log('CHALLENGEID : ', challengeID)

  // check that the challenge is actually from the challengerAccount and not from the default one
  let challenge = await tcrRegistry.methods.challenges(challengeID).call()
  chai.assert.equal(challengerAccount.address, challenge.challenger)
  return challengeID
}

/**
 * utility function for testing. The vote is always committed with 1 PTI
 * 1. Creates the account and adds it to the wallet
 * 2. fund the account
 * 3. gives the approval to the PLCRVoting
 * 4. creates a vote (NB it votes always with 1 wei)
 * 5. requests vote rights
 * 6. gets the previous pollID
 * 7. commits the vote
 * @param  {string} privateKey   private key of the voter
 * @param  {string} videoId      challengeID to vote on
 * @param {integer} vote         1/0
 * @param  {integer} amountToFund amount to fund the voter
 * @param  {Object} paratii      paratii instance
 * @private
 */
async function voteFromDifferentAccount (privateKey, challengeID, vote, salt, amountToFund, paratii) {
  let tcrPLCRVoting = await paratii.eth.tcr.getPLCRVotingContract()
  chai.assert.isOk(tcrPLCRVoting)

  // add voter account.
  let voterAccount = await paratii.eth.web3.eth.accounts.wallet.add({
    privateKey: privateKey
  })
  // index of the last added accounts
  let index = paratii.eth.web3.eth.accounts.wallet.length - 1
  chai.assert.isOk(voterAccount)
  chai.assert.isOk(paratii.eth.web3.eth.accounts.wallet[index])
  chai.assert.equal(voterAccount.address, paratii.eth.web3.eth.accounts.wallet[index].address)

  let token = await paratii.eth.getContract('ParatiiToken')
  let startingFund = new BigNumber(await token.methods.balanceOf(voterAccount.address).call())

  // fund it.
  chai.assert.isOk(token)
  let amountToTransferInWei = paratii.eth.web3.utils.toWei(amountToFund.toString())
  let transferTx = await token.methods.transfer(
    voterAccount.address,
    amountToTransferInWei
  ).send()
  chai.assert.isOk(transferTx)
  let balanceOfVoter = new BigNumber(await token.methods.balanceOf(voterAccount.address).call())
  let amount = new BigNumber(paratii.eth.web3.utils.toWei(amountToFund.toString()))
  chai.assert.equal(Number(balanceOfVoter), Number(amount.plus(startingFund)))

  // approve PLCRVoting
  let amountToVoteInWei = paratii.eth.web3.utils.toWei('1')
  let approveTx = await token.methods.approve(
    tcrPLCRVoting.options.address,
    amountToVoteInWei
  ).send({from: voterAccount.address})
  chai.assert.isOk(approveTx)
  chai.assert.isOk(approveTx.events.Approval)

  // voting process.
  // 1. create voteSaltHash
  let voteSaltHash = paratii.eth.web3.utils.soliditySha3(vote, salt)

  // 2. request voting rights as voter.
  let requestVotingRightsTx = await tcrPLCRVoting.methods.requestVotingRights(
    amountToVoteInWei
  ).send({from: voterAccount.address})

  chai.assert.isOk(requestVotingRightsTx)
  chai.assert.isOk(requestVotingRightsTx.events._VotingRightsGranted)

  // 3. getPrevious PollID
  let prevPollID = await tcrPLCRVoting.methods.getInsertPointForNumTokens(
    voterAccount.address,
    amountToVoteInWei,
    challengeID
  ).call()
  chai.assert.isOk(prevPollID)

  // 4. finally commitVote.
  let commitVoteTx = await tcrPLCRVoting.methods.commitVote(
    challengeID,
    voteSaltHash,
    amountToVoteInWei,
    prevPollID
  ).send({from: voterAccount.address})

  chai.assert.isOk(commitVoteTx)
  chai.assert.isOk(commitVoteTx.events._VoteCommitted)
}

async function revealVoteFromDifferentAccount (privateKey, pollID, vote, salt, paratii) {
  let tcrPLCRVoting = await paratii.eth.tcr.getPLCRVotingContract()

  // add voter account.
  let voterAccount = await paratii.eth.web3.eth.accounts.wallet.add({
    privateKey: privateKey
  })
  // index of the last added accounts
  let index = paratii.eth.web3.eth.accounts.wallet.length - 1
  chai.assert.isOk(voterAccount)
  chai.assert.isOk(paratii.eth.web3.eth.accounts.wallet[index])
  chai.assert.equal(voterAccount.address, paratii.eth.web3.eth.accounts.wallet[index].address)

  let isRevealPeriodActive = await paratii.eth.tcr.revealPeriodActive(pollID)
  chai.assert.isTrue(isRevealPeriodActive)

  let didCommit = await paratii.eth.tcr.didCommit(voterAccount.address, pollID)
  chai.assert.isTrue(didCommit)

  let didReveal = await paratii.eth.tcr.didReveal(voterAccount.address, pollID)
  chai.assert.isFalse(didReveal)

  let secretHash = paratii.eth.web3.utils.soliditySha3(vote, salt)

  let commitHash = await paratii.eth.tcr.getCommitHash(voterAccount.address, pollID)

  chai.assert.equal(secretHash, commitHash)

  let revealTx = await tcrPLCRVoting.methods.revealVote(
    pollID,
    vote,
    salt
  ).send({from: voterAccount.address})

  chai.assert.isOk(revealTx)
  chai.assert.isOk(revealTx.events._VoteRevealed)

  return revealTx
}

async function createDummyVideo (paratii) {
  let tx = await paratii.eth.vids.create({
    id: 'dummy_vid',
    owner: paratii.eth.getAccount(),
    ipfsData: 'QmDummy'
  })
  return tx
}

async function mineABlock (paratii) {
  // let tx = await paratii.eth.transfer('0x0', '0x01', 'ETH', 'dummy_tx')
  // return tx
  let tx
  try {
    tx = await paratii.eth.vids.get('dummy_vid')
  } catch (e) {
    if (e) {
      console.log('no video was created')
      tx = await createDummyVideo(paratii)
    }
  }

  tx = await paratii.eth.vids.update('dummy_vid', {price: Math.floor(Math.random() * 10)})
  tx = await paratii.eth.web3.eth.getBlock('latest')
  return tx
}

export {
  address,
  address1,
  address17,
  address23,
  address99,
  privateKey,
  privateKey17,
  mnemonic23,
  mockDb,
  vidsFixture,
  searchVidsFixture,
  voucherAmount11,
  voucherAmountInitial11,
  voucherCode11,
  hashedVoucherCode11,
  testConfig,
  testConfigWS,
  testAccount,
  challengeFromDifferentAccount,
  voteFromDifferentAccount,
  revealVoteFromDifferentAccount,
  mineABlock
}
