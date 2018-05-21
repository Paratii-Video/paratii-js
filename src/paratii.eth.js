import { add0x } from './utils.js'
import { ParatiiEthVids } from './paratii.eth.vids.js'
import { ParatiiEthUsers } from './paratii.eth.users.js'
import { ParatiiEthEvents } from './paratii.eth.events.js'
import { ParatiiEthVouchers } from './paratii.eth.vouchers.js'
import { ParatiiEthPTIDistributor } from './paratii.eth.distributor.js'
import { ParatiiEthTcr } from './paratii.eth.tcr.js'
import { ParatiiEthTcrPlaceholder } from './paratii.eth.tcrPlaceholder.js'
import { patchWallet } from './paratii.eth.wallet.js'
import { ethSchema, accountSchema } from './schemas.js'
import joi from 'joi'

const Web3 = require('web3')
// const joi = require('joi')
/**
 * contains functions to interact with the Ethereum blockchain and the Paratii contracts.<br>
 * See {@link Paratii}
 * @param {ParatiiEthSchema} config configuration object to initialize Paratii object
 * @property {ParatiiVids} vids operations on videos
 * @property {ParatiiUsers} users operations on users
 * @property {ParatiiEthEvents} events manage subscriptions to Ethereum events
 * @property {ParatiiEthVouchers} vouchers Functions for redeeming vouchers
 * @property {ParatiiEthTcr} tcr TCR functionality
 * @example let paratii = new Paratii()
 * // paratii.eth is an instance of ParatiiEth; let's check the PTI balance of an account
 * paratii.eth.balanceOf('0xCbe4f07b343171ac37055B25a5266f48f6945b7d', 'PTI')
*/
export class ParatiiEth {
  /**
  * @typedef {Array} ParatiiEthSchema
  * @property {accountSchema=} account
  * @property {ethSchema=} eth
 */
  constructor (config) {
    const schema = joi.object({
      account: accountSchema,
      eth: ethSchema
    //   web3: joi.any().default(null)
    })
    const result = joi.validate(config, schema, {allowUnknown: true})
    if (result.error) throw result.error
    config.eth = result.value.eth
    config.account = result.value.account
    if (config.eth.provider.match(/(localhost|127\.0\.0\.1)/g)) {
      config.eth.isTestNet = true
    } else {
      config.eth.isTestNet = false
    }

    if (config.web3) {
      this.web3 = config.web3
    } else {
      this.web3 = new Web3()
      if (config.eth.provider.substring(0, 2) === 'ws') {
        this._provider = new this.web3.providers.WebsocketProvider(config.eth.provider)
      } else {
        this._provider = new this.web3.providers.HttpProvider(config.eth.provider)
      }

      this.web3.setProvider(this._provider)
    }
    this.config = config

    this.wallet = this.web3.eth.accounts.wallet = patchWallet(this.web3.eth.accounts.wallet, this.config)
    this.setAccount(this.config.account)

    this.contracts = {}
    this.contracts.ParatiiToken = this.requireContract('ParatiiToken')
    this.contracts.Avatar = this.requireContract('Avatar')
    this.contracts.Registry = this.requireContract('Registry')
    this.contracts.SendEther = this.requireContract('SendEther')
    this.contracts.Users = this.requireContract('Users')
    this.contracts.Videos = this.requireContract('Videos')
    this.contracts.Store = this.requireContract('Store')
    this.contracts.Likes = this.requireContract('Likes')
    this.contracts.Views = this.requireContract('Views')
    this.contracts.Vouchers = this.requireContract('Vouchers')
    this.contracts.PTIDistributor = this.requireContract('PTIDistributor')
    this.contracts.TcrPlaceholder = this.requireContract('TcrPlaceholder')
    this.contracts.TcrRegistry = this.requireContract('sol-tcr/Registry')
    this.contracts.TcrPLCRVoting = this.requireContract('sol-tcr/PLCRVoting')
    this.contracts.TcrParameterizer = this.requireContract('sol-tcr/Parameterizer')
    this.contracts.TcrDLL = this.requireContract('sol-tcr/DLL')
    this.contracts.TcrAttributeStore = this.requireContract('sol-tcr/AttributeStore')

    this.vids = new ParatiiEthVids(this)
    this.users = new ParatiiEthUsers(this)
    this.events = new ParatiiEthEvents(this)
    this.vouchers = new ParatiiEthVouchers(this)
    this.tcr = new ParatiiEthTcr(this)
    this.distributor = new ParatiiEthPTIDistributor(this)
    this.tcrPlaceholder = new ParatiiEthTcrPlaceholder(this)
  }
  /**
   * [paratii.setAccount()](./Paratii.html#setAccount__anchor)
   */
  setAccount (opts) {
    const schema = accountSchema
    const result = joi.validate(opts, schema)
    if (result.error) throw result.error
    const wallet = this.web3.eth.accounts.wallet
    let { address, privateKey, mnemonic } = result.value
    this.config.account.address = address
    this.config.account.privateKey = privateKey
    this.web3.eth.testAccount = address
    if (privateKey) {
      let account = wallet.add(privateKey)
      if (this.config.account.address && this.config.account.address !== address) {
        throw Error('Private Key and Account address are not compatible! ')
      }
      this.config.account.address = account.address
      this.config.account.privateKey = privateKey
    } else if (mnemonic) {
      wallet.create(1, mnemonic)
      if (address && wallet[0].address !== address) {
        throw Error(`Mnemonic ${mnemonic} and account address ${address} are not compatible!`)
      }
      this.config.account.address = wallet[0].address
      this.config.account.privateKey = wallet[0].privateKey
    }
  }

