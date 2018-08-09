[![CircleCI](https://circleci.com/gh/Paratii-Video/paratii-js.svg?style=svg)](https://circleci.com/gh/Paratii-Video/paratii-js)

<img align="center" src="https://i.imgur.com/iBoFbb2.png" height="250px" />

`paratii.js` is a Javascript library and a toolbox to build decentralized video-powered web applications. At it core, you can use to **put** a video stream and **get** a playable url for it. It will get ingested, stored, transcoded and distributed behind the scenes. The goal (although we are not there yet) is to do this all through non-centralised means. It has early functionalities for **handling tokens** too, meaning one ll soon be able to use it to set monetisation models for videos, collect earnings, participate in curation, and else. The library also has an interface for interacting with **Token Curated Registries** for curating list of videos.

`paratii.js` is the engine behind the [Paratii Portal](https://portal.paratii.video). It is a work in progress, built in function of the needs of the Paratii project.

Documentation on `paratii.js` can be found [here](https://docs.paratii.video/).

More information about the Paratii Project can be found on [paratii.video](http://paratii.video/), or in our [blueprint](https://github.com/Paratii-Video/paratii-player/wiki/Paratii-Blueprint). Join the discussion on [gitter](https://gitter.im/Paratii-Video).

## Installation

You can install `paratii-js` from npmjs.org using:

    npm install paratii-js


## How to use it

Here is a code snippet which will upload a video to Paratii and transcode it:

```javascript
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
```

## Where to find more documentation

There is extensive documentation on [https://docs.paratii.video](https://docs.paratii.video)

## Contributing to `paratii.js`

Contributions are most welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md)
