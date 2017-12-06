import { add0x } from './utils.js'
const Web3 = require('web3')
const dopts = require('default-options')
const utils = require('./utils.js')

/**
 * Paratii Library
 * for usage, see https://github.com/Paratii-Video/paratii-contracts/tree/master/docs
 *
 */

const Paratii = function (opts) {
  let PARATIIREGISTRYADDRESS
  let CONTRACTS
  let account // the account that will be the sender of all transactions
  let config // options for the Paratii object
  let web3
  let contracts = {}

  let contractNames = [
    'ParatiiAvatar',
    'ParatiiToken',
    'ParatiiRegistry',
    'SendEther',
    'UserRegistry',
    'VideoRegistry',
    'VideoStore'
  ]

  init(opts)

  function init (opts = {}) {
    let defaults = {
      provider: 'http://localhost:8545',
      registryAddress: null,
      // TODO: the account can be derived from the private key, so there is no need to specify both
      account: null,
      privateKey: null
    }
    config = dopts(opts, defaults)

    web3 = new Web3()
    web3.setProvider(new web3.providers.HttpProvider(config.provider))

    if (!config.account) {
      // this is the first account generated with testprc/ganache using the --deterministic flag
      // we use it here as default, but probably should not..
      account = {
        address: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
        privateKey: '4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d'
      }
      web3.eth.accounts.wallet.add(account.privateKey)
    } else {
      account = {
        address: config.account
      }
      web3.eth.accounts.wallet.add(config.privateKey)
    }

    if (opts.registryAddress) {
      PARATIIREGISTRYADDRESS = opts.registryAddress
    }

    var ParatiiToken = requireContract('ParatiiToken')
    var ParatiiAvatar = requireContract('ParatiiAvatar')
    var ParatiiRegistry = requireContract('ParatiiRegistry')
    var SendEther = requireContract('SendEther')
    var UserRegistry = requireContract('UserRegistry')
    var VideoRegistry = requireContract('VideoRegistry')
    var VideoStore = requireContract('VideoStore')
    CONTRACTS = {
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

  function requireContract (contractName) {
    const artifact = require(`paratii-contracts/build/contracts/${contractName}.json`)
    const contract = new web3.eth.Contract(
      artifact.abi,
      {
        from: account.address,
        gas: web3.utils.toHex(4e6),
        data: artifact.bytecode
      })
    contract.setProvider(web3.currentProvider)
    return contract
  }

  async function deployContract (name, ...args) {
    let contract = CONTRACTS[name].contract
    let deployedContract = await contract.deploy({arguments: args}).send()
    return deployedContract
  }

  async function deployContracts () {
    let paratiiRegistry = await deployContract('ParatiiRegistry')
    let paratiiRegistryAddress = paratiiRegistry.options.address
    PARATIIREGISTRYADDRESS = paratiiRegistryAddress

    let paratiiAvatar = await deployContract('ParatiiAvatar', paratiiRegistryAddress)
    let paratiiToken = await deployContract('ParatiiToken')
    let sendEther = await deployContract('SendEther')
    let userRegistry = await deployContract('UserRegistry', paratiiRegistryAddress)
    let videoRegistry = await deployContract('VideoRegistry', paratiiRegistryAddress)
    let videoStore = await deployContract('VideoStore', paratiiRegistryAddress)

    await paratiiRegistry.methods.registerAddress('ParatiiAvatar', paratiiAvatar.options.address).send()
    await paratiiRegistry.methods.registerAddress('ParatiiToken', paratiiToken.options.address).send()
    await paratiiRegistry.methods.registerAddress('SendEther', sendEther.options.address).send()
    await paratiiRegistry.methods.registerAddress('VideoRegistry', videoRegistry.options.address).send()
    await paratiiRegistry.methods.registerAddress('VideoStore', videoStore.options.address).send()
    await paratiiRegistry.methods.registerAddress('UserRegistry', userRegistry.options.address).send()

    await paratiiRegistry.methods.registerUint('VideoRedistributionPoolShare', web3.utils.toWei('0.3')).send()

    await paratiiAvatar.methods.addToWhitelist(videoStore.address).send()

    contracts = {
      ParatiiAvatar: paratiiAvatar,
      ParatiiRegistry: paratiiRegistry,
      ParatiiToken: paratiiToken,
      SendEther: sendEther,
      UserRegistry: userRegistry,
      VideoRegistry: videoRegistry,
      VideoStore: videoStore
    }

    return contracts
  }

  async function getContract (name) {
    let contractInfo, contract
    contractInfo = CONTRACTS[name]
    if (!contractInfo) {
      throw Error(`No contract with name "${name}" is known`)
    }
    let address = await getContractAddress(name)
    if (address) {
      contract = contractInfo.contract
      contract.options.address = address
    }
    return contract
  }

  // TODO: optimization: do not ask the contract addresses from the registry each time, only on startup/first access
  async function getContractAddress (name) {
    if (name === 'ParatiiRegistry') {
      return getRegistryAddress()
    }
    try {
      let registry = await getContract('ParatiiRegistry')
      if (!registry) {
        throw Error('No contract!')
      }
      let address = await registry.methods.getContract(name).call({
        from: account.address
      })
      return address
    } catch (err) {
      console.log(err)
      throw err
    }
  }

  async function getContracts () {
    return contracts
    // for (let i = 0; i < contractNames.length; i++) {
    //   contracts[contractNames[i]] = await getContract(contractNames[i])
    // }
    // return contracts
  }

  // function getParatiiRegistry () {
  //
  //   let address = getRegistryAddress()
  //   if (!address) {
  //     let msg = `No paratii registry address known!`
  //     throw Error(msg)
  //   }
  //   CONTRACTS.ParatiiRegistry.contract.options.address = address
  //   return CONTRACTS.ParatiiRegistry.contract
  // }

  function getRegistryAddress () {
    return PARATIIREGISTRYADDRESS
  }

  // async function getOrDeployContracts () {
  //   // get the paratii contracts if a registryaddress is known, otherwise deploy them
  //   let contracts
  //   if (PARATIIREGISTRYADDRESS) {
  //     contracts = await getContracts()
  //   } else {
  //     console.log('deploying new contracts')
  //     contracts = await deployContracts()
  //     console.log('setting registry address')
  //     PARATIIREGISTRYADDRESS = contracts['ParatiiRegistry'].address
  //   }
  //   return contracts
  // }

  async function balanceOf (account, symbol) {
    let balance
    let balances = {}

    // TODO: use default-options for argument type checking
    if (symbol && !(['PTI', 'ETH'].includes(symbol))) {
      throw Error(`Unknown symbol "${symbol}", must be one of "ETH", "PTI"`)
    }

    if (!symbol || symbol === 'ETH') {
      balance = await web3.eth.getBalance(account)
      balances.ETH = balance
    }
    if (!symbol || symbol === 'PTI') {
      let contract = await getContract('ParatiiToken')
      balance = await contract.methods.balanceOf(account).call()
      balances.PTI = balance
    }
    if (symbol) {
      return balance
    } else {
      return balances
    }
  }
  async function _transferETH (beneficiary, amount) {
    // @args amount is in Wei
    // TODO: use the SendEther contract
    // TODO: this will only work on testrpc with unlocked accounts..
    if (!config.account) {
      throw Error('No account set! Cannot send transactions')
    }
    let fromAddress = config.account
    let result = await web3.eth.sendTransaction({
      from: add0x(fromAddress),
      to: add0x(beneficiary),
      value: amount,
      gasPrice: 20000000000
    })
    return result
  }

  async function _transferPTI (beneficiary, amount) {
    const contract = await getContract('ParatiiToken')
    let fromAddress = config.account
    if (!config.account) {
      throw Error('No account set! Cannot send transactions')
    }
    // console.log(`Sending ${amount} PTI from ${fromAddress} to ${beneficiary} using contract ${contract}`)
    let result = await contract.methods
      .transfer(beneficiary, amount)
      .send({ gas: 200000, from: fromAddress })
    return result
  }

  async function transfer (beneficiary, amount, symbol) {
    if (symbol === 'ETH') {
      return _transferETH(beneficiary, amount)
    } else if (symbol === 'PTI') {
      return _transferPTI(beneficiary, amount)
    }
  }

  async function diagnose () {
    // return an array of strings with diagnostic info
    let msg, address, msgs
    msgs = []
    function log (msg) {
      msgs.push(msg)
    }
    log('Paratii was initialized with the following options:')
    log(config)
    address = getRegistryAddress()
    log('checking deployed code of Registry...')
    msg = await web3.eth.getCode(address)
    if (msg === '0x') {
      log(`ERROR: no code was found on the registry address ${address}`)
      log(msg)
    } else {
      log('... seems ok...')
      // log(`We found the following code on the registry address ${address}`)
      // log(msg)
    }
    log('checking for addresses')
    let registry = await getContract('ParatiiRegistry')
    for (let i = 0; i < contractNames.length; i++) {
      let name = contractNames[i]
      if (name !== 'ParatiiRegistry') {
        address = await registry.methods.getContract(name).call()
        log(`address of ${name}: ${address}`)
      }
      // contracts[contractNames[i]] = await getContract(contractNames[i])
    }
    log('thats it!')
    return msgs
  }

  return {
    config,
    diagnose,
    eth: {
      deployContracts,
      balanceOf,
      getContract,
      getContracts,
      getContractAddress,
      // getOrDeployContracts,
      getRegistryAddress,
      transfer
    },
    init,
    web3
  }
}

export { Paratii, utils }
