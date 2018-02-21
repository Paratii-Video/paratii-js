# Paratii Library documentation

## `paratii.eth`

The `eth` namespace contains functions to interact with the Ethereum blockchain and the Paratii contracts deployed there.


## `paratii.eth.web3`

The web3 object used.

### `eth.getContract(contractName)`

The `paratii.eth.getContract` attribute of gives access to the different contracts, and returns an array mapping contract names to addresses. For example

    paratii.eth.getContract('ParatiiToken')
    paratii.eth.getContract('Registry')

### `eth.getContractAddress(contractName)`


### `eth.getContracts()`

Returns all contracts


## `eth.wallet`

Functions having to do with wallet and storage. These implement (and are mostly identical) to the `web3.eth.accounts.wallet` functions that are described here: http://web3js.readthedocs.io/en/1.0/web3-eth-accounts.html#wallet, except that we added support for BIP32/39 mnemonic seed phrases

## `eth.wallet.create([numberOfAccounts, mnemonic])`

Create a wallet with a given number of accounts from a BIP32/BIP39 seedPhrase

    let mnemonic =  "jelly better achieve collect unaware mountain thought cargo oxygen act hood bridge",
    let wallet = await eth.wallet.create(2, mnemonic) // create a wallet with 2 accounts

The default value of `numberOfAccounts` is `1`. If the `mnemonic` argument is not given, a new mnemonic will be generated:

    let wallet = await eth.wallet.create()
    console.log(wallet.getMnemonic()) // log the generated mnemonic phrase

The call to `wallet.create` will fail if the wallet already contains an account. In that case, you should clear the wallet explicitly using `wallet.clear()`


## `eth.wallet.clear`

http://web3js.readthedocs.io/en/1.0/web3-eth-accounts.html#wallet-clear

## `eth.wallet.encrypt([password])`

Encrypts all wallet accounts to and array of encrypted keystore v3 objects. *This does not include the seedPhrase*


## `eth.wallet.decrypt([password])`

## `eth.wallet.save(password, [keyname])`

_not implemented

Saves both encrypted v3 objects as well as the seed phrase in local storage

## `eth.wallet.load(password, [keyname])`

_not implemented_

Load both encrypted v3 objects as well as the seed phrase from local storage

## `eth.wallet.newMnemonic()`

Generate a random new mnemomic.

    let m = eth.wallet.newMnemonic()
    let wallet = await eth.wallet.create(2, m)

## `eth.wallet.getMnemonic()`

Return the mnemonic that was used to generated this wallet (or `undefined` if no such value exists).


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

Use this to send ETH or PTI from `paratii.config.address`:

    eth.transfer('0x123', 2e18, 'PTI')

Transfer the given amount of ETH to the benificiary. Uses the `SendEther` contract to send ether and log an event

## `eth.vids`

The `eth.vids` namespace contains functions to interact with the video registration on the blockchain.
**Typically, if you are a developer that is not interested in the inner workings of Paratii, you would use the functions in [[paratii-core.md]]**

### `eth.vids.create()`

    let videoId = await paratii.eth.vids.create({
      id: '0x12355',
      price: price,
      owner: address1,
      ipfsHash: ipfsHash
    })

### `eth.vids.get()`

    eth.vids.get('0x12345')
    // returns:
    // { id: '0x12355',
    //   owner: '0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0',
    //   price: '3000000000000000000',
    //   ipfsHash: undefined }

### `eth.vids.update()`

    let videoId = await paratii.eth.vids.update(videoId, { ipfsHash: '' })

### `eth.vids.delete()`

## `eth.users`

The `eth.user` namespace contains functions to interact with the video registration on the blockchain.

### `eth.users.create(options)`

Creates a user. Takes one argument, options, that is an object of the following keys:

 - id
 - name
 - email
 - ipfsData

If the ID is not a valid address, it will throw an error, otherwise it will save the user on the blockchain and return the ID.

### `eth.users.update(options)`

Updates a user on the blockchain. Takes one argument, options, which is an object that contains the data to be written to the new user. Left-out data is kept the same. Returns the full user object.


### `eth.users.get(userId)`

Get a users details from the blockchain. Returns an object with the following keys:

 - id
 - name
 - email
 - ipfsData

### `eth.users.delete(userId)`

Deletes a user from the blockchain. Can only be called by the contract owner or the user him/her-self. Returns a transaction.

## `eth.store`

Functions for buying and selling. TBD


## `eth.bank`

Functions for lending money. Completely TBD

## `eth.vouchers`

Functions for redeeming vouchers.

### `eth.vouchers.redeem(voucherCode)`

Function for redeeming a voucher to the current account's address. Takes only one parameter, `voucherCode`, and returns a promise that resolves to a boolean if the transfer is successful or not, and if there are any problems it tries to guess the reason and throws an Error.

Possible errors:

 - This voucher doesn't exist
 - This voucher was already used
 - The Vouchers contract doesn't have enough PTI to redeem the voucher
 - An unknown error occurred
 
### `eth.vouchers.create(data)`

Function for creating a voucher. Can only be called by the owner of the contract. Takes a single parameter, data, which is an object containing `voucherCode`, which is a unique string that is the actual voucher's code, and amount, which is the amount of PTI in Wei that the voucher will net the redeeming user.

Returns a promised voucherId, or throws an Error, mostly when there are issues with parameters, like amount is 0, or voucherCode isn't a string, etc...

## "Admin function"

[We may want to move these to a separate name space]

### `eth.deployContracts()`

This function will deploy are contracts and link them to the

    contracts = await paratii.eth.deployContracts()

    contracts = await paratii.eth.deployContracts({owner: '0x1234435'})

### `eth.vouchers.createVouchers(number, amount)`

Generates a given number of vouchers with unique IDs, and the given amount, and returns an array of objects. Takes two parameters, the number of vouchers to create, and the amount of PTI to value each voucher at.

i.e.
	
	[{ voucherCode: 'aaaa', amount: 1 }, { voucherCode: 'bbbb', amount: 1 }]
	
## `eth.events`

`eth.events` implements a part of the API of the EventEmitter, that can be used to manage subscriptions to Ethereum events.



    eth.events.on('LogAddVideo', listener)
    eth.events.on('LogAddVideoChanged', listener)
    eth.events.on('LogAddVideoError', listener)
    eth.events.on('TransferPTI', listener)
    eth.events.on('TransferETH', listener)


    eth.events.once('LogAddVideo', listener)

    eth.events.removeListener('LogAddVideo', listener)

The web3js  subscriptions are available as well:

    eth.events.on('newBlockHeaders', listener)
    eth.events.on('newBlockHeadersError', listener)
    eth.events.on('pendingTransactions', listener)
    eth.events.on('pendingTransactionsError', listener)
    eth.events.on('syncing', listener)
    eth.events.on('syncingError', listener)
    eth.events.on('syncingChanged', listener)
