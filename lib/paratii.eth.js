import { add0x } from './utils.js'
import { ParatiiEthVids } from './paratii.eth.vids.js'
const Web3 = require('web3')
const dopts = require('default-options')

export class ParatiiEth {
  constructor (config) {
    let defaults = {
      provider: 'http://localhost:8545',
      registryAddress: null,
      account: {
        address: null,
        privateKey: null
      },
      web3: null,
      isTestNet: false
    }
    let options = dopts(config, defaults)
    this.config = config

    if (options.web3) {
      this.web3 = options.web3
    } else {
      this.web3 = new Web3()
      this.web3.setProvider(new this.web3.providers.HttpProvider(options.provider))
    }

    if (this.config.account.privateKey) {
      this.web3.eth.accounts.wallet.add(this.config.account.privateKey)
    }

    this.contracts = {}
    this.contracts.ParatiiToken = this.requireContract('ParatiiToken')
    this.contracts.ParatiiAvatar = this.requireContract('ParatiiAvatar')
    this.contracts.ParatiiRegistry = this.requireContract('ParatiiRegistry')
    this.contracts.SendEther = this.requireContract('SendEther')
    this.contracts.UserRegistry = this.requireContract('UserRegistry')
    this.contracts.VideoRegistry = this.requireContract('VideoRegistry')
    this.contracts.VideoStore = this.requireContract('VideoStore')

    this.contractNames = [
      'ParatiiAvatar',
      'ParatiiToken',
      'ParatiiRegistry',
      'SendEther',
      'UserRegistry',
      'VideoRegistry',
      'VideoStore'
    ]

    this.vids = new ParatiiEthVids(this)
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
    let contract = this.contracts[name]
    let deployedContract = await contract.deploy({arguments: args}).send()
    return deployedContract
  }

  async deployContracts () {
    let paratiiRegistry = await this.deployContract('ParatiiRegistry')
    let paratiiRegistryAddress = paratiiRegistry.options.address

    let paratiiAvatar = await this.deployContract('ParatiiAvatar', paratiiRegistryAddress)
    let paratiiToken = await this.deployContract('ParatiiToken')
    let sendEther = await this.deployContract('SendEther')
    let userRegistry = await this.deployContract('UserRegistry', paratiiRegistryAddress)
    let videoRegistry = await this.deployContract('VideoRegistry', paratiiRegistryAddress)
    let videoStore = await this.deployContract('VideoStore', paratiiRegistryAddress)

    await paratiiRegistry.methods.registerAddress('ParatiiAvatar', paratiiAvatar.options.address).send()
    await paratiiRegistry.methods.registerAddress('ParatiiToken', paratiiToken.options.address).send()
    await paratiiRegistry.methods.registerAddress('SendEther', sendEther.options.address).send()
    await paratiiRegistry.methods.registerAddress('VideoRegistry', videoRegistry.options.address).send()
    await paratiiRegistry.methods.registerAddress('VideoStore', videoStore.options.address).send()
    await paratiiRegistry.methods.registerAddress('UserRegistry', userRegistry.options.address).send()

    await paratiiRegistry.methods.registerUint('VideoRedistributionPoolShare', this.web3.utils.toWei('0.3')).send()

    await paratiiAvatar.methods.addToWhitelist(videoStore.address).send()

    this.contracts = {
      ParatiiAvatar: paratiiAvatar,
      ParatiiRegistry: paratiiRegistry,
      ParatiiToken: paratiiToken,
      SendEther: sendEther,
      UserRegistry: userRegistry,
      VideoRegistry: videoRegistry,
      VideoStore: videoStore
    }
    this.config.registryAddress = paratiiRegistryAddress

    return this.contracts
  }

  async getContract (name) {
    let contract = this.contracts[name]
    if (!contract) {
      throw Error(`No contract with name "${name}" is known`)
    }
    let address = await this.getContractAddress(name)
    if (address && address !== '0x0') {
      contract.options.address = address
    }
    return contract
  }

  // TODO: optimization: do not ask the contract addresses from the registry each time, only on startup/first access
  async getContractAddress (name) {
    let registryAddress = this.getRegistryAddress()
    if (name === 'ParatiiRegistry') {
      return this.getRegistryAddress()
    }
    if (!registryAddress) {
      throw Error('No registry address configured')
    }
    try {
      let registry = await this.getContract('ParatiiRegistry')
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

  async getContracts () {
    return this.contracts
  }

  getRegistryAddress () {
    return this.config.registryAddress
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
    // console.log('000000000000000000000000000000000000000000000000000000000000000')
    // console.log(from)
    // console.log(beneficiary)
    // console.log('000000000000000000000000000000000000000000000000000000000000000')
    let result = await this.web3.eth.sendTransaction({
      from: from,
      to: beneficiary,
      value: amount,
      gasPrice: 20000000000
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
    // console.log('000000000000000000000000000000000000000000000000000000000000000')
    // console.log(from)
    // console.log(beneficiary)
    // console.log(contract.options.address)
    // console.log('000000000000000000000000000000000000000000000000000000000000000')
    // console.log(`Sending ${amount} PTI from ${fromAddress} to ${beneficiary} using contract ${contract}`)
    let result = await contract.methods
      .transfer(beneficiary, amount)
      .send({gas: 200000, from: from})

    return result
  }

  async transfer (beneficiary, amount, symbol) {
    if (symbol === 'ETH') {
      return this._transferETH(beneficiary, amount)
    } else if (symbol === 'PTI') {
      return this._transferPTI(beneficiary, amount)
    }
  }
}
