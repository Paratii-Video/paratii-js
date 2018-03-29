
# Paratii Library

The Paratii library is used for interacting with the Paratii ecosystem: it is used to read and write data to the Ethereum blockchain, starting and stopping a local IPFS node and interacting with other IPFS peers, query-ing the Paratii index, etc.

The `paratii-lib` is meant to be usable both for developing browser clients (such as the `paratii-portal`) (we wil provide a webpacked'ed version for this purpose) as well is in nodejs-based applications (such as `paratii-db`)


## Connecting to the Ethereum blockchain

Typically, the Paratii library will be used for interacting with contracts that are already deployed on the blockchain.

For this purpose, the paratii library must be initialized with the URL of an Ethereum node (the `provider`) and the address of the `ParatiiRegistry` contract (the `registry` parameter). The registry contract identifies addresses of all the other contracts on the Paratii blockchain (and sets some other parameters).

    Paratii({
      'eth.provider': 'http://chain.paratii.video/rpc',
      registry: '0x123455',
    })

This is enough info to _read_ information from the blockchain.
To also write information (for example, to register views), the library needs to know which ethereum address will be used to send the transactions, and how to cryptographically sign those transactions. The library can either sign transactions directly with an optionally provided `privateKey`, or it can use a wallet file to sign those transactions:

    Paratii({
      address: '0x12yourEthereumAddress',
      privateKey: 'privateKeyAssociatedwiththisADdress'
    })

Providing the private Key is optional - for example, typically, when used in a browser, the library will use a wallet file from `localStorage` to sign the transactions.

The `address` plays a crucial role for the paratii library. It is used for authentication on the blockchain, but also for identifying the node in the IPFS network, and for authentication with the `paratii-db` service.


[.. you now have an eth account but no money... ]

## Interacting with your local ipfs instance

[... describe config ]

## Installation

In your nodejs project, you can add the library using

    yarn add github:Paratii-Video/paratii-lib


## Example Session

[next examples are not all working yet - they are being developed in
[test/lib/example-session.js](../../mocha-test/lib/example-session.js)
]

The following examples are meant to be run on the test net:

    import { Paratii } from 'paratii-lib';

Create an instance of 'Paratii'

    paratii = new Paratii()

Normally, you would interact with the Paratii contracts that are already deployed on the blockchain.
But given that we are on a local test-node, we first need to deploy the contracts ourselves:


    contracts = await paratii.eth.deployContracts()

At this point, all Paratii contracts will be available in `contracts`, under their class names.

    contracts.ParatiiToken

Or, equivalently:

    paratii.eth.getContract('ParatiiToken')

 A fresh  `ParatiiToken` contract will have been deployed. Because you deployed it, you will have all the tokens:

    await contracts.ParatiiToken.balanceOf(yourAddress)

should return a number starting with 21 and followed by many zeros.

We can register a new user on the Users:

    await paratii.core.users.create({
      id: '0x12455', // must be a valid Ethereum address
      name: 'Marvin Pontiac',
      email: 'john@lurie.com'
    })

And check if the name is correctly registered.

    (await paratii.core.users.get('0x12455')).name

We can also register a video:

    await paratii.core.videos.create({
      id: '31415', // id of the video
      owner: '0x123455', // address of the video owner
      price: 27182, // price (in PTI "wei")
    })

And read the video information back from the blockchain:

    await paratii.core.videos.get('31415')

We are now ready to buy a video (if you have anough PTI)

    await paratii.core.store.buyVideo('31415')

The `buyVideo` call will check the preconditions (whether the sender has enough ETH and PTI to do the transaction, if the video exists and is for sale) and throw meaningful errors if the preconditions are not met. If indeed the preconditions are met, the function will then initiate a series of transactions on the blockchain to actually acquire the video. If the operation is successful, we can do

    await paratii.core.isAcquired('31415')

to check if we have acquired the video.

This example is tested in
[test/lib/example-session.js](../../test/lib/example-session.js), you can run it

    yarn test test/lib/example-session.js
