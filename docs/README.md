# The Paratii Library




The Paratii javascript library is the preferred way for clients to interact with the deployed contracts on the blockchain.  It offers access to the contracts, and convenience functions that provide more useful error handling that making direct calls to the blockchain can offer. It also offers wallet functionality.

It is still very much under development, and most of the things in this documentation are not implemented yet

## Usage

* [Quick Introduction and example](example-session.md)

## Organization

The paratii library is divided into the following modules:

* [`paratii.core`](./paratii-core.md) for methods that operate transversally over different submodules.
* [`paratii.config`](./paratii-config.md) configuration of the paratii object
* [`paratii.eth`](./paratii-eth.md) for interaction with the blockchain
* [`paratii.ipfs`](./paratii-ipfs.md) for interaction with IPFS
* [`paratii.db`](./paratii-db.md) for interaction with the Paratii blockchain index


See [example-session.md](./example-session.md) and [api.md](./api.md) for more information.