  /**
   * Get the account
   * @example let acc = paratii.eth.getAccount()
   * @private
   */
  getAccount () {
    const wallet = this.web3.eth.accounts.wallet
    return wallet.length > 0 && wallet[0].address
  }

  /**
   * Get the contract instance specified
   * @param {string} name the name of the token
   * @return {Promise} Object representing the contract
   * @example await paratii.eth.getContract('ParatiiToken')
   */
  async getContract (name) {
    let contract = this.contracts[name]
    if (!contract) {
      // console.log('contractNames: ', Object.keys(this.contracts))
      throw Error(`No contract with name "${name}" is known`)
    }
    if (!contract.options.address) {
      let address = await this.getContractAddress(name)
      if (address && address !== '0x0') {
        contract.options.address = address
      }
    }
    if (!contract.methods.constructor._ethAccounts) {
      contract.methods.constructor._ethAccounts = this.web3.eth.accounts
    }
    contract.options.from = this.config.account.address

    return contract
  }
  /**
   * creates the javascript contract object from the json file
   * @param  {string} contractName name of the contract
   * @return {string}              Contract Object
   * @example paratii.eth.requireContract('ParatiiToken')
   * @private
   */
  requireContract (contractName) {
    // console.log('requiring ', contractName)
    let artifact, contract
    let from = this.config.account.address

    let contractArr = contractName.split('/')
    if (contractArr[0] === 'sol-tcr') {
      artifact = require(`sol-tcr/build/contracts/${contractArr[1]}.json`)
      // contract = truffleContract(artifact)
      // contract.setProvider(this._provider)
      // contract.defaults({
      //   from: from,
      //   gas: this.web3.utils.toHex(4e6)
      // })
    } else {
      artifact = require(`paratii-contracts/build/contracts/${contractName}.json`)
    }

    contract = new this.web3.eth.Contract(
      artifact.abi,
      {
        from: from,
        gas: this.web3.utils.toHex(4e6),
        data: artifact.bytecode
      })
      // contract.setProvider(this.web3.currentProvider, this.web3.eth.accounts)
    // if (contractArr[1] === 'DLL') {
    //   console.log('DLL required!')
    // }
    return contract
  }

  // requireTruffleContract (contractName) {
  //   let artifact, contract
  //   let from = this.config.account.address
  //
  //   let contractArr = contractName.split('/')
  //   if (contractArr[0] === 'sol-tcr') {
  //     artifact = require(`sol-tcr/build/contracts/${contractArr[1]}.json`)
  //   } else {
  //     artifact = require(`paratii-contracts/build/contracts/${contractName}.json`)
  //   }
  //   // console.log('artifact: ', this.web3.currentProvider)
  //   contract = truffleContract(artifact)
  //   contract.setProvider(this.web3.currentProvider)
  //
  //   // dirty hack for web3@1.0.0 support for localhost testrpc, see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
  //   // thanks https://github.com/trufflesuite/truffle-contract/issues/57#issuecomment-331300494
  //   if (typeof contract.currentProvider.sendAsync !== 'function') {
  //     contract.currentProvider.sendAsync = function () {
  //       return contract.currentProvider.send.apply(
  //         contract.currentProvider, arguments
  //       )
  //     }
  //   }
  //
  //   contract.defaults({
  //     from: from,
  //     gas: this.web3.utils.toHex(4e6)
  //   })
  //
  //   return contract
  // }

