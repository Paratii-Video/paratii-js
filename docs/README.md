# The Paratii Library

The Paratii javascript library is the place where developers can interact with the [Paratii platform](https://paratii.video/)
It offers access to the contracts, and convenience functions that provide more useful error handling that making direct calls to the blockchain can offer. It also offers wallet functionality.

It is still very much under development, and most of the things in this documentation are not implemented yet

## Organization

The paratii library is divided into the following modules:

* [`paratii.core`](./paratii-core.md) for methods that operate transversally over different submodules.
* [`paratii.config`](./paratii-config.md) configuration of the paratii object
* [`paratii.eth`](./paratii-eth.md) for interaction with the blockchain
* [`paratii.ipfs`](./paratii-ipfs.md) for interaction with IPFS
* [`paratii.db`](./paratii-db.md) for interaction with the Paratii blockchain index

# Usage

* [Quick Introduction and example](example-session.md)

## Using  `paratii.js` in a browser

We do not this yet, but we will provide a compiled version of `paratii.js` that can be imported directly in the browser.

## Using  `paratii.js` in your nodejs application

We intend to provide the package on `npmjs.org` for easy download once it is in a more stable version. Until that time, you can add the the package as a dependency in your `package.json`. If you use yarn, the command is:

    yarn add github:Paratii-Video/paratii-lib

See [example-session.md](./example-session.md) and [api.md](./api.md) for more information.
