# paratii.js

[![CircleCI](https://circleci.com/gh/Paratii-Video/paratii-lib.svg?style=svg)](https://circleci.com/gh/Paratii-Video/paratii-lib)

`paratii.js` is the main entry point and abstraction layer to interact with the Paratii platform.


## Documentation

[documentation.md](./docs/README.md)


More information about the Paratii Project can be found on [paratii.video](http://paratii.video/), or in our [blueprint](https://github.com/Paratii-Video/paratii-player/wiki/Paratii-Blueprint). Join the discussion on [gitter](https://gitter.im/Paratii-Video).



## Using  `paratii.js` in a browser

We do not this yet, but we will provide a compiled version of `paratii.js` that can be imported directly in the browser.

## Using  `paratii.js` in your nodejs application

We intend to provide the package on `npmjs.org` for easy download once it is in a more stable version. Until that time, you can add the the package as a dependency in your `package.json`. If you use yarn, the command is:

    yarn add github:Paratii-Video/paratii-lib

## Contributing to `paratii.js`


Contributions are most welcome.
 - Check out a [new issue](https://github.com/Paratii-Video/paratii-lib/issues)
 - You are most welkcome to chat on our gitter channel https://gitter.im/Paratii-Video/dev
 - [Here](https://github.com/Paratii-Video/wiki/blob/master/CONTRIBUTING.md) you can find some guidelines and the kind of help we would be interested in.

If you want to contribute to development, you'll need to install `paratii-lib` locally and run the tests:

### Prerequisties:


* nodejs >= 8.9.0 ([nodejs.org](https://nodejs.org/))
* [yarn](https://yarnpkg.com/lang/en/docs/install/)
* Install [parity](https://github.com/paritytech/parity) (ethereum client):
    * ```$ bash <(curl https://get.parity.io -Lk)```

If you are on a Mac, you may need to set the path to parity:

    * add the following to your `.bash_profile`: `export PATH=/Applications/Parity\ Ethereum.app/Contents/MacOS:$PATH`
    * ``` $ source path/to/.bash_profile```

### Installation

    $ git clone https://github.com/Paratii-Video/paratii-lib
    $ cd paratii-lib
    $ yarn install

### Running tests

In one console, start parity:

    $ yarn parity

and in another you can now try to run the tests:  

    yarn test
