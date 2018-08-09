# `paratii.js`: the Paratii Library

# The Paratii Library

`paratii.js` is a Javascript library and a toolbox to build decentralized video-powered web applications. At it core, you can use to **put** a video stream and **get** a playable url for it. It will get ingested, stored, transcoded and distributed behind the scenes. The goal (although we are not there yet) is to do this all through non-centralised means. It has early functionalities for **handling tokens** too, meaning one ll soon be able to use it to set monetisation models for videos, collect earnings, participate in curation, and else. The library also has an interface for interacting with **Token Curated Registries** for curating list of videos.

`paratii.js` is the engine behind the [Paratii Portal](https://portal.paratii.video).

All this is very much work in progress. Please be patient.

## Organization

The paratii.js is divided into the following modules:

* [`paratii`](./Paratii.html) is the main access point, which is used for configuration and for accessing all submodules.
* [`paratii.vids`](./ParatiiVids.html) has functions for registering video information on the blockchain, as well as information about likes and views.
* [`paratii.users`](./ParatiiUsers.html)  allows to write basic user information to the blockchain

For more advanced usage, developers may be interested in the following modules:

* [`paratii.eth`](./ParatiiEth.html) to interact with the Paratii contracts on the Ethereum blockchain
* [`paratii.ipfs`](./ParatiiIPFS.html) for interaction with IPFS
* [`paratii.db`](./ParatiiDb.html) for interaction with the Paratii blockchain index
* [`paratii.transcoder`](./ParatiiTranscoder.html) for interaction with transcoding service
* [`paratii.vouchers`](./ParatiiEthVouchers.html) interact with a simple contract for distributing vouchers.
* [`paratii.eth.tcr`](./ParatiiEthTcr.html) interact the [Token Curated Registry contracts of Consensys](https://github.com/skmgoldin/tcr)

# Usage

We provide two ways of using the `paratii.js` library: there is a browser build that you can use directly in your web pages, or you can use `paratii.js` as a package in your nodejs application.

## Using  `paratii.js` in your nodejs application

The package is [available on npmjs](http://www.npmjs.com/package/paratii-js), and installing it is as easy as:

    npm install paratii-js

Or, if you like living on the edge, you can install the latest (instable) version directly from github:

    npm install github:Paratii-Video/paratii-js#dev

You can now `require('paratii-js')` in your code, and search for cats videos on the Paratii platform:

    const { Paratii } = require('paratii-js')
    const paratii = new Paratii()
    paratii.vids.search({keyword: 'cats'})


## Using `paratii.js` in the browser

We provide a webpacked minified version of the library that you can include directly in your browser.
The file to include lives in our github repository <https://raw.githubusercontent.com/Paratii-Video/paratii-js/dev/dist/paratii.min.js>


You can have a look at the [demo Application](https://github.com/Paratii-Video/ParatiiJSDemo) for examples on how to use this.

# Where to go next?

A good place to start is the [introductory tutorial](./tutorial-introduction.html)

Methods and configuration are documented separately under the "Classes" menu; a good place to start is [https:/docs.paratii.video/Paratii.html](https://docs.paratii.video/Paratii.html).


The library is in active development on our [github repository](https://github.com/Paratii-Video/paratii-js).
Contributions are most welcome. If you want to help developing `paratii-js`,
[here are instructions for contributors]( https://github.com/Paratii-Video/paratii-js/blob/dev/CONTRIBUTING.md)
