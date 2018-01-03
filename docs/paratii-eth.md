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

Saves both encrypted v3 objects as well as the seed phrase in local storage

## `eth.wallet.load(password, [keyname])`

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

The `eth.user` namespace contains functions to interact with the video registration on the blockchain. Mostly TBD.

### `eth.users.create()`

### `eth.users.update()`


### `eth.users.get()`
### `eth.users.delete()`


## `eth.store`

Functions for buying and selling. TBD


## `eth.bank`

Functions for lending money. Completely TBD

## "Admin function"

[We may want to move these to a separate name space]

### `eth.deployContracts()`

This function will deploy are contracts and link them to the

    contracts = await paratii.eth.deployContracts()

    contracts = await paratii.eth.deployContracts({owner: '0x1234435'})
