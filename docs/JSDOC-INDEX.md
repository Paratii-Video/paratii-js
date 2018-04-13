# `paratii.js`: the Paratii Library

The Paratii javascript library is the place where developers can interact with the [Paratii platform](https://paratii.video/). It providers functions for writing information about vidoes and ownership to the Ethereum blockchain, share and upload videos over IPFS, requesting and receiving the result of transcoding jobs, and access to a blockchain index that allows for access and search of video information.

All this is very much work in progress. Please be patient.

## Organization

The paratii.js is divided into the following modules:

* [`paratii`](./Paratii.html) is the main access point, which is used for configuration and for accessing all submodules.
* [`paratii.vids`](./ParatiiCoreVids.html) has functions for registering video information on the blockchain, as well as information about likes and views.
* [`paratii.users`](./ParatiiCoreUsers.html)  allows to write basic user information to the blockchain

For more advantage usage, developers may be interested in the following modules:

* [`paratii.eth`](./ParatiiEh.html) to interact with the Paratii contracts on the Ethereum blockchain
* [`paratii.ipfs`](./ParatiiIPFS.html) for interaction with IPFS
* [`paratii.db`](./ParatiiDb.html) for interaction with the Paratii blockchain index

# Usage

## Using `paratii.js` in the browser

See this [Demo Application](https://github.com/geckoslair/ParatiiJSDemo)

## Using  `paratii.js` in your nodejs application

We intend to provide the package on `npmjs.org` for easy download once it is in a more stable version. Until that time, you can add the the package as a dependency in your `package.json`. If you use yarn, the command is:

    yarn add github:Paratii-Video/paratii-js

# Documentation  

Methods and configuration are documented on this site - a good place to start is  [https:/docs.paratii.video/Paratii.html](https://docs.paratii.video/Paratii.html).
More discursive documentation can be found in the repository on [https://github.com/Paratii-Video/paratii-js](https://github.com/Paratii-Video/paratii-js/blob/dev/README.md)
