# Paratii Library documentation

## paratii.eth



### `eth.deployContracts()`

This function will deploy are contracts and link them to the

  contracts = await paratii.eth.deployAllContracts()

  contracts = await paratii.eth.deployAllContracts({owner: '0x1234435'})

### `eth.contracts`

The `paratii.eth.contracts` attribute of gives access to the different contracts, and returns an array mapping contract names to addresses. For example

  paratii.eth.contracts.ParatiiToken

### `eth.sendETH(beneficiary, amount)`

_? perhaps this should be `personal.sendETH` as it uses the personal account as the sender?_
Uses the `SendEther` contract to send ether and  log an event

* TBD: https://github.com/Paratii-Video/paratii-lib/issues/15
* TBD: https://github.com/Paratii-Video/paratii-lib/issues/16

### `eth.sendPTI(beneficiary, amount)`

_? perhaps this should be `personal.sendETH` as it uses the personal account as the sender?_

Uses the `ParatiiToken` contract to send ether and  log an event

* TBD: https://github.com/Paratii-Video/paratii-lib/issues/16


### `eth.getBalance()`

When called with a second argument, returns the balance of that Token:

  `eth.getBalance(0x1245, 'ETH')` // returns the ETH balance of the given address
  `eth.getBalance(0x1245, 'PTI')` // returns the PTI balance of the given address

When called without an argument, returns information about all relevant balances

   `eth.getBalance(0x1245)`
   // returns an array of all balances of 0x1245 that are relevant for PTI
   // {
   //    PTI: 12300000002144,
   //    ETH: 0,
   // }


##  `eth.contracts.ParatiiRegistry`k

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
