
# Paratii Library

Work in progress.  



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

We can now deploy the paratii contracts:

    contracts = await paratii.eth.deployAllContracts()

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
