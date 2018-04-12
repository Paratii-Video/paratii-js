import { add0x } from './utils.js'
import { ParatiiEthVids } from './paratii.eth.vids.js'
import { ParatiiEthUsers } from './paratii.eth.users.js'
import { ParatiiEthEvents } from './paratii.eth.events.js'
import { ParatiiEthVouchers } from './paratii.eth.vouchers.js'
import { ParatiiEthTcr } from './paratii.eth.tcr.js'
import { patchWallet } from './paratii.eth.wallet.js'
import { ethSchema, accountSchema } from './schemas.js'
import joi from 'joi'

const Web3 = require('web3')
// const joi = require('joi')
/**
 * contains functions to interact with the Ethereum blockchain and the Paratii contracts.
 * See {@link Paratii}
 * @param {ParatiiEthSchema} config configuration object to initialize Paratii object
 * @property {ParatiiCoreVids} vids operations on videos
 * @property {ParatiiCoreUsers} users operations on users
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
  * @property {?accountSchema} account
  * @property {?ethSchema} eth
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
        this.web3.setProvider(new this.web3.providers.WebsocketProvider(config.eth.provider))
      } else {
        this.web3.setProvider(new this.web3.providers.HttpProvider(config.eth.provider))
      }
    }
    this.config = config

    this.wallet = patchWallet(this.web3.eth.accounts.wallet, this.config)
    this.setAccount(this.config.account.address, this.config.account.privateKey, this.config.account.mnemonic)

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
    this.contracts.TcrPlaceholder = this.requireContract('TcrPlaceholder')

    this.vids = new ParatiiEthVids(this)
    this.users = new ParatiiEthUsers(this)
    this.events = new ParatiiEthEvents(this)
    this.vouchers = new ParatiiEthVouchers(this)
    this.tcr = new ParatiiEthTcr(this)
  }
  /**
   * creates an account using the private key or, if not present, using the mnemonic
   * @param {string} address    public address
   * @param {string} privateKey private key related to the previous public address
   * @param {string} mnemonic   mnemonic related to the previous public address
   * @example paratii.eth.setAccount('some-address','some-private-key')
   * @example paratii.eth.setAccount('some-address','some-mnemonic')
   * @private
   * SEE paratii.setAccount()
   */
  setAccount (address, privateKey, mnemonic) {
    const wallet = this.web3.eth.accounts.wallet
    this.config.account.address = address
    this.config.account.privateKey = privateKey
    this.web3.eth.testAccount = address
    if (privateKey) {
      let account = wallet.add(privateKey)
      if (account.address !== address) {
        throw Error('Private Key and Account address are not compatible!')
      }
      this.config.account.address = address
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
   * @example getAccount()
   * @memberof paratii.eth
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
   * @example paratii.eth.getContract('ParatiiToken')
   */
  async getContract (name) {
    let contract = this.contracts[name]
    if (!contract) {
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
    const artifact = require(`paratii-contracts/build/contracts/${contractName}.json`)
    let from = this.config.account.address

    const contract = new this.web3.eth.Contract(
      artifact.abi,
      {
        from: from,
        gas: this.web3.utils.toHex(4e6),
        data: artifact.bytecode
      })
    // contract.setProvider(this.web3.currentProvider, this.web3.eth.accounts)
    return contract
  }
  /**
   * deploys contract on the blockchain
   * @param  {string}  name name of the contract
   * @param  {Object}  args configuration for the contract (strings or numbers). It is allowed to pass more than one parameter
   * @return {Promise}      the deployed contract
   * @example paratii.eth.deployContract('ParatiiToken')
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
    deployedContract.setProvider(this.web3.currentProvider, this.web3.eth.accounts)
    this.contracts[name] = deployedContract
    return deployedContract
  }

  /**
   * deploy all Paratii contracts on the blockchain, and register them the registry contract
   * @return {Promise} all the paratii contracts
   * @example let contracts = await paratii.eth.deployContracts()
   * for (contractName in contracts) { console.log(contracts[contractName])}
   */
  async deployContracts () {
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
    let tcrPlaceholder = await this.deployContract('TcrPlaceholder', paratiiRegistryAddress, paratiiToken.options.address, this.web3.utils.toWei('5'), 100)

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
    await paratiiRegistry.methods.registerAddress('TcrPlaceholder', tcrPlaceholder.options.address).send()

    await paratiiRegistry.methods.registerUint('VideoRedistributionPoolShare', this.web3.utils.toWei('0.3'))

    await paratiiAvatar.methods.addToWhitelist(videoStore.address)

    this.contracts = {
      Avatar: paratiiAvatar,
      Registry: paratiiRegistry,
      ParatiiToken: paratiiToken,
      SendEther: sendEther,
      Users: userRegistry,
      Videos: videoRegistry,
      Likes: likes,
      Views: views,
      Vouchers: vouchers,
      Store: videoStore,
      TcrPlaceholder: tcrPlaceholder
    }

    this.setRegistryAddress(paratiiRegistryAddress)

    return this.contracts
  }

  /**
   * Set the provider on all the contracts
   * @example paratii.eth.setContractsProvider()
   * @private
   */
  async setContractsProvider () {
    for (var key in this.contracts) {
      this.contracts[key].setProvider(this.web3.currentProvider, this.web3.eth.accounts)
    }
  }
  /**
   * return all the contracts
   * @return {Promise} all the contracts
   * @example let contracts = await paratii.eth.getContracts()
   */
  async getContracts () {
    for (var name in this.contracts) {
      let contract = this.contracts[name]
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
 * @example paratii.eth.getContractAddress('ParatiiToken')
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
      throw err
    }
  }

  /**
   * get the address of the Registry contract on the blockchain
   * @return {string} address on the blockchain
   * @example let registryAddress = paratii.eth.getRegistryAddress()
   * @private
   */
  getRegistryAddress () {
    return this.config.eth.registryAddress
  }
  /**
   * set the address of the Registry contract on the blockchain
   * @param {string} registryAddress new address
   * @example await paratii.eth.setRegistryAddress('some-address')
   * @private
   */
  setRegistryAddress (registryAddress) {
    this.config.eth.registryAddress = registryAddress
    for (var name in this.contracts) {
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
      balances.ETH = balance
    }
    if (!symbol || symbol === 'PTI') {
      let contract = await this.getContract('ParatiiToken')
      balance = await contract.methods.balanceOf(address).call()
      balances.PTI = balance
    }
    if (symbol) {
      return balance
    } else {
      return balances
    }
  }
  /**
   * send ETH from current account to beneficiary
   * @param  {string}  beneficiary ETH address
   * @param  {number}  amount      amount of ETH to be sent
   * @param  {?string}  description  description of the transaction (will be written in the blockchain)
   * @return {Promise}             information about the transaction recording the transfer
   * @example return paratii.eth._transferETH('some-address', 20, 'an-optional-description')
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
   * @example return paratii.eth._transferPTI('some-address', 20)
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
   * @param  {?string}  description description to be inserted in the blockchain
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
