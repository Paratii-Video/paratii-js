


The Paratii object serves as the general entry point for interacting with the family of Paratii contracts that are deployed on the blockchain, utilities to run and interact with a local IPFS node, and utilities to interact with the Paratii index.

This short tutorial shows you how to set up and use `paratii-js` in a node environment. We have some examples of using `paratii-js` directly in the browser as well.

## Initialization

The default export of the `paratii-js` module is the [Paratii class]('../Paratii.html')

    const { Paratii } = require('paratii-js')

It can be initialized in several ways. Here is an example:

    paratii =  new Paratii() // connect to the default node (http://localhost:8754) with default settings

  Or with particular options, such as the following:

    paratii = new Paratii({
      account: {
        address: '0xCbe4f07b343171ac37055B25a5266f48f6945b7d' // address of the operator/user
      },
      eth: {
        provider': 'http://chain.paratii.video', // the address of an Ethereum node
        registryAddress: '0x0d03db78f5D0a85B1aBB3eAcF77CECe27e6F623F', //  - the address where the Paratii Contract registry can be found
      }
    })

All settings are optional, and are documented [here](./global.html#ParatiiConfigSchema__anchor). The currently active configuration is avaiable at `paratii.config`.

## Find some cool videos

Your newly configured `paratii` object can read data from the blockchain. For example, you can search for videos about cats:

    let coolVideos = await paratii.vids.search({keyword: 'cats'})

Which will give you a list of videos with "cats" in the title or description. Or, alternatively, you can search for all videos associated with a given account:

    let myVideos = await paratii.vids.search({owner: '0xCbe4f07b343171ac37055B25a5266f48f6945b7d'})

This calls will give paginated set of results.

Other options of the search function are [documented here](ParatiiCoreVids.html#search__anchor).

## Set your base account

All operations on Paratii that change the state (such as uploading a video) require that you sign transactions with an Ethereum account. You can set the account being used (and the private key with which to sign the transactions) when constructing the Paratii object:

    paratii = new Paratii({
      account: {
        privateKey: '0x399b141d0cc2b863b2f514ffe53edc6afc9416d5899da4d9bd2350074c38f1c6' // address of the operator/user
      }
    })

Or, alternatively, you can change the account being used by passing the private key to the `setAccount` function:

    paratii.setAccount({privateKey: '0x399b141d0cc2b863b2f514ffe53edc6afc9416d5899da4d9bd2350074c38f1c6'})

If you want to create a new account, `paratii-js` includes a version of the wallet from (web3js)[http://web3js.readthedocs.io/en/1.0/web3-eth-accounts.html#wallet]:

    paratii.eth.wallet.create() // create a new account in the wallet
    paratii.getAccount() // returns the newly generated address


## Upload and transcode videos

The upload-and-transcode process has a number of steps - the video file needs to uploaded to the transcoding network, transcoded into different formats and sizes, the result saved in IPFS and made available to Paratii.

You might not want to bother with the complexity of this process, so we provide a convenience function, with an interface that is as simple as we could make it:

    let pathToYourFile = './some/file.mp4'
    let ev = paratii.vids.uploadAndTranscode(pathToYourFile)

This function will return immediately with an EventEmitter instance which will report about the progress (and eventual errors) in the process:

    ev.on('uploader:progress', function(hash, size, percent) { console.log(`upload progress: ${percent} %`))
    ev.on('transcoding:progress', function(hash, size, percent) { console.log(`upload progress: ${percent} %`))
    ev.on('transcoding:done', function(hash, transcoderResult) { console.log(`transcoding has finished!`))

For further information [see the docs](./ParatiiCoreVids.html#addAndTrancode__anchor)
