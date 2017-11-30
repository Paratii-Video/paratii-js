# Overview of the Paratii contracts and library


## contracts

* `ParatiiRegistry` is a contract in which addresses of the paratii ecosystem are registered. It is the main entrypoint to the system. It is here where clients first go to find out where the other contracts are deployed.
* `ParatiiToken` the PTI ERC20 token
* `ParatiiAvatar` this is the "account" of the Paratii organization. This contract can own and transfer tokens, and is controlled by a number of whitelisted addresses.
* `UserRegistry`, `VideoRegistry`: contracts where information of users and videos is stored and updated
* `VideoStore`:  a contract through which access to videos can be bought


## library

The Paratii javascript library is the preferred way for clients to interact with the deployed contracts on the blockchain.  It offers access to the contracts, and convenience functions that provide more useful error handling that making direct calls to the blockchain can offer. It also offers wallet functionality.

It is still under development.

In the future, the library will also offer access to IPFS and other aspects of the Paratii ecosystem

See [example-session.md](./example-session.md) and [details.md](./details.md) for more information.