  linkByteCode (bytecode, links) {
    Object.keys(links).forEach(function (libraryName) {
      var libraryAddress = links[libraryName]
      var regex = new RegExp('__' + libraryName + '_+', 'g')

      bytecode = bytecode.replace(regex, libraryAddress.replace('0x', ''))
    })

    return bytecode
  }

  /**
   * deploys contract on the blockchain
   * @param  {string}  name name of the contract
   * @param  {Object}  args configuration for the contract (strings or numbers). It is allowed to pass more than one parameter
   * @return {Promise}      the deployed contract
   * @example await paratii.eth.deployContract('ParatiiToken')
   * @example let paratiiRegistryAddress = await paratii.eth.getRegistryAddress()
   * let likes = await this.deployContract('Likes', paratiiRegistryAddress)
   */
  async deployContract (name, ...args) {
    if (!this.config.account.address) {
      let msg = 'You need an Ethereum account to write information to the blockchain - you can use .setAccount(address, [privateKey]) or specify it when creating the object'
      throw Error(msg)
    }

    let contract = await this.getContract(name)

    let deployedContract = await contract.deploy({arguments: args}).send()

    // deployedContract.setProvider(this.web3.currentProvider, this.web3.eth.accounts)
    this.contracts[name] = deployedContract
    // console.log('deployed ', name)
    return deployedContract
  }

  // async deployTcr (paratiiRegistry, paratiiToken) {
  //   // Deployment steps.
  //   // 1. deploy DLL and AttributeStore
  //   // 2. deploy PLCRVoting and link the DLL and AttributeStore
  //   // 3. deploy Parameterizer with default configs for now.
  //   // 4. deploy TcrRegistry
  //   // 5. register TcrRegistry to Registry (lol)
  //   let tcrConfig = require('sol-tcr/conf/config.json')
  //   let parameterizerConfig = tcrConfig.paramDefaults
  //   // this.truffleContracts = {}
  //   // this.truffleContracts.TcrRegistry = this.requireTruffleContract('sol-tcr/Registry')
  //   // this.truffleContracts.TcrPLCRVoting = this.requireTruffleContract('sol-tcr/PLCRVoting')
  //   // this.truffleContracts.TcrParameterizer = this.requireTruffleContract('sol-tcr/Parameterizer')
  //   // this.truffleContracts.TcrDLL = this.requireTruffleContract('sol-tcr/DLL')
  //   // this.truffleContracts.TcrAttributeStore = this.requireTruffleContract('sol-tcr/AttributeStore')
  //   //
  //   // this.truffleContracts.TcrDLL.new({from: this.config.account.address}).then((instance) => {
  //   //   console.log('DLL: ', instance)
  //   //   resolve(instance)
  //   // }).catch((e) => {
  //   //   console.log('gotcha : ', e)
  //   //   reject(e)
  //   // })
  //   // console.log('TcrDLL: ', this.contracts.TcrDLL)
  //   // console.log('TcrAttributeStore: ', this.contracts.TcrAttributeStore)
  //   // console.log('TcrPLCR: ', this.contracts.TcrPLCRVoting)
  //   // console.log('Avatar: ', this.contracts.Avatar)
  //   // console.log('Registry Address: ', this.contracts.Registry.options.address)
  //   // let deployedDLL = await this.contracts.TcrDLL.deploy({arguments: []}).send()
  //   // deployedDLL.setProvider(this.web3.currentProvider, this.web3.eth.accounts)
  //   // this.contracts.TcrDLL = deployedDLL
  //   //
  //   // let deployedAttributeStore = await this.contracts.TcrAttributeStore.deploy({arguments: []}).send()
  //   // deployedAttributeStore.setProvider(this.web3.currentProvider, this.web3.eth.accounts)
  //   // this.contracts.TcrAttributeStore = deployedAttributeStore
  //
  //   // link both libs to PLCRVoting and deploy it.
  //   let linkedByteCode = this.linkByteCode(
  //     this.contracts.TcrPLCRVoting.options.data, {
  //       DLL: this.contracts.TcrDLL.options.address,
  //       AttributeStore: this.contracts.TcrAttributeStore.options.address
  //     })
  //
  //   this.contracts.TcrPLCRVoting.options.data = linkedByteCode
  //
  //   let deployedPLCRVoting = await this.contracts.TcrPLCRVoting.deploy({
  //     arguments: [paratiiToken]
  //   }).send()
  //   deployedPLCRVoting.setProvider(this.web3.currentProvider, this.web3.eth.accounts)
  //   this.contracts.TcrPLCRVoting = deployedPLCRVoting
  //
  //   // ---------------------------------------------
  //
  //   linkedByteCode = null
  //   linkedByteCode = this.linkByteCode(
  //     this.contracts.TcrParameterizer.options.data,
  //     {
  //       DLL: this.contracts.TcrDLL.options.address,
  //       AttributeStore: this.contracts.TcrAttributeStore.options.address
  //     }
  //   )
  //   this.contracts.TcrParameterizer.options.data = linkedByteCode
  //   let deployedParameterizer = await this.contracts.TcrParameterizer.deploy({
  //     arguments: [
  //       paratiiToken,
  //       this.contracts.TcrPLCRVoting.options.address,
  //       parameterizerConfig.minDeposit,
  //       parameterizerConfig.pMinDeposit,
  //       parameterizerConfig.applyStageLength,
  //       parameterizerConfig.pApplyStageLength,
  //       parameterizerConfig.commitStageLength,
  //       parameterizerConfig.pCommitStageLength,
  //       parameterizerConfig.revealStageLength,
  //       parameterizerConfig.pRevealStageLength,
  //       parameterizerConfig.dispensationPct,
  //       parameterizerConfig.pDispensationPct,
  //       parameterizerConfig.voteQuorum,
  //       parameterizerConfig.pVoteQuorum
  //     ]
  //   }).send()
  //
  //   deployedParameterizer.setProvider(this.web3.currentProvider, this.web3.eth.accounts)
  //   this.contracts.TcrParameterizer = deployedParameterizer
  //
  //   // --------------------------------------------------
  //
  //   linkedByteCode = null
  //   linkedByteCode = this.linkByteCode(
  //     this.contracts.TcrRegistry.options.data,
  //     {
  //       DLL: this.contracts.TcrDLL.options.address,
  //       AttributeStore: this.contracts.TcrAttributeStore.options.address
  //     }
  //   )
  //   this.contracts.TcrRegistry.options.data = linkedByteCode
  //   let deployedRegistry = await this.contracts.TcrRegistry.deploy({
  //     arguments: [
  //       paratiiToken,
  //       this.contracts.TcrPLCRVoting.options.address,
  //       this.contracts.TcrParameterizer.options.address,
  //       'paratii test TCR integration'
  //     ]
  //   }).send()
  //
  //   deployedRegistry.setProvider(this.web3.currentProvider, this.web3.eth.accounts)
  //   this.contracts.TcrRegistry = deployedRegistry
  //
  //   return {deployedRegistry, deployedPLCRVoting, deployedParameterizer}
  // }

