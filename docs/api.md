# Paratii Library documentation


## The Paratii Object

### importing


    import { Paratii } from 'paratii-contracts';

Or, if ES6 is not available:

    Paratii = require('paratii-contracts').Paratii


### initialization

The Paratii object serves as the general entry point for interacting with the family of Paratii contracts that are deployed on the blockchain. It can be initialized in several ways. Here is an example:

    paratii =  Paratii() // connect to the default node (http://localhost:8754)

  Or with particular options, such as the following:

    paratii = Paratii({
      provider: 'chain.paratii.video', // optional - the address of an ethereum node (defaults to localhost:8754)
      registry: '0x23445abcdefg', // optional - the address where the Paratii Contract registry can be found
      privatekey: '...', // optional - private key of the user
      wallet: walletObject, // optional, a (possibly password-locked) wallet object [?]
    })

TBD: #7

### `config`

TBD: see issue #6

`config` holds the configuration of the paratii object:

    paratii.config // returns { 'provider': 'http:/...', ''}


### `personal.address`

If the paratii object has been initialized with a `wallet` or `privateKey`, then `paratii.personal.address` returns the Ethereum address of the user

TBD: issue #8

### `personal.getPTIBalance()`

TBD: issue #9

### `personal.getETHBalance()`

TBD: issue #10

### `eth.deployAllContracts()`

This function will deploy are contracts and link them to the

  contracts = await paratii.deployAllContracts()

  contracts = await paratii.deployAllContracts({owner: '0x1234435'})

### `eth.contracts`

The `paratii.eth.contracts` attribute of gives access to the different contracts, and returns an array mapping contract names to addresses. For example

  paratii.eth.contracts.ParatiiToken

## ParatiiRegistry

The [ParatiiRegistry.sol](../contracts/paratii/ParatiiRegistry.sol) contract is a simple key-value store on the blockchain that holds Paratii general settings. In particular, this is the place where the addresses of the deployed Paratii contracts are stored.

For example, the following call will get the address of the `ParatiiToken` contract:

    let paratiiRegistery = paratii.contracts.ParatiiRegistry
    paratiiRegistry.getAddress('ParatiiToken')

The `ParatiiRegistry` is an `Ownable` contract, and contains simple setters and getters for several solidity types:

    ParatiiRegistry.setAddress('UserRegistry', '0x12345') // can only be called by the owner of the contract instance
    ParatiiRegistry.setUint('a-useful-constant', 99999)
    ParatiiRegistry.getUint('a-useful-constant') // will return 99999

## ParatiiToken

[ParatiiToken.sol](../contracts/paratii/ParatiiToken.sol) is an ERC20 token contract and contains the balances of all Paratii account holders.

    paratiToken.balanceOf('0x123') // will return the balance of the given address

## SendEther  

[SendEther.sol](../contracts/paratii/SendEther.sol) is a simple wrapper contract that can be used to send Ether, and will log an event so that the Paratii ecosystem can pick up on it.

## ParatiiAvatar

[ParatiiAvatar.sol](../contracts/paratii/ParatiiAvatar.sol) is a contract that can send and receive ETH and other ERC20 tokens. It is controlled by a number of whitelisted addresses.

    erc20Token = 0x12345667
    paratiiAvatar.transferFrom(erc20Token, fromAddress, toAddress, amount) // will fail because you are not whitelisted
    paratiiAvatar.addToWhitelist(0x22222222)
    paratiiAvatar.transferFrom(erc20Token, fromAddress, toAddress, amount, { from: 0x22222222}) // sender is 0x2222, whihc is in the whitelist
    paratiiAvatar.transfer(toAddress, amount) // transfer some ether to toAddress

## UserRegistry

A registry with information about users.

## VideoRegistry

[VideoRegistry.sol](../contracts/paratii/VideoRegistry.sol): contains information about videos: their IPFS hash, its owner, and the price. The idea is that this contract only contains essential information:  is that additional data (duration, license, descriptions, etc etc) can be stored in IPFS.

## VideoStore

The `VideoStore` is the place to buy Videos. Buying a video in the videostroe will register your purchase, and split the money your are sending between the owner of the video and the Paratii
[VideoStore.sol](../contracts/paratii/VideoStore.sol): The Videostore is the place where videos can be bought/sold. To do this, the user must initiate two transactions:

  * the client calls `ParatiiToken.approve(ParatiiAvatar.address, price_of_video)` to allows the paratiiAvatar to transfer the price_of_video. (For small transactions, this can be done transparently)
  * the client calls `VideoStore.buyVideo(videoId)`, triggering a number of steps:
    - the price of the video will be transfered to the paratiiAvatar
    - an event will be logged that the video is unlocked for this user
    - records the purchase of a video on within the `UserRegistry` allowing the new owner to like/dislike the video
    - a part of the price will be transfered (immediately?) to the owner, other goes tot he redistrubtion pool. (In the first iteration, we can give all money to thee owner)
