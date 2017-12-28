# Paratii Library documentation



## importing


    import { Paratii } from 'paratii-contracts';

Or, if ES6 is not available:

    Paratii = require('paratii-contracts').Paratii


## initialization

The Paratii object serves as the general entry point for interacting with the family of Paratii contracts that are deployed on the blockchain. It can be initialized in several ways. Here is an example:

    paratii =  new Paratii() // connect to the default node (http://localhost:8754)

  Or with particular options, such as the following:

    paratii = new Paratii({
      provider: 'http://chain.paratii.video', // optional - the address of an ethereum node (defaults to localhost:8754)
      registry: '0x23445abcdefg', // optional - the address where the Paratii Contract registry can be found
      address: '0x12455', // address of the operator/user
      privatekey: '...', // optional - private key of the user
    })

Here are some settings:

##   `paratii.config.address`

This is the address of the account from which all transactions are sent to the blockchain. This address must be set before any functions that change the state of the blockchain are called. It can be set in initialization, or by called the function `paratii.setAccount(address)`

##   `paratii.config.privateKey`

The private key corresponding to the `address`. For signing transactions, either this value must be set, or there must be a corresponding wallet in `paratii.eth.web3.eth.accounts`. It can be set either on initialization, or by calling  `paratii.setAccount(address, privateKey)`

##   `paratii.config.regisry`

The address of a Paratii `Registry` contract on the blockchain. This contract knows where all other Paratii contracts are deployed, and stores general settings. Most interactions with the blockchain assume this setting is set. It can be set either on initialization, by calling the function `paratii.setRegistryAddress`. The function `paratii.eth.deployContracts` will also set this address as a side effect

### `config`

`config` holds the configuration of the paratii object:

    paratii.config // returns { 'provider': 'http:/...', ''}


## paratii.setAccount(address, [privateKey])  

Set the ethereum address what will be used to sign all transactions

## paratii.setRegistryAddress(address)

Set the address of the ParatiiRegistry contract