  async deployWithLinks (name, links, ...args) {
    let linkedByteCode = this.linkByteCode(
      this.contracts[name].options.data, links)

    this.contracts[name].options.data = linkedByteCode

    let deployedContract = await this.contracts[name].deploy({
      arguments: args
    }).send()
    // deployedContract.setProvider(this.web3.currentProvider, this.web3.eth.accounts)
    this.contracts[name] = deployedContract
    // console.log('deployed ', name)
    return deployedContract
  }
  // async deployTcr (paratiiRegistry, paratiiToken) {
  //   // Deployment steps.
  //   // 1. deploy DLL and AttributeStore
  //   // 2. deploy PLCRVoting and link the DLL and AttributeStore
  //   // 3. deploy Parameterizer with default configs for now.
  //   // 4. deploy TcrRegistry
  //   // 5. register TcrRegistry to Registry (lol)
  //   let tcrConfig = require('sol-tcr/conf/config.json')
  //   let parameterizerConfig = tcrConfig.paramDefaults
  //   // this.truffleContracts = {}
  //   // this.truffleContracts.TcrRegistry = this.requireTruffleContract('sol-tcr/Registry')
  //   // this.truffleContracts.TcrPLCRVoting = this.requireTruffleContract('sol-tcr/PLCRVoting')
  //   // this.truffleContracts.TcrParameterizer = this.requireTruffleContract('sol-tcr/Parameterizer')
  //   // this.truffleContracts.TcrDLL = this.requireTruffleContract('sol-tcr/DLL')
  //   // this.truffleContracts.TcrAttributeStore = this.requireTruffleContract('sol-tcr/AttributeStore')
  //   //
  //   // this.truffleContracts.TcrDLL.new({from: this.config.account.address}).then((instance) => {
  //   //   console.log('DLL: ', instance)
  //   //   resolve(instance)
  //   // }).catch((e) => {
  //   //   console.log('gotcha : ', e)
  //   //   reject(e)
  //   // })
  //   // console.log('TcrDLL: ', this.contracts.TcrDLL)
  //   // console.log('TcrAttributeStore: ', this.contracts.TcrAttributeStore)
  //   // console.log('TcrPLCR: ', this.contracts.TcrPLCRVoting)
  //   // console.log('Avatar: ', this.contracts.Avatar)
  //   // console.log('Registry Address: ', this.contracts.Registry.options.address)
  //   // let deployedDLL = await this.contracts.TcrDLL.deploy({arguments: []}).send()
  //   // deployedDLL.setProvider(this.web3.currentProvider, this.web3.eth.accounts)
  //   // this.contracts.TcrDLL = deployedDLL
  //   //
  //   // let deployedAttributeStore = await this.contracts.TcrAttributeStore.deploy({arguments: []}).send()
  //   // deployedAttributeStore.setProvider(this.web3.currentProvider, this.web3.eth.accounts)
  //   // this.contracts.TcrAttributeStore = deployedAttributeStore
  //
  //   // link both libs to PLCRVoting and deploy it.
  //   let linkedByteCode = this.linkByteCode(
  //     this.contracts.TcrPLCRVoting.options.data, {
  //       DLL: this.contracts.TcrDLL.options.address,
  //       AttributeStore: this.contracts.TcrAttributeStore.options.address
  //     })
  //
  //   this.contracts.TcrPLCRVoting.options.data = linkedByteCode
  //
  //   let deployedPLCRVoting = await this.contracts.TcrPLCRVoting.deploy({
  //     arguments: [paratiiToken]
  //   }).send()
  //   deployedPLCRVoting.setProvider(this.web3.currentProvider, this.web3.eth.accounts)
  //   this.contracts.TcrPLCRVoting = deployedPLCRVoting
  //
  //   // ---------------------------------------------
  //
  //   linkedByteCode = null
  //   linkedByteCode = this.linkByteCode(
  //     this.contracts.TcrParameterizer.options.data,
  //     {
  //       DLL: this.contracts.TcrDLL.options.address,
  //       AttributeStore: this.contracts.TcrAttributeStore.options.address
  //     }
  //   )
  //   this.contracts.TcrParameterizer.options.data = linkedByteCode
  //   let deployedParameterizer = await this.contracts.TcrParameterizer.deploy({
  //     arguments: [
  //       paratiiToken,
  //       this.contracts.TcrPLCRVoting.options.address,
  //       parameterizerConfig.minDeposit,
  //       parameterizerConfig.pMinDeposit,
  //       parameterizerConfig.applyStageLength,
  //       parameterizerConfig.pApplyStageLength,
  //       parameterizerConfig.commitStageLength,
  //       parameterizerConfig.pCommitStageLength,
  //       parameterizerConfig.revealStageLength,
  //       parameterizerConfig.pRevealStageLength,
  //       parameterizerConfig.dispensationPct,
  //       parameterizerConfig.pDispensationPct,
  //       parameterizerConfig.voteQuorum,
  //       parameterizerConfig.pVoteQuorum
  //     ]
  //   }).send()
  //
  //   deployedParameterizer.setProvider(this.web3.currentProvider, this.web3.eth.accounts)
  //   this.contracts.TcrParameterizer = deployedParameterizer
  //
  //   // --------------------------------------------------
  //
  //   linkedByteCode = null
  //   linkedByteCode = this.linkByteCode(
  //     this.contracts.TcrRegistry.options.data,
  //     {
  //       DLL: this.contracts.TcrDLL.options.address,
  //       AttributeStore: this.contracts.TcrAttributeStore.options.address
  //     }
  //   )
  //   this.contracts.TcrRegistry.options.data = linkedByteCode
  //   let deployedRegistry = await this.contracts.TcrRegistry.deploy({
  //     arguments: [
  //       paratiiToken,
  //       this.contracts.TcrPLCRVoting.options.address,
  //       this.contracts.TcrParameterizer.options.address,
  //       'paratii test TCR integration'
  //     ]
  //   }).send()
  //
  //   deployedRegistry.setProvider(this.web3.currentProvider, this.web3.eth.accounts)
  //   this.contracts.TcrRegistry = deployedRegistry
  //
  //   return {deployedRegistry, deployedPLCRVoting, deployedParameterizer}
  // }

