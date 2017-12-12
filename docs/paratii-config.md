# Paratii Library documentation


## The Paratii Object

### importing


    import { Paratii } from 'paratii-contracts';

Or, if ES6 is not available:

    Paratii = require('paratii-contracts').Paratii


### initialization

The Paratii object serves as the general entry point for interacting with the family of Paratii contracts that are deployed on the blockchain. It can be initialized in several ways. Here is an example:

    paratii =  new Paratii() // connect to the default node (http://localhost:8754)

  Or with particular options, such as the following:

    paratii = new Paratii({
      provider: 'chain.paratii.video', // optional - the address of an ethereum node (defaults to localhost:8754)
      registry: '0x23445abcdefg', // optional - the address where the Paratii Contract registry can be found
      address: '0x12455', // address of the operator/user
      privatekey: '...', // optional - private key of the user
      wallet: walletObject, // optional, a (possibly password-locked) wallet object [?]
    })

TBD: #7

### `config`

TBD: see issue #6

`config` holds the configuration of the paratii object:

    paratii.config // returns { 'provider': 'http:/...', ''}


### `web3`

`paratii.web3` exposts the web3 library
