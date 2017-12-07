import { add0x } from './utils.js'

export class ParatiiEth {
  constructor (context) {
    this.context = context

    var ParatiiToken = this.requireContract('ParatiiToken')
    var ParatiiAvatar = this.requireContract('ParatiiAvatar')
    var ParatiiRegistry = this.requireContract('ParatiiRegistry')
    var SendEther = this.requireContract('SendEther')
    var UserRegistry = this.requireContract('UserRegistry')
    var VideoRegistry = this.requireContract('VideoRegistry')
    var VideoStore = this.requireContract('VideoStore')

    this.contractNames = [
      'ParatiiAvatar',
      'ParatiiToken',
      'ParatiiRegistry',
      'SendEther',
      'UserRegistry',
      'VideoRegistry',
      'VideoStore'
    ]

    this.CONTRACTS = {
      'ParatiiAvatar': {
        contract: ParatiiAvatar
      },
      'ParatiiRegistry': {
        contract: ParatiiRegistry
      },
      'ParatiiToken': {
        contract: ParatiiToken
      },
      'SendEther': {
        contract: SendEther
      },
      'UserRegistry': {
        contract: UserRegistry
      },
      'VideoRegistry': {
        contract: VideoRegistry
      },
      'VideoStore': {
        contract: VideoStore
      }
    }
  }

  requireContract (contractName) {
    const artifact = require(`paratii-contracts/build/contracts/${contractName}.json`)
    const contract = new this.context.web3.eth.Contract(
      artifact.abi,
      {
        from: this.context.account.address,
        gas: this.context.web3.utils.toHex(4e6),
        data: artifact.bytecode
      })
    contract.setProvider(this.context.web3.currentProvider)
    return contract
  }

  async deployContract (name, ...args) {
    let contract = this.CONTRACTS[name].contract
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

    await paratiiRegistry.methods.registerUint('VideoRedistributionPoolShare', this.context.web3.utils.toWei('0.3')).send()

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
    this.context.config.registryAddress = paratiiRegistryAddress

    return this.contracts
  }

  async getContract (name) {
    let contractInfo, contract
    contractInfo = this.CONTRACTS[name]
    if (!contractInfo) {
      throw Error(`No contract with name "${name}" is known`)
    }
    let address = await this.getContractAddress(name)
    if (address) {
      contract = contractInfo.contract
      contract.options.address = address
    }
    return contract
  }

  // TODO: optimization: do not ask the contract addresses from the registry each time, only on startup/first access
  async getContractAddress (name) {
    if (name === 'ParatiiRegistry') {
      return this.getRegistryAddress()
    }
    try {
      let registry = await this.getContract('ParatiiRegistry')
      if (!registry) {
        throw Error('No registry contract!')
      }
      let address = await registry.methods.getContract(name).call({
        from: this.context.account.address
      })
      return address
    } catch (err) {
      console.log(err)
      throw err
    }
  }

  async getContracts () {
    return this.contracts
    // for (let i = 0; i < contractNames.length; i++) {
    //   contracts[contractNames[i]] = await this.getContract(this.contractNames[i])
    // }
    // return contracts
  }
  getRegistryAddress () {
    return this.context.config.registryAddress
  }

  async balanceOf (account, symbol) {
    let balance
    let balances = {}

    // TODO: use default-options for argument type checking
    if (symbol && !(['PTI', 'ETH'].includes(symbol))) {
      throw Error(`Unknown symbol "${symbol}", must be one of "ETH", "PTI"`)
    }

    if (!symbol || symbol === 'ETH') {
      balance = await this.context.web3.eth.getBalance(account)
      balances.ETH = balance
    }
    if (!symbol || symbol === 'PTI') {
      let contract = await this.getContract('ParatiiToken')
      balance = await contract.methods.balanceOf(account).call()
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
    let from = this.context.config.account
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
    let result = await this.context.web3.eth.sendTransaction({
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
      throw Error('No ParaktiiToken contract known - please run paratii.diagnose()')
    }
    let from = this.context.config.account
    if (!from) {
      throw Error('No account set! Cannot send transactions')
    }
    from = add0x(from)
    beneficiary = add0x(beneficiary)
    // console.log('000000000000000000000000000000000000000000000000000000000000000')
    // console.log(from)
    // console.log(beneficiary)
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