  /**
   * deploy all Paratii contracts on the blockchain, and register them the registry contract
   * @return {Promise} all the paratii contracts
   * @example let contracts = await paratii.eth.deployContracts()
   * for (contractName in contracts) { console.log(contracts[contractName])}
   */
  async deployContracts () {
    let tcrConfig = require(this.config.eth.tcrConfigFile)
    let parameterizerConfig = tcrConfig.paramDefaults

    let paratiiRegistry = await this.deployContract('Registry')
    let paratiiRegistryAddress = paratiiRegistry.options.address
    await this.setRegistryAddress(paratiiRegistry.options.address)

    let paratiiAvatar = await this.deployContract('Avatar', paratiiRegistryAddress)
    let paratiiToken = await this.deployContract('ParatiiToken')
    let sendEther = await this.deployContract('SendEther')
    let userRegistry = await this.deployContract('Users', paratiiRegistryAddress)
    let videoRegistry = await this.deployContract('Videos', paratiiRegistryAddress)
    let videoStore = await this.deployContract('Store', paratiiRegistryAddress)
    let likes = await this.deployContract('Likes', paratiiRegistryAddress)
    let views = await this.deployContract('Views', paratiiRegistryAddress)
    let vouchers = await this.deployContract('Vouchers', paratiiRegistryAddress)
    let distributor = await this.deployContract('PTIDistributor', paratiiRegistryAddress)
    let tcrPlaceholder = await this.deployContract('TcrPlaceholder', paratiiRegistryAddress, paratiiToken.options.address, this.web3.utils.toWei('5'), 100)
    let tcrDLL = await this.deployContract('TcrDLL')
    let tcrAttributeStore = await this.deployContract('TcrAttributeStore')

    let tcrPLCRVoting = await this.deployWithLinks('TcrPLCRVoting', {
      DLL: tcrDLL.options.address,
      AttributeStore: tcrAttributeStore.options.address
    }, paratiiToken.options.address)

    let tcrParameterizer = await this.deployWithLinks('TcrParameterizer', {
      DLL: tcrDLL.options.address,
      AttributeStore: tcrAttributeStore.options.address
    }, paratiiToken.options.address,
    tcrPLCRVoting.options.address,
    parameterizerConfig.minDeposit,
    parameterizerConfig.pMinDeposit,
    parameterizerConfig.applyStageLength,
    parameterizerConfig.pApplyStageLength,
    parameterizerConfig.commitStageLength,
    parameterizerConfig.pCommitStageLength,
    parameterizerConfig.revealStageLength,
    parameterizerConfig.pRevealStageLength,
    parameterizerConfig.dispensationPct,
    parameterizerConfig.pDispensationPct,
    parameterizerConfig.voteQuorum,
    parameterizerConfig.pVoteQuorum)

    let tcrRegistry = await this.deployWithLinks('TcrRegistry', {
      DLL: tcrDLL.options.address,
      AttributeStore: tcrAttributeStore.options.address
    }, paratiiToken.options.address,
    tcrPLCRVoting.options.address,
    tcrParameterizer.options.address,
    'paratii test TCR integration')
    // TcrPLCRVoting, TcrParameterizer = await this.deployTcr(paratiiRegistry.options.address, paratiiToken.options.address)
    // console.log('tcrTEST address: ', tcrTest.options.address)

    paratiiRegistry = await this.getContract('Registry')

    await paratiiRegistry.methods.registerAddress('Avatar', paratiiAvatar.options.address).send()
    await paratiiRegistry.methods.registerAddress('ParatiiToken', paratiiToken.options.address).send()
    await paratiiRegistry.methods.registerAddress('SendEther', sendEther.options.address).send()
    await paratiiRegistry.methods.registerAddress('Videos', videoRegistry.options.address).send()
    await paratiiRegistry.methods.registerAddress('Store', videoStore.options.address).send()
    await paratiiRegistry.methods.registerAddress('Users', userRegistry.options.address).send()
    await paratiiRegistry.methods.registerAddress('Likes', likes.options.address).send()
    await paratiiRegistry.methods.registerAddress('Views', views.options.address).send()
    await paratiiRegistry.methods.registerAddress('Vouchers', vouchers.options.address).send()
    await paratiiRegistry.methods.registerAddress('PTIDistributor', distributor.options.address).send()
    await paratiiRegistry.methods.registerAddress('TcrPlaceholder', tcrPlaceholder.options.address).send()
    await paratiiRegistry.methods.registerAddress('TcrDLL', tcrDLL.options.address).send()
    await paratiiRegistry.methods.registerAddress('TcrAttributeStore', tcrAttributeStore.options.address).send()
    await paratiiRegistry.methods.registerAddress('TcrRegistry', tcrRegistry.options.address).send()
    await paratiiRegistry.methods.registerAddress('TcrPLCRVoting', tcrPLCRVoting.options.address).send()
    await paratiiRegistry.methods.registerAddress('TcrParameterizer', tcrParameterizer.options.address).send()

    await paratiiRegistry.methods.registerUint('VideoRedistributionPoolShare', this.web3.utils.toWei('0.3'))

    await paratiiAvatar.methods.addToWhitelist(videoStore.address)

    this.contracts.Avatar = paratiiAvatar
    this.contracts.Registry = paratiiRegistry
    this.contracts.ParatiiToken = paratiiToken
    this.contracts.SendEther = sendEther
    this.contracts.Users = userRegistry
    this.contracts.Videos = videoRegistry
    this.contracts.Likes = likes
    this.contracts.Views = views
    this.contracts.Vouchers = vouchers
    this.contracts.PTIDistributor = distributor
    this.contracts.Store = videoStore
    this.contracts.TcrPlaceholder = tcrPlaceholder
    this.contracts.TcrDLL = tcrDLL
    this.contracts.TcrAttributeStore = tcrAttributeStore
    this.contracts.TcrRegistry = tcrRegistry
    this.contracts.TcrPLCRVoting = tcrPLCRVoting
    this.contracts.TcrParameterizer = tcrParameterizer

    await this.setRegistryAddress(paratiiRegistryAddress)

    return this.contracts
  }

