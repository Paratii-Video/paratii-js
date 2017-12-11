# Paratii Library documentation

## `paratii.eth`

The `eth` namespace contains functions to interact with the Ethereum blockchain and the Paratii contracts deployed there.


## `paratii.eth.web3`

The web3 object used by this paratii instance.

### `eth.contracts`

The `paratii.eth.contracts` attribute of gives access to the different contracts, and returns an array mapping contract names to addresses. For example

    paratii.eth.contracts.ParatiiToken

## `eth.wallet`

Functions having to do with wallet and storage

### `eth.balanceOf(account, symbol)`

When called with a second argument, returns the balance of that Token:

    eth.balanceOf(0x1245, 'ETH') // returns the ETH balance of the given address
    eth.balanceOf(0x1245, 'PTI') // returns the PTI balance of the given address

When called without an argument, returns information about all relevant balances

    eth.balanceOf(0x1245) // returns an array of all balances of 0x1245
    // {
    //    PTI: 12300000002144,
    //    ETH: 0,
    // }


 ### `eth.transfer(beneficiary, amount, symbol)`

_? perhaps this should be `personal.transfer(...)` instead of `eth.transfer(...)` as it uses the personal account as the sender?_


Use this to send ETH or PTI


Transfer the given amount of ETH to the benificiary. Uses the `SendEther` contract to send ether and log an event:

## `eth.vids`

The `eth.vids` namespace contains functions to interact with the video registration on the blockchain

### `eth.vids.register()`
### `eth.vids.get()`
### `eth.vids.unregister()`

## `eth.users`

The `eth.user` namespace contains functions to interact with the video registration on the blockchain

### `eth.users.register()`
### `eth.users.get()`
### `eth.users.unregister()`


## `eth.store`

Functions for buying and selling


## `eth.bank`

Functions for lending money

## "Admin function"

[We may want to move these to a separate name space]

### `eth.deployContracts()`

This function will deploy are contracts and link them to the

    contracts = await paratii.eth.deployAllContracts()

    contracts = await paratii.eth.deployAllContracts({owner: '0x1234435'})
