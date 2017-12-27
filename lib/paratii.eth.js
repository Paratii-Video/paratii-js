import { add0x } from './utils.js'
import { ParatiiEthVids } from './paratii.eth.vids.js'
import { ParatiiEthUsers } from './paratii.eth.users.js'
import { patchWallet } from './paratii.eth.wallet.js'
const Web3 = require('web3')
const dopts = require('default-options')

export class ParatiiEth {
  constructor (config) {
    let defaults = {
      provider: 'http://localhost:8545/rpc/',
      registryAddress: null,
      account: {
        address: null,
        privateKey: null
      },
      web3: null,
      isTestNet: false
    }
    let options = dopts(config, defaults, {allowUnknown: true})
    this.config = config

    if (options.web3) {
      this.web3 = options.web3
    } else {
      this.web3 = new Web3()
      this.web3.setProvider(new this.web3.providers.HttpProvider(options.provider))
    }

    this.contracts = {}
    this.contracts.ParatiiToken = this.requireContract('ParatiiToken')
    this.contracts.Avatar = this.requireContract('Avatar')
    this.contracts.Registry = this.requireContract('Registry')
    this.contracts.SendEther = this.requireContract('SendEther')
    this.contracts.Users = this.requireContract('Users')
    this.contracts.Videos = this.requireContract('Videos')
    this.contracts.Store = this.requireContract('Store')

    this.vids = new ParatiiEthVids(this)
    this.users = new ParatiiEthUsers(this)

    this.wallet = patchWallet(this.web3.eth.accounts.wallet)

    if (this.config.account.privateKey) {
      this.web3.eth.defaultAccount = this.config.account.address
      this.web3.eth.accounts.wallet.add(this.config.account.privateKey)
    }
  }

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
    contract.setProvider(this.web3.currentProvider)
    return contract
  }

  async deployContract (name, ...args) {
    if (!this.config.account.address) {
      let msg = `No Ethereum address was set - you can use .setAccount(address, [privateKey]) or specify it when creating the object`
      throw Error(msg)
    }
    let contract = this.contracts[name]

    let deployedContract = await contract.deploy({arguments: args}).send()

    return deployedContract
  }
  async sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async fixMethodAndSend (method, opts) {
    // this methos fix a know bug on web3, apparently, 'deployContract(...)' does not return the same object as `getContract()` [<- this is a bug]
    let rawTransaction = await method
    rawTransaction._ethAccounts = this.web3.eth.accounts
    // wait for receipt let nonce increment
    await rawTransaction.send(opts)
  }

  async fixMethodAndCall (method) {
    // this methos fix a know bug on web3, apparently, 'deployContract(...)' does not return the same object as `getContract()` [<- this is a bug]
    let rawTransaction = await method
    rawTransaction._ethAccounts = this.web3.eth.accounts
    // wait for receipt let nonce increment
    let result = await rawTransaction.call()
    return result
  }

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

    paratiiRegistry = await this.getContract('Registry')
    paratiiRegistry.setProvider(this.web3.currentProvider)
    paratiiAvatar.setProvider(this.web3.currentProvider)

    await this.fixMethodAndSend(await paratiiRegistry.methods.registerAddress('Avatar', paratiiAvatar.options.address))
    await this.fixMethodAndSend(await paratiiRegistry.methods.registerAddress('ParatiiToken', paratiiToken.options.address))
    await this.fixMethodAndSend(await paratiiRegistry.methods.registerAddress('SendEther', sendEther.options.address))
    await this.fixMethodAndSend(await paratiiRegistry.methods.registerAddress('Videos', videoRegistry.options.address))
    await this.fixMethodAndSend(await paratiiRegistry.methods.registerAddress('Store', videoStore.options.address))
    await this.fixMethodAndSend(await paratiiRegistry.methods.registerAddress('Users', userRegistry.options.address))

    await this.fixMethodAndSend(paratiiRegistry.methods.registerUint('VideoRedistributionPoolShare', this.web3.utils.toWei('0.3')))

    await this.fixMethodAndSend(paratiiAvatar.methods.addToWhitelist(videoStore.address))

    this.contracts = {
      Avatar: paratiiAvatar,
      Registry: paratiiRegistry,
      ParatiiToken: paratiiToken,
      SendEther: sendEther,
      Users: userRegistry,
      Videos: videoRegistry,
      Store: videoStore
    }
    this.config.registryAddress = paratiiRegistryAddress

    return this.contracts
  }

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
    return contract
  }

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
      console.log(err)
      throw err
    }
  }

  getRegistryAddress () {
    return this.config.registryAddress
  }

  setRegistryAddress (registryAddress) {
    this.config.registryAddress = registryAddress
  }

  async balanceOf (address, symbol) {
    let balance
    let balances = {}

    // TODO: use default-options for argument type checking
    if (symbol && !(['PTI', 'ETH'].includes(symbol))) {
      throw Error(`Unknown symbol "${symbol}", must be one of "ETH", "PTI"`)
    }

    if (!symbol || symbol === 'ETH') {
      balance = await this.web3.eth.getBalance(address)
      balances.ETH = balance
    }
    if (!symbol || symbol === 'PTI') {
      let contract = await this.getContract('ParatiiToken')
      contract.setProvider(this.web3.currentProvider)
      balance = await this.fixMethodAndCall(contract.methods.balanceOf(address))
      balances.PTI = balance
    }
    if (symbol) {
      return balance
    } else {
      return balances
    }
  }
  async _transferETH (beneficiary, amount) {
    // @args amount is in Wei
    // TODO: use the SendEther contract
    // TODO: this will only work on testrpc with unlocked accounts..
    let from = this.config.account.address
    if (!from) {
      throw Error('No account set! Cannot send transactions')
    }
    if (!beneficiary) {
      throw Error('No beneficiary given.')
    }
    from = add0x(from)
    beneficiary = add0x(beneficiary)

    let result = await this.web3.eth.sendTransaction({
      from: from,
      to: beneficiary,
      value: amount,
      gasPrice: 20000000000,
      gas: 21000
    })
    return result
  }

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

    let result = await this.fixMethodAndSend(contract.methods.transfer(beneficiary, amount), {gas: 200000, from: from})

    return result
  }

  async transfer (beneficiary, amount, symbol) {
    if (symbol === 'ETH') {
      return this._transferETH(beneficiary, amount)
    } else if (symbol === 'PTI') {
      return this._transferPTI(beneficiary, amount)
    }
  }

  async subscribe (type, options) {
    this.web3.eth.subscribe(type, function (error, result) {
      if (!error) { console.log(result) } else {
        console.log(error)
      }
    })
  }
}