  /**
   * return all the contracts
   * @return {Promise}
   * @example let contracts = await paratii.eth.getContracts()
   * @example let contracts = await paratii.eth.deployContracts()
   * for (contractName in contracts) { console.log(contracts[contractName])}
   */
  async getContracts () {
    for (var name in this.contracts) {
      let contract = this.contracts[name]
      console.log(`[${name}] = ${contract.options.address}`)
      if (!contract.options.address) {
        let address = await this.getContractAddress(name)
        if (address && address !== '0x0') {
          contract.options.address = address
        }
      }
    }
    return this.contracts
  }
/**
 * get the address of the contract on the blockchain
 * @param  {string}  name name of the contract
 * @return {Promise}      Contract address on the blockchain (String)
 * @example await paratii.eth.getContractAddress('ParatiiToken')
 */
  async getContractAddress (name) {
    let registryAddress = this.getRegistryAddress()
    if (name === 'Registry') {
      return registryAddress
    }
    if (!registryAddress) {
      throw Error('No registry address configured')
    }
    try {
      let registry = await this.getContract('Registry')
      if (!registry) {
        throw Error('No registry contract!')
      }
      let address = await registry.methods.getContract(name).call()
      return address
    } catch (err) {
      if (err.message === 'Couldn\'t decode address from ABI: 0x') {
        throw Error(`The registry address is not correct: ${this.getRegistryAddress()}`)
      } else {
        if (err.message === 'Invalid JSON RPC response: ""') {
          throw Error(`Cannot connect to Ethereum at ${this.config.eth.provider}? ${err.message}`)
        } else {
          throw err
        }
      }
    }
  }

