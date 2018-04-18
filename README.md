<img src="https://i.imgur.com/rH3YYYX.png" width="200">

[![CircleCI](https://circleci.com/gh/Paratii-Video/paratii-js.svg?style=svg)](https://circleci.com/gh/Paratii-Video/paratii-js)

`paratii.js` is the main entry point and abstraction layer to interact with Paratii, a decentralized platform for video distribution.

More information about the Paratii Project can be found on [paratii.video](http://paratii.video/), or in our [blueprint](https://github.com/Paratii-Video/paratii-player/wiki/Paratii-Blueprint). Join the discussion on [gitter](https://gitter.im/Paratii-Video).

## Installation

You can install `paratii-js` from npmjs.org using:

    npm install paratii-js


## How to use it

Here is a code snippet which will upload a video to Paratii and transcode it:

    // import the Paratii object
    const Paratii  = require('paratii-js')
    // create a new instance of Paratii with default values
    const paratii = new Paratii()

    // where is your video?
    const YOURVID = '/path/to/video.mp4'

    // go and add the video
    paratii.vids.uploadAndTranscode({
      file: YOURVID,
      title: 'Paratii for fun and profit'
      })

We have more extensive documentation on [https://docs.paratii.video](https://docs.paratii.video)

## Contributing to `paratii.js`

Contributions are most welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md)
