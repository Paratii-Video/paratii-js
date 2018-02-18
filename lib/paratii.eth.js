
import { add0x } from './utils.js'
import { ParatiiEthVids } from './paratii.eth.vids.js'
import { ParatiiEthUsers } from './paratii.eth.users.js'
import { ParatiiEthEvents } from './paratii.eth.events.js'
import { ParatiiEthVouchers } from './paratii.eth.vouchers.js'
import { ParatiiEthTcr } from './paratii.eth.tcr.js'
import { patchWallet } from './paratii.eth.wallet.js'
const Web3 = require('web3')
const dopts = require('default-options')

export class ParatiiEth {
  constructor (config) {
    let defaults = {
      // provider: 'http://localhost:8545/rpc/',
      provider: 'ws://localhost:8546',
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
      if (options.provider.substring(0, 2) === 'ws') {
        this.web3.setProvider(new this.web3.providers.WebsocketProvider(options.provider))
      } else {
        this.web3.setProvider(new this.web3.providers.HttpProvider(options.provider))
      }
      // this.web3.setProvider(options.provider)
    }

    this.wallet = patchWallet(this.web3.eth.accounts.wallet, this.config)
    this.setAccount(this.config.account.address, this.config.account.privateKey)

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

  setAccount (address, privateKey) {
    this.config.account.address = address
    this.config.account.privateKey = privateKey
    this.web3.eth.defaultAccount = address
    if (privateKey) {
      let account = this.web3.eth.accounts.wallet.add(privateKey)
      if (account.address !== address) {
        throw Error('Private Key and Account are not compatible!')
      }
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
    // contract.setProvider(this.web3.currentProvider, this.web3.eth.accounts)
    return contract
  }

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
  // TODO: this is for testing - remove this
  async sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
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
    let likes = await this.deployContract('Likes', paratiiRegistryAddress)
    let views = await this.deployContract('Views', paratiiRegistryAddress)
    let vouchers = await this.deployContract('Vouchers', paratiiRegistryAddress)
    let tcrPlaceholder = await this.deployContract('TcrPlaceholder', paratiiRegistryAddress, paratiiToken.options.address, 5, 100)

    paratiiRegistry = await this.getContract('Registry')

    await paratiiRegistry.methods.registerAddress('Avatar', paratiiAvatar.options.address).send()
    // console.log(`Registered address of Avatar ${paratiiAvatar.options.address} at contract ${paratiiRegistryAddress}`)
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

    // await this.setContractsProvider()

    this.config.registryAddress = paratiiRegistryAddress

    return this.contracts
  }

  async setContractsProvider () {
    for (var key in this.contracts) {
      this.contracts[key].setProvider(this.web3.currentProvider, this.web3.eth.accounts)
    }
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
    if (!contract.methods.constructor._ethAccounts) {
      contract.methods.constructor._ethAccounts = this.web3.eth.accounts
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
      throw err
    }
  }

  getRegistryAddress () {
    return this.config.registryAddress
  }

  setRegistryAddress (registryAddress) {
    this.config.registryAddress = registryAddress
    for (var name in this.contracts) {
      let contract = this.contracts[name]
      contract.options.address = undefined
    }
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
      balance = await contract.methods.balanceOf(address).call()
      balances.PTI = balance
    }
    if (symbol) {
      return balance
    } else {
      return balances
    }
  }
  // async _transferETH (beneficiary, amount) {
  //   // @args amount is in Wei
  //   // TODO: use the SendEther contract
  //   // TODO: this will only work on testrpc with unlocked accounts..
  //   let from = this.config.account.address
  //   if (!from) {
  //     throw Error('No account set! Cannot send transactions')
  //   }
  //   if (!beneficiary) {
  //     throw Error('No beneficiary given.')
  //   }
  //   from = add0x(from)
  //   beneficiary = add0x(beneficiary)
  //
  //   let result = await this.web3.eth.sendTransaction({
  //     from: from,
  //     to: beneficiary,
  //     value: amount,
  //     gasPrice: 20000000000,
  //     gas: 21000
  //   })
  //   return result
  // }
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

  async transfer (beneficiary, amount, symbol, description) {
    if (symbol === 'ETH') {
      return this._transferETH(beneficiary, amount, description)
    } else if (symbol === 'PTI') {
      return this._transferPTI(beneficiary, amount)
    }
  }
}
