
export function add0x (input) {
  if (typeof (input) !== 'string') {
    return input
  } else if (input.length < 2 || input.slice(0, 2) !== '0x') {
    return `0x${input}`
  }
  return input
}

// // some utility functions
// export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'
// export const NULL_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000'
//
// export function getInfoFromLogs (tx, arg, eventName, index = 0) {
//   // tx.logs look like this:
//   //
//   // [ { logIndex: 13,
//   //     transactionIndex: 0,
//   //     transactionHash: '0x999e51b4124371412924d73b60a0ae1008462eb367db45f8452b134e5a8d56c8',
//   //     blockHash: '0xe35f7c374475a6933a500f48d4dfe5dce5b3072ad316f64fbf830728c6fe6fc9',
//   //     blockNumber: 294,
//   //     address: '0xd6a2a42b97ba20ee8655a80a842c2a723d7d488d',
//   //     type: 'mined',
//   //     event: 'NewOrg',
//   //     args: { _avatar: '0xcc05f0cde8c3e4b6c41c9b963031829496107bbb' } } ]
//   //
//   // if (eventName) {
//   //   for (let i=0; i < tx.logs.length; i++) {
//   //     if
//   //   }
//   // }
//   if (eventName !== undefined) {
//     for (let i = 0; i < tx.logs.length; i++) {
//       if (tx.logs[i].event === eventName) {
//         index = i
//         break
//       }
//     }
//     if (index === undefined) {
//       let msg = `There is no event logged with eventName ${eventName}`
//       throw msg
//     }
//   } else {
//     if (index === undefined) {
//       index = tx.logs.length - 1
//     }
//   }
//   if (tx.logs[index] === undefined) {
//     throw Error(`No log with index ${index} found in ${tx.logs}`)
//   }
//   let result = tx.logs[index].args[arg]
//   if (result === undefined) {
//     let msg = `This log does not seem to have a field "${arg}": ${tx.logs[index].args}`
//     throw Error(msg)
//   }
//   return result
// }
//
// /**
//  * side-effect is to set web3.eth.defaultAccount.
//  * throws an exception on failure.
//  */
// let alreadyTriedAndFailed
//
// export function getDefaultAccount () {
//   let defaultAccount
//
//   try {
//     if (typeof window === 'undefined') {
//       defaultAccount = web3.eth.defaultAccount = web3.eth.defaultAccount || web3.eth.accounts[0]
//     } else {
//       if (_web3 && !alreadyTriedAndFailed) {
//         defaultAccount = _web3.eth.defaultAccount = _web3.eth.accounts[0]
//       } else {
//         throw new Error('web3 is not available.  getWeb3() has not been called or else it failed.')
//       }
//     }
//
//     if (!defaultAccount) {
//       alreadyTriedAndFailed = true
//       throw new Error('eth.accounts[0] is not set')
//     }
//   } catch (ex) {
//     alreadyTriedAndFailed = true
//     throw new Error(`No default account found: ${ex}`)
//   }
//
//   // TODO: this should be the default sender account that signs the transactions
//   return defaultAccount
// }
//
// const TruffleContract = require('truffle-contract')
//
// /**
//  * Returns TruffleContract given the name of the contract.
//  *
//  * When testing or migrating, uses .sol
//  * Elsewhere (development, production), uses migrated .json
//  *
//  * Side effect:  It initializes (and uses) `web3` if a global `web3` is not already present, which
//  * happens when running in the context of an application (as opposed to tests or migration).
//  *
//  * @param contractName
//  */
// export function requireContract (contractName) {
//   if (typeof artifacts === 'object') {
//     return artifacts.require(`./${contractName}.sol`)
//   } else {
//     try {
//       let myWeb3 = getWeb3()
//
//       const artifact = require(`../build/contracts/${contractName}.json`)
//       const contract = new TruffleContract(artifact)
//
//       contract.setProvider(myWeb3.currentProvider)
//       // contract.defaults({
//       //   from: getDefaultAccount(),
//       //   gas: 0x455510
//       // })
//       return contract
//     } catch (ex) {
//       throw ex
//     }
//   }
// }
//
// var _web3
//
// /**
//  * throws an exception when web3 cannot be initialized or there is no default client
//  */
// export function getWeb3 () {
//   let web3 = require('./web3.js').web3
//   return web3
//   // if (typeof window === 'undefined') {
//   //   return web3 // assume is set by truffle in test and migration environments
//   // } else if (_web3) {
//   //   return _web3
//   // } else if (alreadyTriedAndFailed) {
//   //   // then avoid time-consuming and futile retry
//   //   throw new Error('already tried and failed')
//   // }
//   //
//   // var preWeb3
//   //
//   //   // already defined under `window`?
//   // var windowWeb3 = window.web3
//   //
//   // if (windowWeb3) {
//   //       // console.log(`Connecting via currentProvider`)
//   //   preWeb3 = new Web3(windowWeb3.currentProvider)
//   // } else {
//   //       // console.log(`Connecting via http://localhost:8545`)
//   //   preWeb3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
//   // }
//   //
//   // if (!preWeb3) {
//   //   alreadyTriedAndFailed = true
//   //   throw new Error('web3 not found')
//   // }
//   //
//   // return _web3 = preWeb3
// }
//
//     /**
//      * @param tx The transaction
//      * @param argName The name of the property whose value we wish to return, from  the args object: tx.logs[index].args[argName]
//      * @param eventName Overrides index, identifies which log, where tx.logs[n].event  === eventName
//      * @param index Identifies which log, when eventName is not given
//      */
// export function getValueFromLogs (tx, arg, eventName, index = 0) {
//   // tx.logs look like this:
//   //
//   // [ { logIndex: 13,
//   //     transactionIndex: 0,
//   //     transactionHash: '0x999e51b4124371412924d73b60a0ae1008462eb367db45f8452b134e5a8d56c8',
//   //     blockHash: '0xe35f7c374475a6933a500f48d4dfe5dce5b3072ad316f64fbf830728c6fe6fc9',
//   //     blockNumber: 294,
//   //     address: '0xd6a2a42b97ba20ee8655a80a842c2a723d7d488d',
//   //     type: 'mined',
//   //     event: 'NewOrg',
//   //     args: { _avatar: '0xcc05f0cde8c3e4b6c41c9b963031829496107bbb' } } ]
//   //
//   // if (eventName) {
//   //   for (let i=0; i < tx.logs.length; i++) {
//   //     if
//   //   }
//   // }
//   if (eventName !== undefined) {
//     for (let i = 0; i < tx.logs.length; i++) {
//       if (tx.logs[i].event === eventName) {
//         index = i
//         break
//       }
//     }
//     if (index === undefined) {
//       let msg = `There is no event logged with eventName ${eventName}`
//       throw msg
//     }
//   } else {
//     if (index === undefined) {
//       index = tx.logs.length - 1
//     }
//   }
//   if (index === -1) {
//     throw Error('This transaction has no logs')
//   }
//   let result = tx.logs[index].args[arg]
//   if (!result) {
//     let msg = `This log does not seem to have a field "${arg}": ${tx.logs[index].args}`
//     throw msg
//   }
//   return result
// }
//
// export const ExtendTruffleContract = (superclass) => class {
//   constructor (contract) {
//     this.contract = contract
//     for (var i in this.contract) {
//       if (this[i] === undefined) {
//         this[i] = this.contract[i]
//       }
//     }
//     // for (var prop in this.contract) {
//     //   if (!this.hasOwnProperty(prop)) {
//     //     this[prop] = superclass[prop];
//     //   }
//     // }
//   }
//
//   static async new () {
//     let contract = await superclass.new()
//     return new this(contract)
//   }
//
//   static async at (address) {
//     return new this((await superclass.at(address)))
//   }
//
//   static async deployed () {
//     return new this(await superclass.deployed())
//   }
//
//   /**
//    * Call setParameters on this scheme.
//    * Returns promise of parameters hash.
//    * If there are any parameters, then this function must be overridden by the subclass to provide them.
//    * @param overrides -- object with properties whose names are expected by the scheme to correspond to parameters.  Overrides the defaults.
//    *
//    * Should have the following properties:
//    *
//    *  for all:
//    *    voteParametersHash
//    *    votingMachine -- address
//    *
//    *  for SimpleContributionScheme:
//    *    orgNativeTokenFee -- number
//    *    schemeNativeTokenFee -- number
//    */
//   // eslint-disable-next-line no-unused-vars
//   async setParams (params) {
//     return ''
//   }
//
//   async _setParameters () {
//     const parametersHash = await this.contract.getParametersHash(...arguments)
//     await this.contract.setParameters(...arguments)
//     return parametersHash
//   }
//
//   /**
//    * The subclass must override this for there to be any permissions at all, unless caller provides a value.
//    */
//   getDefaultPermissions (overrideValue) {
//     return overrideValue || '0x00000000'
//   }
// }
