# Paratii Library documentation



### `personal.account`

If the paratii object has been initialized with a `wallet` or `privateKey`, then `paratii.personal.account` returns information about the registered account 

    personal.account.address // returns the address of the account

TBD: issue #8

### `personal.setAccount(addressOrKeyOrWallet)`

    personal.setAccount('0x1234')
    personal.setAccount(privateKey)
    personal.setAccount('0x1234')

TBD: issue XXX

### `personal.getPTIBalance()`

TBD: issue #9

### `personal.getETHBalance()`

TBD: issue #10

## `personal.wallet`
### `personal.wallet.create(numberOfAccounts, seedPhrase)`
### `personal.wallet.encrypt()`
### `personal.wallet.decrypt(....)`
### `personal.wallet.mnemonic`
