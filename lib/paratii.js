const dopts = require('default-options')
const Web3 = require('web3')

/**
 * Paratii Library
 * for usage, see https://github.com/Paratii-Video/paratii-contracts/tree/master/docs
 *
 */

const Paratii = function (opts) {
  let PARATIIREGISTRYADDRESS
  let CONTRACTS
  let account // the account that will be the sender of all transactions
  let options // options for the Paratii object
  let web3

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
    options = dopts(opts, defaults)

    web3 = new Web3()
    web3.setProvider(new web3.providers.HttpProvider(options.provider))

    if (!options.account) {
      // this is the first account generated with testprc/ganache using the --deterministic flag
      // we use it here as default, but probably should not..
      account = {
        address: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
        privateKey: '4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d'
      }
      web3.eth.accounts.wallet.add(account.privateKey)
    } else {
      account = {
        address: options.account
      }
      web3.eth.accounts.wallet.add(options.privateKey)
    }

    PARATIIREGISTRYADDRESS = opts.registryAddress
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

    let result = {
      ParatiiAvatar: paratiiAvatar,
      ParatiiRegistry: paratiiRegistry,
      ParatiiToken: paratiiToken,
      SendEther: sendEther,
      UserRegistry: userRegistry,
      VideoRegistry: videoRegistry,
      VideoStore: videoStore
    }

    return result
  }

  async function getContract (name) {
    let contractInfo = CONTRACTS[name]
    if (!contractInfo) {
      throw Error(`No contract with name "${name}" is known`)
    }
    let address = await getContractAddress(name)
    if (address) {
      const contract = contractInfo.contract
      contract.options.address = address
      return contract
    }
  }

  // TODO: optimization: do not ask the contract addresses from the registry each time, only on startup/first access
  async function getContractAddress (name) {
    if (name === 'ParatiiRegistry') {
      return getRegistryAddress()
    }
    try {
      let registry = await getContract('ParatiiRegistry')
      let address = await registry.methods.getContract(name).call({
        from: account.address
      })
      return address
    } catch (err) {
      console.log(err)
      throw err
    }
  }

  async function getParatiiContracts () {
    let contracts = {}
    for (let i = 0; i < CONTRACTS.length; i++) {
      contracts[contractNames[i]] = await getContract(contractNames[i])
    }
    return contracts
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

  async function getOrDeployContracts () {
    // get the paratii contracts if a registryaddress is known, otherwise deploy them
    let contracts
    if (PARATIIREGISTRYADDRESS) {
      contracts = await getParatiiContracts()
    } else {
      console.log('deploying new contracts')
      contracts = await deployContracts()
      console.log('setting registry address')
      PARATIIREGISTRYADDRESS = contracts['ParatiiRegistry'].address
    }
    return contracts
  }

  async function diagnose () {
    // print some info and try to find imperfections...
    let msg, address
    function log (msg) { console.log(msg) }
    log('Paratii was initialized with the following options:')
    log(options)
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
  }

  return {
    diagnose,
    deployContract,
    deployContracts,
    getContract,
    getContractAddress,
    getOrDeployContracts,
    getRegistryAddress,
    init,
    web3
  }
}

export { Paratii }