  /**
   * Gets the address of the ParatiiRegistry contract
   * @param {string} address address of the ParatiiRegistry contract
   * @example paratii.getRegistryAddress()
  */
  getRegistryAddress () {
    return this.config.eth.registryAddress
  }

  /**
   * Sets the address of the ParatiiRegistry contract
   * @param {string} address address of the ParatiiRegistry contract
   * @example paratii.eth.setRegistryAddress('0x0D6B5A54F940BF3D52E438CaB785981aAeFDf40C')
   * // the address must be a valid ethereum address
  */
  setRegistryAddress (registryAddress) {
    this.config.eth.registryAddress = registryAddress
    for (var name in this.contracts) {
      // console.log('contractName: ', name)
      let contract = this.contracts[name]
      contract.options.address = undefined
    }
  }

  /**
  * When called with a second argument, returns the balance of that Token.<br>
  * When called without a second argument, returns information about all relevant balances.
  * @param  {string}  address ethereum address
  * @param  {string}  [symbol] symbol of the token (ETH,PTI)
  * @return {Promise}         information about balances of that address
  * @example
  * // returns the ETH balance of the given address
  * await paratii.eth.balanceOf('some-address', 'ETH')
  * // returns the PTI balance of the given address
  * await paratii.eth.balanceOf('some-address', 'PTI')
  * // returns both the PTI and the ETH balance of the given address
  * await paratii.eth.balanceOf('some-address')
  */
  async balanceOf (address, symbol) {
    let balance
    let balances = {}

    if (symbol && !(['PTI', 'ETH'].includes(symbol))) {
      throw Error(`Unknown symbol "${symbol}", must be one of "ETH", "PTI"`)
    }

    if (!symbol || symbol === 'ETH') {
      balance = await this.web3.eth.getBalance(address)
      balances.ETH = this.web3.utils.toBN(balance)
    }
    if (!symbol || symbol === 'PTI') {
      let contract = await this.getContract('ParatiiToken')
      balance = await contract.methods.balanceOf(address).call()
      balances.PTI = this.web3.utils.toBN(balance)
    }
    if (symbol) {
      return this.web3.utils.toBN(balance)
    } else {
      return balances
    }
  }

  /**
   * get the amount the beneficiary is allowed to transferFrom the owner account.
   * @param  {string}  ownerAddress       the address of the owner.
   * @param  {string}  beneficiaryAddress address of the contract/person allowed to spend owners money
   * @return {Promise}                    returns allowance in BN format.
   */
  async allowance (ownerAddress, beneficiaryAddress) {
    let tokenContract = await this.getContract('ParatiiToken')
    let allowance = await tokenContract.methods.allowance(ownerAddress, beneficiaryAddress).call()
    return this.web3.utils.toBN(allowance)
  }

  /**
   * ERC20 token approval
   * @param  {string}  beneficiary beneficiary ETH Address
   * @param  {Number}  amount      bignumber of amount to approve.
   * @return {Promise}             returns approvation tx
   */
  async approve (beneficiary, amount) {
    let tokenContract = await this.getContract('ParatiiToken')
    let approved = await tokenContract.methods.approve(beneficiary, amount).send({from: this.getAccount()})
    if (!approved) {
      throw new Error(`Couldn't Approve ${beneficiary} to spend ${amount.toString()} from ${this.getAccount()}`)
    }

    // check to make sure all is good.
    let allowance = await this.allowance(this.getAccount(), beneficiary)
    if (allowance.toString() !== amount.toString()) {
      throw new Error(`allowance Error : allowance ${allowance.toString()} !== amount ${amount.toString()}`)
    }

    return approved
  }

  /**
   * send ETH from current account to beneficiary
   * @param  {string}  beneficiary ETH address
   * @param  {number}  amount      amount of ETH to be sent
   * @param  {string=}  description  description of the transaction (will be written in the blockchain)
   * @return {Promise}             information about the transaction recording the transfer
   * @example await paratii.eth._transferETH('some-address', 20, 'an-optional-description')
   * @private
   */
  async _transferETH (beneficiary, amount, description) {
    const contract = await this.getContract('SendEther')
    if (!contract.options || !contract.options.address) {
      throw Error('No SendEther contract known - please run paratii.diagnose()')
    }

    let from = this.config.account.address
    if (!from) {
      throw Error('No account set! Cannot send transactions')
    }

    if (!description) {
      description = ''
    }
    from = add0x(from)
    beneficiary = add0x(beneficiary)

    try {
      return await contract.methods.transfer(beneficiary, description).send({value: amount})
    } catch (err) {
      throw err
    }
  }
  /**
   * send PTI from current account to beneficiary
   * @param  {string}  beneficiary ETH address
   * @param  {number}  amount      amount of PTI to be sent
   * @return {Promise}             information about the transaction recording the transfer
   * @example await paratii.eth._transferPTI('some-address', 20)
   * @private
   */
  async _transferPTI (beneficiary, amount) {
    const contract = await this.getContract('ParatiiToken')

    if (!contract.options || !contract.options.address) {
      throw Error('No ParatiiToken contract known - please run paratii.diagnose()')
    }
    let from = this.config.account.address
    if (!from) {
      throw Error('No account set! Cannot send transactions')
    }
    from = add0x(from)
    beneficiary = add0x(beneficiary)

    let result = await contract.methods.transfer(beneficiary, amount).send()

    return result
  }
  /**
   * Use this to send ETH or PTI from paratii.config.address
   * @param  {string}  beneficiary ETH address
   * @param  {number}  amount      amount of ETH/PTI to be sent
   * @param  {string}  symbol      symbol of the token to send (ETH,PTI)
   * @param  {string=}  description description to be inserted in the blockchain
   * @return {Promise}             information about the transaction recording the transfer
   * @example let result = await paratii.eth.transfer('some-address', 20, 'ETH', 'thanks for all the fish')
   */
  async transfer (beneficiary, amount, symbol, description) {
    if (symbol === 'ETH') {
      return this._transferETH(beneficiary, amount, description)
    } else if (symbol === 'PTI') {
      return this._transferPTI(beneficiary, amount)
    }
  }
}
